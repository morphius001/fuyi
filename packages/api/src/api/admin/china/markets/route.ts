import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

import {
  ADMIN_MARKET_READONLY_NOTE,
  buildAdminMarketReadModel,
} from "./helpers";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const readModel = await buildAdminMarketReadModel(req);

  return res.json({
    markets: {
      mode: "admin_read_only_markets",
      source: "static_market_read_model",
      note: ADMIN_MARKET_READONLY_NOTE,
      items: readModel.listOpenMarkets(),
    },
  });
}
