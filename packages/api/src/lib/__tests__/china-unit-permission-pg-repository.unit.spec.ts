import {
  readChinaUnitPermissionSellerOptionsFromPg,
  resolveChinaUnitPermissionSellerBindingFromPg,
  updateChinaUnitPermissionSellerBindingInPg,
  type ChinaUnitPermissionPgConnection,
} from "../china-unit-permission-pg-repository";

const createPg = (
  rows: Record<string, Record<string, unknown>[]>,
): ChinaUnitPermissionPgConnection => {
  const pg = ((tableName: string) => ({
    whereNull() {
      return this;
    },
    where() {
      return this;
    },
    andWhere(callback: (builder: unknown) => void) {
      callback({
        where() {
          return this;
        },
        orWhere() {
          return this;
        },
      });

      return this;
    },
    orderBy() {
      return this;
    },
    limit() {
      return this;
    },
    select() {
      return Promise.resolve(rows[tableName] ?? []);
    },
  })) as ChinaUnitPermissionPgConnection;

  pg.schema = {
    hasTable: async (tableName: string) =>
      tableName === "china_unit_permission_seller_binding",
  };

  return pg;
};

const createMutablePg = (
  rows: Record<string, Record<string, unknown>[]>,
): ChinaUnitPermissionPgConnection => {
  const pg = ((tableName: string) => {
    const conditions: Array<[string, unknown]> = [];

    const builder = {
      where(column: string, value: unknown) {
        conditions.push([column, value]);
        return builder;
      },
      whereNull(column: string) {
        conditions.push([column, null]);
        return builder;
      },
      andWhere(callback: (whereBuilder: unknown) => void) {
        callback({
          where(column: string, value: unknown) {
            conditions.push([column, value]);
            return this;
          },
          orWhere(column: string, value: unknown) {
            conditions.push([column, value]);
            return this;
          },
        });

        return builder;
      },
      orderBy() {
        return builder;
      },
      limit() {
        return builder;
      },
      select() {
        const tableRows = rows[tableName] ?? [];

        return Promise.resolve(
          tableRows.filter((row) =>
            conditions.every(([column, value]) =>
              value === null ? row[column] == null : row[column] === value,
            ),
          ),
        );
      },
      insert(row: Record<string, unknown>) {
        rows[tableName] = rows[tableName] ?? [];
        rows[tableName].push(row);

        return Promise.resolve(row);
      },
      delete() {
        const tableRows = rows[tableName] ?? [];
        rows[tableName] = tableRows.filter(
          (row) =>
            !conditions.every(([column, value]) =>
              value === null ? row[column] == null : row[column] === value,
            ),
        );

        return Promise.resolve();
      },
    };

    return builder;
  }) as ChinaUnitPermissionPgConnection;

  pg.schema = {
    hasTable: async (tableName: string) =>
      [
        "china_unit_permission_config",
        "china_unit_permission_config_event",
        "china_unit_permission_seller_binding",
        ...(rows.seller ? ["seller"] : []),
      ].includes(tableName),
  };

  return pg;
};

describe("China unit permission PG repository", () => {
  it("resolves a seller handle to an operating unit binding", async () => {
    const binding = await resolveChinaUnitPermissionSellerBindingFromPg(
      createPg({
        china_unit_permission_seller_binding: [
          {
            unit_key: "seafoodStallA12",
            seller_id: null,
            seller_handle: "a-hai-xian-huo-dang",
            source: "admin_binding",
            updated_at: new Date("2026-05-15T15:10:00.000Z"),
          },
        ],
      }),
      {
        sellerHandle: "a-hai-xian-huo-dang",
        sellerId: "sel_demo",
      },
    );

    expect(binding).toMatchObject({
      unitKey: "seafoodStallA12",
      sellerHandle: "a-hai-xian-huo-dang",
      source: "admin_binding",
    });
  });

  it("falls back to the seeded demo binding when the binding table is absent", async () => {
    const binding = await resolveChinaUnitPermissionSellerBindingFromPg(
      undefined,
      {
        sellerHandle: "a-hai-xian-huo-dang",
      },
    );

    expect(binding).toMatchObject({
      unitKey: "seafoodStallA12",
      sellerHandle: "a-hai-xian-huo-dang",
      source: "seed_binding",
    });
  });

  it("moves an existing seller handle binding to the requested unit", async () => {
    const rows = {
      china_unit_permission_config: [],
      china_unit_permission_config_event: [],
      china_unit_permission_seller_binding: [
        {
          unit_key: "seafoodStallA12",
          seller_id: null,
          seller_handle: "a-hai-xian-huo-dang",
          status: "active",
          source: "admin_binding",
          updated_at: new Date("2026-05-15T15:10:00.000Z"),
        },
      ],
    };

    await updateChinaUnitPermissionSellerBindingInPg(createMutablePg(rows), {
      unitKey: "frozenMerchantB08",
      sellerHandle: "a-hai-xian-huo-dang",
    });

    expect(rows.china_unit_permission_seller_binding).toHaveLength(1);
    expect(rows.china_unit_permission_seller_binding[0]).toMatchObject({
      unit_key: "frozenMerchantB08",
      seller_handle: "a-hai-xian-huo-dang",
    });
  });

  it("lists real seller options from the seller table", async () => {
    const options = await readChinaUnitPermissionSellerOptionsFromPg(
      createMutablePg({
        seller: [
          {
            id: "sel_1",
            handle: "a-hai-xian-huo-dang",
            name: "阿海鲜活档",
            deleted_at: null,
          },
        ],
      }),
    );

    expect(options).toEqual([
      {
        sellerId: "sel_1",
        sellerHandle: "a-hai-xian-huo-dang",
        sellerName: "阿海鲜活档",
        source: "seller_table",
      },
    ]);
  });

  it("rejects seller bindings when the selected seller does not exist", async () => {
    const rows = {
      china_unit_permission_config: [],
      china_unit_permission_config_event: [],
      china_unit_permission_seller_binding: [],
      seller: [
        {
          id: "sel_1",
          handle: "a-hai-xian-huo-dang",
          name: "阿海鲜活档",
          deleted_at: null,
        },
      ],
    };

    const result = await updateChinaUnitPermissionSellerBindingInPg(
      createMutablePg(rows),
      {
        unitKey: "seafoodStallA12",
        sellerHandle: "missing-seller",
      },
    );

    expect(result).toBeNull();
    expect(rows.china_unit_permission_seller_binding).toHaveLength(0);
  });
});
