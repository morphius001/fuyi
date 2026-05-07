import { MedusaRequest } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

import {
  buildChinaMarketReadModelSeedFromRepository,
  buildStaticMarketReadModelSeed,
  ChinaMarketRepositoryRows,
  ChinaMarketReadModelService,
} from "../../../../modules/china-market-read-model";

type SellerRow = {
  id: string;
  handle?: string;
  name: string;
  metadata?: Record<string, unknown> | null;
};

type StoreMarketPgConnection = {
  schema?: {
    hasTable?: (tableName: string) => Promise<boolean>;
  };
  // Knex exposes a broad overloaded query builder. Store market helpers only
  // need this small read-only subset.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (tableName: string): any;
};

export type StoreMarketReadModelDataSource = "repository" | "static_fallback";

export type StoreMarketReadModelResult = {
  readModel: ChinaMarketReadModelService;
  dataSource: StoreMarketReadModelDataSource;
};

const tableExists = async (pg: StoreMarketPgConnection, tableName: string) =>
  Boolean(await pg.schema?.hasTable?.(tableName));

const selectVisibleRows = (pg: StoreMarketPgConnection, tableName: string) =>
  pg(tableName).whereNull("deleted_at");

const selectOptionalVisibleRows = async (
  pg: StoreMarketPgConnection,
  tableName: string,
) => {
  if (!(await tableExists(pg, tableName))) {
    return [];
  }

  return (await selectVisibleRows(pg, tableName).select("*")) as Record<
    string,
    unknown
  >[];
};

export const readStoreMarketRepositoryRows = async (
  pg: StoreMarketPgConnection,
): Promise<ChinaMarketRepositoryRows | undefined> => {
  const requiredTables = ["china_market", "china_market_membership"];
  const hasRequiredTables = (
    await Promise.all(
      requiredTables.map((tableName) => tableExists(pg, tableName)),
    )
  ).every(Boolean);

  if (!hasRequiredTables) {
    return undefined;
  }

  return {
    markets: await selectOptionalVisibleRows(pg, "china_market"),
    memberships: await selectOptionalVisibleRows(pg, "china_market_membership"),
    roles: await selectOptionalVisibleRows(pg, "china_seller_role"),
    announcements: await selectOptionalVisibleRows(
      pg,
      "china_market_announcement",
    ),
    businessHours: await selectOptionalVisibleRows(
      pg,
      "china_market_business_hour",
    ),
    deliveryProfiles: await selectOptionalVisibleRows(
      pg,
      "china_market_delivery_profile",
    ),
  };
};

export const buildStoreMarketReadModelFromSellerRows = (
  sellerRows: SellerRow[],
): StoreMarketReadModelResult => ({
  readModel: new ChinaMarketReadModelService(
    buildStaticMarketReadModelSeed({
      sellers: sellerRows,
    }),
  ),
  dataSource: "static_fallback",
});

export const buildStoreMarketReadModelFromRepositoryRows = async ({
  rows,
  sellerRows,
}: {
  rows?: ChinaMarketRepositoryRows;
  sellerRows: SellerRow[];
}): Promise<StoreMarketReadModelResult> => {
  if (rows) {
    const seed = await buildChinaMarketReadModelSeedFromRepository({
      listChinaMarketReadRows: () => rows,
    });

    if (seed.markets?.length) {
      return {
        readModel: new ChinaMarketReadModelService(seed),
        dataSource: "repository",
      };
    }
  }

  return buildStoreMarketReadModelFromSellerRows(sellerRows);
};

export const readStoreSellerRows = async (pg: StoreMarketPgConnection) => {
  const now = new Date();

  return (await pg("seller")
    .whereNull("deleted_at")
    .where("status", "open")
    .andWhere((builder) => {
      builder.whereNull("closed_from").orWhere("closed_from", ">", now);
    })
    .andWhere((builder) => {
      builder.whereNull("closed_to").orWhere("closed_to", "<", now);
    })
    .orderBy("created_at", "asc")
    .limit(100)
    .select("id", "handle", "name", "metadata")) as SellerRow[];
};

export const buildStoreMarketReadModelResult = async (
  req: MedusaRequest,
): Promise<StoreMarketReadModelResult> => {
  const pg = req.scope.resolve(
    ContainerRegistrationKeys.PG_CONNECTION,
  ) as StoreMarketPgConnection;
  const sellerRows = await readStoreSellerRows(pg);
  const repositoryRows = await readStoreMarketRepositoryRows(pg);

  return buildStoreMarketReadModelFromRepositoryRows({
    rows: repositoryRows,
    sellerRows,
  });
};

export const buildStoreMarketReadModel = async (req: MedusaRequest) =>
  (await buildStoreMarketReadModelResult(req)).readModel;

export const STORE_MARKET_READONLY_NOTE =
  "Store China market APIs are read-only and do not affect checkout, shipping options, cart totals, orders, payments, refunds, settlements, commissions, permissions, or fulfillment.";
