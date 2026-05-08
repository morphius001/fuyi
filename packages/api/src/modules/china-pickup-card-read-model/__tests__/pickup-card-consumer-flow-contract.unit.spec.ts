import { buildChinaPickupCardConsumerFlowView } from "../pickup-card-consumer-flow-contract";

describe("China pickup card consumer flow contract", () => {
  it("builds a read-only entitlement redemption flow", () => {
    const view = buildChinaPickupCardConsumerFlowView();

    expect(view).toMatchObject({
      mode: "pickup_card_consumer_flow_contract",
      locale: "zh-CN",
      currency: "CNY",
      timezone: "Asia/Shanghai",
      readOnly: true,
      runtimeEnabled: false,
    });
    expect(view.steps).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: "credential_input",
          createsPayment: false,
          createsOrder: false,
        }),
        expect.objectContaining({
          key: "redemption_submit",
          createsPayment: false,
          createsOrder: false,
        }),
      ]),
    );
  });

  it("keeps entitlements from becoming catalog substitution, balance, or cart discounts", () => {
    const view = buildChinaPickupCardConsumerFlowView();

    expect(view.entitlements).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          mode: "fixed",
          allowsCatalogSubstitution: false,
          convertsToBalance: false,
          appliesToCartTotal: false,
        }),
        expect.objectContaining({
          mode: "choice",
          allowsCatalogSubstitution: false,
          convertsToBalance: false,
          appliesToCartTotal: false,
        }),
      ]),
    );
  });

  it("separates address delivery from pickup requirements", () => {
    const view = buildChinaPickupCardConsumerFlowView();

    expect(view.fulfillmentRequirements).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          mode: "ship_to_address",
          requiresMainlandMobile: true,
          requiresChinaAddress: true,
          requiresPickupTime: false,
        }),
        expect.objectContaining({
          mode: "market_pickup",
          requiresMainlandMobile: true,
          requiresChinaAddress: false,
          requiresPickupTime: true,
        }),
      ]),
    );
  });

  it("blocks payment, coupon, gift card, cart, order paid state, and fulfillment creation", () => {
    const view = buildChinaPickupCardConsumerFlowView();

    expect(view.highRiskBoundaries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: "payment_provider",
          status: "blocked_serial_work",
        }),
        expect.objectContaining({
          key: "coupon_promotion",
          status: "blocked_serial_work",
        }),
        expect.objectContaining({
          key: "gift_card_store_credit",
          status: "blocked_serial_work",
        }),
        expect.objectContaining({
          key: "cart_total",
          status: "blocked_serial_work",
        }),
        expect.objectContaining({
          key: "order_paid_state",
          status: "blocked_serial_work",
        }),
        expect.objectContaining({
          key: "fulfillment_creation",
          status: "blocked_serial_work",
        }),
      ]),
    );
    expect(view.note).toContain("not checkout");
  });
});
