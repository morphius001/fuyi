import { buildChinaTemplateRegistryReadonlyContract } from "../template-registry-readonly-contract";

describe("China template registry readonly contract", () => {
  it("builds a read-only three-surface template registry", () => {
    const contract = buildChinaTemplateRegistryReadonlyContract();

    expect(contract).toMatchObject({
      mode: "china_template_registry_readonly_contract",
      locale: "zh-CN",
      currency: "CNY",
      timezone: "Asia/Shanghai",
      readOnly: true,
      runtimeEnabled: false,
    });
    expect(contract.surfaces.map((surface) => surface.surface)).toEqual([
      "storefront",
      "admin",
      "vendor",
    ]);
    expect(contract.surfaces.flatMap((surface) => surface.templates)).toHaveLength(13);
    expect(
      contract.surfaces
        .flatMap((surface) => surface.templates)
        .every(
          (template) =>
            template.runtimeEnabled === false &&
            template.canWriteBusinessState === false,
        ),
    ).toBe(true);
  });

  it("includes template v2 ids for the four merged preview surfaces without runtime writes", () => {
    const contract = buildChinaTemplateRegistryReadonlyContract();
    const templates = contract.surfaces.flatMap((surface) => surface.templates);

    expect(templates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          templateId: "storefront-home-market-shop-v2",
          version: "v2",
          visibility: "consumer_default_visible",
          consumerFacing: true,
          runtimeEnabled: false,
          canWriteBusinessState: false,
        }),
        expect.objectContaining({
          templateId: "storefront-shop-stall-v2",
          version: "v2",
          slots: expect.arrayContaining(["shop_profile", "fulfillment_hint"]),
          runtimeEnabled: false,
          canWriteBusinessState: false,
        }),
        expect.objectContaining({
          templateId: "admin-dashboard-ops-v2",
          version: "v2",
          slots: expect.arrayContaining(["data_source_notice", "focus_modules"]),
          runtimeEnabled: false,
          canWriteBusinessState: false,
        }),
        expect.objectContaining({
          templateId: "vendor-role-workspace-v2",
          version: "v2",
          slots: expect.arrayContaining(["role_context", "role_workspace_cards"]),
          runtimeEnabled: false,
          canWriteBusinessState: false,
        }),
      ]),
    );
  });

  it("keeps B-side suppliers out of the default consumer homepage path", () => {
    const contract = buildChinaTemplateRegistryReadonlyContract();
    const storefrontHome = contract.surfaces
      .find((surface) => surface.surface === "storefront")
      ?.templates.find(
        (template) => template.templateId === "storefront-home-market-shop-v2",
      );

    expect(storefrontHome).toMatchObject({
      surface: "storefront",
      scenario: "home",
      visibility: "consumer_default_visible",
      consumerFacing: true,
      runtimeEnabled: false,
      canWriteBusinessState: false,
    });
    expect(storefrontHome?.notes.join(" ")).toContain(
      "物料、配送供应商、上游供给、种苗批发和外地批发商默认不进入消费者首页主路径",
    );
    expect(contract.highRiskBoundaries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: "consumer_b_side_visibility",
          status: "blocked_serial_work",
        }),
      ]),
    );
  });

  it("keeps vendor role workspace v2 from acting as a real permission or fulfillment source", () => {
    const contract = buildChinaTemplateRegistryReadonlyContract();
    const vendorRoleWorkspace = contract.surfaces
      .find((surface) => surface.surface === "vendor")
      ?.templates.find(
        (template) => template.templateId === "vendor-role-workspace-v2",
      );

    expect(vendorRoleWorkspace).toMatchObject({
      surface: "vendor",
      scenario: "dashboard",
      visibility: "merchant_default_visible",
      consumerFacing: false,
      runtimeEnabled: false,
      canWriteBusinessState: false,
    });
    expect(vendorRoleWorkspace?.notes.join(" ")).toContain(
      "不代表真实权限已经生效",
    );
    expect(vendorRoleWorkspace?.notes.join(" ")).toContain(
      "另走平台审核、权限、履约、结算和日志边界",
    );
  });

  it("keeps pickup card independent and live commerce out of the primary homepage entry", () => {
    const contract = buildChinaTemplateRegistryReadonlyContract();

    expect(contract.highRiskBoundaries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: "pickup_card_checkout_discount",
          status: "blocked_serial_work",
        }),
        expect.objectContaining({
          key: "live_primary_home_entry",
          status: "blocked_serial_work",
        }),
      ]),
    );

    const pickupCard = contract.surfaces
      .flatMap((surface) => surface.templates)
      .find(
        (template) =>
          template.templateId === "storefront-pickup-card-independent-v1",
      );
    expect(pickupCard).toMatchObject({
      scenario: "pickup_card",
      visibility: "independent_entry",
      consumerFacing: true,
      canWriteBusinessState: false,
    });
  });

  it("marks permission, feature flag, payment, settlement, provider, and fulfillment as blocked serial work", () => {
    const contract = buildChinaTemplateRegistryReadonlyContract();

    expect(contract.highRiskBoundaries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: "rbac_permission",
          status: "blocked_serial_work",
        }),
        expect.objectContaining({
          key: "feature_flag_effective_state",
          status: "blocked_serial_work",
        }),
        expect.objectContaining({
          key: "payment_success",
          status: "blocked_serial_work",
        }),
        expect.objectContaining({
          key: "order_status",
          status: "blocked_serial_work",
        }),
        expect.objectContaining({
          key: "refund_status",
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
          key: "payout",
          status: "blocked_serial_work",
        }),
        expect.objectContaining({
          key: "checkout_shipping_options",
          status: "blocked_serial_work",
        }),
        expect.objectContaining({
          key: "provider_configuration",
          status: "blocked_serial_work",
        }),
        expect.objectContaining({
          key: "real_credentials",
          status: "blocked_serial_work",
        }),
        expect.objectContaining({
          key: "fulfillment",
          status: "blocked_serial_work",
        }),
      ]),
    );
    expect(contract.note).toContain("does not affect permissions");
  });
});
