import {
  buildChinaDiscoveryReadModel,
  buildChinaModuleCapabilityView,
  buildChinaModuleConfigListView,
  buildChinaStorefrontHomeView,
  buildChinaStorefrontSearchView,
  buildChinaStorefrontSellerView,
  buildChinaVendorProductDraftReadModel,
} from "../china-read-models";

describe("China read model builders", () => {
  it("builds discovery data from seller and category rows with metadata fallback", () => {
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
          metadata: {
            summary: "今日鲜活到港",
          },
        },
      ],
    });

    expect(discovery).toMatchObject({
      mode: "read_only_discovery",
      source: "seller_and_category_tables",
      sellers: [
        {
          market: "三门海鲜市场",
          booth: "A区18号",
          tags: ["真实商家", "已开放", "鲜活蟹类"],
          summary: "鲜活蟹类，市场统一配送 / 档口自提。",
        },
      ],
      categories: [
        {
          description: "今日鲜活到港",
          count: "真实类目",
        },
      ],
    });
    expect(discovery.note).toContain("display-only");
  });

  it("combines module configs without enabling runtime behavior", () => {
    const view = buildChinaModuleCapabilityView({
      definitions: [
        {
          key: "pickup_card",
          label: "提货卡",
          description: "独立提货入口",
          riskLevel: "medium",
          runtimeScope: "display_only",
          defaultState: "hidden",
          allowMarketOverride: true,
          allowMerchantTypeOverride: false,
          allowSellerOverride: false,
        },
      ],
      configs: [
        {
          moduleKey: "pickup_card",
          scopeType: "platform",
          state: "requestable",
          status: "published",
          version: 1,
        },
        {
          moduleKey: "pickup_card",
          scopeType: "market",
          scopeId: "market_sanmen",
          state: "mock_only",
          status: "published",
          version: 2,
        },
      ],
      context: {
        marketId: "market_sanmen",
      },
    });

    expect(view.capabilities).toEqual([
      expect.objectContaining({
        moduleKey: "pickup_card",
        state: "mock_only",
        source: "market",
        runtimeEnabled: false,
      }),
    ]);
  });

  it("exposes default Admin module configs as read-only static view", () => {
    const listView = buildChinaModuleConfigListView();

    expect(listView).toMatchObject({
      mode: "read_only_module_config",
      source: "static_read_model",
    });
    expect(listView.definitions.map((definition) => definition.key)).toContain(
      "wechat_pay_provider"
    );
    expect(
      listView.effective.find(
        (capability) => capability.moduleKey === "wechat_pay_provider"
      )
    ).toMatchObject({
      state: "blocked_serial",
      runtimeEnabled: false,
    });
  });

  it("keeps vendor product draft read models separate from product creation", () => {
    const draft = buildChinaVendorProductDraftReadModel({
      draftId: "draft_1",
      sellerId: "sel_1",
      marketId: "market_sanmen",
      status: "ready_for_product_create",
    });

    expect(draft).toMatchObject({
      mode: "read_only_product_draft",
      source: "draft_skeleton",
      canCreateProduct: false,
    });
    expect(draft.note).toContain("do not create products");
  });

  it("builds Storefront home, search, and seller view shapes without runtime side effects", () => {
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
        },
      ],
    });
    const products = [
      {
        id: "prod_1",
        title: "鲜活梭子蟹",
        sellerId: "sel_1",
        sellerName: "阿海鲜活档",
        market: "三门海鲜市场",
        booth: "A区18号",
        source: "store_product_table" as const,
      },
    ];

    const home = buildChinaStorefrontHomeView({
      discovery,
      products,
    });
    const search = buildChinaStorefrontSearchView({
      discovery,
      query: "梭子蟹",
      products,
      marketName: "三门海鲜市场",
    });
    const seller = buildChinaStorefrontSellerView({
      seller: discovery.sellers[0],
      products,
    });

    expect(home).toMatchObject({
      mode: "storefront_home_view",
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
    expect(search).toMatchObject({
      mode: "storefront_search_view",
      query: "梭子蟹",
      matchedProducts: [
        {
          id: "prod_1",
        },
      ],
    });
    expect(seller).toMatchObject({
      mode: "storefront_seller_view",
      pickupCardPlacement: "separate_entry",
      livePlacement: "seller_status_badge",
      products: [
        {
          id: "prod_1",
        },
      ],
    });
  });
});
