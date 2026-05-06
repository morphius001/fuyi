import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

import { getChinaCapabilities } from "../../../../lib/china-capabilities";

export async function GET(_req: MedusaRequest, res: MedusaResponse) {
  return res.json({
    capabilities: getChinaCapabilities("storefront"),
  });
}
