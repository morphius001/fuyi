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

type AdminMarketPgConnection = {
  schema?: {
    hasTable?: (tableName: string) => Promise<boolean>;
  };
  // Knex exposes a broad overloaded query builder. Admin market helpers only
  // need this small read-only subset.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (tableName: string): any;
};

export type AdminMarketReadModelDataSource = "repository" | "static_fallback";

export type AdminMarketReadModelResult = {
  readModel: ChinaMarketReadModelService;
  dataSource: AdminMarketReadModelDataSource;
};

const tableExists = async (pg: AdminMarketPgConnection, tableName: string) =>
  Boolean(await pg.schema?.hasTable?.(tableName));

const selectVisibleRows = (pg: AdminMarketPgConnection, tableName: string) =>
  pg(tableName).whereNull("deleted_at");

const selectOptionalVisibleRows = async (
  pg: AdminMarketPgConnection,
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

export const readAdminMarketRepositoryRows = async (
  pg: AdminMarketPgConnection,
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

export const buildAdminMarketReadModelFromSellerRows = (
  sellerRows: SellerRow[],
): AdminMarketReadModelResult => ({
  readModel: new ChinaMarketReadModelService(
    buildStaticMarketReadModelSeed({
      sellers: sellerRows,
    }),
  ),
  dataSource: "static_fallback",
});

export const buildAdminMarketReadModelFromRepositoryRows = async ({
  rows,
  sellerRows,
}: {
  rows?: ChinaMarketRepositoryRows;
  sellerRows: SellerRow[];
}): Promise<AdminMarketReadModelResult> => {
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

  return buildAdminMarketReadModelFromSellerRows(sellerRows);
};

export const readAdminSellerRows = async (pg: AdminMarketPgConnection) =>
  (await pg("seller")
    .whereNull("deleted_at")
    .orderBy("created_at", "asc")
    .limit(200)
    .select("id", "handle", "name", "metadata")) as SellerRow[];

export const buildAdminMarketReadModelResult = async (
  req: MedusaRequest,
): Promise<AdminMarketReadModelResult> => {
  const pg = req.scope.resolve(
    ContainerRegistrationKeys.PG_CONNECTION,
  ) as AdminMarketPgConnection;
  const sellerRows = await readAdminSellerRows(pg);
  const repositoryRows = await readAdminMarketRepositoryRows(pg);

  return buildAdminMarketReadModelFromRepositoryRows({
    rows: repositoryRows,
    sellerRows,
  });
};

export const buildAdminMarketReadModel = async (req: MedusaRequest) =>
  (await buildAdminMarketReadModelResult(req)).readModel;

export const ADMIN_MARKET_READONLY_NOTE =
  "Admin China market APIs are read-only and do not save configuration, change permissions, or affect checkout, shipping options, orders, payments, refunds, settlements, commissions, or fulfillment.";
