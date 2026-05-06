import { buildChinaVendorMarketContext, ChinaMarketReadModelService } from "..";

describe("buildChinaVendorMarketContext", () => {
  const readModel = new ChinaMarketReadModelService({
    markets: [
      {
        id: "market_sanmen",
        name: "三门海鲜市场",
        slug: "sanmen-seafood-market",
        city: "台州",
        district: "三门",
        status: "open",
        timezone: "Asia/Shanghai",
        metadata: {
          serviceRange: "三门城区试点",
        },
      },
      {
        id: "market_zhoushan",
        name: "舟山沈家门市场",
        slug: "zhoushan-shenjiamen",
        city: "舟山",
        district: "普陀",
        status: "open",
        timezone: "Asia/Shanghai",
        metadata: {},
      },
    ],
    memberships: [
      {
        id: "membership_1",
        marketId: "market_sanmen",
        sellerId: "sel_1",
        sellerHandle: "a-hai-xian-huo-dang",
        sellerName: "阿海鲜活档",
        boothNo: "A区18号",
        stallName: "鲜活蟹类",
        isPrimary: true,
        status: "open",
        mainCategoryIds: ["pcat_crab"],
        metadata: {},
      },
      {
        id: "membership_2",
        marketId: "market_zhoushan",
        sellerId: "sel_1",
        sellerHandle: "a-hai-xian-huo-dang",
        sellerName: "阿海鲜活档",
        boothNo: "B区06号",
        isPrimary: false,
        status: "paused",
        mainCategoryIds: [],
        metadata: {},
      },
      {
        id: "membership_other",
        marketId: "market_sanmen",
        sellerId: "sel_2",
        sellerName: "其它商户",
        boothNo: "C区01号",
        isPrimary: true,
        status: "open",
        mainCategoryIds: [],
        metadata: {},
      },
    ],
    roles: [
      {
        id: "role_1",
        sellerId: "sel_1",
        marketId: "market_sanmen",
        roleKey: "seafood_stall",
        status: "active",
        metadata: {},
      },
      {
        id: "role_2",
        sellerId: "sel_1",
        marketId: "market_sanmen",
        roleKey: "materials_supplier",
        status: "active",
        metadata: {},
      },
      {
        id: "role_paused",
        sellerId: "sel_1",
        roleKey: "delivery_supplier",
        status: "paused",
        metadata: {},
      },
    ],
    announcements: [
      {
        id: "ann_merchant",
        marketId: "market_sanmen",
        audience: "merchant",
        title: "商户晨会",
        content: "今日冷链车 15:00 截单。",
        severity: "info",
        status: "published",
      },
      {
        id: "ann_consumer",
        marketId: "market_sanmen",
        audience: "consumer",
        title: "消费者公告",
        content: "不应进入商户上下文。",
        severity: "info",
        status: "published",
      },
    ],
    businessHours: [
      {
        id: "hours_1",
        marketId: "market_sanmen",
        weekday: 1,
        opensAt: "06:30",
        closesAt: "17:30",
        isClosed: false,
      },
    ],
    deliveryProfiles: [
      {
        id: "delivery_pickup",
        marketId: "market_sanmen",
        deliveryType: "market_pickup",
        enabled: true,
        displayName: "市场自提",
        metadata: {},
      },
      {
        id: "delivery_unified",
        marketId: "market_sanmen",
        deliveryType: "market_unified_delivery",
        enabled: true,
        displayName: "市场统一配送展示",
        serviceAreaNote: "仅展示",
        cutoffTime: "15:00",
        metadata: {},
      },
    ],
  });

  it("builds a vendor-scoped read-only context without runtime behavior", () => {
    const context = buildChinaVendorMarketContext({
      readModel,
      sellerId: "sel_1",
      sellerHandle: "a-hai-xian-huo-dang",
    });

    expect(context).toMatchObject({
      mode: "vendor_market_context_read_only",
      source: "china_market_read_model",
      sellerId: "sel_1",
      sellerHandle: "a-hai-xian-huo-dang",
      runtimeEnabled: false,
      primaryMembership: {
        marketName: "三门海鲜市场",
        boothNo: "A区18号",
        businessHours: "周一 06:30-17:30",
        serviceRange: "三门城区试点",
        merchantTypeKeys: ["seafood_stall", "materials_supplier"],
      },
      announcements: [
        {
          title: "商户晨会",
        },
      ],
      deliveryProfiles: [
        {
          displayName: "市场自提",
          checkoutImpact: "none",
          runtimeEnabled: false,
        },
        {
          displayName: "市场统一配送展示",
          merchantSelectable: true,
          checkoutImpact: "none",
          runtimeEnabled: false,
        },
      ],
    });
    expect(context.memberships).toHaveLength(2);
    expect(context.announcements).toHaveLength(1);
    expect(context.note).toContain("read-only");
  });

  it("does not leak other seller memberships when filtering by seller", () => {
    const context = buildChinaVendorMarketContext({
      readModel,
      sellerId: "sel_1",
    });

    expect(context.memberships.map((membership) => membership.boothNo)).toEqual(
      ["A区18号", "B区06号"],
    );
  });

  it("can filter to a seller-owned market without trusting a frontend seller id", () => {
    const context = buildChinaVendorMarketContext({
      readModel,
      sellerId: "sel_1",
      marketId: "market_zhoushan",
    });

    expect(context.memberships).toMatchObject([
      {
        marketId: "market_zhoushan",
        boothNo: "B区06号",
      },
    ]);
    expect(context.announcements).toEqual([]);
    expect(context.primaryMembership?.merchantTypeKeys).toEqual([]);
    expect(
      context.moduleHints.find((hint) => hint.key === "market_materials"),
    ).toMatchObject({
      visible: false,
    });
  });

  it("returns an empty read-only context for sellers without visible memberships", () => {
    const context = buildChinaVendorMarketContext({
      readModel,
      sellerId: "missing_seller",
    });

    expect(context).toMatchObject({
      mode: "vendor_market_context_empty",
      sellerId: "missing_seller",
      runtimeEnabled: false,
      memberships: [],
      announcements: [],
      deliveryProfiles: [],
    });
  });
});
