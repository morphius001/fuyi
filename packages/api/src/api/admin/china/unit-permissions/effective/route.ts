import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

import { buildChinaUnitPermissionEffectiveView } from "../../../../../lib/china-unit-permission-config";
import {
  readChinaUnitPermissionConfigsFromPg,
  type ChinaUnitPermissionPgConnection,
} from "../../../../../lib/china-unit-permission-pg-repository";

const readQueryString = (value: unknown) => {
  if (Array.isArray(value)) {
    return typeof value[0] === "string" ? value[0] : undefined;
  }

  return typeof value === "string" ? value : undefined;
};

const resolvePg = (req: MedusaRequest) => {
  try {
    return req.scope.resolve(
      ContainerRegistrationKeys.PG_CONNECTION,
    ) as ChinaUnitPermissionPgConnection;
  } catch {
    return undefined;
  }
};

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const pgConfigs = await readChinaUnitPermissionConfigsFromPg(resolvePg(req));

  return res.json(
    buildChinaUnitPermissionEffectiveView(readQueryString(req.query.unit_key), {
      items: pgConfigs,
      source: pgConfigs ? "pg_admin_draft" : "server_memory_draft",
    }),
  );
}
