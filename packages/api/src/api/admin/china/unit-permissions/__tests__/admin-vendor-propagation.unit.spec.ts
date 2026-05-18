import {
  AuthenticatedMedusaRequest,
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";

import {
  DELETE as adminDeleteUnitPermissions,
  GET as adminGetUnitPermissions,
  POST as adminPostUnitPermissions,
} from "../route";
import { GET as vendorAuthorizeUnitPermission } from "../../../../vendor/china/unit-permissions/authorize/route";
import { GET as vendorEffectiveUnitPermission } from "../../../../vendor/china/unit-permissions/effective/route";
import { GET as vendorModuleSurfacePreview } from "../../../../vendor/china/module-surfaces/preview/route";

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

const createVendorPg = () => {
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

const makeAdminRequest = (body?: Record<string, unknown>) =>
  ({
    body,
    scope: {
      resolve: jest.fn(() => {
        throw new Error("PG unavailable in unit test");
      }),
    },
    auth_context: {
      actor_id: "admin_demo",
      actor_type: "admin",
    },
  }) as unknown as MedusaRequest;

const makeVendorRequest = (query: Record<string, unknown> = {}) =>
  ({
    query,
    scope: {
      resolve: jest.fn(() => createVendorPg()),
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

describe("admin unit permission changes propagate to Vendor guarded surfaces", () => {
  beforeEach(async () => {
    await adminDeleteUnitPermissions(makeAdminRequest(), makeResponse());
  });

  afterEach(async () => {
    await adminDeleteUnitPermissions(makeAdminRequest(), makeResponse());
  });

  it("updates Vendor effective view, authorize, and read-only preview after an Admin toggle", async () => {
    const effectiveBefore = makeResponse();

    await vendorEffectiveUnitPermission(makeVendorRequest(), effectiveBefore);

    expect(effectiveBefore.json).toHaveBeenCalledWith(
      expect.objectContaining({
        unitPermissionEffective: expect.objectContaining({
          hiddenModuleKeys: expect.arrayContaining(["livestream"]),
          visibleModuleKeys: expect.not.arrayContaining(["livestream"]),
        }),
      }),
    );

    const adminOpen = makeResponse();

    await adminPostUnitPermissions(
      makeAdminRequest({
        moduleKey: "livestream",
        unitKey: "seafoodStallA12",
        visible: true,
      }),
      adminOpen,
    );

    expect(adminOpen.status).not.toHaveBeenCalled();

    const effectiveAfter = makeResponse();

    await vendorEffectiveUnitPermission(makeVendorRequest(), effectiveAfter);

    expect(effectiveAfter.json).toHaveBeenCalledWith(
      expect.objectContaining({
        unitPermissionEffective: expect.objectContaining({
          hiddenModuleKeys: expect.not.arrayContaining(["livestream"]),
          visibleModuleKeys: expect.arrayContaining(["livestream"]),
        }),
      }),
    );

    const authorizeAfter = makeResponse();

    await vendorAuthorizeUnitPermission(
      makeVendorRequest({ module_key: "livestream" }),
      authorizeAfter,
    );

    expect(authorizeAfter.status).not.toHaveBeenCalled();
    expect(authorizeAfter.json).toHaveBeenCalledWith({
      unitPermissionAccess: expect.objectContaining({
        allowed: true,
        moduleKey: "livestream",
        unitKey: "seafoodStallA12",
      }),
    });

    const previewAfter = makeResponse();

    await vendorModuleSurfacePreview(
      makeVendorRequest({ module_key: "livestream" }),
      previewAfter,
    );

    expect(previewAfter.status).not.toHaveBeenCalled();
    expect(previewAfter.json).toHaveBeenCalledWith({
      unitPermissionAccess: expect.objectContaining({
        allowed: true,
        moduleKey: "livestream",
      }),
      moduleSurface: expect.objectContaining({
        moduleKey: "livestream",
        runtimeEnabled: false,
        title: "直播工作台预览",
      }),
    });
  });

  it("returns seller options for the Admin binding selector", async () => {
    const res = makeResponse();

    await adminGetUnitPermissions(makeAdminRequest(), res);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        sellerOptions: expect.arrayContaining([
          expect.objectContaining({
            sellerHandle: "a-hai-xian-huo-dang",
          }),
        ]),
      }),
    );
  });

  it("keeps finance as an explicit unit-level read-only surface when enabled", async () => {
    const adminOpen = makeResponse();

    await adminPostUnitPermissions(
      makeAdminRequest({
        moduleKey: "financeReadOnly",
        unitKey: "seafoodStallA12",
        visible: true,
      }),
      adminOpen,
    );

    expect(adminOpen.status).not.toHaveBeenCalled();

    const authorizeAfter = makeResponse();

    await vendorAuthorizeUnitPermission(
      makeVendorRequest({ module_key: "financeReadOnly" }),
      authorizeAfter,
    );

    expect(authorizeAfter.status).not.toHaveBeenCalled();
    expect(authorizeAfter.json).toHaveBeenCalledWith({
      unitPermissionAccess: expect.objectContaining({
        allowed: true,
        moduleKey: "financeReadOnly",
        unitKey: "seafoodStallA12",
      }),
    });

    const previewAfter = makeResponse();

    await vendorModuleSurfacePreview(
      makeVendorRequest({ module_key: "financeReadOnly" }),
      previewAfter,
    );

    expect(previewAfter.status).not.toHaveBeenCalled();
    expect(previewAfter.json).toHaveBeenCalledWith({
      unitPermissionAccess: expect.objectContaining({
        allowed: true,
        moduleKey: "financeReadOnly",
      }),
      moduleSurface: expect.objectContaining({
        moduleKey: "financeReadOnly",
        runtimeEnabled: false,
        title: "财务结算只读预览",
      }),
    });
  });
});
