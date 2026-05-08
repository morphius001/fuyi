import { buildChinaLogisticsWaybillReadonlyView } from "../logistics-waybill-readonly-contract";

describe("China logistics and waybill readonly contract", () => {
  it("builds read-only fulfillment mode views without checkout impact", () => {
    const view = buildChinaLogisticsWaybillReadonlyView();

    expect(view).toMatchObject({
      mode: "logistics_waybill_readonly_contract",
      locale: "zh-CN",
      currency: "CNY",
      timezone: "Asia/Shanghai",
      readOnly: true,
      runtimeEnabled: false,
    });
    expect(view.fulfillmentModes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: "market_unified_delivery",
          visibleOnStorefront: true,
          configurableByVendor: true,
          checkoutImpact: "none",
          runtimeEnabled: false,
        }),
        expect.objectContaining({
          key: "delivery_supplier",
          visibleOnStorefront: false,
          requiresAdminEnablement: true,
          checkoutImpact: "none",
        }),
      ]),
    );
  });

  it("keeps waybill features mock-only or blocked without real shipment or label creation", () => {
    const view = buildChinaLogisticsWaybillReadonlyView();

    expect(view.waybillCapabilities).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: "mock_tracking_id",
          status: "mock_only",
          createsRealShipment: false,
          printsRealLabel: false,
        }),
        expect.objectContaining({
          key: "cloud_print",
          status: "blocked_serial_work",
          createsRealShipment: false,
          printsRealLabel: false,
        }),
      ]),
    );
    expect(
      view.waybillCapabilities.every(
        (capability) =>
          !capability.createsRealShipment && !capability.printsRealLabel,
      ),
    ).toBe(true);
  });

  it("blocks checkout, fulfillment, shipment, labels, cloud print, and order status updates", () => {
    const view = buildChinaLogisticsWaybillReadonlyView();

    expect(view.highRiskBoundaries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: "checkout_shipping_options",
          status: "blocked_serial_work",
        }),
        expect.objectContaining({
          key: "fulfillment_creation",
          status: "blocked_serial_work",
        }),
        expect.objectContaining({
          key: "shipment_confirmation",
          status: "blocked_serial_work",
        }),
        expect.objectContaining({
          key: "real_waybill_label",
          status: "blocked_serial_work",
        }),
        expect.objectContaining({
          key: "cloud_print",
          status: "blocked_serial_work",
        }),
        expect.objectContaining({
          key: "order_logistics_status",
          status: "blocked_serial_work",
        }),
      ]),
    );
    expect(view.note).toContain("does not change checkout");
  });
});
