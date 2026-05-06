import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

import {
  buildStoreMarketReadModel,
  STORE_MARKET_READONLY_NOTE,
} from "../helpers";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const slug = req.params?.slug;

  if (typeof slug !== "string" || !slug.trim()) {
    return res.status(400).json({
      type: "invalid_data",
      message: "Market slug is required",
    });
  }

  const readModel = await buildStoreMarketReadModel(req);
  const detail = readModel.buildMarketDetail(slug);

  if (!detail) {
    return res.status(404).json({
      type: "not_found",
      message: "Market not found",
    });
  }

  return res.json({
    market: {
      ...detail,
      note: STORE_MARKET_READONLY_NOTE,
    },
  });
}
