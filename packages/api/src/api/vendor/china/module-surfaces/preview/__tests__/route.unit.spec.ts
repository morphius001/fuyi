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

  andWhere(callback: (builder: TestQuery) => void) {
    callback(this);

    return this;
  }

  orWhere(key: string, value: unknown) {
    this.filters.push((row) => row[key] === value);

    return this;
  }

  orderBy() {
    return this;
  }

  limit() {
    return this;
  }

  async select() {
    return this.rows.filter((row) =>
      this.filters.every((filter) => filter(row)),
    );
  }
}

const createPg = () => {
  const rows: Record<string, TestRow[]> = {
    seller: [
      {
        id: "sel_demo",
        handle: "a-hai-xian-huo-dang",
        metadata: {},
      },
    ],
  };

  const pg = ((tableName: string) => new TestQuery(rows[tableName] ?? [])) as ((
    tableName: string,
  ) => TestQuery) & {
    schema: {
      hasTable: (tableName: string) => Promise<boolean>;
    };
  };

  pg.schema = {
    hasTable: async () => false,
  };

  return pg;
};

const makeRequest = (query: Record<string, unknown>) =>
  ({
    query,
    scope: {
      resolve: jest.fn(() => createPg()),
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

describe("vendor China module surface preview route", () => {
  it("returns a read-only preview for an allowed module", async () => {
    const res = makeResponse();

    await GET(makeRequest({ module_key: "expressPrint" }), res);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      unitPermissionAccess: expect.objectContaining({
        allowed: true,
        moduleKey: "expressPrint",
        unitKey: "seafoodStallA12",
      }),
      moduleSurface: expect.objectContaining({
        mode: "vendor_china_module_surface_preview",
        moduleKey: "expressPrint",
        runtimeEnabled: false,
      }),
    });
  });

  it("returns module-specific read-only previews for core allowed modules", async () => {
    const res = makeResponse();

    await GET(makeRequest({ module_key: "seafoodTrade" }), res);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      unitPermissionAccess: expect.objectContaining({
        allowed: true,
        moduleKey: "seafoodTrade",
        unitKey: "seafoodStallA12",
      }),
      moduleSurface: expect.objectContaining({
        cards: expect.arrayContaining([
          expect.objectContaining({
            label: "今日鲜货",
            note: expect.stringContaining("不发布商品"),
          }),
        ]),
        moduleKey: "seafoodTrade",
        runtimeEnabled: false,
        title: "海鲜档口经营预览",
      }),
    });
  });

  it("blocks a preview for a hidden module before returning module data", async () => {
    const res = makeResponse();

    await GET(makeRequest({ module_key: "livestream" }), res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      unitPermissionAccess: expect.objectContaining({
        allowed: false,
        moduleKey: "livestream",
        reason: "module_hidden_for_unit",
      }),
    });
  });

  it("rejects requests without a module key", async () => {
    const res = makeResponse();

    await GET(makeRequest({}), res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "module_key is required.",
    });
  });
});
