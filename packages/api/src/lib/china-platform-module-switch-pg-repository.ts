import { randomUUID } from "node:crypto";

import {
  ChinaPlatformModuleSwitchConfig,
  ChinaPlatformModuleSwitchUpdateRequest,
  defaultChinaPlatformModuleSwitchConfigs,
} from "./china-platform-module-switch-config";

export const CHINA_PLATFORM_MODULE_SWITCH_CONFIG_TABLE =
  "china_platform_module_switch_config";
export const CHINA_PLATFORM_MODULE_SWITCH_CONFIG_EVENT_TABLE =
  "china_platform_module_switch_config_event";

export type ChinaPlatformModuleSwitchPgConnection = {
  schema?: {
    hasTable?: (tableName: string) => Promise<boolean>;
  };
  // Knex exposes a broad overloaded builder. This repository only needs a
  // narrow read/write subset at this boundary.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (tableName: string): any;
};

export type ChinaPlatformModuleSwitchActor = {
  actorId?: string;
  actorType?: string;
};

type ChinaPlatformModuleSwitchConfigRow = {
  module_key: string;
  status: ChinaPlatformModuleSwitchConfig["status"];
  switch_on: boolean;
  layer_key: ChinaPlatformModuleSwitchConfig["layerKey"];
  scope_key: string;
  vendor_impact_key: string;
  policy_key: string;
  guardrail_key: string;
  updated_at: Date | string;
};

const normalizeDateString = (value: Date | string) =>
  value instanceof Date ? value.toISOString() : String(value);

const mapRowToConfig = (
  row: ChinaPlatformModuleSwitchConfigRow,
): ChinaPlatformModuleSwitchConfig => ({
  moduleKey: row.module_key,
  status: row.status,
  switchOn: Boolean(row.switch_on),
  layerKey: row.layer_key,
  scopeKey: row.scope_key,
  vendorImpactKey: row.vendor_impact_key,
  policyKey: row.policy_key,
  guardrailKey: row.guardrail_key,
  updatedAt: normalizeDateString(row.updated_at),
});

const mapConfigToRow = (
  config: ChinaPlatformModuleSwitchConfig,
  actor: ChinaPlatformModuleSwitchActor = {},
) => ({
  id: `cpms_${randomUUID()}`,
  module_key: config.moduleKey,
  status: config.status,
  switch_on: config.switchOn,
  layer_key: config.layerKey,
  scope_key: config.scopeKey,
  vendor_impact_key: config.vendorImpactKey,
  policy_key: config.policyKey,
  guardrail_key: config.guardrailKey,
  source: "admin_draft",
  updated_by_actor_id: actor.actorId ?? null,
  updated_by_actor_type: actor.actorType ?? "admin",
  updated_at: new Date(),
});

export const hasChinaPlatformModuleSwitchTables = async (
  pg?: ChinaPlatformModuleSwitchPgConnection,
) => {
  if (!pg) {
    return false;
  }

  const hasConfigTable = Boolean(
    await pg.schema?.hasTable?.(CHINA_PLATFORM_MODULE_SWITCH_CONFIG_TABLE),
  );
  const hasEventTable = Boolean(
    await pg.schema?.hasTable?.(CHINA_PLATFORM_MODULE_SWITCH_CONFIG_EVENT_TABLE),
  );

  return hasConfigTable && hasEventTable;
};

export const readChinaPlatformModuleSwitchConfigsFromPg = async (
  pg?: ChinaPlatformModuleSwitchPgConnection,
) => {
  if (!pg || !(await hasChinaPlatformModuleSwitchTables(pg))) {
    return undefined;
  }

  const rows = (await pg(CHINA_PLATFORM_MODULE_SWITCH_CONFIG_TABLE)
    .whereNull("deleted_at")
    .orderBy("created_at", "asc")
    .select(
      "module_key",
      "status",
      "switch_on",
      "layer_key",
      "scope_key",
      "vendor_impact_key",
      "policy_key",
      "guardrail_key",
      "updated_at",
    )) as ChinaPlatformModuleSwitchConfigRow[];

  return rows.length
    ? rows.map(mapRowToConfig)
    : defaultChinaPlatformModuleSwitchConfigs;
};

const writePlatformModuleSwitchEvent = async ({
  actor,
  afterSwitchOn,
  beforeSwitchOn,
  eventType,
  metadata,
  moduleKey,
  pg,
}: {
  actor?: ChinaPlatformModuleSwitchActor;
  afterSwitchOn?: boolean | null;
  beforeSwitchOn?: boolean | null;
  eventType: "platform_module_switch_updated" | "platform_module_switch_reset";
  metadata?: Record<string, unknown>;
  moduleKey: string;
  pg: ChinaPlatformModuleSwitchPgConnection;
}) =>
  pg(CHINA_PLATFORM_MODULE_SWITCH_CONFIG_EVENT_TABLE).insert({
    id: `cpmsevt_${randomUUID()}`,
    event_type: eventType,
    module_key: moduleKey,
    before_switch_on: beforeSwitchOn ?? null,
    after_switch_on: afterSwitchOn ?? null,
    actor_id: actor?.actorId ?? null,
    actor_type: actor?.actorType ?? "admin",
    metadata_redacted: JSON.stringify(metadata ?? {}),
  });

export const resetChinaPlatformModuleSwitchConfigsInPg = async (
  pg: ChinaPlatformModuleSwitchPgConnection | undefined,
  actor: ChinaPlatformModuleSwitchActor = {},
) => {
  if (!pg || !(await hasChinaPlatformModuleSwitchTables(pg))) {
    return undefined;
  }

  await pg(CHINA_PLATFORM_MODULE_SWITCH_CONFIG_TABLE).delete();

  for (const config of defaultChinaPlatformModuleSwitchConfigs) {
    await pg(CHINA_PLATFORM_MODULE_SWITCH_CONFIG_TABLE).insert(
      mapConfigToRow(config, actor),
    );
    await writePlatformModuleSwitchEvent({
      actor,
      eventType: "platform_module_switch_reset",
      metadata: {
        note: "platform default planning draft only",
        source: "defaultChinaPlatformModuleSwitchConfigs",
      },
      moduleKey: config.moduleKey,
      pg,
    });
  }

  return readChinaPlatformModuleSwitchConfigsFromPg(pg);
};

export const updateChinaPlatformModuleSwitchConfigInPg = async (
  pg: ChinaPlatformModuleSwitchPgConnection | undefined,
  request: ChinaPlatformModuleSwitchUpdateRequest,
  actor: ChinaPlatformModuleSwitchActor = {},
) => {
  if (!pg || !(await hasChinaPlatformModuleSwitchTables(pg))) {
    return undefined;
  }

  const currentConfigs =
    (await readChinaPlatformModuleSwitchConfigsFromPg(pg)) ??
    defaultChinaPlatformModuleSwitchConfigs;
  const currentConfig =
    currentConfigs.find((config) => config.moduleKey === request.moduleKey) ??
    defaultChinaPlatformModuleSwitchConfigs.find(
      (config) => config.moduleKey === request.moduleKey,
    );

  if (!currentConfig) {
    return null;
  }

  const beforeSwitchOn = currentConfig.switchOn;
  const nextConfig: ChinaPlatformModuleSwitchConfig = {
    ...currentConfig,
    switchOn: request.switchOn,
    updatedAt: new Date().toISOString(),
  };

  await pg(CHINA_PLATFORM_MODULE_SWITCH_CONFIG_TABLE)
    .insert(mapConfigToRow(nextConfig, actor))
    .onConflict("module_key")
    .merge({
      status: nextConfig.status,
      switch_on: nextConfig.switchOn,
      layer_key: nextConfig.layerKey,
      scope_key: nextConfig.scopeKey,
      vendor_impact_key: nextConfig.vendorImpactKey,
      policy_key: nextConfig.policyKey,
      guardrail_key: nextConfig.guardrailKey,
      source: "admin_draft",
      updated_by_actor_id: actor.actorId ?? null,
      updated_by_actor_type: actor.actorType ?? "admin",
      updated_at: new Date(),
      deleted_at: null,
    });

  await writePlatformModuleSwitchEvent({
    actor,
    afterSwitchOn: request.switchOn,
    beforeSwitchOn,
    eventType: "platform_module_switch_updated",
    metadata: { note: "platform default planning draft only" },
    moduleKey: request.moduleKey,
    pg,
  });

  return nextConfig;
};
