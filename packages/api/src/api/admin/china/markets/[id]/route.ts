import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

import {
  ADMIN_MARKET_READONLY_NOTE,
  buildAdminMarketReadModelResult,
} from "../helpers";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const id = req.params?.id;

  if (typeof id !== "string" || !id.trim()) {
    return res.status(400).json({
      type: "invalid_data",
      message: "Market id is required",
    });
  }

  const { readModel, dataSource } = await buildAdminMarketReadModelResult(req);
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
      source: dataSource,
      note: ADMIN_MARKET_READONLY_NOTE,
    },
  });
}
