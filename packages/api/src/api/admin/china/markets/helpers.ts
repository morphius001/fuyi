import { MedusaRequest } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

import {
  buildStaticMarketReadModelSeed,
  ChinaMarketReadModelService,
} from "../../../../modules/china-market-read-model";

type SellerRow = {
  id: string;
  handle?: string;
  name: string;
  metadata?: Record<string, unknown> | null;
};

export const buildAdminMarketReadModel = async (req: MedusaRequest) => {
  const pg = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION);
  const sellerRows = (await pg("seller")
    .whereNull("deleted_at")
    .orderBy("created_at", "asc")
    .limit(200)
    .select("id", "handle", "name", "metadata")) as SellerRow[];

  return new ChinaMarketReadModelService(
    buildStaticMarketReadModelSeed({
      sellers: sellerRows,
    })
  );
};

export const ADMIN_MARKET_READONLY_NOTE =
  "Admin China market APIs are read-only and do not save configuration, change permissions, or affect checkout, shipping options, orders, payments, refunds, settlements, commissions, or fulfillment.";
