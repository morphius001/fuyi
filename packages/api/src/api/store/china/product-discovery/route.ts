import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

import { buildChinaProductDiscoveryReadModel } from "../../../../lib/china-product-discovery-read-model";
import {
  parseProductDiscoveryFilters,
  type ProductDiscoveryPg,
  readChinaProductDiscoveryRows,
} from "./helpers";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const pg = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION);
  const { filters, limit } = parseProductDiscoveryFilters(
    (req.query ?? {}) as Record<string, unknown>
  );
  const rows = await readChinaProductDiscoveryRows({
    pg: pg as unknown as ProductDiscoveryPg,
    filters,
    limit,
  });

  return res.json({
    product_discovery: buildChinaProductDiscoveryReadModel(rows),
  });
}
