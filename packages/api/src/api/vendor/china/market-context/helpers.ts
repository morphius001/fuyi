import { MedusaError } from "@medusajs/framework/utils";

import {
  buildChinaVendorMarketContext,
  buildStaticMarketReadModelSeed,
  ChinaMarketReadModelService,
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
