import { buildChinaShopDecorationReadonlyView } from "../shop-decoration-readonly-contract";

describe("China shop decoration readonly contract", () => {
  it("builds a display-only shop decoration view", () => {
    const view = buildChinaShopDecorationReadonlyView({
      seller: {
        sellerId: "sel_1",
        sellerName: "阿海鲜活档",
        sellerHandle: "a-hai-xian-huo-dang",
      },
      market: {
        marketId: "market_sanmen",
        marketName: "三门海鲜市场",
        boothNo: "A区18号",
      },
      status: "published",
      announcements: ["今日梭子蟹到货"],
      productGroupTitles: ["今日鲜货"],
      credentialLabels: ["营业执照"],
      deliveryNotes: ["支持市场统一配送"],
    });

    expect(view).toMatchObject({
      mode: "shop_decoration_readonly_contract",
      locale: "zh-CN",
      currency: "CNY",
      timezone: "Asia/Shanghai",
      readOnly: true,
      runtimeEnabled: false,
      seller: {
        sellerName: "阿海鲜活档",
      },
      market: {
        boothNo: "A区18号",
      },
      status: "published",
    });
    expect(view.moduleAvailability).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: "hero",
          editable: false,
        }),
        expect.objectContaining({
          key: "live_status",
          editable: false,
        }),
      ]),
    );
  });

  it("keeps product, checkout, payment, permission, provider, and fulfillment work blocked", () => {
    const view = buildChinaShopDecorationReadonlyView({
      seller: {
        sellerId: "sel_1",
        sellerName: "阿海鲜活档",
      },
    });

    expect(view.highRiskBoundaries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: "product_publish",
          status: "blocked_serial_work",
        }),
        expect.objectContaining({
          key: "checkout_shipping_options",
          status: "blocked_serial_work",
        }),
        expect.objectContaining({
          key: "payment",
          status: "blocked_serial_work",
        }),
        expect.objectContaining({
          key: "permission",
          status: "blocked_serial_work",
        }),
        expect.objectContaining({
          key: "real_file_upload",
          status: "blocked_serial_work",
        }),
        expect.objectContaining({
          key: "fulfillment",
          status: "blocked_serial_work",
        }),
      ]),
    );
    expect(view.note).toContain("display-only");
  });
});
