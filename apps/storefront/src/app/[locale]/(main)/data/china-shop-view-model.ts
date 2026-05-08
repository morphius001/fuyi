import type {
  ChinaDiscoveryMarket,
  ChinaDiscoverySeller
} from '@/lib/data/china-discovery';

export type ChinaShopProductCardInput = {
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

export type ChinaShopViewModelAdapterInput = {
  handle: string;
  seller?: ChinaDiscoverySeller | null;
  markets?: ChinaDiscoveryMarket[] | null;
  productIds?: string[] | null;
  products?: ChinaShopProductCardInput[] | null;
  fallback?: {
    seller?: ChinaDiscoverySeller;
    markets?: ChinaDiscoveryMarket[];
    products?: ChinaShopProductCardInput[];
    notice?: string;
  };
};

type ChinaShopDataSource = {
  key:
    | 'seller'
    | 'market_context'
    | 'products'
    | 'fulfillment_hint'
    | 'pickup_card_entry'
    | 'live_status';
  source:
    | 'seller_and_category_tables'
    | 'seller_summary'
    | 'market_contract'
    | 'static_read_model'
    | 'static_fallback';
  fallbackUsed: boolean;
};

type ChinaShopBoundary = {
  key:
    | 'checkout_shipping_options'
    | 'payment_success'
    | 'order_status'
    | 'refund_status'
    | 'settlement'
    | 'commission'
    | 'payout'
    | 'fulfillment'
    | 'pickup_card_checkout_discount'
    | 'live_provider_runtime'
    | 'real_provider_config';
  status: 'blocked_serial_work';
  reason: string;
};

export type ChinaShopViewModel = {
  mode: 'storefront_seller_view';
  templateId: 'storefront-shop-stall-v2';
  source: 'seller_and_category_tables';
  locale: 'zh-CN';
  currency: 'CNY';
  timezone: 'Asia/Shanghai';
  seller: ChinaDiscoverySeller;
  marketContext?: ChinaDiscoveryMarket;
  products: ChinaShopProductCardInput[];
  visibility: 'consumer_default_visible' | 'role_gated_preview_only';
  consumerFacing: boolean;
  fulfillmentHint: {
    placement: 'shop_header';
    text: string;
    source: 'seller_summary' | 'market_contract' | 'static_fallback';
    affectsCheckoutShippingOptions: false;
  };
  pickupCardPlacement: 'separate_entry';
  livePlacement: 'seller_status_badge';
  displayRules: Array<{
    key:
      | 'fulfillment_belongs_to_shop'
      | 'product_cards_are_readonly'
      | 'pickup_card_is_independent'
      | 'live_is_status_badge';
    reason: string;
  }>;
  dataSources: ChinaShopDataSource[];
  highRiskBoundaries: ChinaShopBoundary[];
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

const fallbackSeller: ChinaDiscoverySeller = {
  id: 'fallback_seller',
  handle: 'a-hai-xian-huo-dang',
  name: '阿海鲜活档',
  market: '三门海鲜市场',
  booth: 'A区18号',
  tags: ['展示档口', '本地鲜货'],
  summary: '鲜活蟹类，市场自提 / 商家配送可配置。',
  source: 'static_fallback'
};

const fallbackMarkets: ChinaDiscoveryMarket[] = [
  {
    name: '三门海鲜市场',
    city: '台州三门',
    hours: '06:30 - 17:30',
    notice: '鲜活区今日到货，冷链配送 10:00 / 15:00。',
    delivery: '市场自提 / 同城配送 / 冷链',
    source: 'static_market_contract'
  }
];

const fallbackProducts: ChinaShopProductCardInput[] = [
  {
    id: 'fallback_product',
    title: '鲜活梭子蟹',
    handle: 'xian-huo-suo-zi-xie',
    sellerId: fallbackSeller.id,
    sellerName: fallbackSeller.name,
    market: fallbackSeller.market,
    booth: fallbackSeller.booth,
    priceText: '¥68/斤',
    specText: '公母混装 500g/只起',
    stockText: '店铺商品展示待后台更新',
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

const normalizeProducts = ({
  products,
  seller,
  productIds
}: {
  products: ChinaShopProductCardInput[];
  seller: ChinaDiscoverySeller;
  productIds: string[];
}) => {
  const productIdSet = new Set(productIds);

  return products
    .filter(product => product.id && product.title)
    .filter(product => {
      if (productIdSet.size > 0) {
        return productIdSet.has(product.id);
      }

      return !product.sellerId || product.sellerId === seller.id;
    })
    .map(product => ({
      ...product,
      sellerId: product.sellerId ?? seller.id,
      sellerName: product.sellerName ?? seller.name,
      market: product.market ?? seller.market,
      booth: product.booth ?? seller.booth,
      source:
        product.source === 'store_product_table' || product.source === 'placeholder'
          ? product.source
          : 'placeholder'
    }));
};

const buildFulfillmentHint = ({
  seller,
  marketContext
}: {
  seller: ChinaDiscoverySeller;
  marketContext?: ChinaDiscoveryMarket;
}): ChinaShopViewModel['fulfillmentHint'] => {
  if (seller.summary) {
    return {
      placement: 'shop_header',
      text: seller.summary,
      source: 'seller_summary',
      affectsCheckoutShippingOptions: false
    };
  }

  if (marketContext?.delivery) {
    return {
      placement: 'shop_header',
      text: marketContext.delivery,
      source: 'market_contract',
      affectsCheckoutShippingOptions: false
    };
  }

  return {
    placement: 'shop_header',
    text: '配送、自提和营业时间待后台运营配置。',
    source: 'static_fallback',
    affectsCheckoutShippingOptions: false
  };
};

const buildBoundaries = (): ChinaShopBoundary[] => [
  {
    key: 'checkout_shipping_options',
    status: 'blocked_serial_work',
    reason: '店铺履约提示不写入 checkout shipping options。'
  },
  {
    key: 'payment_success',
    status: 'blocked_serial_work',
    reason: '支付成功必须以后端异步通知为准。'
  },
  {
    key: 'order_status',
    status: 'blocked_serial_work',
    reason: '店铺 adapter 不创建或修改订单状态。'
  },
  {
    key: 'refund_status',
    status: 'blocked_serial_work',
    reason: '店铺 adapter 不创建或修改退款状态。'
  },
  {
    key: 'settlement',
    status: 'blocked_serial_work',
    reason: '店铺 adapter 不改变商家结算规则。'
  },
  {
    key: 'commission',
    status: 'blocked_serial_work',
    reason: '店铺 adapter 不改变佣金规则。'
  },
  {
    key: 'payout',
    status: 'blocked_serial_work',
    reason: '店铺 adapter 不处理商家打款。'
  },
  {
    key: 'fulfillment',
    status: 'blocked_serial_work',
    reason: '店铺 adapter 不创建履约单、配送单、运单或面单。'
  },
  {
    key: 'pickup_card_checkout_discount',
    status: 'blocked_serial_work',
    reason: '提货卡保持独立入口，不作为购物车抵扣。'
  },
  {
    key: 'live_provider_runtime',
    status: 'blocked_serial_work',
    reason: '直播真实 provider 和 IM 互动必须后续单独接入。'
  },
  {
    key: 'real_provider_config',
    status: 'blocked_serial_work',
    reason: '店铺 adapter 不保存或启用真实 Provider 配置。'
  }
];

export const buildChinaShopViewModel = ({
  handle,
  seller,
  markets,
  productIds,
  products,
  fallback
}: ChinaShopViewModelAdapterInput): ChinaShopViewModel => {
  const resolvedSeller =
    seller ??
    fallback?.seller ??
    (handle === fallbackSeller.handle
      ? fallbackSeller
      : {
          ...fallbackSeller,
          handle,
          summary: '店铺资料待后台运营配置。'
        });
  const resolvedMarkets = markets?.length
    ? markets
    : fallback?.markets?.length
      ? fallback.markets
      : fallbackMarkets;
  const marketContext = resolvedMarkets.find(market => market.name === resolvedSeller.market);
  const resolvedProductIds = productIds ?? [];
  const rawProducts = products?.length ? products : fallback?.products ?? fallbackProducts;
  const normalizedProducts = normalizeProducts({
    products: rawProducts,
    seller: resolvedSeller,
    productIds: resolvedProductIds
  });
  const consumerFacing = isConsumerSeller(resolvedSeller);
  const fulfillmentHint = buildFulfillmentHint({
    seller: resolvedSeller,
    marketContext
  });

  return {
    mode: 'storefront_seller_view',
    templateId: 'storefront-shop-stall-v2',
    source: 'seller_and_category_tables',
    locale: 'zh-CN',
    currency: 'CNY',
    timezone: 'Asia/Shanghai',
    seller: resolvedSeller,
    marketContext,
    products: normalizedProducts,
    visibility: consumerFacing ? 'consumer_default_visible' : 'role_gated_preview_only',
    consumerFacing,
    fulfillmentHint,
    pickupCardPlacement: 'separate_entry',
    livePlacement: 'seller_status_badge',
    displayRules: [
      {
        key: 'fulfillment_belongs_to_shop',
        reason: '配送、自提、营业时间和公告属于店铺/档口头部能力，不放在商品卡里决定。'
      },
      {
        key: 'product_cards_are_readonly',
        reason: '商品卡只展示规格、价格和库存提示，不创建购物车、订单或履约状态。'
      },
      {
        key: 'pickup_card_is_independent',
        reason: '提货卡是独立提货入口，不作为优惠券、储值卡、支付方式或购物车抵扣。'
      },
      {
        key: 'live_is_status_badge',
        reason: '直播只作为店铺状态或局部入口，不作为首页主入口或交易事实来源。'
      }
    ],
    dataSources: [
      {
        key: 'seller',
        source: seller ? 'seller_and_category_tables' : 'static_fallback',
        fallbackUsed: !seller
      },
      {
        key: 'market_context',
        source: marketContext ? 'market_contract' : 'static_fallback',
        fallbackUsed: !marketContext
      },
      {
        key: 'products',
        source: products?.length ? 'static_read_model' : 'static_fallback',
        fallbackUsed: !products?.length
      },
      {
        key: 'fulfillment_hint',
        source: fulfillmentHint.source,
        fallbackUsed: fulfillmentHint.source === 'static_fallback'
      },
      {
        key: 'pickup_card_entry',
        source: 'static_read_model',
        fallbackUsed: false
      },
      {
        key: 'live_status',
        source: 'static_read_model',
        fallbackUsed: false
      }
    ],
    highRiskBoundaries: buildBoundaries(),
    fallbackNotice:
      fallback?.notice ??
      (!seller || normalizedProducts.length === 0
        ? '店铺商品展示待后台更新。'
        : undefined),
    readOnly: true,
    runtimeEnabled: false,
    canWriteBusinessState: false,
    note: runtimeNote
  };
};
