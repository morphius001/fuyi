import { ChinaMarketRepositoryRows } from "../repository-market-read-model-adapter";

export const marketMembershipFixtureSellerId = "sel_fixture_seafood_001";
export const marketMembershipFixtureSellerHandle = "fixture-seafood-stall";
export const marketMembershipFixtureMarketId = "market_fixture_sanmen";
export const marketMembershipFixtureSecondaryMarketId =
  "market_fixture_zhoushan";

export const buildMarketMembershipRepositoryRowsFixture =
  (): ChinaMarketRepositoryRows => ({
    markets: [
      {
        id: marketMembershipFixtureMarketId,
        name: "三门海鲜市场",
        slug: "sanmen-seafood-market",
        province: "浙江",
        city: "台州",
        district: "三门",
        address: "海润街道测试档口区",
        status: "open",
        service_range_note: "三门城区测试配送圈",
        metadata: {
          fixtureOnly: true,
        },
      },
      {
        id: marketMembershipFixtureSecondaryMarketId,
        name: "舟山沈家门市场",
        slug: "zhoushan-shenjiamen-market",
        province: "浙江",
        city: "舟山",
        district: "普陀",
        address: "沈家门测试市场",
        status: "open",
        service_range_note: "舟山测试配送圈",
        metadata: {
          fixtureOnly: true,
        },
      },
    ],
    memberships: [
      {
        id: "membership_fixture_primary",
        market_id: marketMembershipFixtureMarketId,
        seller_id: marketMembershipFixtureSellerId,
        seller_handle: marketMembershipFixtureSellerHandle,
        seller_name: "测试鲜活档",
        booth_no: "A区18号",
        stall_name: "测试鲜活一号档",
        is_primary: true,
        status: "open",
        main_category_ids: ["pcat_fixture_crab"],
        merchant_type_keys: ["seafood_stall"],
      },
      {
        id: "membership_fixture_secondary",
        market_id: marketMembershipFixtureSecondaryMarketId,
        seller_id: marketMembershipFixtureSellerId,
        seller_handle: marketMembershipFixtureSellerHandle,
        seller_name: "测试鲜活档",
        booth_no: "B区06号",
        stall_name: "测试舟山联营档",
        is_primary: false,
        status: "paused",
        main_category_ids: ["pcat_fixture_fish"],
        merchant_type_keys: ["seafood_stall", "regional_wholesaler"],
      },
    ],
    roles: [
      {
        id: "role_fixture_seafood",
        seller_id: marketMembershipFixtureSellerId,
        market_id: marketMembershipFixtureMarketId,
        role_key: "seafood_stall",
        status: "active",
      },
      {
        id: "role_fixture_materials",
        seller_id: marketMembershipFixtureSellerId,
        market_id: marketMembershipFixtureMarketId,
        role_key: "materials_supplier",
        status: "active",
      },
      {
        id: "role_fixture_regional",
        seller_id: marketMembershipFixtureSellerId,
        market_id: marketMembershipFixtureSecondaryMarketId,
        role_key: "regional_wholesaler",
        status: "active",
      },
    ],
    announcements: [
      {
        id: "announcement_fixture_merchant",
        market_id: marketMembershipFixtureMarketId,
        audience: "merchant",
        title: "测试错峰入场",
        content: "测试商户请按档口区入场。",
        severity: "warning",
        status: "published",
      },
      {
        id: "announcement_fixture_consumer",
        market_id: marketMembershipFixtureMarketId,
        audience: "consumer",
        title: "测试消费者公告",
        content: "消费者公告不进入商户上下文。",
        severity: "info",
        status: "published",
      },
    ],
    businessHours: [
      {
        id: "hours_fixture_market",
        market_id: marketMembershipFixtureMarketId,
        weekday: 1,
        opens_at: "05:30",
        closes_at: "17:30",
        is_closed: false,
        note: "测试鲜活区优先",
      },
    ],
    deliveryProfiles: [
      {
        id: "delivery_fixture_pickup",
        market_id: marketMembershipFixtureMarketId,
        delivery_type: "market_pickup",
        enabled: true,
        display_name: "测试市场自提",
        service_area_note: "到档口核验提货",
        cutoff_time: "16:30",
        merchant_selectable: false,
      },
      {
        id: "delivery_fixture_unified",
        market_id: marketMembershipFixtureMarketId,
        delivery_type: "market_unified_delivery",
        enabled: true,
        display_name: "测试市场统一配送",
        service_area_note: "三门城区测试配送圈",
        cutoff_time: "15:00",
        merchant_selectable: true,
      },
    ],
  });

export const buildInvalidMarketMembershipRepositoryRowsFixture =
  (): ChinaMarketRepositoryRows => ({
    markets: [
      {
        id: "market_fixture_deleted",
        name: "删除市场",
        slug: "deleted-market",
        city: "台州",
        status: "open",
        deleted_at: new Date(),
      },
      {
        id: "market_fixture_missing_city",
        name: "缺城市",
        slug: "missing-city",
        status: "open",
      },
    ],
    memberships: [
      {
        id: "membership_fixture_bad_status",
        market_id: marketMembershipFixtureMarketId,
        seller_id: marketMembershipFixtureSellerId,
        booth_no: "A区18号",
        status: "rejected",
      },
    ],
    roles: [
      {
        id: "role_fixture_unknown",
        seller_id: marketMembershipFixtureSellerId,
        role_key: "admin",
        status: "active",
      },
    ],
    announcements: [
      {
        id: "announcement_fixture_bad_audience",
        market_id: marketMembershipFixtureMarketId,
        audience: "supplier",
        title: "错误 audience",
        content: "不应进入 read model",
        severity: "info",
        status: "published",
      },
    ],
    businessHours: [
      {
        id: "hours_fixture_bad_weekday",
        market_id: marketMembershipFixtureMarketId,
        weekday: 8,
        opens_at: "05:30",
        closes_at: "17:30",
      },
    ],
    deliveryProfiles: [
      {
        id: "delivery_fixture_bad_type",
        market_id: marketMembershipFixtureMarketId,
        delivery_type: "seller_self_delivery",
        enabled: true,
        display_name: "旧枚举",
      },
    ],
  });
