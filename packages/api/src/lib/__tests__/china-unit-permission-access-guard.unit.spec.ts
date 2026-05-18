import { resolveChinaUnitPermissionModuleAccess } from "../china-unit-permission-access-guard";

describe("China unit permission access guard", () => {
  it("allows a bound seafood stall to access enabled module surfaces", async () => {
    const result = await resolveChinaUnitPermissionModuleAccess({
      moduleKey: "seafoodTrade",
      seller: {
        sellerHandle: "a-hai-xian-huo-dang",
        sellerId: "sel_demo",
      },
    });

    expect(result).toMatchObject({
      allowed: true,
      moduleKey: "seafoodTrade",
      unitKey: "seafoodStallA12",
    });
    expect(result.visibleModuleKeys).toContain("seafoodTrade");
  });

  it("blocks hidden modules for the seller operating unit", async () => {
    const result = await resolveChinaUnitPermissionModuleAccess({
      moduleKey: "livestream",
      seller: {
        sellerHandle: "a-hai-xian-huo-dang",
        sellerId: "sel_demo",
      },
    });

    expect(result).toMatchObject({
      allowed: false,
      moduleKey: "livestream",
      reason: "module_hidden_for_unit",
      statusCode: 403,
      unitKey: "seafoodStallA12",
    });
    expect(result.hiddenModuleKeys).toContain("livestream");
  });

  it("does not grant access when the vendor seller is not bound to a unit", async () => {
    const result = await resolveChinaUnitPermissionModuleAccess({
      moduleKey: "seafoodTrade",
      seller: {
        sellerHandle: "unknown-seller",
        sellerId: "sel_unknown",
      },
    });

    expect(result).toMatchObject({
      allowed: false,
      reason: "seller_unbound",
      statusCode: 403,
    });
    expect(result.visibleModuleKeys).toEqual([]);
  });

  it("supports explicit metadata fallback without opening unrelated modules", async () => {
    const result = await resolveChinaUnitPermissionModuleAccess({
      moduleKey: "marketMaterials",
      seller: {
        sellerHandle: "metadata-only-supplier",
        sellerId: "sel_metadata_supplier",
        unitKey: "materialSupplierNorth",
      },
    });

    expect(result).toMatchObject({
      allowed: true,
      moduleKey: "marketMaterials",
      source: "server_memory_draft:seller_metadata_fallback",
      unitKey: "materialSupplierNorth",
    });
    expect(result.hiddenModuleKeys).toContain("livestream");
  });

  it("reports unknown modules without converting menu visibility into RBAC", async () => {
    const result = await resolveChinaUnitPermissionModuleAccess({
      moduleKey: "settlementPayoutMutation",
      seller: {
        sellerHandle: "a-hai-xian-huo-dang",
      },
    });

    expect(result).toMatchObject({
      allowed: false,
      reason: "module_not_found",
      statusCode: 403,
    });
    expect(result.note).toContain("menu visibility only");
    expect(result.note).toContain("not a replacement for Medusa/Mercur RBAC");
  });
});
