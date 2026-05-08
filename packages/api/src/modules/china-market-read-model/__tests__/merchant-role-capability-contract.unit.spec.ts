import { buildChinaMerchantRoleCapabilityContract } from "../merchant-role-capability-contract";

describe("China merchant role capability contract", () => {
  it("builds a read-only contract with no runtime impact", () => {
    const contract = buildChinaMerchantRoleCapabilityContract();

    expect(contract).toMatchObject({
      mode: "merchant_role_capability_contract_read_only",
      locale: "zh-CN",
      currency: "CNY",
      timezone: "Asia/Shanghai",
      readOnly: true,
      runtimeEnabled: false,
    });
    expect(contract.roles).toHaveLength(10);
    expect(contract.roles).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          roleKey: "seafood_stall",
          group: "consumer_merchant",
          consumerVisibility: "default_visible",
          merchantVisibility: "default_visible",
          permissionImpact: "none",
          orderOwnershipImpact: "none",
          settlementImpact: "none",
          runtimeEnabled: false,
        }),
      ]),
    );
  });

  it("keeps materials and delivery suppliers out of the consumer product flow by default", () => {
    const contract = buildChinaMerchantRoleCapabilityContract();

    expect(contract.roles).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          roleKey: "materials_supplier",
          consumerVisibility: "hidden_by_default",
          merchantVisibility: "default_visible",
          defaultCapabilities: ["merchant_materials_procurement"],
          blockedCapabilities: expect.arrayContaining([
            "consumer_product_flow",
            "shop_homepage",
            "materials_supplier_self_order",
          ]),
        }),
        expect.objectContaining({
          roleKey: "delivery_supplier",
          consumerVisibility: "hidden_by_default",
          defaultCapabilities: expect.arrayContaining([
            "delivery_supplier_service",
            "market_unified_delivery_display",
          ]),
          blockedCapabilities: expect.arrayContaining([
            "consumer_product_flow",
            "shop_homepage",
          ]),
        }),
      ]),
    );
  });

  it("requires upstream and regional suppliers to stay merchant-facing unless another consumer role is approved", () => {
    const contract = buildChinaMerchantRoleCapabilityContract();

    expect(contract.roles).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          roleKey: "grower",
          group: "upstream_supply",
          consumerVisibility: "requires_additional_consumer_role",
          defaultCapabilities: ["upstream_supply_match"],
        }),
        expect.objectContaining({
          roleKey: "farmer",
          group: "upstream_supply",
          consumerVisibility: "requires_additional_consumer_role",
          defaultCapabilities: ["upstream_supply_match"],
        }),
        expect.objectContaining({
          roleKey: "seedling_supplier",
          group: "upstream_supply",
          consumerVisibility: "hidden_by_default",
          defaultCapabilities: ["seedling_trade_match"],
        }),
        expect.objectContaining({
          roleKey: "regional_wholesaler",
          group: "regional_supply",
          consumerVisibility: "hidden_by_default",
          defaultCapabilities: ["regional_wholesale_match"],
        }),
      ]),
    );
  });

  it("marks payment, settlement, permissions, logistics, and waybill as blocked serial work", () => {
    const contract = buildChinaMerchantRoleCapabilityContract();

    expect(contract.highRiskBoundaries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: "rbac_permission",
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
          key: "real_logistics_provider",
          status: "blocked_serial_work",
        }),
        expect.objectContaining({
          key: "waybill_printing",
          status: "blocked_serial_work",
        }),
      ]),
    );
    expect(contract.note).toContain("does not affect permissions");
  });
});
