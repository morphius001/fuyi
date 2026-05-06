import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

import {
  buildStoreMarketReadModel,
  STORE_MARKET_READONLY_NOTE,
} from "../../helpers";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const slug = req.params?.slug;

  if (typeof slug !== "string" || !slug.trim()) {
    return res.status(400).json({
      type: "invalid_data",
      message: "Market slug is required",
    });
  }

  const readModel = await buildStoreMarketReadModel(req);
  const market = readModel.getMarketBySlug(slug);

  if (!market) {
    return res.status(404).json({
      type: "not_found",
      message: "Market not found",
    });
  }

  return res.json({
    sellers: {
      mode: "read_only_market_sellers",
      source: "static_market_read_model",
      note: STORE_MARKET_READONLY_NOTE,
      market,
      items: readModel.listOpenMembershipsByMarket(market.id),
    },
  });
}
