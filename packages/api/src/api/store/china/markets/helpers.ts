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

export const buildStoreMarketReadModel = async (req: MedusaRequest) => {
  const pg = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION);
  const now = new Date();
  const sellerRows = (await pg("seller")
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

  return new ChinaMarketReadModelService(
    buildStaticMarketReadModelSeed({
      sellers: sellerRows,
    })
  );
};

export const STORE_MARKET_READONLY_NOTE =
  "Store China market APIs are read-only and do not affect checkout, shipping options, cart totals, orders, payments, refunds, settlements, commissions, permissions, or fulfillment.";
