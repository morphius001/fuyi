import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

import {
  buildVendorMarketContextFromRepositoryRows,
  buildVendorMarketContextFromSellerRows,
  readVendorMarketContextRepositoryRows,
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
  const seller = sellers.find((row) => row.id === sellerId);

  if (!seller) {
    const marketContext = buildVendorMarketContextFromSellerRows({
      sellerId,
      marketId,
      sellers,
    });

    res.json({
      marketContext,
      dataSource: "static_fallback",
      note: VENDOR_MARKET_CONTEXT_ROUTE_NOTE,
    });
    return;
  }

  const repositoryRows = await readVendorMarketContextRepositoryRows({
    pg,
    sellerId,
    marketId,
  }).catch(() => undefined);
  const result = repositoryRows
    ? await buildVendorMarketContextFromRepositoryRows({
        seller,
        sellerId,
        marketId,
        rows: repositoryRows,
      })
    : {
        marketContext: buildVendorMarketContextFromSellerRows({
          sellerId,
          marketId,
          sellers,
        }),
        dataSource: "static_fallback" as const,
      };

  res.json({
    marketContext: result.marketContext,
    dataSource: result.dataSource,
    note: VENDOR_MARKET_CONTEXT_ROUTE_NOTE,
  });
};
