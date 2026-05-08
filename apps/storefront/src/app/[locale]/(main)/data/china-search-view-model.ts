import type {
  ChinaDiscoveryCategory,
  ChinaDiscoveryMarket,
  ChinaDiscoverySeller
} from '@/lib/data/china-discovery';

export type ChinaSearchProductCardInput = {
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
  source?: 'store_product_table' | 'placeholder' | string;
};

export type ChinaSearchDiscoveryInput = {
  markets?: ChinaDiscoveryMarket[];
  categories?: ChinaDiscoveryCategory[];
  sellers?: ChinaDiscoverySeller[];
  source?: string;
};

export type ChinaSearchViewModelAdapterInput = {
  query?: string | null;
  marketName?: string | null;
  discovery?: ChinaSearchDiscoveryInput | null;
  products?: ChinaSearchProductCardInput[] | null;
  fallback?: {
    discovery?: ChinaSearchDiscoveryInput;
    products?: ChinaSearchProductCardInput[];
    notice?: string;
  };
};

export type ChinaSearchReadModelInputContract = {
  version: 'storefront-search-input-contract-v1';
  readOnly: true;
  runtimeEnabled: false;
  query: {
    source: 'url_search_params';
    normalizedBy: 'trim_lowercase';
    writesBusinessState: false;
  };
  market: {
    sourceOrder: Array<'url_market_param' | 'discovery_market' | 'static_fallback'>;
    effect: 'display_filter_only';
    writesCheckoutShippingOptions: false;
  };
  categories: {
    sourceOrder: Array<'discovery_categories' | 'static_fallback'>;
    consumerFacingOnly: true;
  };
  sellers: {
    sourceOrder: Array<'discovery_sellers' | 'static_fallback'>;
    consumerFacingOnly: true;
  };
  products: {
    sourceOrder: Array<'store_products' | 'static_fallback'>;
    readOnlyCards: true;
    reservesInventory: false;
  };
  blockedRuntime: Array<
    | 'search_ranking_provider'
    | 'ads_bidding'
    | 'recommendation_engine'
    | 'inventory_reservation'
    | 'cart_mutation'
    | 'checkout_shipping_options'
    | 'order_mutation'
    | 'payment'
    | 'fulfillment'
  >;
};

type ChinaSearchDataSource = {
  key:
    | 'query'
    | 'market_context'
    | 'matched_sellers'
    | 'matched_categories'
    | 'matched_products';
  source:
    | 'storefront_adapter'
    | 'store_product_table'
    | 'static_read_model'
    | 'static_fallback'
    | string;
  fallbackUsed: boolean;
};

type ChinaSearchBoundary = {
  key:
    | 'inventory_reservation'
    | 'checkout_shipping_options'
    | 'payment_success'
    | 'order_status'
    | 'refund_status'
    | 'settlement'
    | 'commission'
    | 'payout'
    | 'fulfillment'
    | 'search_ranking_runtime'
    | 'real_provider_config';
  status: 'blocked_serial_work';
  reason: string;
};

export type ChinaSearchViewModel = {
  mode: 'storefront_search_view';
  templateId: 'storefront-search-market-results-v1';
  source: string;
  locale: 'zh-CN';
  currency: 'CNY';
  timezone: 'Asia/Shanghai';
  query: string;
  normalizedQuery: string;
  marketContext?: ChinaDiscoveryMarket;
  matchedSellers: ChinaDiscoverySeller[];
  matchedCategories: ChinaDiscoveryCategory[];
  matchedProducts: ChinaSearchProductCardInput[];
  resultGroups: Array<{
    key: 'markets' | 'categories' | 'shops' | 'products';
    label: string;
    count: number;
    consumerFacing: true;
  }>;
  displayRules: Array<{
    key:
      | 'consumer_results_only'
      | 'market_context_is_filter'
      | 'product_cards_are_readonly'
      | 'empty_state_is_display_only';
    reason: string;
  }>;
  dataSources: ChinaSearchDataSource[];
  highRiskBoundaries: ChinaSearchBoundary[];
  fallbackNotice?: string;
  readOnly: true;
  runtimeEnabled: false;
  canWriteBusinessState: false;
  note: string;
};

const runtimeNote =
  'This read model is display-only. It does not change product, inventory, cart, order, checkout, payment, fulfillment, settlement, commission, payout, refund, or permission behavior.';

export const getChinaSearchReadModelInputContract = (): ChinaSearchReadModelInputContract => ({
  version: 'storefront-search-input-contract-v1',
  readOnly: true,
  runtimeEnabled: false,
  query: {
    source: 'url_search_params',
    normalizedBy: 'trim_lowercase',
    writesBusinessState: false
  },
  market: {
    sourceOrder: ['url_market_param', 'discovery_market', 'static_fallback'],
    effect: 'display_filter_only',
    writesCheckoutShippingOptions: false
  },
  categories: {
    sourceOrder: ['discovery_categories', 'static_fallback'],
    consumerFacingOnly: true
  },
  sellers: {
    sourceOrder: ['discovery_sellers', 'static_fallback'],
    consumerFacingOnly: true
  },
  products: {
    sourceOrder: ['store_products', 'static_fallback'],
    readOnlyCards: true,
    reservesInventory: false
  },
  blockedRuntime: [
    'search_ranking_provider',
    'ads_bidding',
    'recommendation_engine',
    'inventory_reservation',
    'cart_mutation',
    'checkout_shipping_options',
    'order_mutation',
    'payment',
    'fulfillment'
  ]
});

const bSideKeywords = [
  '物料',
  '包装',
  '泡沫箱',
  '冰袋',
  '冰块',
  '配送供应商',
  '上游',
  '种苗',
  '外地批发'
];

const fallbackDiscovery: Required<
  Pick<ChinaSearchDiscoveryInput, 'markets' | 'categories' | 'sellers'>
> &
  Pick<ChinaSearchDiscoveryInput, 'source'> = {
  source: 'storefront_adapter_fallback',
  markets: [
    {
      name: '三门海鲜市场',
      city: '台州三门',
      hours: '06:30 - 17:30',
      notice: '鲜活区今日到货，冷链配送 10:00 / 15:00。',
      delivery: '市场自提 / 同城配送 / 冷链',
      source: 'static_market_contract'
    }
  ],
  categories: [
    {
      id: 'fallback_fresh_seafood',
      handle: 'fresh-seafood',
      name: '本地鲜货',
      description: '鱼虾蟹贝和今日到货',
      count: '展示类目',
      source: 'static_fallback'
    }
  ],
  sellers: [
    {
      id: 'fallback_seller',
      handle: 'a-hai-xian-huo-dang',
      name: '阿海鲜活档',
      market: '三门海鲜市场',
      booth: 'A区18号',
      tags: ['展示档口', '本地鲜货'],
      summary: '鲜活蟹类，市场自提 / 商家配送可配置。',
      source: 'static_fallback'
    }
  ]
};

const fallbackProducts: ChinaSearchProductCardInput[] = [
  {
    id: 'fallback_product',
    title: '鲜活梭子蟹',
    handle: 'xian-huo-suo-zi-xie',
    sellerId: 'fallback_seller',
    sellerName: '阿海鲜活档',
    market: '三门海鲜市场',
    booth: 'A区18号',
    priceText: '¥68/斤',
    specText: '公母混装 500g/只起',
    stockText: '展示数据待后台更新',
    source: 'placeholder'
  }
];

const includesBSideKeyword = (values: Array<string | undefined>) =>
  values.some(value => bSideKeywords.some(keyword => value?.includes(keyword)));

const includesQuery = (value: string | undefined, query: string) => {
  if (!query) {
    return true;
  }

  return value?.toLowerCase().includes(query.toLowerCase()) ?? false;
};

const isConsumerSeller = (seller: ChinaDiscoverySeller) =>
  !includesBSideKeyword([
    seller.name,
    seller.market,
    seller.booth,
    seller.summary,
    ...seller.tags
  ]);

const isConsumerCategory = (category: ChinaDiscoveryCategory) =>
  !includesBSideKeyword([category.name, category.description]);

const isConsumerProduct = (product: ChinaSearchProductCardInput) =>
  !includesBSideKeyword([
    product.title,
    product.sellerName,
    product.market,
    product.booth,
    product.specText
  ]);

const normalizeProducts = (products: ChinaSearchProductCardInput[]) =>
  products
    .filter(product => product.id && product.title)
    .filter(isConsumerProduct)
    .map(product => ({
      ...product,
      source:
        product.source === 'store_product_table' || product.source === 'placeholder'
          ? product.source
          : 'placeholder'
    }));

const belongsToMarket = (marketContext: ChinaDiscoveryMarket | undefined, market?: string) =>
  !marketContext || market === marketContext.name;

const buildBoundaries = (): ChinaSearchBoundary[] => [
  {
    key: 'inventory_reservation',
    status: 'blocked_serial_work',
    reason: '搜索 adapter 不占用库存。'
  },
  {
    key: 'checkout_shipping_options',
    status: 'blocked_serial_work',
    reason: '搜索 adapter 不写入 checkout shipping options。'
  },
  {
    key: 'payment_success',
    status: 'blocked_serial_work',
    reason: '支付成功必须以后端异步通知为准。'
  },
  {
    key: 'order_status',
    status: 'blocked_serial_work',
    reason: '搜索 adapter 不创建或修改订单状态。'
  },
  {
    key: 'refund_status',
    status: 'blocked_serial_work',
    reason: '搜索 adapter 不创建或修改退款状态。'
  },
  {
    key: 'settlement',
    status: 'blocked_serial_work',
    reason: '搜索 adapter 不改变结算主体或规则。'
  },
  {
    key: 'commission',
    status: 'blocked_serial_work',
    reason: '搜索 adapter 不改变佣金规则。'
  },
  {
    key: 'payout',
    status: 'blocked_serial_work',
    reason: '搜索 adapter 不处理商家打款。'
  },
  {
    key: 'fulfillment',
    status: 'blocked_serial_work',
    reason: '搜索 adapter 不创建履约单、配送单、运单或面单。'
  },
  {
    key: 'search_ranking_runtime',
    status: 'blocked_serial_work',
    reason: '搜索 adapter 不接真实排序、广告、竞价或推荐系统。'
  },
  {
    key: 'real_provider_config',
    status: 'blocked_serial_work',
    reason: '搜索 adapter 不保存或启用真实 Provider 配置。'
  }
];

export const buildChinaSearchViewModel = ({
  query,
  marketName,
  discovery,
  products,
  fallback
}: ChinaSearchViewModelAdapterInput = {}): ChinaSearchViewModel => {
  const trimmedQuery = (query ?? '').trim();
  const normalizedQuery = trimmedQuery.toLowerCase();
  const fallbackSource = fallback?.discovery ?? fallbackDiscovery;
  const source = discovery?.source ?? 'storefront_adapter_fallback';
  const markets = discovery?.markets?.length
    ? discovery.markets
    : fallbackSource.markets ?? fallbackDiscovery.markets;
  const categories = discovery?.categories?.length
    ? discovery.categories
    : fallbackSource.categories ?? fallbackDiscovery.categories;
  const sellers = discovery?.sellers?.length
    ? discovery.sellers
    : fallbackSource.sellers ?? fallbackDiscovery.sellers;
  const normalizedProducts = normalizeProducts(
    products?.length ? products : fallback?.products ?? fallbackProducts
  );
  const marketContext = marketName
    ? markets.find(market => market.name === marketName)
    : undefined;
  const matchedSellers = sellers
    .filter(isConsumerSeller)
    .filter(seller => belongsToMarket(marketContext, seller.market))
    .filter(seller =>
      [
        seller.name,
        seller.market,
        seller.booth,
        seller.summary,
        ...seller.tags
      ].some(value => includesQuery(value, normalizedQuery))
    );
  const matchedCategories = categories
    .filter(isConsumerCategory)
    .filter(category =>
      [category.name, category.description].some(value =>
        includesQuery(value, normalizedQuery)
      )
    );
  const matchedProducts = normalizedProducts.filter(product =>
    belongsToMarket(marketContext, product.market) &&
    [
      product.title,
      product.sellerName,
      product.market,
      product.booth,
      product.specText
    ].some(value => includesQuery(value, normalizedQuery))
  );

  return {
    mode: 'storefront_search_view',
    templateId: 'storefront-search-market-results-v1',
    source,
    locale: 'zh-CN',
    currency: 'CNY',
    timezone: 'Asia/Shanghai',
    query: trimmedQuery,
    normalizedQuery,
    marketContext,
    matchedSellers,
    matchedCategories,
    matchedProducts,
    resultGroups: [
      {
        key: 'markets',
        label: '市场',
        count: marketContext ? 1 : markets.length,
        consumerFacing: true
      },
      {
        key: 'categories',
        label: '类目',
        count: matchedCategories.length,
        consumerFacing: true
      },
      {
        key: 'shops',
        label: '店铺 / 档口',
        count: matchedSellers.length,
        consumerFacing: true
      },
      {
        key: 'products',
        label: '商品',
        count: matchedProducts.length,
        consumerFacing: true
      }
    ],
    displayRules: [
      {
        key: 'consumer_results_only',
        reason: '搜索结果默认只展示消费者找店、找类目、找商品路径，过滤物料、配送和上游供给。'
      },
      {
        key: 'market_context_is_filter',
        reason: '市场上下文只作为展示和筛选输入，不写配送规则或履约事实。'
      },
      {
        key: 'product_cards_are_readonly',
        reason: '商品卡只展示规格、价格和库存提示，不创建购物车、订单或库存占用。'
      },
      {
        key: 'empty_state_is_display_only',
        reason: '无结果只显示消费者提示，不自动发起询价、补货、客服或订单。'
      }
    ],
    dataSources: [
      {
        key: 'query',
        source: 'storefront_adapter',
        fallbackUsed: !trimmedQuery
      },
      {
        key: 'market_context',
        source: marketContext ? source : 'static_fallback',
        fallbackUsed: Boolean(marketName && !marketContext)
      },
      {
        key: 'matched_sellers',
        source: discovery?.sellers?.length ? source : 'static_fallback',
        fallbackUsed: !discovery?.sellers?.length
      },
      {
        key: 'matched_categories',
        source: discovery?.categories?.length ? source : 'static_fallback',
        fallbackUsed: !discovery?.categories?.length
      },
      {
        key: 'matched_products',
        source: products?.length ? 'store_product_table' : 'static_fallback',
        fallbackUsed: !products?.length
      }
    ],
    highRiskBoundaries: buildBoundaries(),
    fallbackNotice:
      fallback?.notice ??
      (matchedSellers.length || matchedCategories.length || matchedProducts.length
        ? undefined
        : '没有找到匹配内容，可以换个关键词或切换市场。'),
    readOnly: true,
    runtimeEnabled: false,
    canWriteBusinessState: false,
    note: runtimeNote
  };
};
