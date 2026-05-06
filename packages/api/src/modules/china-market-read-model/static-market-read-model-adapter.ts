import { defaultChinaMarkets, readMetadataString } from "../../lib/china-read-models";
import {
  ChinaMarket,
  ChinaMarketDeliveryProfile,
  ChinaMarketMembership,
  ChinaMarketReadModelSeed,
} from "./types";

type SellerMetadataRow = {
  id: string;
  handle?: string;
  name: string;
  metadata?: Record<string, unknown> | null;
};

const slugifyMarketName = (name: string) =>
  name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\u4e00-\u9fa5-]/g, "");

const marketIdFromSlug = (slug: string) => `market_${slug}`;

export const buildStaticMarketReadModelSeed = ({
  sellers = [],
}: {
  sellers?: SellerMetadataRow[];
} = {}): ChinaMarketReadModelSeed => {
  const markets: ChinaMarket[] = defaultChinaMarkets.map((market) => {
    const slug = slugifyMarketName(market.name);

    return {
      id: marketIdFromSlug(slug),
      name: market.name,
      slug,
      city: market.city,
      status: "open",
      timezone: "Asia/Shanghai",
      metadata: {
        source: market.source,
        hours: market.hours,
        notice: market.notice,
      },
    };
  });
  const marketByName = new Map(markets.map((market) => [market.name, market]));
  const memberships: ChinaMarketMembership[] = sellers.map((seller, index) => {
    const marketName =
      readMetadataString(seller.metadata, ["market_name", "market"]) ??
      defaultChinaMarkets[0].name;
    const market = marketByName.get(marketName) ?? markets[0];

    return {
      id: `membership_static_${seller.id || index}`,
      marketId: market.id,
      sellerId: seller.id,
      sellerHandle: seller.handle,
      sellerName: seller.name,
      boothNo:
        readMetadataString(seller.metadata, ["booth_no", "booth", "stall_no"]) ??
        "档口待配置",
      stallName: readMetadataString(seller.metadata, ["stall_name"]),
      isPrimary: true,
      status: "open",
      mainCategoryIds: [],
      metadata: {
        source: "seller_metadata_static_adapter",
        categorySummary: readMetadataString(seller.metadata, [
          "category_summary",
          "categories",
        ]),
      },
    };
  });
  const deliveryProfiles: ChinaMarketDeliveryProfile[] = markets.flatMap((market) => [
    {
      id: `delivery_${market.id}_pickup`,
      marketId: market.id,
      deliveryType: "market_pickup",
      enabled: true,
      displayName: "市场自提",
      metadata: {
        source: "static_market_contract",
      },
    },
    {
      id: `delivery_${market.id}_display`,
      marketId: market.id,
      deliveryType: "market_unified_delivery",
      enabled: true,
      displayName: "统一配送展示能力",
      serviceAreaNote: "仅展示，不影响 checkout shipping options",
      metadata: {
        source: "static_market_contract",
      },
    },
  ]);

  return {
    markets,
    memberships,
    deliveryProfiles,
  };
};
