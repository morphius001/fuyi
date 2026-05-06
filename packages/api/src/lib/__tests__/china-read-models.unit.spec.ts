import {
  buildChinaDiscoveryReadModel,
  buildChinaModuleCapabilityView,
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
});
