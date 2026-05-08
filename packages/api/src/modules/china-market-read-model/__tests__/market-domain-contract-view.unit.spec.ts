import { buildChinaMarketDomainContractView } from "../market-domain-contract-view";

describe("China market domain contract view", () => {
  it("builds a read-only contract without runtime impact", () => {
    const contract = buildChinaMarketDomainContractView({
      markets: [
        {
          id: "market_sanmen",
          name: "三门海鲜市场",
          slug: "sanmen-seafood-market",
          city: "台州",
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
          sellerName: "阿海鲜活档",
          boothNo: "A区18号",
          isPrimary: true,
          status: "open",
          mainCategoryIds: ["pcat_crab"],
          metadata: {},
        },
      ],
      deliveryProfiles: [
        {
          id: "delivery_1",
          marketId: "market_sanmen",
          deliveryType: "market_unified_delivery",
          enabled: true,
          displayName: "市场统一配送",
          metadata: {},
        },
      ],
    });

    expect(contract).toMatchObject({
      mode: "market_domain_contract_read_only",
      locale: "zh-CN",
      currency: "CNY",
      timezone: "Asia/Shanghai",
      readOnly: true,
      runtimeEnabled: false,
    });
    expect(contract.entities).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: "market",
          currentCount: 1,
          writeEnabled: false,
          runtimeImpact: "none",
        }),
        expect.objectContaining({
          key: "seller_market_membership",
          currentCount: 1,
        }),
        expect.objectContaining({
          key: "market_delivery_profile",
          currentCount: 1,
        }),
      ]),
    );
  });

  it("keeps supplier roles separate from consumer-facing merchants", () => {
    const contract = buildChinaMarketDomainContractView();

    expect(contract.roles).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          roleKey: "seafood_stall",
          consumerFacingByDefault: true,
          merchantFacingByDefault: false,
          permissionImpact: "none",
        }),
        expect.objectContaining({
          roleKey: "materials_supplier",
          consumerFacingByDefault: false,
          merchantFacingByDefault: true,
          permissionImpact: "none",
        }),
        expect.objectContaining({
          roleKey: "delivery_supplier",
          consumerFacingByDefault: false,
          merchantFacingByDefault: true,
          permissionImpact: "none",
        }),
      ]),
    );
  });

  it("marks checkout, settlement, commission, and permission as blocked serial work", () => {
    const contract = buildChinaMarketDomainContractView();

    expect(contract.highRiskBoundaries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: "checkout_shipping_options",
          status: "blocked_serial_work",
        }),
        expect.objectContaining({
          key: "settlement",
          status: "blocked_serial_work",
        }),
        expect.objectContaining({
          key: "commission",
          status: "blocked_serial_work",
        }),
        expect.objectContaining({
          key: "permission",
          status: "blocked_serial_work",
        }),
      ]),
    );
    expect(contract.note).toContain("does not affect checkout");
  });
});
