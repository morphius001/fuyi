import {
  buildChinaMarketReadModelSeedFromRepository,
  mapChinaMarketRepositoryRowsToSeed,
} from "../repository-market-read-model-adapter";
import { ChinaMarketReadModelService } from "../market-read-model-service";
import { buildChinaVendorMarketContext } from "../vendor-market-context-builder";

describe("repository market read model adapter", () => {
  it("maps china market membership tables into the existing read model seed", async () => {
    const seed = await buildChinaMarketReadModelSeedFromRepository({
      listChinaMarketReadRows: async () => ({
        markets: [
          {
            id: "market_sanmen",
            name: "三门海鲜市场",
            slug: "sanmen-seafood-market",
            province: "浙江",
            city: "台州",
            district: "三门",
            address: "海润街道",
            status: "open",
            service_range_note: "三门城区试点",
            metadata: {
              source: "repository",
            },
          },
        ],
        memberships: [
          {
            id: "membership_1",
            market_id: "market_sanmen",
            seller_id: "sel_1",
            seller_handle: "a-hai-xian-huo-dang",
            seller_name: "阿海鲜活档",
            booth_no: "A区18号",
            stall_name: "阿海一号档",
            is_primary: true,
            status: "open",
            main_category_ids: ["pcat_crab"],
            merchant_type_keys: ["seafood_stall"],
          },
        ],
        roles: [
          {
            id: "role_1",
            seller_id: "sel_1",
            market_id: "market_sanmen",
            role_key: "seafood_stall",
            status: "active",
          },
        ],
        announcements: [
          {
            id: "ann_1",
            market_id: "market_sanmen",
            audience: "merchant",
            title: "今日错峰入场",
            content: "早高峰请按档口区进入。",
            severity: "warning",
            status: "published",
          },
        ],
        businessHours: [
          {
            id: "hours_1",
            market_id: "market_sanmen",
            weekday: 1,
            opens_at: "05:30",
            closes_at: "17:30",
            is_closed: false,
            note: "鲜活区优先",
          },
        ],
        deliveryProfiles: [
          {
            id: "delivery_1",
            market_id: "market_sanmen",
            delivery_type: "market_unified_delivery",
            enabled: true,
            display_name: "市场统一配送",
            service_area_note: "城区次日达",
            cutoff_time: "15:00",
            merchant_selectable: true,
          },
        ],
      }),
    });

    const readModel = new ChinaMarketReadModelService(seed);
    const context = buildChinaVendorMarketContext({
      readModel,
      sellerId: "sel_1",
    });

    expect(seed.markets?.[0]).toMatchObject({
      city: "台州",
      metadata: {
        serviceRange: "三门城区试点",
      },
    });
    expect(seed.memberships?.[0]).toMatchObject({
      boothNo: "A区18号",
      stallName: "阿海一号档",
      metadata: {
        merchantTypeKeys: ["seafood_stall"],
      },
    });
    expect(context).toMatchObject({
      runtimeEnabled: false,
      primaryMembership: {
        stallName: "阿海一号档",
        merchantTypeKeys: ["seafood_stall"],
        serviceRange: "三门城区试点",
      },
      announcements: [
        {
          title: "今日错峰入场",
          severity: "warning",
        },
      ],
      deliveryProfiles: [
        {
          deliveryType: "market_unified_delivery",
          merchantSelectable: true,
          runtimeEnabled: false,
          checkoutImpact: "none",
        },
      ],
    });
  });

  it("drops deleted, unknown, and incomplete rows before they reach route builders", () => {
    const seed = mapChinaMarketRepositoryRowsToSeed({
      markets: [
        {
          id: "market_deleted",
          name: "删除市场",
          slug: "deleted",
          city: "台州",
          status: "open",
          deleted_at: new Date(),
        },
        {
          id: "market_missing_city",
          name: "缺城市",
          slug: "missing-city",
          status: "open",
        },
      ],
      memberships: [
        {
          id: "membership_bad",
          market_id: "market_sanmen",
          seller_id: "sel_1",
          booth_no: "A区18号",
          status: "rejected",
        },
      ],
      roles: [
        {
          id: "role_unknown",
          seller_id: "sel_1",
          role_key: "admin",
          status: "active",
        },
      ],
      announcements: [
        {
          id: "ann_bad",
          market_id: "market_sanmen",
          audience: "supplier",
          title: "错误 audience",
          content: "不应进入 read model",
          severity: "info",
          status: "published",
        },
      ],
      businessHours: [
        {
          id: "hours_bad",
          market_id: "market_sanmen",
          weekday: 8,
          opens_at: "05:30",
          closes_at: "17:30",
        },
      ],
      deliveryProfiles: [
        {
          id: "delivery_bad",
          market_id: "market_sanmen",
          delivery_type: "seller_self_delivery",
          enabled: true,
          display_name: "旧枚举",
        },
      ],
    });

    expect(seed).toMatchObject({
      markets: [],
      memberships: [],
      roles: [],
      announcements: [],
      businessHours: [],
      deliveryProfiles: [],
    });
  });
});
