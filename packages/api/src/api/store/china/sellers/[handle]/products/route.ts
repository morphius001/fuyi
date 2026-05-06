import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const handle = req.params?.handle;

  if (typeof handle !== "string" || !handle.trim()) {
    return res.status(400).json({
      type: "invalid_data",
      message: "Seller handle is required",
    });
  }

  const pg = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION);
  const now = new Date();

  const seller = await pg("seller")
    .where({ handle })
    .whereNull("deleted_at")
    .where("status", "open")
    .andWhere((builder) => {
      builder.whereNull("closed_from").orWhere("closed_from", ">", now);
    })
    .andWhere((builder) => {
      builder.whereNull("closed_to").orWhere("closed_to", "<", now);
    })
    .first("id", "handle", "name", "status", "metadata");

  if (!seller) {
    return res.status(404).json({
      type: "not_found",
      message: "Seller not found",
    });
  }

  const productRows = await pg("product_product_seller_seller")
    .where({ seller_id: seller.id })
    .whereNull("deleted_at")
    .select("product_id");

  return res.json({
    seller,
    product_ids: productRows.map((row) => row.product_id),
  });
}
