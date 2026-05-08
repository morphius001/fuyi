import { buildChinaLiveCommerceReadonlyView } from "../live-commerce-readonly-contract";

describe("China live commerce readonly contract", () => {
  it("builds a read-only live status view for shop context", () => {
    const view = buildChinaLiveCommerceReadonlyView({
      sessionId: "live_1",
      sellerId: "sel_1",
      sellerName: "阿海鲜活档",
      marketId: "market_sanmen",
      boothNo: "A区18号",
      title: "今日鲜活梭子蟹",
      status: "scheduled",
      scheduledAt: "2026-05-08T20:00:00+08:00",
      productRefs: ["prod_crab"],
      provider: "mock_live",
    });

    expect(view).toMatchObject({
      mode: "live_commerce_readonly_contract",
      locale: "zh-CN",
      currency: "CNY",
      timezone: "Asia/Shanghai",
      readOnly: true,
      runtimeEnabled: false,
      session: {
        sellerName: "阿海鲜活档",
        status: "scheduled",
        provider: "mock_live",
      },
    });
  });

  it("keeps live visible in shop context but hidden from the consumer home primary entry", () => {
    const view = buildChinaLiveCommerceReadonlyView({
      sellerId: "sel_1",
      sellerName: "阿海鲜活档",
      status: "offline",
      productRefs: [],
      provider: "none",
    });

    expect(view.placements).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: "shop_card_badge",
          visible: true,
        }),
        expect.objectContaining({
          key: "shop_home_status",
          visible: true,
        }),
        expect.objectContaining({
          key: "home_primary_entry",
          visible: false,
        }),
      ]),
    );
  });

  it("blocks real streaming, IM, chatroom, live orders, payment, settlement, and permissions", () => {
    const view = buildChinaLiveCommerceReadonlyView({
      sellerId: "sel_1",
      sellerName: "阿海鲜活档",
      status: "offline",
      productRefs: [],
      provider: "none",
    });

    expect(view.highRiskBoundaries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: "real_streaming",
          status: "blocked_serial_work",
        }),
        expect.objectContaining({
          key: "real_im",
          status: "blocked_serial_work",
        }),
        expect.objectContaining({
          key: "chatroom",
          status: "blocked_serial_work",
        }),
        expect.objectContaining({
          key: "live_order",
          status: "blocked_serial_work",
        }),
        expect.objectContaining({
          key: "payment",
          status: "blocked_serial_work",
        }),
        expect.objectContaining({
          key: "settlement",
          status: "blocked_serial_work",
        }),
        expect.objectContaining({
          key: "permission",
          status: "blocked_serial_work",
        }),
      ]),
    );
    expect(view.note).toContain("shop/stall status signal only");
  });
});
