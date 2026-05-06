import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

const markets = [
  {
    name: "三门海鲜市场",
    city: "台州三门",
    hours: "06:30 - 17:30",
    notice: "鲜活区今日到货，冷链配送 10:00 / 15:00。",
    delivery: "市场自提 / 同城配送 / 冷链",
    source: "static_market_contract",
  },
  {
    name: "舟山沈家门市场",
    city: "舟山普陀",
    hours: "07:00 - 18:00",
    notice: "冰鲜海货和干货礼盒供应。",
    delivery: "门店自提 / 快递配送",
    source: "static_market_contract",
  },
];

const readMetadataValue = (
  metadata: Record<string, unknown> | null | undefined,
  keys: string[]
) => {
  for (const key of keys) {
    const value = metadata?.[key];

    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return undefined;
};

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

  const sellers = sellerRows.map((seller) => {
    const metadata = seller.metadata as Record<string, unknown> | null;
    const market =
      readMetadataValue(metadata, ["market", "market_name"]) ?? "三门海鲜市场";
    const booth =
      readMetadataValue(metadata, ["booth", "booth_no", "stall_no"]) ??
      "档口待配置";
    const categories =
      readMetadataValue(metadata, ["categories", "category_summary"]) ??
      "本地鲜货";
    const fulfillment =
      readMetadataValue(metadata, ["fulfillment", "delivery_summary"]) ??
      "市场自提 / 商家配送可配置";

    return {
      id: seller.id,
      handle: seller.handle,
      name: seller.name,
      market,
      booth,
      tags: ["真实商家", "已开放", categories],
      summary: `${categories}，${fulfillment}。`,
      source: "seller_table",
    };
  });

  const categories = categoryRows.map((category) => ({
    id: category.id,
    handle: category.handle,
    name: category.name,
    description:
      category.description ??
      readMetadataValue(category.metadata, ["description", "summary"]) ??
      "本地市场类目",
    count: "真实类目",
    source: "product_category_table",
  }));

  return res.json({
    discovery: {
      mode: "read_only_discovery",
      source: "seller_and_category_tables",
      note: "This endpoint only exposes marketplace discovery data for China-local storefront UI. It does not change product, order, checkout, payment, fulfillment, settlement, commission, payout, refund, or permission behavior.",
      sellers,
      markets,
      categories,
    },
  });
}
