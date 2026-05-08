import {
  buildChinaDiscoveryReadModel,
  buildChinaStorefrontSellerView,
} from "../china-read-models";

describe("Storefront shop view model mapper", () => {
  it("maps a consumer shop into the Storefront shop v2 template contract", () => {
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
      categoryRows: [],
    });

    const shop = buildChinaStorefrontSellerView({
      seller: discovery.sellers[0],
      markets: discovery.markets,
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

    expect(shop).toMatchObject({
      mode: "storefront_seller_view",
      templateId: "storefront-shop-stall-v2",
      locale: "zh-CN",
      currency: "CNY",
      timezone: "Asia/Shanghai",
      visibility: "consumer_default_visible",
      consumerFacing: true,
      readOnly: true,
      runtimeEnabled: false,
      canWriteBusinessState: false,
      seller: {
        handle: "a-hai-xian-huo-dang",
        booth: "A区18号",
      },
      marketContext: {
        name: "三门海鲜市场",
      },
      fulfillmentHint: {
        placement: "shop_header",
        text: "鲜活蟹类，市场统一配送 / 档口自提。",
        source: "seller_summary",
        affectsCheckoutShippingOptions: false,
      },
      pickupCardPlacement: "separate_entry",
      livePlacement: "seller_status_badge",
      products: [
        {
          id: "prod_1",
          title: "鲜活梭子蟹",
        },
      ],
    });
    expect(shop.dataSources).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: "seller",
          source: "seller_and_category_tables",
          fallbackUsed: false,
        }),
        expect.objectContaining({
          key: "market_context",
          source: "market_contract",
          fallbackUsed: false,
        }),
        expect.objectContaining({
          key: "products",
          source: "static_read_model",
          fallbackUsed: false,
        }),
      ])
    );
  });

  it("keeps fulfillment, pickup card, live, and product card rules display-only", () => {
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
      categoryRows: [],
    });

    const shop = buildChinaStorefrontSellerView({
      seller: discovery.sellers[0],
      products: [],
    });

    expect(shop.displayRules).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: "fulfillment_belongs_to_shop",
        }),
        expect.objectContaining({
          key: "product_cards_are_readonly",
        }),
        expect.objectContaining({
          key: "pickup_card_is_independent",
        }),
        expect.objectContaining({
          key: "live_is_status_badge",
        }),
      ])
    );
    expect(shop.dataSources).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: "products",
          source: "static_fallback",
          fallbackUsed: true,
        }),
      ])
    );
    expect(shop.fallbackNotice).toBe("店铺商品展示待后台运营配置。");
  });

  it("marks B-side supplier shops as role gated preview instead of consumer default", () => {
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
      ],
      categoryRows: [],
    });

    const shop = buildChinaStorefrontSellerView({
      seller: discovery.sellers[0],
      markets: discovery.markets,
      products: [
        {
          id: "prod_materials",
          title: "泡沫箱 10kg",
          sellerId: "sel_materials",
          sellerName: "泡沫箱物料供应商",
          source: "store_product_table",
        },
      ],
    });

    expect(shop).toMatchObject({
      visibility: "role_gated_preview_only",
      consumerFacing: false,
      products: [
        {
          id: "prod_materials",
        },
      ],
    });
  });

  it("documents high-risk Storefront shop boundaries as blocked serial work", () => {
    const discovery = buildChinaDiscoveryReadModel({
      sellerRows: [
        {
          id: "sel_1",
          handle: "a-hai-xian-huo-dang",
          name: "阿海鲜活档",
        },
      ],
      categoryRows: [],
      markets: [],
    });

    const shop = buildChinaStorefrontSellerView({
      seller: discovery.sellers[0],
      markets: discovery.markets,
    });

    expect(shop.highRiskBoundaries).toEqual(
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
          key: "live_provider_runtime",
          status: "blocked_serial_work",
        }),
        expect.objectContaining({
          key: "real_provider_config",
          status: "blocked_serial_work",
        }),
      ])
    );
    expect(shop.dataSources).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: "market_context",
          source: "static_fallback",
          fallbackUsed: true,
        }),
      ])
    );
    expect(shop.note).toContain("display-only");
  });
});
