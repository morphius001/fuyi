import { randomUUID } from "node:crypto";

import {
  ChinaUnitPermissionConfig,
  ChinaUnitPermissionSellerBinding,
  ChinaUnitPermissionSellerBindingUpdateRequest,
  ChinaUnitPermissionSellerOption,
  ChinaUnitPermissionUpdateRequest,
  defaultChinaUnitPermissionConfigs,
  defaultChinaUnitPermissionSellerBindings,
} from "./china-unit-permission-config";

export const CHINA_UNIT_PERMISSION_CONFIG_TABLE =
  "china_unit_permission_config";
export const CHINA_UNIT_PERMISSION_CONFIG_EVENT_TABLE =
  "china_unit_permission_config_event";
export const CHINA_UNIT_PERMISSION_SELLER_BINDING_TABLE =
  "china_unit_permission_seller_binding";

export type ChinaUnitPermissionPgConnection = {
  schema?: {
    hasTable?: (tableName: string) => Promise<boolean>;
  };
  // Knex exposes a broad overloaded builder. This repository only needs a
  // small read/write subset, so keep the local boundary narrow.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (tableName: string): any;
};

export type ChinaUnitPermissionActor = {
  actorId?: string;
  actorType?: string;
};

type ChinaUnitPermissionConfigRow = {
  id: string;
  unit_key: string;
  status: ChinaUnitPermissionConfig["status"];
  unit_type_key: ChinaUnitPermissionConfig["unitTypeKey"];
  market_key: ChinaUnitPermissionConfig["marketKey"];
  guardrail_key: string;
  module_access: unknown;
  updated_at: Date | string;
};

type ChinaUnitPermissionSellerBindingRow = {
  unit_key: string;
  seller_id?: string | null;
  seller_handle?: string | null;
  source: ChinaUnitPermissionSellerBinding["source"];
  updated_at: Date | string;
};

type ChinaUnitPermissionSellerOptionRow = {
  id: string;
  handle?: string | null;
  name?: string | null;
};

const parseModuleAccess = (
  moduleAccess: unknown,
): ChinaUnitPermissionConfig["moduleAccess"] => {
  if (Array.isArray(moduleAccess)) {
    return moduleAccess as ChinaUnitPermissionConfig["moduleAccess"];
  }

  if (typeof moduleAccess === "string") {
    try {
      const parsed = JSON.parse(moduleAccess);

      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return [];
};

const mapRowToConfig = (
  row: ChinaUnitPermissionConfigRow,
): ChinaUnitPermissionConfig => ({
  unitKey: row.unit_key,
  status: row.status,
  unitTypeKey: row.unit_type_key,
  marketKey: row.market_key,
  guardrailKey: row.guardrail_key,
  updatedAt:
    row.updated_at instanceof Date
      ? row.updated_at.toISOString()
      : String(row.updated_at),
  moduleAccess: parseModuleAccess(row.module_access),
});

const normalizeDateString = (value: Date | string) =>
  value instanceof Date ? value.toISOString() : String(value);

const mapRowToSellerBinding = (
  row: ChinaUnitPermissionSellerBindingRow,
): ChinaUnitPermissionSellerBinding => ({
  unitKey: row.unit_key,
  sellerId: row.seller_id,
  sellerHandle: row.seller_handle,
  source: row.source,
  updatedAt: normalizeDateString(row.updated_at),
});

const mapRowToSellerOption = (
  row: ChinaUnitPermissionSellerOptionRow,
): ChinaUnitPermissionSellerOption => ({
  sellerId: row.id,
  sellerHandle: row.handle,
  sellerName: row.name ?? row.handle ?? row.id,
  source: "seller_table",
});

const mapConfigToRow = (
  config: ChinaUnitPermissionConfig,
  actor: ChinaUnitPermissionActor = {},
) => ({
  id: `cuperm_${randomUUID()}`,
  unit_key: config.unitKey,
  status: config.status,
  unit_type_key: config.unitTypeKey,
  market_key: config.marketKey,
  guardrail_key: config.guardrailKey,
  module_access: JSON.stringify(config.moduleAccess),
  source: "admin_draft",
  updated_by_actor_id: actor.actorId ?? null,
  updated_by_actor_type: actor.actorType ?? "admin",
  updated_at: new Date(),
});

const mapSellerBindingToRow = (
  binding: ChinaUnitPermissionSellerBinding,
  actor: ChinaUnitPermissionActor = {},
) => ({
  id: `cupbind_${randomUUID()}`,
  unit_key: binding.unitKey,
  seller_id: binding.sellerId ?? null,
  seller_handle: binding.sellerHandle ?? null,
  status: "active",
  source: binding.source,
  updated_by_actor_id: actor.actorId ?? null,
  updated_by_actor_type: actor.actorType ?? "admin",
  updated_at: new Date(),
});

export const hasChinaUnitPermissionTables = async (
  pg?: ChinaUnitPermissionPgConnection,
) => {
  if (!pg) {
    return false;
  }

  const hasConfigTable = Boolean(
    await pg.schema?.hasTable?.(CHINA_UNIT_PERMISSION_CONFIG_TABLE),
  );
  const hasEventTable = Boolean(
    await pg.schema?.hasTable?.(CHINA_UNIT_PERMISSION_CONFIG_EVENT_TABLE),
  );

  return hasConfigTable && hasEventTable;
};

export const hasChinaUnitPermissionSellerBindingTable = async (
  pg?: ChinaUnitPermissionPgConnection,
) => {
  if (!pg) {
    return false;
  }

  return Boolean(
    await pg.schema?.hasTable?.(CHINA_UNIT_PERMISSION_SELLER_BINDING_TABLE),
  );
};

export const hasChinaUnitPermissionSellerTable = async (
  pg?: ChinaUnitPermissionPgConnection,
) => {
  if (!pg) {
    return false;
  }

  return Boolean(await pg.schema?.hasTable?.("seller"));
};

export const readChinaUnitPermissionConfigsFromPg = async (
  pg?: ChinaUnitPermissionPgConnection,
) => {
  if (!pg || !(await hasChinaUnitPermissionTables(pg))) {
    return undefined;
  }

  const rows = (await pg(CHINA_UNIT_PERMISSION_CONFIG_TABLE)
    .whereNull("deleted_at")
    .orderBy("created_at", "asc")
    .select(
      "id",
      "unit_key",
      "status",
      "unit_type_key",
      "market_key",
      "guardrail_key",
      "module_access",
      "updated_at",
    )) as ChinaUnitPermissionConfigRow[];

  return rows.length
    ? rows.map(mapRowToConfig)
    : defaultChinaUnitPermissionConfigs;
};

const writeUnitPermissionEvent = async ({
  actor,
  afterVisible,
  beforeVisible,
  eventType,
  metadata,
  moduleKey,
  pg,
  unitKey,
}: {
  actor?: ChinaUnitPermissionActor;
  afterVisible?: boolean | null;
  beforeVisible?: boolean | null;
  eventType:
    | "unit_permission_updated"
    | "unit_permission_reset"
    | "unit_permission_binding_updated";
  metadata?: Record<string, unknown>;
  moduleKey?: string | null;
  pg: ChinaUnitPermissionPgConnection;
  unitKey: string;
}) =>
  pg(CHINA_UNIT_PERMISSION_CONFIG_EVENT_TABLE).insert({
    id: `cupevt_${randomUUID()}`,
    event_type: eventType,
    unit_key: unitKey,
    module_key: moduleKey ?? null,
    before_visible: beforeVisible ?? null,
    after_visible: afterVisible ?? null,
    actor_id: actor?.actorId ?? null,
    actor_type: actor?.actorType ?? "admin",
    metadata_redacted: JSON.stringify(metadata ?? {}),
  });

export const readChinaUnitPermissionSellerBindingsFromPg = async (
  pg?: ChinaUnitPermissionPgConnection,
) => {
  if (!pg || !(await hasChinaUnitPermissionSellerBindingTable(pg))) {
    return undefined;
  }

  const rows = (await pg(CHINA_UNIT_PERMISSION_SELLER_BINDING_TABLE)
    .whereNull("deleted_at")
    .where("status", "active")
    .orderBy("created_at", "asc")
    .select(
      "unit_key",
      "seller_id",
      "seller_handle",
      "source",
      "updated_at",
    )) as ChinaUnitPermissionSellerBindingRow[];

  return rows.length
    ? rows.map(mapRowToSellerBinding)
    : defaultChinaUnitPermissionSellerBindings;
};

export const readChinaUnitPermissionSellerOptionsFromPg = async (
  pg?: ChinaUnitPermissionPgConnection,
) => {
  if (!pg || !(await hasChinaUnitPermissionSellerTable(pg))) {
    return undefined;
  }

  const rows = (await pg("seller")
    .whereNull("deleted_at")
    .orderBy("created_at", "desc")
    .limit(50)
    .select("id", "handle", "name")) as ChinaUnitPermissionSellerOptionRow[];

  return rows.map(mapRowToSellerOption);
};

const findChinaUnitPermissionSellerOptionFromPg = async (
  pg: ChinaUnitPermissionPgConnection | undefined,
  request: ChinaUnitPermissionSellerBindingUpdateRequest,
) => {
  if (!pg || !(await hasChinaUnitPermissionSellerTable(pg))) {
    return undefined;
  }

  const sellerId =
    typeof request.sellerId === "string" && request.sellerId.trim()
      ? request.sellerId.trim()
      : undefined;
  const sellerHandle =
    typeof request.sellerHandle === "string" && request.sellerHandle.trim()
      ? request.sellerHandle.trim()
      : undefined;

  if (!sellerId && !sellerHandle) {
    return null;
  }

  const query = pg("seller").whereNull("deleted_at");

  if (sellerId) {
    query.where("id", sellerId);
  } else if (sellerHandle) {
    query.where("handle", sellerHandle);
  }

  const rows = (await query
    .limit(1)
    .select("id", "handle", "name")) as ChinaUnitPermissionSellerOptionRow[];

  return rows[0] ? mapRowToSellerOption(rows[0]) : null;
};

export const resetChinaUnitPermissionSellerBindingsInPg = async (
  pg: ChinaUnitPermissionPgConnection | undefined,
  actor: ChinaUnitPermissionActor = {},
) => {
  if (!pg || !(await hasChinaUnitPermissionSellerBindingTable(pg))) {
    return undefined;
  }

  await pg(CHINA_UNIT_PERMISSION_SELLER_BINDING_TABLE).delete();

  for (const binding of defaultChinaUnitPermissionSellerBindings) {
    await pg(CHINA_UNIT_PERMISSION_SELLER_BINDING_TABLE).insert(
      mapSellerBindingToRow(binding, actor),
    );
  }

  return readChinaUnitPermissionSellerBindingsFromPg(pg);
};

export const updateChinaUnitPermissionSellerBindingInPg = async (
  pg: ChinaUnitPermissionPgConnection | undefined,
  request: ChinaUnitPermissionSellerBindingUpdateRequest,
  actor: ChinaUnitPermissionActor = {},
) => {
  if (!pg || !(await hasChinaUnitPermissionSellerBindingTable(pg))) {
    return undefined;
  }

  const unitExists = (
    (await readChinaUnitPermissionConfigsFromPg(pg)) ??
    defaultChinaUnitPermissionConfigs
  ).some((config) => config.unitKey === request.unitKey);

  if (!unitExists) {
    return null;
  }

  const sellerId =
    typeof request.sellerId === "string" && request.sellerId.trim()
      ? request.sellerId.trim()
      : null;
  const sellerHandle =
    typeof request.sellerHandle === "string" && request.sellerHandle.trim()
      ? request.sellerHandle.trim()
      : null;

  if (!sellerId && !sellerHandle) {
    return null;
  }

  const sellerOption = await findChinaUnitPermissionSellerOptionFromPg(
    pg,
    request,
  );

  if (sellerOption === null) {
    return null;
  }

  const binding: ChinaUnitPermissionSellerBinding = {
    unitKey: request.unitKey,
    sellerId: sellerOption?.sellerId ?? sellerId,
    sellerHandle: sellerOption?.sellerHandle ?? sellerHandle,
    source: "admin_binding",
    updatedAt: new Date().toISOString(),
  };

  await pg(CHINA_UNIT_PERMISSION_SELLER_BINDING_TABLE)
    .where("unit_key", request.unitKey)
    .delete();
  if (sellerId) {
    await pg(CHINA_UNIT_PERMISSION_SELLER_BINDING_TABLE)
      .where("seller_id", sellerId)
      .delete();
  }
  if (sellerHandle) {
    await pg(CHINA_UNIT_PERMISSION_SELLER_BINDING_TABLE)
      .where("seller_handle", sellerHandle)
      .delete();
  }
  await pg(CHINA_UNIT_PERMISSION_SELLER_BINDING_TABLE).insert(
    mapSellerBindingToRow(binding, actor),
  );

  await writeUnitPermissionEvent({
    actor,
    eventType: "unit_permission_binding_updated",
    metadata: {
      note: "seller binding for menu visibility only",
      sellerHandle,
      sellerId,
    },
    pg,
    unitKey: request.unitKey,
  });

  return binding;
};

export const resolveChinaUnitPermissionSellerBindingFromPg = async (
  pg: ChinaUnitPermissionPgConnection | undefined,
  seller: {
    sellerId?: string;
    sellerHandle?: string | null;
  },
) => {
  const sellerId = seller.sellerId?.trim();
  const sellerHandle = seller.sellerHandle?.trim();

  if (!sellerId && !sellerHandle) {
    return undefined;
  }

  if (pg && (await hasChinaUnitPermissionSellerBindingTable(pg))) {
    const rows = (await pg(CHINA_UNIT_PERMISSION_SELLER_BINDING_TABLE)
      .whereNull("deleted_at")
      .where("status", "active")
      .andWhere(
        (builder: {
          where: (column: string, value: string) => unknown;
          orWhere: (column: string, value: string) => unknown;
        }) => {
          if (sellerId) {
            builder.where("seller_id", sellerId);
          }

          if (sellerHandle && sellerId) {
            builder.orWhere("seller_handle", sellerHandle);
          } else if (sellerHandle) {
            builder.where("seller_handle", sellerHandle);
          }
        },
      )
      .orderBy("updated_at", "desc")
      .limit(1)
      .select(
        "unit_key",
        "seller_id",
        "seller_handle",
        "source",
        "updated_at",
      )) as ChinaUnitPermissionSellerBindingRow[];

    if (rows[0]) {
      return mapRowToSellerBinding(rows[0]);
    }
  }

  return defaultChinaUnitPermissionSellerBindings.find(
    (binding) =>
      (sellerId && binding.sellerId === sellerId) ||
      (sellerHandle && binding.sellerHandle === sellerHandle),
  );
};

export const resetChinaUnitPermissionConfigsInPg = async (
  pg: ChinaUnitPermissionPgConnection | undefined,
  actor: ChinaUnitPermissionActor = {},
) => {
  if (!pg || !(await hasChinaUnitPermissionTables(pg))) {
    return undefined;
  }

  await pg(CHINA_UNIT_PERMISSION_CONFIG_TABLE).delete();

  for (const config of defaultChinaUnitPermissionConfigs) {
    await pg(CHINA_UNIT_PERMISSION_CONFIG_TABLE).insert(
      mapConfigToRow(config, actor),
    );
    await writeUnitPermissionEvent({
      actor,
      eventType: "unit_permission_reset",
      metadata: { source: "defaultChinaUnitPermissionConfigs" },
      pg,
      unitKey: config.unitKey,
    });
  }

  await resetChinaUnitPermissionSellerBindingsInPg(pg, actor);

  return readChinaUnitPermissionConfigsFromPg(pg);
};

export const updateChinaUnitPermissionConfigInPg = async (
  pg: ChinaUnitPermissionPgConnection | undefined,
  request: ChinaUnitPermissionUpdateRequest,
  actor: ChinaUnitPermissionActor = {},
) => {
  if (!pg || !(await hasChinaUnitPermissionTables(pg))) {
    return undefined;
  }

  const currentConfigs =
    (await readChinaUnitPermissionConfigsFromPg(pg)) ??
    defaultChinaUnitPermissionConfigs;
  const currentConfig =
    currentConfigs.find((config) => config.unitKey === request.unitKey) ??
    defaultChinaUnitPermissionConfigs.find(
      (config) => config.unitKey === request.unitKey,
    );

  if (!currentConfig) {
    return null;
  }

  const moduleAccess = currentConfig.moduleAccess.find(
    (candidate) => candidate.moduleKey === request.moduleKey,
  );

  if (!moduleAccess) {
    return null;
  }

  const beforeVisible = moduleAccess.visible;
  const nextConfig: ChinaUnitPermissionConfig = {
    ...currentConfig,
    updatedAt: new Date().toISOString(),
    moduleAccess: currentConfig.moduleAccess.map((candidate) =>
      candidate.moduleKey === request.moduleKey
        ? {
            ...candidate,
            reasonKey: request.visible
              ? candidate.reasonKey === "operatorHidden"
                ? "enabledByOperator"
                : candidate.reasonKey
              : "operatorHidden",
            visible: request.visible,
          }
        : candidate,
    ),
  };

  await pg(CHINA_UNIT_PERMISSION_CONFIG_TABLE)
    .insert(mapConfigToRow(nextConfig, actor))
    .onConflict("unit_key")
    .merge({
      status: nextConfig.status,
      unit_type_key: nextConfig.unitTypeKey,
      market_key: nextConfig.marketKey,
      guardrail_key: nextConfig.guardrailKey,
      module_access: JSON.stringify(nextConfig.moduleAccess),
      source: "admin_draft",
      updated_by_actor_id: actor.actorId ?? null,
      updated_by_actor_type: actor.actorType ?? "admin",
      updated_at: new Date(),
      deleted_at: null,
    });

  await writeUnitPermissionEvent({
    actor,
    afterVisible: request.visible,
    beforeVisible,
    eventType: "unit_permission_updated",
    metadata: { note: "menu visibility only" },
    moduleKey: request.moduleKey,
    pg,
    unitKey: request.unitKey,
  });

  return nextConfig;
};
