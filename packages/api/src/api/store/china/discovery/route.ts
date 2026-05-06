import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

import { buildChinaDiscoveryReadModel } from "../../../../lib/china-read-models";

export async function GET(_req: MedusaRequest, res: MedusaResponse) {
  const pg = _req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION);
  const now = new Date();

  const sellerRows = await pg("seller")
    .whereNull("deleted_at")
    .where("status", "open")
    .andWhere((builder) => {
      builder.whereNull("closed_from").orWhere("closed_from", ">", now);
    })
    .andWhere((builder) => {
      builder.whereNull("closed_to").orWhere("closed_to", "<", now);
    })
    .orderBy("created_at", "asc")
    .limit(8)
    .select("id", "handle", "name", "status", "metadata");

  const categoryRows = await pg("product_category")
    .whereNull("deleted_at")
    .where("is_active", true)
    .orderBy("rank", "asc")
    .limit(12)
    .select("id", "handle", "name", "description", "metadata");

  return res.json({
    discovery: buildChinaDiscoveryReadModel({
      sellerRows,
      categoryRows,
    }),
  });
}
