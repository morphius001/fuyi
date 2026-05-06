import {
  buildStaticMarketReadModelSeed,
  ChinaMarketReadModelService,
} from "..";

describe("ChinaMarketReadModelService skeleton", () => {
  const service = new ChinaMarketReadModelService({
    markets: [
      {
        id: "market_sanmen",
        name: "三门海鲜市场",
        slug: "sanmen-seafood-market",
        city: "台州",
        district: "三门",
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
        isPrimary: true,
        status: "open",
        mainCategoryIds: ["pcat_crab"],
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
    ],
    announcements: [
      {
        id: "ann_1",
        marketId: "market_sanmen",
        audience: "all",
        title: "今日到货",
        content: "鲜活区今日到货。",
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
        id: "delivery_1",
        marketId: "market_sanmen",
        deliveryType: "market_unified_delivery",
        enabled: true,
        displayName: "市场统一配送",
        serviceAreaNote: "同城试点",
        metadata: {},
      },
    ],
  });

  it("builds read-only market detail without enabling runtime behavior", () => {
    const detail = service.buildMarketDetail("sanmen-seafood-market");

    expect(detail).toMatchObject({
      mode: "read_only_market_detail",
      runtimeEnabled: false,
      market: {
        name: "三门海鲜市场",
      },
      memberships: [
        {
          boothNo: "A区18号",
        },
      ],
      deliveryProfiles: [
        {
          displayName: "市场统一配送",
        },
      ],
    });
    expect(detail?.note).toContain("display-only");
  });

  it("keeps seller roles separate from permissions", () => {
    expect(service.listRolesBySeller("sel_1")).toMatchObject([
      {
        roleKey: "seafood_stall",
        status: "active",
      },
    ]);
  });

  it("wraps static markets and seller metadata into read model seed", () => {
    const seed = buildStaticMarketReadModelSeed({
      sellers: [
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
    });
    const readModel = new ChinaMarketReadModelService(seed);
    const market = readModel.listOpenMarkets()[0];
    const detail = readModel.buildMarketDetail(market.slug);

    expect(detail).toMatchObject({
      runtimeEnabled: false,
      memberships: [
        {
          sellerHandle: "a-hai-xian-huo-dang",
          boothNo: "A区18号",
        },
      ],
      deliveryProfiles: [
        {
          displayName: "市场自提",
        },
        {
          displayName: "统一配送展示能力",
        },
      ],
    });
  });
});
