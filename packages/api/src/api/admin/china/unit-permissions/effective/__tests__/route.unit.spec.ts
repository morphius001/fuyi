import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

import {
  DELETE as adminDeleteUnitPermissions,
  POST as adminPostUnitPermissions,
} from "../../route";
import { GET } from "../route";

const makeRequest = (
  query: Record<string, unknown> = {},
  body?: Record<string, unknown>,
) =>
  ({
    body,
    query,
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

describe("Admin China unit permission effective preview route", () => {
  beforeEach(async () => {
    await adminDeleteUnitPermissions(makeRequest(), makeResponse());
  });

  afterEach(async () => {
    await adminDeleteUnitPermissions(makeRequest(), makeResponse());
  });

  it("reflects Admin unit permission changes for the selected unit", async () => {
    const before = makeResponse();

    await GET(makeRequest({ unit_key: "seafoodStallA12" }), before);

    expect(before.json).toHaveBeenCalledWith(
      expect.objectContaining({
        unitPermissionEffective: expect.objectContaining({
          hiddenModuleKeys: expect.arrayContaining(["financeReadOnly"]),
          visibleModuleKeys: expect.not.arrayContaining(["financeReadOnly"]),
        }),
      }),
    );

    await adminPostUnitPermissions(
      makeRequest(
        {},
        {
          moduleKey: "financeReadOnly",
          unitKey: "seafoodStallA12",
          visible: true,
        },
      ),
      makeResponse(),
    );

    const after = makeResponse();

    await GET(makeRequest({ unit_key: "seafoodStallA12" }), after);

    expect(after.json).toHaveBeenCalledWith(
      expect.objectContaining({
        unitPermissionEffective: expect.objectContaining({
          hiddenModuleKeys: expect.not.arrayContaining(["financeReadOnly"]),
          visibleModuleKeys: expect.arrayContaining(["financeReadOnly"]),
        }),
      }),
    );
  });
});
