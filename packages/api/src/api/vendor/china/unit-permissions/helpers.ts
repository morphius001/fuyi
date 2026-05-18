import { AuthenticatedMedusaRequest } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

import { type ChinaUnitPermissionPgConnection } from "../../../../lib/china-unit-permission-pg-repository";

export type ChinaUnitPermissionSellerIdentityRow = {
  id: string;
  handle?: string | null;
  metadata?: Record<string, unknown> | string | null;
};

const parseSellerMetadata = (
  metadata: ChinaUnitPermissionSellerIdentityRow["metadata"],
) => {
  if (metadata && typeof metadata === "object" && !Array.isArray(metadata)) {
    return metadata as Record<string, unknown>;
  }

  if (typeof metadata === "string") {
    try {
      const parsed = JSON.parse(metadata);

      return parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? (parsed as Record<string, unknown>)
        : {};
    } catch {
      return {};
    }
  }

  return {};
};

export const parseChinaUnitPermissionMetadataUnitKey = (
  metadata: ChinaUnitPermissionSellerIdentityRow["metadata"],
) => {
  const value = parseSellerMetadata(metadata).china_unit_permission_unit_key;

  return typeof value === "string" && value.trim() ? value.trim() : undefined;
};

export const resolveChinaUnitPermissionPg = (
  req: AuthenticatedMedusaRequest,
) => {
  try {
    return req.scope.resolve(
      ContainerRegistrationKeys.PG_CONNECTION,
    ) as ChinaUnitPermissionPgConnection;
  } catch {
    return undefined;
  }
};

export const readChinaUnitPermissionSellerIdentity = async (
  pg: ChinaUnitPermissionPgConnection | undefined,
  sellerId: string,
) => {
  if (!pg) {
    return undefined;
  }

  const rows = (await pg("seller")
    .whereNull("deleted_at")
    .where("id", sellerId)
    .select("id", "handle", "metadata")
    .catch(() => [])) as ChinaUnitPermissionSellerIdentityRow[];

  return rows[0];
};
