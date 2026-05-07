import {
  buildStoreMarketReadModelFromRepositoryRows,
  buildStoreMarketReadModelFromSellerRows,
  readStoreMarketRepositoryRows,
} from "../helpers";
import {
  buildMarketMembershipRepositoryRowsFixture,
  marketMembershipFixtureMarketId,
} from "../../../../../modules/china-market-read-model/__tests__/market-membership-test-fixture";

type TestRepositoryRows = ReturnType<
  typeof buildMarketMembershipRepositoryRowsFixture
>;

type TestSellerRow = {
  id: string;
  handle?: string;
  name: string;
  metadata?: Record<string, unknown>;
  deleted_at?: Date | null;
};

class TestStoreMarketQuery {
  private filters: Array<(row: Record<string, unknown>) => boolean> = [];
  private maxRows?: number;

  constructor(private readonly rows: Array<Record<string, unknown>> = []) {}

  whereNull(key: string) {
    this.filters.push((row) => row[key] == null);

    return this;
  }

  where(key: string, value: unknown) {
    this.filters.push((row) => row[key] === value);

    return this;
  }

  andWhere() {
    return this;
  }

  orderBy() {
    return this;
  }

  limit(maxRows: number) {
    this.maxRows = maxRows;

    return this;
  }

  async select(...keys: string[]) {
    const rows = this.rows.filter((row) =>
      this.filters.every((filter) => filter(row)),
    );
    const limitedRows =
      typeof this.maxRows === "number" ? rows.slice(0, this.maxRows) : rows;

    if (!keys.length || keys.includes("*")) {
      return limitedRows;
    }

    return limitedRows.map((row) =>
      Object.fromEntries(keys.map((key) => [key, row[key]])),
    );
  }
}

const buildTestStoreMarketPg = ({
  rows = buildMarketMembershipRepositoryRowsFixture(),
  sellers = [],
  missingTables = [],
}: {
  rows?: TestRepositoryRows;
  sellers?: TestSellerRow[];
  missingTables?: string[];
} = {}) => {
  const tableRows: Record<string, Array<Record<string, unknown>>> = {
    seller: sellers,
    china_market: rows.markets ?? [],
    china_market_membership: rows.memberships ?? [],
    china_seller_role: rows.roles ?? [],
    china_market_announcement: rows.announcements ?? [],
    china_market_business_hour: rows.businessHours ?? [],
    china_market_delivery_profile: rows.deliveryProfiles ?? [],
  };
  const missing = new Set(missingTables);
  const pg = ((tableName: string) =>
    new TestStoreMarketQuery(
      missing.has(tableName) ? [] : (tableRows[tableName] ?? []),
    )) as ((tableName: string) => TestStoreMarketQuery) & {
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

describe("store market read model helpers", () => {
  it("reads repository rows when market membership tables exist", async () => {
    const rows = await readStoreMarketRepositoryRows(buildTestStoreMarketPg());

    expect(rows).toMatchObject({
      markets: expect.arrayContaining([
        expect.objectContaining({
          id: marketMembershipFixtureMarketId,
        }),
      ]),
      memberships: expect.arrayContaining([
        expect.objectContaining({
          market_id: marketMembershipFixtureMarketId,
          booth_no: "A区18号",
        }),
      ]),
    });
  });

  it("builds Store readonly markets and sellers from repository rows", async () => {
    const result = await buildStoreMarketReadModelFromRepositoryRows({
      rows: await readStoreMarketRepositoryRows(buildTestStoreMarketPg()),
      sellerRows: [],
    });
    const markets = result.readModel.listOpenMarkets();
    const detail = result.readModel.buildMarketDetail(
      markets.find((market) => market.id === marketMembershipFixtureMarketId)!
        .slug,
    );

    expect(result.dataSource).toBe("repository");
    expect(markets).toHaveLength(2);
    expect(detail).toMatchObject({
      mode: "read_only_market_detail",
      runtimeEnabled: false,
      memberships: [
        {
          boothNo: "A区18号",
          status: "open",
        },
      ],
      deliveryProfiles: expect.arrayContaining([
        expect.objectContaining({
          deliveryType: "market_pickup",
        }),
      ]),
    });
  });

  it("returns undefined repository rows when required tables are missing", async () => {
    const rows = await readStoreMarketRepositoryRows(
      buildTestStoreMarketPg({
        missingTables: ["china_market_membership"],
      }),
    );

    expect(rows).toBeUndefined();
  });

  it("falls back to seller metadata when repository rows are unavailable", async () => {
    const sellerRows = [
      {
        id: "sel_static_store_001",
        handle: "static-store-seller",
        name: "静态消费者侧商户",
        metadata: {
          market_name: "三门海鲜市场",
          booth_no: "S区02号",
        },
      },
    ];
    const result = await buildStoreMarketReadModelFromRepositoryRows({
      rows: undefined,
      sellerRows,
    });
    const staticResult = buildStoreMarketReadModelFromSellerRows(sellerRows);

    expect(result.dataSource).toBe("static_fallback");
    expect(result.readModel.listOpenMarkets().length).toBeGreaterThan(0);
    expect(staticResult.dataSource).toBe("static_fallback");
  });
});
