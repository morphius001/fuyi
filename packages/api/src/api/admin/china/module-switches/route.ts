import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

import {
  buildChinaPlatformModuleSwitchView,
  resetChinaPlatformModuleSwitchConfigs,
  updateChinaPlatformModuleSwitchConfig,
  type ChinaPlatformModuleSwitchUpdateRequest,
} from "../../../../lib/china-platform-module-switch-config";
import {
  readChinaPlatformModuleSwitchConfigsFromPg,
  resetChinaPlatformModuleSwitchConfigsInPg,
  updateChinaPlatformModuleSwitchConfigInPg,
  type ChinaPlatformModuleSwitchActor,
  type ChinaPlatformModuleSwitchPgConnection,
} from "../../../../lib/china-platform-module-switch-pg-repository";

const isPlatformModuleSwitchUpdateRequest = (
  body: unknown,
): body is ChinaPlatformModuleSwitchUpdateRequest => {
  const candidate = body as Partial<ChinaPlatformModuleSwitchUpdateRequest>;

  return (
    typeof candidate?.moduleKey === "string" &&
    typeof candidate.switchOn === "boolean"
  );
};

const resolvePg = (req: MedusaRequest) => {
  try {
    return req.scope.resolve(
      ContainerRegistrationKeys.PG_CONNECTION,
    ) as ChinaPlatformModuleSwitchPgConnection;
  } catch {
    return undefined;
  }
};

const resolveActor = (req: MedusaRequest): ChinaPlatformModuleSwitchActor => {
  const request = req as MedusaRequest & {
    auth_context?: {
      actor_id?: string;
      actor_type?: string;
    };
  };

  return {
    actorId: request.auth_context?.actor_id,
    actorType: request.auth_context?.actor_type ?? "admin",
  };
};

const buildPlatformModuleSwitchAdminResponse = async (
  pg: ChinaPlatformModuleSwitchPgConnection | undefined,
) => {
  const pgConfigs = await readChinaPlatformModuleSwitchConfigsFromPg(pg);

  return buildChinaPlatformModuleSwitchView({
    items: pgConfigs,
    source: pgConfigs ? "pg_admin_draft" : "server_memory_draft",
  });
};

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  return res.json(await buildPlatformModuleSwitchAdminResponse(resolvePg(req)));
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  if (!isPlatformModuleSwitchUpdateRequest(req.body)) {
    return res.status(400).json({
      error: "invalid_platform_module_switch_update",
      message: "moduleKey and switchOn are required.",
    });
  }

  const pg = resolvePg(req);
  const updatedInPg = await updateChinaPlatformModuleSwitchConfigInPg(
    pg,
    req.body,
    resolveActor(req),
  );
  const updated =
    updatedInPg ?? updateChinaPlatformModuleSwitchConfig(req.body);

  if (!updated) {
    return res.status(404).json({
      error: "platform_module_switch_not_found",
      message: "No matching platform module switch entry was found.",
    });
  }

  return res.json({
    updated,
    ...(await buildPlatformModuleSwitchAdminResponse(pg)),
  });
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const pg = resolvePg(req);
  const pgConfigs = await resetChinaPlatformModuleSwitchConfigsInPg(
    pg,
    resolveActor(req),
  );

  if (pgConfigs) {
    return res.json(await buildPlatformModuleSwitchAdminResponse(pg));
  }

  resetChinaPlatformModuleSwitchConfigs();
  return res.json(buildChinaPlatformModuleSwitchView());
}
