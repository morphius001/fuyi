import { Module } from "@medusajs/framework/utils";

import ChinaPlatformOpsModuleService from "./service";

export const CHINA_PLATFORM_OPS_MODULE = "chinaPlatformOps";

export default Module(CHINA_PLATFORM_OPS_MODULE, {
  service: ChinaPlatformOpsModuleService,
});
