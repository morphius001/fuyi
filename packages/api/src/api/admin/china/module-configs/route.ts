import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

import { buildChinaModuleConfigListView } from "../../../../lib/china-read-models";

export async function GET(_req: MedusaRequest, res: MedusaResponse) {
  return res.json({
    module_configs: buildChinaModuleConfigListView(),
  });
}
