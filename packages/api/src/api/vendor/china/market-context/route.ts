import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

import {
  buildVendorMarketContextFromSellerRows,
  resolveVendorMarketContextSellerId,
  VENDOR_MARKET_CONTEXT_ROUTE_NOTE,
  VendorMarketContextSellerRow,
  VendorSellerContextRequest,
} from "./helpers";

const readQueryString = (value: unknown) =>
  typeof value === "string" && value.trim() ? value.trim() : undefined;

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) => {
  const sellerId = resolveVendorMarketContextSellerId(
    req as VendorSellerContextRequest,
  );
  const marketId = readQueryString(req.query.market_id);
  const pg = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION);
  const sellers = (await pg("seller")
    .whereNull("deleted_at")
    .where("id", sellerId)
    .select(
      "id",
      "handle",
      "name",
      "metadata",
    )) as VendorMarketContextSellerRow[];

  const marketContext = buildVendorMarketContextFromSellerRows({
    sellerId,
    marketId,
    sellers,
  });

  res.json({
    marketContext,
    note: VENDOR_MARKET_CONTEXT_ROUTE_NOTE,
  });
};
