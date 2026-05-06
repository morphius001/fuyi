import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

import {
  ADMIN_MARKET_READONLY_NOTE,
  buildAdminMarketReadModel,
} from "../helpers";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const id = req.params?.id;

  if (typeof id !== "string" || !id.trim()) {
    return res.status(400).json({
      type: "invalid_data",
      message: "Market id is required",
    });
  }

  const readModel = await buildAdminMarketReadModel(req);
  const market = readModel.listOpenMarkets().find((item) => item.id === id);

  if (!market) {
    return res.status(404).json({
      type: "not_found",
      message: "Market not found",
    });
  }

  return res.json({
    market: {
      ...readModel.buildMarketDetail(market.slug),
      note: ADMIN_MARKET_READONLY_NOTE,
    },
  });
}
