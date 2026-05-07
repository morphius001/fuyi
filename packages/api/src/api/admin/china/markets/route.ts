import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

import {
  ADMIN_MARKET_READONLY_NOTE,
  buildAdminMarketReadModelResult,
} from "./helpers";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { readModel, dataSource } = await buildAdminMarketReadModelResult(req);

  return res.json({
    markets: {
      mode: "admin_read_only_markets",
      source: dataSource,
      note: ADMIN_MARKET_READONLY_NOTE,
      items: readModel.listOpenMarkets(),
    },
  });
}
