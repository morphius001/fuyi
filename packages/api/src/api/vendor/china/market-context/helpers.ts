import { MedusaError } from "@medusajs/framework/utils";

import {
  buildChinaVendorMarketContext,
  buildChinaMarketReadModelSeedFromRepository,
  buildStaticMarketReadModelSeed,
  ChinaMarketReadModelService,
  ChinaMarketRepositoryRows,
} from "../../../../modules/china-market-read-model";

export type VendorSellerContextRequest = {
  seller_context?: {
    seller_id?: string;
  };
};

export type VendorMarketContextSellerRow = {
  id: string;
  handle?: string;
  name: string;
  metadata?: Record<string, unknown> | null;
};

export type VendorMarketContextDataSource = "repository" | "static_fallback";

export type VendorMarketContextBuildResult = {
  marketContext: ReturnType<typeof buildChinaVendorMarketContext>;
  dataSource: VendorMarketContextDataSource;
};

type VendorMarketContextPgConnection = {
  schema?: {
    hasTable?: (tableName: string) => Promise<boolean>;
  };
  // Knex has a large overloaded query builder type. The helper only relies on
  // the small read-only subset below, so keep the DB boundary narrow here.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (tableName: string): any;
};

type VendorMarketContextQueryBuilder = ReturnType<
  ReturnType<VendorMarketContextPgConnection>["whereNull"]
>;

export const VENDOR_MARKET_CONTEXT_ROUTE_NOTE =
  "Vendor China market context is read-only and does not change checkout, shipping options, orders, payments, refunds, settlements, commissions, permissions, or fulfillment.";

export const resolveVendorMarketContextSellerId = (
  req: VendorSellerContextRequest,
) => {
  const sellerId = req.seller_context?.seller_id;

  if (!sellerId) {
    throw new MedusaError(
      MedusaError.Types.UNAUTHORIZED,
      "You must be authenticated as a vendor seller to access market context.",
    );
  }

  return sellerId;
};

export const buildVendorMarketContextFromSellerRows = ({
  sellerId,
  marketId,
  sellers,
}: {
  sellerId: string;
  marketId?: string;
  sellers: VendorMarketContextSellerRow[];
}) => {
  const seller = sellers.find((row) => row.id === sellerId);

  if (!seller) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "Seller market context was not found.",
    );
  }

  const readModel = new ChinaMarketReadModelService(
    buildStaticMarketReadModelSeed({
      sellers: [seller],
    }),
  );

  return buildChinaVendorMarketContext({
    readModel,
    sellerId,
    sellerHandle: seller.handle,
    marketId,
  });
};

export const buildVendorMarketContextFromRepositoryRows = async ({
  seller,
  sellerId,
  marketId,
  rows,
}: {
  seller: VendorMarketContextSellerRow;
  sellerId: string;
  marketId?: string;
  rows: ChinaMarketRepositoryRows;
}): Promise<VendorMarketContextBuildResult> => {
  const readModel = new ChinaMarketReadModelService(
    await buildChinaMarketReadModelSeedFromRepository({
      listChinaMarketReadRows: () => rows,
    }),
  );
  const repositoryContext = buildChinaVendorMarketContext({
    readModel,
    sellerId,
    sellerHandle: seller.handle,
    marketId,
  });

  if (repositoryContext.memberships.length) {
    return {
      marketContext: repositoryContext,
      dataSource: "repository",
    };
  }

  return {
    marketContext: buildVendorMarketContextFromSellerRows({
      sellerId,
      marketId,
      sellers: [seller],
    }),
    dataSource: "static_fallback",
  };
};

const tableExists = async (
  pg: VendorMarketContextPgConnection,
  tableName: string,
) => Boolean(await pg.schema?.hasTable?.(tableName));

const selectVisibleRows = (
  pg: VendorMarketContextPgConnection,
  tableName: string,
) => pg(tableName).whereNull("deleted_at");

const selectRowsForMarkets = async ({
  pg,
  tableName,
  marketIds,
  marketKey = "market_id",
}: {
  pg: VendorMarketContextPgConnection;
  tableName: string;
  marketIds: string[];
  marketKey?: string;
}) => {
  if (!marketIds.length || !(await tableExists(pg, tableName))) {
    return [];
  }

  return (await selectVisibleRows(pg, tableName)
    .whereIn(marketKey, marketIds)
    .select("*")) as Record<string, unknown>[];
};

export const readVendorMarketContextRepositoryRows = async ({
  pg,
  sellerId,
  marketId,
}: {
  pg: VendorMarketContextPgConnection;
  sellerId: string;
  marketId?: string;
}): Promise<ChinaMarketRepositoryRows | undefined> => {
  const requiredTables = ["china_market", "china_market_membership"];
  const hasRequiredTables = (
    await Promise.all(
      requiredTables.map((tableName) => tableExists(pg, tableName)),
    )
  ).every(Boolean);

  if (!hasRequiredTables) {
    return undefined;
  }

  const membershipQuery = selectVisibleRows(
    pg,
    "china_market_membership",
  ).where("seller_id", sellerId);
  const memberships = (await (
    marketId ? membershipQuery.where("market_id", marketId) : membershipQuery
  ).select("*")) as Record<string, unknown>[];
  const marketIds = Array.from(
    new Set(
      memberships
        .map((membership) => membership.market_id)
        .filter((value): value is string => typeof value === "string"),
    ),
  );

  return {
    markets: await selectRowsForMarkets({
      pg,
      tableName: "china_market",
      marketIds,
      marketKey: "id",
    }),
    memberships,
    roles: (await tableExists(pg, "china_seller_role"))
      ? ((await selectVisibleRows(pg, "china_seller_role")
          .where("seller_id", sellerId)
          .select("*")) as Record<string, unknown>[])
      : [],
    announcements: await selectRowsForMarkets({
      pg,
      tableName: "china_market_announcement",
      marketIds,
    }),
    businessHours: await selectRowsForMarkets({
      pg,
      tableName: "china_market_business_hour",
      marketIds,
    }),
    deliveryProfiles: await selectRowsForMarkets({
      pg,
      tableName: "china_market_delivery_profile",
      marketIds,
    }),
  };
};
