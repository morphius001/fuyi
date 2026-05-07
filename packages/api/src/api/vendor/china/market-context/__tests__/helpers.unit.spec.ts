import { MedusaError } from "@medusajs/framework/utils";

import {
  buildVendorMarketContextFromRepositoryRows,
  buildVendorMarketContextFromSellerRows,
  readVendorMarketContextRepositoryRows,
  resolveVendorMarketContextSellerId,
} from "../helpers";
import {
  buildMarketMembershipRepositoryRowsFixture,
  marketMembershipFixtureMarketId,
  marketMembershipFixtureSecondaryMarketId,
  marketMembershipFixtureSellerHandle,
  marketMembershipFixtureSellerId,
} from "../../../../../modules/china-market-read-model/__tests__/market-membership-test-fixture";

type TestRepositoryRows = ReturnType<
  typeof buildMarketMembershipRepositoryRowsFixture
>;
type TestRepositoryTableRows = NonNullable<
  TestRepositoryRows[keyof TestRepositoryRows]
>;

class TestMarketContextQuery {
  private filters: Array<(row: Record<string, unknown>) => boolean> = [];

  constructor(private readonly rows: TestRepositoryTableRows = []) {}

  whereNull(key: string) {
    this.filters.push((row) => row[key] == null);

    return this;
  }

  where(key: string, value: unknown) {
    this.filters.push((row) => row[key] === value);

    return this;
  }

  whereIn(key: string, values: unknown[]) {
    this.filters.push((row) => values.includes(row[key]));

    return this;
  }

  async select() {
    return this.rows.filter((row) =>
      this.filters.every((filter) => filter(row)),
    );
  }
}

const buildTestMarketContextPg = ({
  rows = buildMarketMembershipRepositoryRowsFixture(),
  missingTables = [],
}: {
  rows?: TestRepositoryRows;
  missingTables?: string[];
} = {}) => {
  const tableRows: Record<string, TestRepositoryTableRows> = {
    china_market: rows.markets ?? [],
    china_market_membership: rows.memberships ?? [],
    china_seller_role: rows.roles ?? [],
    china_market_announcement: rows.announcements ?? [],
    china_market_business_hour: rows.businessHours ?? [],
    china_market_delivery_profile: rows.deliveryProfiles ?? [],
  };
  const missing = new Set(missingTables);
  const pg = ((tableName: string) => {
    if (missing.has(tableName)) {
      return new TestMarketContextQuery([]);
    }

    return new TestMarketContextQuery(tableRows[tableName] ?? []);
  }) as ((tableName: string) => TestMarketContextQuery) & {
    schema: {
      hasTable: (tableName: string) => Promise<boolean>;
    };
  };

  pg.schema = {
    hasTable: async (tableName: string) =>
      Boolean(tableRows[tableName]) && !missing.has(tableName),
  };

  return pg;
};

describe("vendor market context route helpers", () => {
  it("resolves seller id from seller_context only", () => {
    expect(
      resolveVendorMarketContextSellerId({
        seller_context: {
          seller_id: "sel_1",
        },
      }),
    ).toBe("sel_1");
  });

  it("rejects requests without vendor seller context", () => {
    expect(() => resolveVendorMarketContextSellerId({})).toThrow(MedusaError);
  });

  it("builds context only for the authenticated seller row", () => {
    const context = buildVendorMarketContextFromSellerRows({
      sellerId: "sel_1",
      sellers: [
        {
          id: "sel_1",
          handle: "a-hai-xian-huo-dang",
          name: "阿海鲜活档",
          metadata: {
            market_name: "三门海鲜市场",
            booth_no: "A区18号",
            category_summary: "鲜活蟹类",
          },
        },
        {
          id: "sel_2",
          handle: "other",
          name: "其它商户",
          metadata: {
            market_name: "三门海鲜市场",
            booth_no: "C区01号",
          },
        },
      ],
    });

    expect(context).toMatchObject({
      sellerId: "sel_1",
      sellerHandle: "a-hai-xian-huo-dang",
      runtimeEnabled: false,
      memberships: [
        {
          boothNo: "A区18号",
        },
      ],
    });
    expect(context.memberships).toHaveLength(1);
  });

  it("returns empty context for seller-owned market filters without membership", () => {
    const context = buildVendorMarketContextFromSellerRows({
      sellerId: "sel_1",
      marketId: "market_missing",
      sellers: [
        {
          id: "sel_1",
          handle: "a-hai-xian-huo-dang",
          name: "阿海鲜活档",
          metadata: {
            market_name: "三门海鲜市场",
            booth_no: "A区18号",
          },
        },
      ],
    });

    expect(context).toMatchObject({
      mode: "vendor_market_context_empty",
      sellerId: "sel_1",
      runtimeEnabled: false,
      memberships: [],
      deliveryProfiles: [],
    });
  });

  it("prefers repository rows when they contain current seller membership", async () => {
    const result = await buildVendorMarketContextFromRepositoryRows({
      sellerId: marketMembershipFixtureSellerId,
      seller: {
        id: marketMembershipFixtureSellerId,
        handle: marketMembershipFixtureSellerHandle,
        name: "测试鲜活档",
      },
      rows: buildMarketMembershipRepositoryRowsFixture(),
    });

    expect(result).toMatchObject({
      dataSource: "repository",
      marketContext: {
        sellerId: marketMembershipFixtureSellerId,
        runtimeEnabled: false,
        primaryMembership: {
          stallName: "测试鲜活一号档",
          merchantTypeKeys: ["seafood_stall", "materials_supplier"],
        },
        deliveryProfiles: expect.arrayContaining([
          expect.objectContaining({
            deliveryType: "market_unified_delivery",
            merchantSelectable: true,
            runtimeEnabled: false,
            checkoutImpact: "none",
          }),
        ]),
      },
    });
  });

  it("falls back to seller metadata when repository rows are unavailable for the seller", async () => {
    const result = await buildVendorMarketContextFromRepositoryRows({
      sellerId: "sel_1",
      seller: {
        id: "sel_1",
        handle: "a-hai-xian-huo-dang",
        name: "阿海鲜活档",
        metadata: {
          market_name: "三门海鲜市场",
          booth_no: "A区18号",
        },
      },
      rows: {
        markets: [],
        memberships: [],
      },
    });

    expect(result).toMatchObject({
      dataSource: "static_fallback",
      marketContext: {
        sellerId: "sel_1",
        memberships: [
          {
            boothNo: "A区18号",
          },
        ],
        runtimeEnabled: false,
      },
    });
  });

  it("reads DB rows for the authenticated seller and keeps repository mode", async () => {
    const rows = await readVendorMarketContextRepositoryRows({
      pg: buildTestMarketContextPg(),
      sellerId: marketMembershipFixtureSellerId,
    });

    expect(rows).toMatchObject({
      markets: expect.arrayContaining([
        expect.objectContaining({
          id: marketMembershipFixtureMarketId,
        }),
        expect.objectContaining({
          id: marketMembershipFixtureSecondaryMarketId,
        }),
      ]),
      memberships: expect.arrayContaining([
        expect.objectContaining({
          seller_id: marketMembershipFixtureSellerId,
          booth_no: "A区18号",
        }),
        expect.objectContaining({
          seller_id: marketMembershipFixtureSellerId,
          booth_no: "B区06号",
        }),
      ]),
    });

    const result = await buildVendorMarketContextFromRepositoryRows({
      sellerId: marketMembershipFixtureSellerId,
      seller: {
        id: marketMembershipFixtureSellerId,
        handle: marketMembershipFixtureSellerHandle,
        name: "测试鲜活档",
      },
      rows: rows ?? {},
    });

    expect(result).toMatchObject({
      dataSource: "repository",
      marketContext: {
        runtimeEnabled: false,
        primaryMembership: {
          boothNo: "A区18号",
          merchantTypeKeys: ["seafood_stall", "materials_supplier"],
        },
      },
    });
  });

  it("limits DB rows to an authenticated seller owned market filter", async () => {
    const rows = await readVendorMarketContextRepositoryRows({
      pg: buildTestMarketContextPg(),
      sellerId: marketMembershipFixtureSellerId,
      marketId: marketMembershipFixtureSecondaryMarketId,
    });

    expect(rows?.memberships).toMatchObject([
      {
        market_id: marketMembershipFixtureSecondaryMarketId,
        seller_id: marketMembershipFixtureSellerId,
        booth_no: "B区06号",
      },
    ]);
    expect(rows?.markets).toMatchObject([
      {
        id: marketMembershipFixtureSecondaryMarketId,
      },
    ]);
    expect(rows?.announcements).toEqual([]);
    expect(rows?.deliveryProfiles).toEqual([]);
  });

  it("returns undefined when required DB tables are missing", async () => {
    const rows = await readVendorMarketContextRepositoryRows({
      pg: buildTestMarketContextPg({
        missingTables: ["china_market_membership"],
      }),
      sellerId: marketMembershipFixtureSellerId,
    });

    expect(rows).toBeUndefined();
  });

  it("keeps static fallback when DB rows have no seller membership", async () => {
    const rows = await readVendorMarketContextRepositoryRows({
      pg: buildTestMarketContextPg(),
      sellerId: "sel_missing_fixture",
    });
    const result = await buildVendorMarketContextFromRepositoryRows({
      sellerId: "sel_missing_fixture",
      seller: {
        id: "sel_missing_fixture",
        handle: "fallback-seller",
        name: "Fallback 测试档",
        metadata: {
          market_name: "Fallback 测试市场",
          booth_no: "F区01号",
        },
      },
      rows: rows ?? {},
    });

    expect(rows).toMatchObject({
      markets: [],
      memberships: [],
    });
    expect(result).toMatchObject({
      dataSource: "static_fallback",
      marketContext: {
        sellerId: "sel_missing_fixture",
        runtimeEnabled: false,
        memberships: [
          {
            boothNo: "F区01号",
          },
        ],
      },
    });
  });
});
