import { AuthenticatedMedusaRequest } from "@medusajs/framework/http";

import { resolveChinaUnitPermissionModuleAccess } from "../../../../lib/china-unit-permission-access-guard";
import {
  resolveVendorMarketContextSellerId,
  type VendorSellerContextRequest,
} from "../market-context/helpers";
import {
  parseChinaUnitPermissionMetadataUnitKey,
  readChinaUnitPermissionSellerIdentity,
  resolveChinaUnitPermissionPg,
} from "./helpers";

export const resolveChinaVendorUnitModuleAccessForRoute = async ({
  moduleKey,
  req,
}: {
  moduleKey: string;
  req: AuthenticatedMedusaRequest;
}) => {
  const sellerId = resolveVendorMarketContextSellerId(
    req as VendorSellerContextRequest,
  );
  const pg = resolveChinaUnitPermissionPg(req);
  const seller = await readChinaUnitPermissionSellerIdentity(pg, sellerId);

  return resolveChinaUnitPermissionModuleAccess({
    moduleKey,
    pg,
    seller: {
      sellerHandle: seller?.handle,
      sellerId,
      unitKey: parseChinaUnitPermissionMetadataUnitKey(seller?.metadata),
    },
  });
};
