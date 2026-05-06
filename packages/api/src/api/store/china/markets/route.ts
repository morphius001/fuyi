import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

import {
  buildStoreMarketReadModel,
  STORE_MARKET_READONLY_NOTE,
} from "./helpers";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const readModel = await buildStoreMarketReadModel(req);

  return res.json({
    markets: {
      mode: "read_only_markets",
      source: "static_market_read_model",
      note: STORE_MARKET_READONLY_NOTE,
      items: readModel.listOpenMarkets(),
    },
  });
}
