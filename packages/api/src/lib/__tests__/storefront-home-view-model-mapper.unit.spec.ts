import {
  buildChinaDiscoveryReadModel,
  buildChinaStorefrontHomeView,
} from "../china-read-models";

describe("Storefront home view model mapper", () => {
  it("maps discovery data into the Storefront home v2 template contract", () => {
    const discovery = buildChinaDiscoveryReadModel({
      sellerRows: [
        {
          id: "sel_1",
          handle: "a-hai-xian-huo-dang",
          name: "阿海鲜活档",
          metadata: {
            market_name: "三门海鲜市场",
            booth_no: "A区18号",
            category_summary: "鲜活蟹类",
            delivery_summary: "市场统一配送 / 档口自提",
          },
        },
      ],
      categoryRows: [
        {
          id: "pcat_1",
          handle: "fresh-crab",
          name: "鲜活蟹类",
          description: "今日鲜活到港",
        },
      ],
    });

    const home = buildChinaStorefrontHomeView({
      discovery,
      products: [
        {
          id: "prod_1",
          title: "鲜活梭子蟹",
          sellerId: "sel_1",
          sellerName: "阿海鲜活档",
          market: "三门海鲜市场",
          booth: "A区18号",
          priceText: "¥68/斤",
          specText: "公母混装 500g/只起",
          source: "store_product_table",
        },
      ],
    });

    expect(home).toMatchObject({
      mode: "storefront_home_view",
      templateId: "storefront-home-market-shop-v2",
      locale: "zh-CN",
      currency: "CNY",
      timezone: "Asia/Shanghai",
      readOnly: true,
      runtimeEnabled: false,
      canWriteBusinessState: false,
      consumerPath: [
        "market_switch",
        "category_discovery",
        "shop_discovery",
        "fresh_product_preview",
        "shop_detail",
      ],
      categoryNav: [
        {
          handle: "fresh-crab",
          name: "鲜活蟹类",
        },
      ],
      featuredSellers: [
        {
          handle: "a-hai-xian-huo-dang",
          booth: "A区18号",
        },
      ],
      freshProducts: [
        {
          id: "prod_1",
          title: "鲜活梭子蟹",
        },
      ],
      serviceLinks: [
        {
          key: "pickup_card",
          placement: "secondary",
        },
        {
          key: "after_sales",
          placement: "secondary",
        },
        {
          key: "merchant_entry",
          placement: "secondary",
        },
      ],
    });
    expect(home.dataSources).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: "markets",
          source: "static_market_contract",
          fallbackUsed: false,
        }),
        expect.objectContaining({
          key: "categories",
          source: "seller_and_category_tables",
          fallbackUsed: false,
        }),
        expect.objectContaining({
          key: "fresh_products",
          source: "static_read_model",
          fallbackUsed: false,
        }),
      ])
    );
  });

  it("keeps B-side supplier content out of the default consumer home path", () => {
    const blockedCases = [
      {
        id: "materials",
        sellerName: "泡沫箱物料供应商",
        categoryName: "市场物料",
        categoryDescription: "泡沫箱、包装箱、冰袋、冰块",
        productTitle: "泡沫箱 10kg",
      },
      {
        id: "delivery",
        sellerName: "同城配送供应商",
        categoryName: "配送供应商服务",
        categoryDescription: "市场配送供应商接单能力",
        productTitle: "同城冷链配送供应商服务",
      },
      {
        id: "upstream",
        sellerName: "本地养殖户上游供给",
        categoryName: "上游供给",
        categoryDescription: "养殖户和种植户对接商户",
        productTitle: "上游供给批次",
      },
      {
        id: "seedling",
        sellerName: "种苗批发合作社",
        categoryName: "种苗批发",
        categoryDescription: "对接养殖户、种植户和商户",
        productTitle: "虾苗种苗批发",
      },
      {
        id: "regional",
        sellerName: "外地批发商直供",
        categoryName: "外地批发",
        categoryDescription: "外地批发商对接商户",
        productTitle: "外地批发供货单",
      },
    ];
    const discovery = buildChinaDiscoveryReadModel({
      sellerRows: [
        ...blockedCases.map((blockedCase) => ({
          id: `sel_${blockedCase.id}`,
          handle: `blocked-${blockedCase.id}`,
          name: blockedCase.sellerName,
          metadata: {
            market_name: "三门海鲜市场",
            booth_no: "供应区01号",
            category_summary: blockedCase.categoryDescription,
          },
        })),
        {
          id: "sel_2",
          handle: "wan-kou-bing-xian-hang",
          name: "湾口冰鲜行",
          metadata: {
            market_name: "三门海鲜市场",
            booth_no: "B区06号",
            category_summary: "冰鲜鱼类",
          },
        },
      ],
      categoryRows: [
        ...blockedCases.map((blockedCase) => ({
          id: `pcat_${blockedCase.id}`,
          handle: `blocked-${blockedCase.id}`,
          name: blockedCase.categoryName,
          description: blockedCase.categoryDescription,
        })),
        {
          id: "pcat_fish",
          handle: "fresh-fish",
          name: "冰鲜鱼类",
        },
      ],
    });

    const home = buildChinaStorefrontHomeView({
      discovery,
      products: [
        ...blockedCases.map((blockedCase) => ({
          id: `prod_${blockedCase.id}`,
          title: blockedCase.productTitle,
          sellerName: blockedCase.sellerName,
          source: "store_product_table" as const,
        })),
        {
          id: "prod_fish",
          title: "东海小黄鱼",
          sellerName: "湾口冰鲜行",
          source: "store_product_table",
        },
      ],
    });

    expect(home.featuredSellers.map((seller) => seller.handle)).toEqual([
      "wan-kou-bing-xian-hang",
    ]);
    expect(home.categoryNav.map((category) => category.handle)).toEqual([
      "fresh-fish",
    ]);
    expect(home.freshProducts.map((product) => product.id)).toEqual([
      "prod_fish",
    ]);
    expect(home.excludedConsumerSections).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: "materials_suppliers",
        }),
        expect.objectContaining({
          key: "delivery_suppliers",
        }),
        expect.objectContaining({
          key: "upstream_supply",
        }),
        expect.objectContaining({
          key: "seedling_wholesale",
        }),
        expect.objectContaining({
          key: "regional_wholesale",
        }),
        expect.objectContaining({
          key: "live_primary_entry",
        }),
      ])
    );
  });

  it("marks empty discovery sections as fallback without enabling runtime writes", () => {
    const discovery = buildChinaDiscoveryReadModel({
      sellerRows: [],
      categoryRows: [],
      markets: [],
    });

    const home = buildChinaStorefrontHomeView({
      discovery,
    });

    expect(home).toMatchObject({
      fallbackNotice: "首页展示数据待后台运营配置。",
      readOnly: true,
      runtimeEnabled: false,
      canWriteBusinessState: false,
    });
    expect(home.dataSources).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: "markets",
          source: "static_fallback",
          fallbackUsed: true,
        }),
        expect.objectContaining({
          key: "categories",
          fallbackUsed: true,
        }),
        expect.objectContaining({
          key: "featured_sellers",
          fallbackUsed: true,
        }),
        expect.objectContaining({
          key: "fresh_products",
          source: "static_fallback",
          fallbackUsed: true,
        }),
      ])
    );
  });

  it("documents high-risk Storefront home boundaries as blocked serial work", () => {
    const discovery = buildChinaDiscoveryReadModel({
      sellerRows: [],
      categoryRows: [],
    });

    const home = buildChinaStorefrontHomeView({
      discovery,
    });

    expect(home.highRiskBoundaries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: "checkout_shipping_options",
          status: "blocked_serial_work",
        }),
        expect.objectContaining({
          key: "payment_success",
          status: "blocked_serial_work",
        }),
        expect.objectContaining({
          key: "order_status",
          status: "blocked_serial_work",
        }),
        expect.objectContaining({
          key: "refund_status",
          status: "blocked_serial_work",
        }),
        expect.objectContaining({
          key: "settlement",
          status: "blocked_serial_work",
        }),
        expect.objectContaining({
          key: "commission",
          status: "blocked_serial_work",
        }),
        expect.objectContaining({
          key: "payout",
          status: "blocked_serial_work",
        }),
        expect.objectContaining({
          key: "fulfillment",
          status: "blocked_serial_work",
        }),
        expect.objectContaining({
          key: "pickup_card_checkout_discount",
          status: "blocked_serial_work",
        }),
        expect.objectContaining({
          key: "real_provider_config",
          status: "blocked_serial_work",
        }),
      ])
    );
    expect(home.note).toContain("display-only");
  });
});
