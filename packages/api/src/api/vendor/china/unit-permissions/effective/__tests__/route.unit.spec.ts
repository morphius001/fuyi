import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";

import { GET } from "../route";

type TestRow = Record<string, unknown>;

class TestQuery {
  private filters: Array<(row: TestRow) => boolean> = [];

  constructor(private readonly rows: TestRow[] = []) {}

  whereNull(key: string) {
    this.filters.push((row) => row[key] == null);

    return this;
  }

  where(key: string, value: unknown) {
    this.filters.push((row) => row[key] === value);

    return this;
  }

  async select() {
    return this.rows.filter((row) =>
      this.filters.every((filter) => filter(row)),
    );
  }

  catch() {
    return this.select();
  }
}

const createPg = (sellerRows: TestRow[]) => {
  const rows: Record<string, TestRow[]> = {
    seller: sellerRows,
  };

  const pg = ((tableName: string) => new TestQuery(rows[tableName] ?? [])) as ((
    tableName: string,
  ) => TestQuery) & {
    schema: {
      hasTable: () => Promise<boolean>;
    };
  };

  pg.schema = {
    hasTable: async () => false,
  };

  return pg;
};

const makeRequest = (sellerRows: TestRow[]) =>
  ({
    scope: {
      resolve: jest.fn(() => createPg(sellerRows)),
    },
    seller_context: {
      seller_id: "sel_demo",
    },
  }) as unknown as AuthenticatedMedusaRequest;

const makeResponse = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };

  return res as unknown as MedusaResponse & {
    status: jest.Mock;
    json: jest.Mock;
  };
};

describe("vendor China unit permission effective route", () => {
  it("returns an empty effective view when the seller is not bound to a unit", async () => {
    const res = makeResponse();

    await GET(makeRequest([]), res);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      unitPermissionEffective: expect.objectContaining({
        hiddenModuleKeys: [],
        source: "server_memory_draft:seller_unbound",
        unit: {
          unitKey: "seller_unbound",
          moduleAccess: [],
        },
        visibleModuleKeys: [],
      }),
    });
  });

  it("labels seeded seller bindings with the actual binding source", async () => {
    const res = makeResponse();

    await GET(
      makeRequest([
        {
          deleted_at: null,
          handle: "a-hai-xian-huo-dang",
          id: "sel_demo",
          metadata: {},
        },
      ]),
      res,
    );

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        unitPermissionEffective: expect.objectContaining({
          source: "server_memory_draft:seed_binding",
          unit: expect.objectContaining({
            unitKey: "seafoodStallA12",
          }),
        }),
      }),
    );
  });
});
