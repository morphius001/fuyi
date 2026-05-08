import { buildVendorMobileDraftProductContract } from "../mobile-draft-product-contract";

describe("Vendor mobile draft product contract", () => {
  it("builds a read-only mobile draft contract", () => {
    const contract = buildVendorMobileDraftProductContract();

    expect(contract).toMatchObject({
      mode: "vendor_mobile_draft_product_contract_read_only",
      locale: "zh-CN",
      currency: "CNY",
      timezone: "Asia/Shanghai",
      readOnly: true,
      runtimeEnabled: false,
    });
    expect(contract.fields).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: "title",
          requiredForMobileSave: true,
          merchantConfirmRequired: true,
        }),
        expect.objectContaining({
          key: "spec_template_id",
          source: "spec_template_readonly",
          requiredForMobileSave: true,
        }),
      ]),
    );
  });

  it("keeps every stage from creating products or inventory", () => {
    const contract = buildVendorMobileDraftProductContract();

    expect(contract.stages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: "draft_saved",
          createsProduct: false,
          createsInventory: false,
          requiresAudit: true,
        }),
        expect.objectContaining({
          key: "ready_for_product_create",
          createsProduct: false,
          createsInventory: false,
          requiresAudit: true,
        }),
      ]),
    );
    expect(
      contract.stages.every(
        (stage) => !stage.createsProduct && !stage.createsInventory,
      ),
    ).toBe(true);
  });

  it("blocks product publishing, real AI, orders, payments, and permissions as serial work", () => {
    const contract = buildVendorMobileDraftProductContract();

    expect(contract.highRiskBoundaries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: "real_product_creation",
          status: "blocked_serial_work",
        }),
        expect.objectContaining({
          key: "real_ai_provider",
          status: "blocked_serial_work",
        }),
        expect.objectContaining({
          key: "order",
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
      ]),
    );
    expect(contract.note).toContain("does not create products");
  });
});
