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

export type ChinaStorefrontHomeTemplateId = "storefront-home-market-shop-v2";

export type ChinaStorefrontHomeDataSourceView = {
  key:
    | "markets"
    | "categories"
    | "featured_sellers"
    | "fresh_products"
    | "service_links";
  source: ChinaReadModelSource | "static_market_contract" | "static_fallback";
  fallbackUsed: boolean;
};

export type ChinaStorefrontHomeConsumerPathStep =
  | "market_switch"
  | "category_discovery"
  | "shop_discovery"
  | "fresh_product_preview"
  | "shop_detail";

export type ChinaStorefrontHomeExcludedSection = {
  key:
    | "materials_suppliers"
    | "delivery_suppliers"
    | "upstream_supply"
    | "seedling_wholesale"
    | "regional_wholesale"
    | "live_primary_entry";
  reason: string;
};

export type ChinaStorefrontHomeBoundaryView = {
  key:
    | "checkout_shipping_options"
    | "payment_success"
    | "order_status"
    | "refund_status"
    | "settlement"
    | "commission"
    | "payout"
    | "fulfillment"
    | "consumer_b_side_visibility"
    | "pickup_card_checkout_discount"
    | "real_provider_config";
  status: "blocked_serial_work";
  reason: string;
};

export type ChinaStorefrontShopTemplateId = "storefront-shop-stall-v2";

export type ChinaStorefrontShopVisibility =
  | "consumer_default_visible"
  | "role_gated_preview_only";

export type ChinaStorefrontShopDataSourceView = {
  key:
    | "seller"
    | "market_context"
    | "products"
    | "fulfillment_hint"
    | "pickup_card_entry"
    | "live_status";
  source:
    | ChinaReadModelSource
    | "seller_summary"
    | "market_contract"
    | "static_read_model"
    | "static_fallback";
  fallbackUsed: boolean;
};

export type ChinaStorefrontShopFulfillmentHintView = {
  placement: "shop_header";
  text: string;
  source: "seller_summary" | "market_contract" | "static_fallback";
  affectsCheckoutShippingOptions: false;
};

export type ChinaStorefrontShopDisplayRuleView = {
  key:
    | "fulfillment_belongs_to_shop"
    | "product_cards_are_readonly"
    | "pickup_card_is_independent"
    | "live_is_status_badge";
  reason: string;
};

export type ChinaStorefrontShopBoundaryView = {
  key:
    | "checkout_shipping_options"
    | "payment_success"
    | "order_status"
    | "refund_status"
    | "settlement"
    | "commission"
    | "payout"
    | "fulfillment"
    | "pickup_card_checkout_discount"
    | "live_provider_runtime"
    | "real_provider_config";
  status: "blocked_serial_work";
  reason: string;
};

export type ChinaStorefrontSearchTemplateId =
  "storefront-search-market-results-v1";

export type ChinaStorefrontSearchResultGroupView = {
  key: "markets" | "categories" | "shops" | "products";
  label: string;
  count: number;
  consumerFacing: true;
};

export type ChinaStorefrontSearchDataSourceView = {
  key:
    | "query"
    | "market_context"
    | "matched_sellers"
    | "matched_categories"
    | "matched_products";
  source: ChinaReadModelSource | "static_fallback";
  fallbackUsed: boolean;
};

export type ChinaStorefrontSearchDisplayRuleView = {
  key:
    | "consumer_results_only"
    | "market_context_is_filter"
    | "product_cards_are_readonly"
    | "empty_state_is_display_only";
  reason: string;
};

export type ChinaStorefrontSearchBoundaryView = {
  key:
    | "inventory_reservation"
    | "checkout_shipping_options"
    | "payment_success"
    | "order_status"
    | "refund_status"
    | "settlement"
    | "commission"
    | "payout"
    | "fulfillment"
    | "search_ranking_runtime"
    | "real_provider_config";
  status: "blocked_serial_work";
  reason: string;
};

export type ChinaStorefrontHomeView = {
  mode: "storefront_home_view";
  templateId: ChinaStorefrontHomeTemplateId;
  source: ChinaReadModelSource;
  locale: "zh-CN";
  currency: "CNY";
  timezone: "Asia/Shanghai";
  marketSelector: ChinaMarketReadModel[];
  categoryNav: ChinaCategoryDiscoveryReadModel[];
  featuredSellers: ChinaSellerDiscoveryReadModel[];
  freshProducts: ChinaStorefrontProductCardReadModel[];
  serviceLinks: Array<{
    key: "pickup_card" | "after_sales" | "merchant_entry";
    label: string;
    placement: "secondary";
  }>;
  consumerPath: ChinaStorefrontHomeConsumerPathStep[];
  dataSources: ChinaStorefrontHomeDataSourceView[];
  excludedConsumerSections: ChinaStorefrontHomeExcludedSection[];
  highRiskBoundaries: ChinaStorefrontHomeBoundaryView[];
  fallbackNotice?: string;
  readOnly: true;
  runtimeEnabled: false;
  canWriteBusinessState: false;
  note: string;
};

export type ChinaStorefrontSearchView = {
  mode: "storefront_search_view";
  templateId: ChinaStorefrontSearchTemplateId;
  source: ChinaReadModelSource;
  locale: "zh-CN";
  currency: "CNY";
  timezone: "Asia/Shanghai";
  query: string;
  normalizedQuery: string;
  marketContext?: ChinaMarketReadModel;
  matchedSellers: ChinaSellerDiscoveryReadModel[];
  matchedCategories: ChinaCategoryDiscoveryReadModel[];
  matchedProducts: ChinaStorefrontProductCardReadModel[];
  resultGroups: ChinaStorefrontSearchResultGroupView[];
  displayRules: ChinaStorefrontSearchDisplayRuleView[];
  dataSources: ChinaStorefrontSearchDataSourceView[];
  highRiskBoundaries: ChinaStorefrontSearchBoundaryView[];
  fallbackNotice?: string;
  readOnly: true;
  runtimeEnabled: false;
  canWriteBusinessState: false;
  note: string;
};

export type ChinaStorefrontSellerView = {
  mode: "storefront_seller_view";
  templateId: ChinaStorefrontShopTemplateId;
  source: ChinaReadModelSource;
  locale: "zh-CN";
  currency: "CNY";
  timezone: "Asia/Shanghai";
  seller: ChinaSellerDiscoveryReadModel;
  marketContext?: ChinaMarketReadModel;
  products: ChinaStorefrontProductCardReadModel[];
  visibility: ChinaStorefrontShopVisibility;
  consumerFacing: boolean;
  fulfillmentHint: ChinaStorefrontShopFulfillmentHintView;
  pickupCardPlacement: "separate_entry";
  livePlacement: "seller_status_badge";
  displayRules: ChinaStorefrontShopDisplayRuleView[];
  dataSources: ChinaStorefrontShopDataSourceView[];
  highRiskBoundaries: ChinaStorefrontShopBoundaryView[];
  fallbackNotice?: string;
  readOnly: true;
  runtimeEnabled: false;
  canWriteBusinessState: false;
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

const storefrontHomeExcludedConsumerSections: ChinaStorefrontHomeExcludedSection[] =
  [
    {
      key: "materials_suppliers",
      reason: "物料供应商面向商户采购，不进入消费者首页主路径。",
    },
    {
      key: "delivery_suppliers",
      reason: "配送供应商能力由市场/商家配置展示，不作为消费者首页入口。",
    },
    {
      key: "upstream_supply",
      reason: "养殖户、种植户和外地批发商属于供给链协作，不默认展示给消费者。",
    },
    {
      key: "seedling_wholesale",
      reason: "种苗批发面向养殖户、种植户和商户，不进入消费者首页。",
    },
    {
      key: "regional_wholesale",
      reason: "外地批发商对接商户，不进入消费者首页主路径。",
    },
    {
      key: "live_primary_entry",
      reason: "直播只作为店铺状态或局部入口，不作为首页主入口。",
    },
  ];

const storefrontHomeHighRiskBoundaries: ChinaStorefrontHomeBoundaryView[] = [
  {
    key: "checkout_shipping_options",
    status: "blocked_serial_work",
    reason: "首页配送展示不能写入 checkout shipping options。",
  },
  {
    key: "payment_success",
    status: "blocked_serial_work",
    reason: "支付成功必须以后端异步通知为准，首页 mapper 不参与支付状态。",
  },
  {
    key: "order_status",
    status: "blocked_serial_work",
    reason: "首页 mapper 不创建或修改订单状态。",
  },
  {
    key: "refund_status",
    status: "blocked_serial_work",
    reason: "首页 mapper 不创建或修改退款状态。",
  },
  {
    key: "settlement",
    status: "blocked_serial_work",
    reason: "首页 mapper 不改变结算主体、周期或规则。",
  },
  {
    key: "commission",
    status: "blocked_serial_work",
    reason: "首页 mapper 不改变佣金规则。",
  },
  {
    key: "payout",
    status: "blocked_serial_work",
    reason: "首页 mapper 不处理商家打款。",
  },
  {
    key: "fulfillment",
    status: "blocked_serial_work",
    reason: "首页 mapper 不创建履约单、配送单、运单或面单。",
  },
  {
    key: "consumer_b_side_visibility",
    status: "blocked_serial_work",
    reason: "物料、配送供应商和上游供给默认不进入消费者首页。",
  },
  {
    key: "pickup_card_checkout_discount",
    status: "blocked_serial_work",
    reason: "提货卡保持独立入口，不作为优惠券、支付方式或购物车抵扣。",
  },
  {
    key: "real_provider_config",
    status: "blocked_serial_work",
    reason: "首页 mapper 不保存或启用真实 Provider 配置。",
  },
];

const storefrontHomeConsumerPath: ChinaStorefrontHomeConsumerPathStep[] = [
  "market_switch",
  "category_discovery",
  "shop_discovery",
  "fresh_product_preview",
  "shop_detail",
];

const bSideConsumerHomeKeywords = [
  "物料",
  "包装",
  "泡沫箱",
  "冰袋",
  "冰块",
  "配送供应商",
  "上游",
  "种苗",
  "外地批发",
];

const includesAnyKeyword = (values: Array<string | undefined>) =>
  values.some((value) =>
    bSideConsumerHomeKeywords.some((keyword) => value?.includes(keyword))
  );

const isConsumerHomeSeller = (seller: ChinaSellerDiscoveryReadModel) =>
  !includesAnyKeyword([
    seller.name,
    seller.market,
    seller.booth,
    seller.summary,
    ...seller.tags,
  ]);

const isConsumerHomeCategory = (category: ChinaCategoryDiscoveryReadModel) =>
  !includesAnyKeyword([category.name, category.description]);

const isConsumerHomeProduct = (product: ChinaStorefrontProductCardReadModel) =>
  !includesAnyKeyword([
    product.title,
    product.sellerName,
    product.market,
    product.booth,
    product.specText,
  ]);

const resolveStorefrontHomeMarketSource = (
  markets: ChinaMarketReadModel[]
): ChinaStorefrontHomeDataSourceView["source"] => {
  if (!markets.length) {
    return "static_fallback";
  }

  return markets.every((market) => market.source === "static_market_contract")
    ? "static_market_contract"
    : "seller_and_category_tables";
};

export const buildChinaStorefrontHomeView = ({
  discovery,
  products = [],
  fallbackNotice,
}: {
  discovery: ChinaDiscoveryReadModel;
  products?: ChinaStorefrontProductCardReadModel[];
  fallbackNotice?: string;
}): ChinaStorefrontHomeView => {
  const categoryNav = discovery.categories.filter(isConsumerHomeCategory);
  const featuredSellers = discovery.sellers.filter(isConsumerHomeSeller);
  const freshProducts = products.filter(isConsumerHomeProduct);
  const serviceLinks = [
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
  ] satisfies ChinaStorefrontHomeView["serviceLinks"];
  const hasDiscoveryContent =
    discovery.markets.length > 0 ||
    categoryNav.length > 0 ||
    featuredSellers.length > 0;

  return {
    mode: "storefront_home_view",
    templateId: "storefront-home-market-shop-v2",
    source: discovery.source,
    locale: "zh-CN",
    currency: "CNY",
    timezone: "Asia/Shanghai",
    marketSelector: discovery.markets,
    categoryNav,
    featuredSellers,
    freshProducts,
    serviceLinks,
    consumerPath: storefrontHomeConsumerPath,
    dataSources: [
      {
        key: "markets",
        source: resolveStorefrontHomeMarketSource(discovery.markets),
        fallbackUsed: discovery.markets.length === 0,
      },
      {
        key: "categories",
        source: discovery.source,
        fallbackUsed: categoryNav.length === 0,
      },
      {
        key: "featured_sellers",
        source: discovery.source,
        fallbackUsed: featuredSellers.length === 0,
      },
      {
        key: "fresh_products",
        source: freshProducts.length ? "static_read_model" : "static_fallback",
        fallbackUsed: freshProducts.length === 0,
      },
      {
        key: "service_links",
        source: "static_read_model",
        fallbackUsed: false,
      },
    ],
    excludedConsumerSections: storefrontHomeExcludedConsumerSections,
    highRiskBoundaries: storefrontHomeHighRiskBoundaries,
    fallbackNotice:
      fallbackNotice ??
      (hasDiscoveryContent ? undefined : "首页展示数据待后台运营配置。"),
    readOnly: true,
    runtimeEnabled: false,
    canWriteBusinessState: false,
    note: CHINA_READ_MODEL_RUNTIME_NOTE,
  };
};

const includesQuery = (value: string | undefined, query: string) =>
  !query || value?.toLowerCase().includes(query.toLowerCase());

const storefrontSearchDisplayRules: ChinaStorefrontSearchDisplayRuleView[] = [
  {
    key: "consumer_results_only",
    reason: "消费者搜索默认只返回市场、类目、店铺和商品找货结果，不展示物料、配送供应商或上游供给主路径。",
  },
  {
    key: "market_context_is_filter",
    reason: "市场上下文只作为搜索过滤和展示提示，不改变配送、库存或交易事实。",
  },
  {
    key: "product_cards_are_readonly",
    reason: "搜索商品卡只展示规格、价格和库存提示，不创建购物车、订单或库存占用。",
  },
  {
    key: "empty_state_is_display_only",
    reason: "搜索空状态只提示换关键词或切市场，不触发补货、询价、订单或客服流程。",
  },
];

const storefrontSearchHighRiskBoundaries: ChinaStorefrontSearchBoundaryView[] = [
  {
    key: "inventory_reservation",
    status: "blocked_serial_work",
    reason: "搜索结果不占用库存，也不锁定价格或规格。",
  },
  {
    key: "checkout_shipping_options",
    status: "blocked_serial_work",
    reason: "搜索市场过滤不写入 checkout shipping options。",
  },
  {
    key: "payment_success",
    status: "blocked_serial_work",
    reason: "搜索页不决定支付成功，支付成功必须以后端异步通知为准。",
  },
  {
    key: "order_status",
    status: "blocked_serial_work",
    reason: "搜索 mapper 不创建或修改订单状态。",
  },
  {
    key: "refund_status",
    status: "blocked_serial_work",
    reason: "搜索 mapper 不创建或修改退款状态。",
  },
  {
    key: "settlement",
    status: "blocked_serial_work",
    reason: "搜索 mapper 不改变结算主体、周期或规则。",
  },
  {
    key: "commission",
    status: "blocked_serial_work",
    reason: "搜索 mapper 不改变佣金规则。",
  },
  {
    key: "payout",
    status: "blocked_serial_work",
    reason: "搜索 mapper 不处理商家打款。",
  },
  {
    key: "fulfillment",
    status: "blocked_serial_work",
    reason: "搜索 mapper 不创建履约单、配送单、运单或面单。",
  },
  {
    key: "search_ranking_runtime",
    status: "blocked_serial_work",
    reason: "搜索 mapper 不接真实排序、广告、竞价或推荐系统。",
  },
  {
    key: "real_provider_config",
    status: "blocked_serial_work",
    reason: "搜索 mapper 不保存或启用真实 Provider 配置。",
  },
];

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
  const matchedSellers = discovery.sellers
    .filter(isConsumerHomeSeller)
    .filter((seller) =>
      [
        seller.name,
        seller.market,
        seller.booth,
        seller.summary,
        ...seller.tags,
      ].some((value) => includesQuery(value, trimmedQuery))
    );
  const matchedCategories = discovery.categories
    .filter(isConsumerHomeCategory)
    .filter((category) =>
      [category.name, category.description].some((value) =>
        includesQuery(value, trimmedQuery)
      )
    );
  const matchedProducts = products.filter(
    (product) =>
      isConsumerHomeProduct(product) &&
      [
        product.title,
        product.sellerName,
        product.market,
        product.booth,
        product.specText,
      ].some((value) => includesQuery(value, trimmedQuery))
  );

  return {
    mode: "storefront_search_view",
    templateId: "storefront-search-market-results-v1",
    source: discovery.source,
    locale: "zh-CN",
    currency: "CNY",
    timezone: "Asia/Shanghai",
    query: trimmedQuery,
    normalizedQuery: trimmedQuery.toLowerCase(),
    marketContext,
    matchedSellers,
    matchedCategories,
    matchedProducts,
    resultGroups: [
      {
        key: "markets",
        label: "市场",
        count: marketContext ? 1 : discovery.markets.length,
        consumerFacing: true,
      },
      {
        key: "categories",
        label: "类目",
        count: matchedCategories.length,
        consumerFacing: true,
      },
      {
        key: "shops",
        label: "店铺 / 档口",
        count: matchedSellers.length,
        consumerFacing: true,
      },
      {
        key: "products",
        label: "商品",
        count: matchedProducts.length,
        consumerFacing: true,
      },
    ],
    displayRules: storefrontSearchDisplayRules,
    dataSources: [
      {
        key: "query",
        source: "static_read_model",
        fallbackUsed: !trimmedQuery,
      },
      {
        key: "market_context",
        source: marketContext ? discovery.source : "static_fallback",
        fallbackUsed: Boolean(marketName && !marketContext),
      },
      {
        key: "matched_sellers",
        source: discovery.source,
        fallbackUsed: matchedSellers.length === 0,
      },
      {
        key: "matched_categories",
        source: discovery.source,
        fallbackUsed: matchedCategories.length === 0,
      },
      {
        key: "matched_products",
        source: matchedProducts.length ? "static_read_model" : "static_fallback",
        fallbackUsed: matchedProducts.length === 0,
      },
    ],
    highRiskBoundaries: storefrontSearchHighRiskBoundaries,
    fallbackNotice:
      matchedSellers.length || matchedCategories.length || matchedProducts.length
        ? undefined
        : "没有找到匹配内容，可以换个关键词或切换市场。",
    readOnly: true,
    runtimeEnabled: false,
    canWriteBusinessState: false,
    note: CHINA_READ_MODEL_RUNTIME_NOTE,
  };
};

const storefrontShopDisplayRules: ChinaStorefrontShopDisplayRuleView[] = [
  {
    key: "fulfillment_belongs_to_shop",
    reason: "配送、自提、营业时间和公告属于店铺/档口头部能力，不放在商品卡里决定。",
  },
  {
    key: "product_cards_are_readonly",
    reason: "商品卡只展示规格、价格和库存提示，不创建购物车、订单或履约状态。",
  },
  {
    key: "pickup_card_is_independent",
    reason: "提货卡是独立提货入口，不作为优惠券、储值卡、支付方式或购物车抵扣。",
  },
  {
    key: "live_is_status_badge",
    reason: "直播只作为店铺状态或局部入口，不作为首页主入口或交易事实来源。",
  },
];

const storefrontShopHighRiskBoundaries: ChinaStorefrontShopBoundaryView[] = [
  {
    key: "checkout_shipping_options",
    status: "blocked_serial_work",
    reason: "店铺履约提示不写入 checkout shipping options。",
  },
  {
    key: "payment_success",
    status: "blocked_serial_work",
    reason: "店铺页不决定支付成功，支付成功必须以后端异步通知为准。",
  },
  {
    key: "order_status",
    status: "blocked_serial_work",
    reason: "店铺页 mapper 不创建或修改订单状态。",
  },
  {
    key: "refund_status",
    status: "blocked_serial_work",
    reason: "店铺页 mapper 不创建或修改退款状态。",
  },
  {
    key: "settlement",
    status: "blocked_serial_work",
    reason: "店铺页 mapper 不改变商家结算规则。",
  },
  {
    key: "commission",
    status: "blocked_serial_work",
    reason: "店铺页 mapper 不改变佣金规则。",
  },
  {
    key: "payout",
    status: "blocked_serial_work",
    reason: "店铺页 mapper 不处理商家打款。",
  },
  {
    key: "fulfillment",
    status: "blocked_serial_work",
    reason: "店铺页 mapper 不创建履约单、配送单、运单或面单。",
  },
  {
    key: "pickup_card_checkout_discount",
    status: "blocked_serial_work",
    reason: "提货卡保持独立入口，不作为购物车抵扣。",
  },
  {
    key: "live_provider_runtime",
    status: "blocked_serial_work",
    reason: "直播真实 provider 和 IM 互动必须后续单独接入。",
  },
  {
    key: "real_provider_config",
    status: "blocked_serial_work",
    reason: "店铺页 mapper 不保存或启用真实 Provider 配置。",
  },
];

const resolveStorefrontShopFulfillmentHint = ({
  seller,
  marketContext,
}: {
  seller: ChinaSellerDiscoveryReadModel;
  marketContext?: ChinaMarketReadModel;
}): ChinaStorefrontShopFulfillmentHintView => {
  if (seller.summary) {
    return {
      placement: "shop_header",
      text: seller.summary,
      source: "seller_summary",
      affectsCheckoutShippingOptions: false,
    };
  }

  if (marketContext?.delivery) {
    return {
      placement: "shop_header",
      text: marketContext.delivery,
      source: "market_contract",
      affectsCheckoutShippingOptions: false,
    };
  }

  return {
    placement: "shop_header",
    text: "配送、自提和营业时间待后台运营配置。",
    source: "static_fallback",
    affectsCheckoutShippingOptions: false,
  };
};

export const buildChinaStorefrontSellerView = ({
  seller,
  products = [],
  markets = defaultChinaMarkets,
  fallbackNotice,
}: {
  seller: ChinaSellerDiscoveryReadModel;
  products?: ChinaStorefrontProductCardReadModel[];
  markets?: ChinaMarketReadModel[];
  fallbackNotice?: string;
}): ChinaStorefrontSellerView => {
  const marketContext = markets.find((market) => market.name === seller.market);
  const sellerProducts = products.filter(
    (product) => !product.sellerId || product.sellerId === seller.id
  );
  const consumerFacing = isConsumerHomeSeller(seller);

  return {
    mode: "storefront_seller_view",
    templateId: "storefront-shop-stall-v2",
    source: "seller_and_category_tables",
    locale: "zh-CN",
    currency: "CNY",
    timezone: "Asia/Shanghai",
    seller,
    marketContext,
    products: sellerProducts,
    visibility: consumerFacing
      ? "consumer_default_visible"
      : "role_gated_preview_only",
    consumerFacing,
    fulfillmentHint: resolveStorefrontShopFulfillmentHint({
      seller,
      marketContext,
    }),
    pickupCardPlacement: "separate_entry",
    livePlacement: "seller_status_badge",
    displayRules: storefrontShopDisplayRules,
    dataSources: [
      {
        key: "seller",
        source: "seller_and_category_tables",
        fallbackUsed: false,
      },
      {
        key: "market_context",
        source: marketContext ? "market_contract" : "static_fallback",
        fallbackUsed: !marketContext,
      },
      {
        key: "products",
        source: sellerProducts.length ? "static_read_model" : "static_fallback",
        fallbackUsed: sellerProducts.length === 0,
      },
      {
        key: "fulfillment_hint",
        source: resolveStorefrontShopFulfillmentHint({
          seller,
          marketContext,
        }).source,
        fallbackUsed: !seller.summary && !marketContext?.delivery,
      },
      {
        key: "pickup_card_entry",
        source: "static_read_model",
        fallbackUsed: false,
      },
      {
        key: "live_status",
        source: "static_read_model",
        fallbackUsed: false,
      },
    ],
    highRiskBoundaries: storefrontShopHighRiskBoundaries,
    fallbackNotice:
      fallbackNotice ??
      (sellerProducts.length ? undefined : "店铺商品展示待后台运营配置。"),
    readOnly: true,
    runtimeEnabled: false,
    canWriteBusinessState: false,
    note: CHINA_READ_MODEL_RUNTIME_NOTE,
  };
};

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

export const defaultChinaModuleDefinitions: ChinaModuleDefinitionReadModel[] = [
  {
    key: "shop_decoration",
    label: "店铺装修",
    description: "商家主页装修入口，只控制展示和编辑入口，不放大商品或权限能力。",
    riskLevel: "low",
    runtimeScope: "display_only",
    defaultState: "requestable",
    allowMarketOverride: true,
    allowMerchantTypeOverride: true,
    allowSellerOverride: true,
  },
  {
    key: "pickup_card",
    label: "提货卡",
    description: "提货卡为独立兑换入口，不是优惠券、满减券、储值卡或支付方式。",
    riskLevel: "medium",
    runtimeScope: "display_only",
    defaultState: "mock_only",
    allowMarketOverride: true,
    allowMerchantTypeOverride: false,
    allowSellerOverride: false,
  },
  {
    key: "live_commerce",
    label: "直播状态",
    description: "直播只作为店铺/档口轻量状态，真实直播 provider 后续单独接入。",
    riskLevel: "medium",
    runtimeScope: "display_only",
    defaultState: "visible_disabled",
    allowMarketOverride: true,
    allowMerchantTypeOverride: true,
    allowSellerOverride: true,
  },
  {
    key: "ai_quick_listing",
    label: "AI 快速上架草稿",
    description: "AI 只能生成草稿建议，商户确认和平台审核前不能创建真实商品。",
    riskLevel: "medium",
    runtimeScope: "menu",
    defaultState: "mock_only",
    allowMarketOverride: true,
    allowMerchantTypeOverride: true,
    allowSellerOverride: true,
  },
  {
    key: "market_supplies",
    label: "市场物料",
    description: "泡沫箱、包装箱、冰袋、冰块等面向商户采购，不进入消费者主链路。",
    riskLevel: "medium",
    runtimeScope: "menu",
    defaultState: "requestable",
    allowMarketOverride: true,
    allowMerchantTypeOverride: true,
    allowSellerOverride: true,
  },
  {
    key: "delivery_supplier",
    label: "配送供应商",
    description: "配送供应商工作台和接单能力必须与真实履约、物流和结算保持分离。",
    riskLevel: "high",
    runtimeScope: "fulfillment",
    defaultState: "blocked_serial",
    allowMarketOverride: false,
    allowMerchantTypeOverride: false,
    allowSellerOverride: false,
  },
  {
    key: "wechat_pay_provider",
    label: "微信支付 Provider",
    description: "真实支付必须以后端异步通知、验签、幂等和重试为准。",
    riskLevel: "blocked_serial",
    runtimeScope: "payment",
    defaultState: "blocked_serial",
    allowMarketOverride: false,
    allowMerchantTypeOverride: false,
    allowSellerOverride: false,
  },
];

export type ChinaModuleConfigReadModel = {
  moduleKey: string;
  scopeType: "platform" | "market" | "merchant_type" | "seller" | "emergency";
  scopeId?: string;
  state: ChinaModuleConfigState;
  status: "draft" | "published" | "archived";
  version: number;
  reason?: string;
};

export const defaultChinaModuleConfigs: ChinaModuleConfigReadModel[] = [
  {
    moduleKey: "shop_decoration",
    scopeType: "platform",
    state: "requestable",
    status: "published",
    version: 1,
    reason: "基础店铺主页装修入口可先做展示和草稿。",
  },
  {
    moduleKey: "pickup_card",
    scopeType: "platform",
    state: "mock_only",
    status: "published",
    version: 1,
    reason: "提货卡保持独立 mock/read-only 入口。",
  },
  {
    moduleKey: "ai_quick_listing",
    scopeType: "platform",
    state: "mock_only",
    status: "published",
    version: 1,
    reason: "AI 上架仅允许生成草稿建议。",
  },
  {
    moduleKey: "market_supplies",
    scopeType: "merchant_type",
    scopeId: "materials_supplier",
    state: "requestable",
    status: "published",
    version: 1,
    reason: "物料供应商可申请 B 端物料能力，不进入消费者主链路。",
  },
  {
    moduleKey: "delivery_supplier",
    scopeType: "emergency",
    state: "blocked_serial",
    status: "published",
    version: 1,
    reason: "配送供应商真实接单、履约、物流和结算必须串行。",
  },
  {
    moduleKey: "wechat_pay_provider",
    scopeType: "emergency",
    state: "blocked_serial",
    status: "published",
    version: 1,
    reason: "真实支付 provider 必须走专用高风险串行任务。",
  },
];

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

export type ChinaModuleConfigListView = {
  mode: "read_only_module_config";
  source: "static_read_model";
  definitions: ChinaModuleDefinitionReadModel[];
  configs: ChinaModuleConfigReadModel[];
  effective: ChinaModuleEffectiveCapability[];
  note: string;
};

const scopePriority: Record<ChinaModuleConfigReadModel["scopeType"], number> = {
  platform: 1,
  market: 2,
  merchant_type: 3,
  seller: 4,
  emergency: 5,
};

export const buildChinaModuleCapabilityView = ({
  definitions = defaultChinaModuleDefinitions,
  configs = defaultChinaModuleConfigs,
  context = {},
}: {
  definitions?: ChinaModuleDefinitionReadModel[];
  configs?: ChinaModuleConfigReadModel[];
  context?: ChinaModuleCapabilityView["context"];
} = {}): ChinaModuleCapabilityView => {
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

export const buildChinaModuleConfigListView = ({
  definitions = defaultChinaModuleDefinitions,
  configs = defaultChinaModuleConfigs,
  context = {},
}: {
  definitions?: ChinaModuleDefinitionReadModel[];
  configs?: ChinaModuleConfigReadModel[];
  context?: ChinaModuleCapabilityView["context"];
} = {}): ChinaModuleConfigListView => {
  const effective = buildChinaModuleCapabilityView({
    definitions,
    configs,
    context,
  }).capabilities;

  return {
    mode: "read_only_module_config",
    source: "static_read_model",
    definitions,
    configs,
    effective,
    note: CHINA_READ_MODEL_RUNTIME_NOTE,
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
