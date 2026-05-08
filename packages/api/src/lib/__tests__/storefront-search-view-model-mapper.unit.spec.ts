import {
  buildChinaDiscoveryReadModel,
  buildChinaStorefrontSearchView,
} from "../china-read-models";

describe("Storefront search view model mapper", () => {
  it("maps consumer search results into a read-only search template contract", () => {
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
          },
        },
      ],
      categoryRows: [
        {
          id: "pcat_1",
          handle: "fresh-crab",
          name: "鲜活蟹类",
          description: "梭子蟹、青蟹、花蟹",
        },
      ],
    });

    const search = buildChinaStorefrontSearchView({
      discovery,
      query: " 梭子蟹 ",
      marketName: "三门海鲜市场",
      products: [
        {
          id: "prod_1",
          title: "鲜活梭子蟹",
          sellerId: "sel_1",
          sellerName: "阿海鲜活档",
          market: "三门海鲜市场",
          booth: "A区18号",
          specText: "公母混装 500g/只起",
          source: "store_product_table",
        },
      ],
    });

    expect(search).toMatchObject({
      mode: "storefront_search_view",
      templateId: "storefront-search-market-results-v1",
      locale: "zh-CN",
      currency: "CNY",
      timezone: "Asia/Shanghai",
      query: "梭子蟹",
      normalizedQuery: "梭子蟹",
      readOnly: true,
      runtimeEnabled: false,
      canWriteBusinessState: false,
      marketContext: {
        name: "三门海鲜市场",
      },
      matchedCategories: [
        {
          handle: "fresh-crab",
        },
      ],
      matchedProducts: [
        {
          id: "prod_1",
        },
      ],
    });
    expect(search.resultGroups).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: "markets",
          count: 1,
          consumerFacing: true,
        }),
        expect.objectContaining({
          key: "products",
          count: 1,
          consumerFacing: true,
        }),
      ])
    );
  });

  it("filters B-side suppliers and procurement items out of consumer search", () => {
    const discovery = buildChinaDiscoveryReadModel({
      sellerRows: [
        {
          id: "sel_materials",
          handle: "market-materials",
          name: "泡沫箱物料供应商",
          metadata: {
            market_name: "三门海鲜市场",
            booth_no: "物料区01号",
            category_summary: "泡沫箱、冰袋、冰块",
          },
        },
        {
          id: "sel_delivery",
          handle: "delivery-supplier",
          name: "同城配送供应商",
          metadata: {
            market_name: "三门海鲜市场",
            category_summary: "配送供应商",
          },
        },
        {
          id: "sel_upstream",
          handle: "upstream-grower",
          name: "养殖户上游供给",
          metadata: {
            market_name: "三门海鲜市场",
            category_summary: "上游供给、种苗批发、外地批发",
          },
        },
        {
          id: "sel_1",
          handle: "wan-kou-bing-xian-hang",
          name: "湾口冰鲜行",
          metadata: {
            market_name: "三门海鲜市场",
            category_summary: "冰鲜鱼类",
          },
        },
      ],
      categoryRows: [
        {
          id: "pcat_materials",
          handle: "materials",
          name: "市场物料",
          description: "泡沫箱、冰袋、冰块",
        },
        {
          id: "pcat_fish",
          handle: "fresh-fish",
          name: "冰鲜鱼类",
        },
      ],
    });

    const search = buildChinaStorefrontSearchView({
      discovery,
      query: "",
      products: [
        {
          id: "prod_materials",
          title: "泡沫箱 10kg",
          sellerName: "泡沫箱物料供应商",
          source: "store_product_table",
        },
        {
          id: "prod_delivery",
          title: "同城配送供应商服务",
          sellerName: "同城配送供应商",
          source: "store_product_table",
        },
        {
          id: "prod_fish",
          title: "东海小黄鱼",
          sellerName: "湾口冰鲜行",
          source: "store_product_table",
        },
      ],
    });

    expect(search.matchedSellers.map((seller) => seller.handle)).toEqual([
      "wan-kou-bing-xian-hang",
    ]);
    expect(search.matchedCategories.map((category) => category.handle)).toEqual([
      "fresh-fish",
    ]);
    expect(search.matchedProducts.map((product) => product.id)).toEqual([
      "prod_fish",
    ]);
    expect(search.displayRules).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: "consumer_results_only",
        }),
      ])
    );
  });

  it("marks empty search results as display-only fallback", () => {
    const discovery = buildChinaDiscoveryReadModel({
      sellerRows: [],
      categoryRows: [],
      markets: [],
    });

    const search = buildChinaStorefrontSearchView({
      discovery,
      query: "不存在",
      marketName: "不存在的市场",
    });

    expect(search).toMatchObject({
      fallbackNotice: "没有找到匹配内容，可以换个关键词或切换市场。",
      readOnly: true,
      runtimeEnabled: false,
      canWriteBusinessState: false,
    });
    expect(search.dataSources).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: "market_context",
          source: "static_fallback",
          fallbackUsed: true,
        }),
        expect.objectContaining({
          key: "matched_products",
          source: "static_fallback",
          fallbackUsed: true,
        }),
      ])
    );
  });

  it("documents search boundaries as blocked serial work", () => {
    const discovery = buildChinaDiscoveryReadModel({
      sellerRows: [],
      categoryRows: [],
    });

    const search = buildChinaStorefrontSearchView({
      discovery,
      query: "梭子蟹",
    });

    expect(search.highRiskBoundaries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: "inventory_reservation",
          status: "blocked_serial_work",
        }),
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
          key: "search_ranking_runtime",
          status: "blocked_serial_work",
        }),
        expect.objectContaining({
          key: "real_provider_config",
          status: "blocked_serial_work",
        }),
      ])
    );
    expect(search.note).toContain("display-only");
  });
});
