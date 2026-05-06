export type ChinaReadModelMode =
  | "read_only_discovery"
  | "read_only_module_config"
  | "read_only_product_draft";

export type ChinaReadModelSource =
  | "static_baseline"
  | "static_read_model"
  | "seller_and_category_tables"
  | "draft_skeleton";

export type ChinaMarketReadModel = {
  name: string;
  city: string;
  hours: string;
  notice: string;
  delivery: string;
  source: ChinaReadModelSource | "static_market_contract";
};

export type ChinaSellerDiscoveryReadModel = {
  id: string;
  handle: string;
  name: string;
  market: string;
  booth: string;
  tags: string[];
  summary: string;
  source: "seller_table";
};

export type ChinaCategoryDiscoveryReadModel = {
  id: string;
  handle: string;
  name: string;
  description: string;
  count: string;
  source: "product_category_table";
};

export type ChinaDiscoveryReadModel = {
  mode: "read_only_discovery";
  source: "seller_and_category_tables";
  note: string;
  sellers: ChinaSellerDiscoveryReadModel[];
  markets: ChinaMarketReadModel[];
  categories: ChinaCategoryDiscoveryReadModel[];
};

export type ChinaStorefrontProductCardReadModel = {
  id: string;
  title: string;
  handle?: string;
  sellerId?: string;
  sellerName?: string;
  market?: string;
  booth?: string;
  priceText?: string;
  specText?: string;
  stockText?: string;
  source: "store_product_table" | "placeholder";
};

export type ChinaStorefrontHomeView = {
  mode: "storefront_home_view";
  source: ChinaReadModelSource;
  marketSelector: ChinaMarketReadModel[];
  categoryNav: ChinaCategoryDiscoveryReadModel[];
  featuredSellers: ChinaSellerDiscoveryReadModel[];
  freshProducts: ChinaStorefrontProductCardReadModel[];
  serviceLinks: Array<{
    key: "pickup_card" | "after_sales" | "merchant_entry";
    label: string;
    placement: "secondary";
  }>;
  note: string;
};

export type ChinaStorefrontSearchView = {
  mode: "storefront_search_view";
  source: ChinaReadModelSource;
  query: string;
  marketContext?: ChinaMarketReadModel;
  matchedSellers: ChinaSellerDiscoveryReadModel[];
  matchedCategories: ChinaCategoryDiscoveryReadModel[];
  matchedProducts: ChinaStorefrontProductCardReadModel[];
  note: string;
};

export type ChinaStorefrontSellerView = {
  mode: "storefront_seller_view";
  source: ChinaReadModelSource;
  seller: ChinaSellerDiscoveryReadModel;
  products: ChinaStorefrontProductCardReadModel[];
  pickupCardPlacement: "separate_entry";
  livePlacement: "seller_status_badge";
  note: string;
};

export type ChinaMetadataRecord = Record<string, unknown> | null | undefined;

export type ChinaSellerDiscoveryRow = {
  id: string;
  handle: string;
  name: string;
  metadata?: ChinaMetadataRecord;
};

export type ChinaCategoryDiscoveryRow = {
  id: string;
  handle: string;
  name: string;
  description?: string | null;
  metadata?: ChinaMetadataRecord;
};

export const CHINA_READ_MODEL_RUNTIME_NOTE =
  "This read model is display-only. It does not change product, order, checkout, payment, fulfillment, settlement, commission, payout, refund, or permission behavior.";

export const defaultChinaMarkets: ChinaMarketReadModel[] = [
  {
    name: "三门海鲜市场",
    city: "台州三门",
    hours: "06:30 - 17:30",
    notice: "鲜活区今日到货，冷链配送 10:00 / 15:00。",
    delivery: "市场自提 / 同城配送 / 冷链",
    source: "static_market_contract",
  },
  {
    name: "舟山沈家门市场",
    city: "舟山普陀",
    hours: "07:00 - 18:00",
    notice: "冰鲜海货和干货礼盒供应。",
    delivery: "门店自提 / 快递配送",
    source: "static_market_contract",
  },
];

export const readMetadataString = (
  metadata: ChinaMetadataRecord,
  keys: string[],
  fallback?: string
) => {
  for (const key of keys) {
    const value = metadata?.[key];

    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return fallback;
};

export const buildChinaDiscoveryReadModel = ({
  sellerRows,
  categoryRows,
  markets = defaultChinaMarkets,
}: {
  sellerRows: ChinaSellerDiscoveryRow[];
  categoryRows: ChinaCategoryDiscoveryRow[];
  markets?: ChinaMarketReadModel[];
}): ChinaDiscoveryReadModel => {
  const sellers = sellerRows.map((seller) => {
    const metadata = seller.metadata;
    const market =
      readMetadataString(metadata, ["market", "market_name"]) ??
      "三门海鲜市场";
    const booth =
      readMetadataString(metadata, ["booth", "booth_no", "stall_no"]) ??
      "档口待配置";
    const categories =
      readMetadataString(metadata, ["categories", "category_summary"]) ??
      "本地鲜货";
    const fulfillment =
      readMetadataString(metadata, ["fulfillment", "delivery_summary"]) ??
      "市场自提 / 商家配送可配置";

    return {
      id: seller.id,
      handle: seller.handle,
      name: seller.name,
      market,
      booth,
      tags: ["真实商家", "已开放", categories],
      summary: `${categories}，${fulfillment}。`,
      source: "seller_table" as const,
    };
  });

  const categories = categoryRows.map((category) => ({
    id: category.id,
    handle: category.handle,
    name: category.name,
    description:
      category.description ??
      readMetadataString(category.metadata, ["description", "summary"]) ??
      "本地市场类目",
    count: "真实类目",
    source: "product_category_table" as const,
  }));

  return {
    mode: "read_only_discovery",
    source: "seller_and_category_tables",
    note: CHINA_READ_MODEL_RUNTIME_NOTE,
    sellers,
    markets,
    categories,
  };
};

export const buildChinaStorefrontHomeView = ({
  discovery,
  products = [],
}: {
  discovery: ChinaDiscoveryReadModel;
  products?: ChinaStorefrontProductCardReadModel[];
}): ChinaStorefrontHomeView => ({
  mode: "storefront_home_view",
  source: discovery.source,
  marketSelector: discovery.markets,
  categoryNav: discovery.categories,
  featuredSellers: discovery.sellers,
  freshProducts: products,
  serviceLinks: [
    {
      key: "pickup_card",
      label: "提货卡",
      placement: "secondary",
    },
    {
      key: "after_sales",
      label: "售后服务",
      placement: "secondary",
    },
    {
      key: "merchant_entry",
      label: "商家入驻",
      placement: "secondary",
    },
  ],
  note: CHINA_READ_MODEL_RUNTIME_NOTE,
});

const includesQuery = (value: string | undefined, query: string) =>
  !query || value?.toLowerCase().includes(query.toLowerCase());

export const buildChinaStorefrontSearchView = ({
  discovery,
  query,
  products = [],
  marketName,
}: {
  discovery: ChinaDiscoveryReadModel;
  query: string;
  products?: ChinaStorefrontProductCardReadModel[];
  marketName?: string;
}): ChinaStorefrontSearchView => {
  const trimmedQuery = query.trim();
  const marketContext = marketName
    ? discovery.markets.find((market) => market.name === marketName)
    : undefined;

  return {
    mode: "storefront_search_view",
    source: discovery.source,
    query: trimmedQuery,
    marketContext,
    matchedSellers: discovery.sellers.filter((seller) =>
      [
        seller.name,
        seller.market,
        seller.booth,
        seller.summary,
        ...seller.tags,
      ].some((value) => includesQuery(value, trimmedQuery))
    ),
    matchedCategories: discovery.categories.filter((category) =>
      [category.name, category.description].some((value) =>
        includesQuery(value, trimmedQuery)
      )
    ),
    matchedProducts: products.filter((product) =>
      [
        product.title,
        product.sellerName,
        product.market,
        product.booth,
        product.specText,
      ].some((value) => includesQuery(value, trimmedQuery))
    ),
    note: CHINA_READ_MODEL_RUNTIME_NOTE,
  };
};

export const buildChinaStorefrontSellerView = ({
  seller,
  products = [],
}: {
  seller: ChinaSellerDiscoveryReadModel;
  products?: ChinaStorefrontProductCardReadModel[];
}): ChinaStorefrontSellerView => ({
  mode: "storefront_seller_view",
  source: "seller_and_category_tables",
  seller,
  products: products.filter(
    (product) => !product.sellerId || product.sellerId === seller.id
  ),
  pickupCardPlacement: "separate_entry",
  livePlacement: "seller_status_badge",
  note: CHINA_READ_MODEL_RUNTIME_NOTE,
});

export type ChinaModuleRuntimeScope =
  | "display_only"
  | "menu"
  | "fulfillment"
  | "payment"
  | "settlement"
  | "permission";

export type ChinaModuleConfigState =
  | "hidden"
  | "visible_disabled"
  | "requestable"
  | "mock_only"
  | "enabled"
  | "suspended"
  | "blocked_serial";

export type ChinaModuleDefinitionReadModel = {
  key: string;
  label: string;
  description: string;
  riskLevel: "low" | "medium" | "high" | "blocked_serial";
  runtimeScope: ChinaModuleRuntimeScope;
  defaultState: ChinaModuleConfigState;
  allowMarketOverride: boolean;
  allowMerchantTypeOverride: boolean;
  allowSellerOverride: boolean;
};

export type ChinaModuleConfigReadModel = {
  moduleKey: string;
  scopeType: "platform" | "market" | "merchant_type" | "seller" | "emergency";
  scopeId?: string;
  state: ChinaModuleConfigState;
  status: "draft" | "published" | "archived";
  version: number;
  reason?: string;
};

export type ChinaModuleEffectiveCapability = {
  moduleKey: string;
  label: string;
  state: ChinaModuleConfigState;
  source: "definition_default" | ChinaModuleConfigReadModel["scopeType"];
  runtimeScope: ChinaModuleRuntimeScope;
  riskLevel: ChinaModuleDefinitionReadModel["riskLevel"];
  runtimeEnabled: false;
  note: string;
};

export type ChinaModuleCapabilityView = {
  mode: "read_only_module_config";
  source: "static_read_model";
  context: {
    marketId?: string;
    merchantType?: string;
    sellerId?: string;
  };
  capabilities: ChinaModuleEffectiveCapability[];
};

const scopePriority: Record<ChinaModuleConfigReadModel["scopeType"], number> = {
  platform: 1,
  market: 2,
  merchant_type: 3,
  seller: 4,
  emergency: 5,
};

export const buildChinaModuleCapabilityView = ({
  definitions,
  configs = [],
  context = {},
}: {
  definitions: ChinaModuleDefinitionReadModel[];
  configs?: ChinaModuleConfigReadModel[];
  context?: ChinaModuleCapabilityView["context"];
}): ChinaModuleCapabilityView => {
  const publishedConfigs = configs
    .filter((config) => config.status === "published")
    .sort((left, right) => {
      const priorityDelta =
        scopePriority[left.scopeType] - scopePriority[right.scopeType];

      if (priorityDelta !== 0) {
        return priorityDelta;
      }

      return left.version - right.version;
    });

  const capabilities = definitions.map((definition) => {
    const matchingConfig = publishedConfigs
      .filter((config) => config.moduleKey === definition.key)
      .filter((config) => {
        if (config.scopeType === "platform" || config.scopeType === "emergency") {
          return true;
        }

        if (config.scopeType === "market") {
          return config.scopeId === context.marketId;
        }

        if (config.scopeType === "merchant_type") {
          return config.scopeId === context.merchantType;
        }

        return config.scopeId === context.sellerId;
      })
      .at(-1);

    const source: ChinaModuleEffectiveCapability["source"] =
      matchingConfig?.scopeType ?? "definition_default";

    return {
      moduleKey: definition.key,
      label: definition.label,
      state: matchingConfig?.state ?? definition.defaultState,
      source,
      runtimeScope: definition.runtimeScope,
      riskLevel: definition.riskLevel,
      runtimeEnabled: false as const,
      note: CHINA_READ_MODEL_RUNTIME_NOTE,
    };
  });

  return {
    mode: "read_only_module_config",
    source: "static_read_model",
    context,
    capabilities,
  };
};

export type ChinaVendorProductDraftStatus =
  | "draft_created"
  | "ai_suggested"
  | "merchant_reviewing"
  | "pending_platform_review"
  | "ready_for_product_create"
  | "rejected"
  | "cancelled";

export type ChinaVendorProductDraftReadModel = {
  mode: "read_only_product_draft";
  source: "draft_skeleton";
  draftId: string;
  sellerId: string;
  marketId?: string;
  status: ChinaVendorProductDraftStatus;
  canCreateProduct: false;
  note: string;
};

export const buildChinaVendorProductDraftReadModel = ({
  draftId,
  sellerId,
  marketId,
  status = "draft_created",
}: {
  draftId: string;
  sellerId: string;
  marketId?: string;
  status?: ChinaVendorProductDraftStatus;
}): ChinaVendorProductDraftReadModel => ({
  mode: "read_only_product_draft",
  source: "draft_skeleton",
  draftId,
  sellerId,
  marketId,
  status,
  canCreateProduct: false,
  note: "Draft read models do not create products, initialize inventory, publish listings, or change order/payment/fulfillment behavior.",
});
