import type {
  ChinaDiscoveryCategory,
  ChinaDiscoveryMarket,
  ChinaDiscoverySeller
} from '@/lib/data/china-discovery';

export type ChinaHomeProductCardInput = {
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

export type ChinaHomeDiscoveryInput = {
  markets?: ChinaDiscoveryMarket[];
  categories?: ChinaDiscoveryCategory[];
  sellers?: ChinaDiscoverySeller[];
  source?: string;
};

export type ChinaHomeViewModelAdapterInput = {
  discovery?: ChinaHomeDiscoveryInput | null;
  products?: ChinaHomeProductCardInput[] | null;
  fallback?: {
    discovery?: ChinaHomeDiscoveryInput;
    products?: ChinaHomeProductCardInput[];
    notice?: string;
  };
};

type ChinaHomeDataSource = {
  key:
    | 'markets'
    | 'categories'
    | 'featured_sellers'
    | 'fresh_products'
    | 'service_links';
  source: string;
  fallbackUsed: boolean;
};

type ChinaHomeBoundary = {
  key:
    | 'checkout_shipping_options'
    | 'payment_success'
    | 'order_status'
    | 'refund_status'
    | 'settlement'
    | 'commission'
    | 'payout'
    | 'fulfillment'
    | 'consumer_b_side_visibility'
    | 'pickup_card_checkout_discount'
    | 'real_provider_config';
  status: 'blocked_serial_work';
  reason: string;
};

export type ChinaHomeViewModel = {
  mode: 'storefront_home_view';
  templateId: 'storefront-home-market-shop-v2';
  source: string;
  locale: 'zh-CN';
  currency: 'CNY';
  timezone: 'Asia/Shanghai';
  marketSelector: ChinaDiscoveryMarket[];
  categoryNav: ChinaDiscoveryCategory[];
  featuredSellers: ChinaDiscoverySeller[];
  freshProducts: ChinaHomeProductCardInput[];
  serviceLinks: Array<{
    key: 'pickup_card' | 'after_sales' | 'merchant_entry';
    label: string;
    placement: 'secondary';
  }>;
  consumerPath: Array<
    | 'market_switch'
    | 'category_discovery'
    | 'shop_discovery'
    | 'fresh_product_preview'
    | 'shop_detail'
  >;
  dataSources: ChinaHomeDataSource[];
  excludedConsumerSections: Array<{
    key:
      | 'materials_suppliers'
      | 'delivery_suppliers'
      | 'upstream_supply'
      | 'seedling_wholesale'
      | 'regional_wholesale'
      | 'live_primary_entry';
    reason: string;
  }>;
  highRiskBoundaries: ChinaHomeBoundary[];
  fallbackNotice?: string;
  readOnly: true;
  runtimeEnabled: false;
  canWriteBusinessState: false;
  note: string;
};

const runtimeNote =
  'This read model is display-only. It does not change product, order, checkout, payment, fulfillment, settlement, commission, payout, refund, or permission behavior.';

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

const fallbackDiscovery: Required<Pick<ChinaHomeDiscoveryInput, 'markets' | 'categories' | 'sellers'>> = {
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

const fallbackProducts: ChinaHomeProductCardInput[] = [
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

const isConsumerProduct = (product: ChinaHomeProductCardInput) =>
  !includesBSideKeyword([
    product.title,
    product.sellerName,
    product.market,
    product.booth,
    product.specText
  ]);

const normalizeProducts = (products: ChinaHomeProductCardInput[]) =>
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

const buildBoundaries = (): ChinaHomeBoundary[] => [
  {
    key: 'checkout_shipping_options',
    status: 'blocked_serial_work',
    reason: '首页展示不写入 checkout shipping options。'
  },
  {
    key: 'payment_success',
    status: 'blocked_serial_work',
    reason: '支付成功必须以后端异步通知为准。'
  },
  {
    key: 'order_status',
    status: 'blocked_serial_work',
    reason: '首页 adapter 不创建或修改订单状态。'
  },
  {
    key: 'refund_status',
    status: 'blocked_serial_work',
    reason: '首页 adapter 不创建或修改退款状态。'
  },
  {
    key: 'settlement',
    status: 'blocked_serial_work',
    reason: '首页 adapter 不改变结算主体或规则。'
  },
  {
    key: 'commission',
    status: 'blocked_serial_work',
    reason: '首页 adapter 不改变佣金规则。'
  },
  {
    key: 'payout',
    status: 'blocked_serial_work',
    reason: '首页 adapter 不处理商家打款。'
  },
  {
    key: 'fulfillment',
    status: 'blocked_serial_work',
    reason: '首页 adapter 不创建履约单、配送单、运单或面单。'
  },
  {
    key: 'consumer_b_side_visibility',
    status: 'blocked_serial_work',
    reason: 'B 端供应商默认不进入消费者首页主路径。'
  },
  {
    key: 'pickup_card_checkout_discount',
    status: 'blocked_serial_work',
    reason: '提货卡保持独立入口，不作为购物车抵扣。'
  },
  {
    key: 'real_provider_config',
    status: 'blocked_serial_work',
    reason: '首页 adapter 不保存或启用真实 Provider 配置。'
  }
];

export const buildChinaHomeViewModel = ({
  discovery,
  products,
  fallback
}: ChinaHomeViewModelAdapterInput = {}): ChinaHomeViewModel => {
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
  const freshProducts = normalizeProducts(
    products?.length ? products : fallback?.products ?? fallbackProducts
  );
  const categoryNav = categories.filter(isConsumerCategory);
  const featuredSellers = sellers.filter(isConsumerSeller);

  return {
    mode: 'storefront_home_view',
    templateId: 'storefront-home-market-shop-v2',
    source,
    locale: 'zh-CN',
    currency: 'CNY',
    timezone: 'Asia/Shanghai',
    marketSelector: markets,
    categoryNav,
    featuredSellers,
    freshProducts,
    serviceLinks: [
      {
        key: 'pickup_card',
        label: '提货卡',
        placement: 'secondary'
      },
      {
        key: 'after_sales',
        label: '售后服务',
        placement: 'secondary'
      },
      {
        key: 'merchant_entry',
        label: '商家入驻',
        placement: 'secondary'
      }
    ],
    consumerPath: [
      'market_switch',
      'category_discovery',
      'shop_discovery',
      'fresh_product_preview',
      'shop_detail'
    ],
    dataSources: [
      {
        key: 'markets',
        source: discovery?.markets?.length ? source : 'static_fallback',
        fallbackUsed: !discovery?.markets?.length
      },
      {
        key: 'categories',
        source: discovery?.categories?.length ? source : 'static_fallback',
        fallbackUsed: !discovery?.categories?.length
      },
      {
        key: 'featured_sellers',
        source: discovery?.sellers?.length ? source : 'static_fallback',
        fallbackUsed: !discovery?.sellers?.length
      },
      {
        key: 'fresh_products',
        source: products?.length ? 'store_product_table' : 'static_fallback',
        fallbackUsed: !products?.length
      },
      {
        key: 'service_links',
        source: 'static_read_model',
        fallbackUsed: false
      }
    ],
    excludedConsumerSections: [
      {
        key: 'materials_suppliers',
        reason: '物料供应商面向商户采购，不进入消费者首页主路径。'
      },
      {
        key: 'delivery_suppliers',
        reason: '配送供应商能力归属市场和店铺配置，不作为首页入口。'
      },
      {
        key: 'upstream_supply',
        reason: '养殖户、种植户和外地批发商属于供给链协作，不默认展示给消费者。'
      },
      {
        key: 'seedling_wholesale',
        reason: '种苗批发面向养殖户、种植户和商户，不进入消费者首页。'
      },
      {
        key: 'regional_wholesale',
        reason: '外地批发商对接商户，不进入消费者首页主路径。'
      },
      {
        key: 'live_primary_entry',
        reason: '直播只作为店铺状态或局部入口，不作为首页主入口。'
      }
    ],
    highRiskBoundaries: buildBoundaries(),
    fallbackNotice:
      fallback?.notice ??
      (!discovery?.markets?.length || !discovery?.sellers?.length
        ? '首页展示数据待后台更新。'
        : undefined),
    readOnly: true,
    runtimeEnabled: false,
    canWriteBusinessState: false,
    note: runtimeNote
  };
};
