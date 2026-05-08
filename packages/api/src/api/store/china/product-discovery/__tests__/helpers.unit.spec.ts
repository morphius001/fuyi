import {
  parseProductDiscoveryFilters,
  readChinaProductDiscoveryRows,
} from "../helpers";

class ProductDiscoveryTestQuery {
  private filters: Array<(row: Record<string, unknown>) => boolean> = [];
  private maxRows?: number;

  constructor(private readonly rows: Array<Record<string, unknown>>) {}

  whereNull(key: string) {
    this.filters.push((row) => row[key] == null);

    return this;
  }

  where(key: string | Record<string, unknown>, value?: unknown) {
    if (typeof key === "string") {
      this.filters.push((row) => row[key] === value);
    } else {
      Object.entries(key).forEach(([entryKey, entryValue]) => {
        this.filters.push((row) => row[entryKey] === entryValue);
      });
    }

    return this;
  }

  whereIn(key: string, values: unknown[]) {
    this.filters.push((row) => values.includes(row[key]));

    return this;
  }

  andWhere() {
    return this;
  }

  orWhere() {
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
      this.filters.every((filter) => filter(row))
    );
    const limitedRows =
      typeof this.maxRows === "number" ? rows.slice(0, this.maxRows) : rows;

    if (!keys.length || keys.includes("*")) {
      return limitedRows;
    }

    return limitedRows.map((row) =>
      Object.fromEntries(keys.map((key) => [key, row[key]]))
    );
  }
}

const buildPg = () => {
  const tableRows: Record<string, Array<Record<string, unknown>>> = {
    seller: [
      {
        id: "sel_1",
        handle: "a-hai-xian-huo-dang",
        name: "阿海鲜活档",
        status: "open",
        metadata: {
          market_name: "三门海鲜市场",
          booth_no: "A区18号",
        },
      },
      {
        id: "sel_2",
        handle: "closed-seller",
        name: "关闭店铺",
        status: "closed",
        metadata: {},
      },
    ],
    product_product_seller_seller: [
      {
        product_id: "prod_crab",
        seller_id: "sel_1",
      },
      {
        product_id: "prod_closed",
        seller_id: "sel_2",
      },
    ],
    product: [
      {
        id: "prod_crab",
        title: "鲜活梭子蟹",
        handle: "xian-huo-suo-zi-xie",
        status: "published",
        metadata: {
          price_text: "¥68/斤",
          spec_text: "公母混装",
        },
      },
      {
        id: "prod_closed",
        title: "关闭店铺商品",
        status: "published",
        metadata: {},
      },
    ],
  };

  return ((tableName: string) =>
    new ProductDiscoveryTestQuery(tableRows[tableName] ?? [])) as any;
};

describe("Store product discovery helpers", () => {
  it("parses readonly filters with bounded limit", () => {
    expect(
      parseProductDiscoveryFilters({
        q: " 梭子蟹 ",
        market: "三门海鲜市场",
        seller_handle: "a-hai-xian-huo-dang",
        category_handle: "fresh-crab",
        limit: "200",
      })
    ).toEqual({
      filters: {
        query: "梭子蟹",
        market: "三门海鲜市场",
        sellerHandle: "a-hai-xian-huo-dang",
        categoryHandle: "fresh-crab",
      },
      limit: 24,
    });
  });

  it("reads visible seller products without touching business state", async () => {
    const rows = await readChinaProductDiscoveryRows({
      pg: buildPg(),
      filters: {
        sellerHandle: "a-hai-xian-huo-dang",
      },
      limit: 12,
      now: new Date("2026-05-09T00:00:00.000Z"),
    });

    expect(rows).toMatchObject({
      sellerProductIds: ["prod_crab"],
      sellerContexts: [
        {
          id: "sel_1",
          handle: "a-hai-xian-huo-dang",
          market: "三门海鲜市场",
          booth: "A区18号",
        },
      ],
      productRows: [
        {
          id: "prod_crab",
          title: "鲜活梭子蟹",
          seller_id: "sel_1",
          seller_handle: "a-hai-xian-huo-dang",
        },
      ],
    });
  });
});
