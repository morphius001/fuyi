import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

import { buildChinaModuleCapabilityView } from "../../../../../lib/china-read-models";

const readQueryString = (value: unknown) => {
  if (Array.isArray(value)) {
    return typeof value[0] === "string" ? value[0] : undefined;
  }

  return typeof value === "string" ? value : undefined;
};

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  return res.json({
    module_config_effective: buildChinaModuleCapabilityView({
      context: {
        marketId: readQueryString(req.query.market_id),
        merchantType: readQueryString(req.query.merchant_type),
        sellerId: readQueryString(req.query.seller_id),
      },
    }),
  });
}
