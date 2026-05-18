import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

import { DELETE, GET, POST } from "../route";

const makeRequest = (body?: Record<string, unknown>) =>
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

describe("admin China platform module switches route", () => {
  afterEach(async () => {
    await DELETE(makeRequest(), makeResponse());
  });

  it("returns the server-memory platform module switch draft when PG is unavailable", async () => {
    const res = makeResponse();

    await GET(makeRequest(), res);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      platformModuleSwitches: expect.objectContaining({
        mode: "platform_module_switch_draft",
        source: "server_memory_draft",
        items: expect.arrayContaining([
          expect.objectContaining({
            moduleKey: "seafoodTrade",
            switchOn: true,
          }),
        ]),
      }),
    });
  });

  it("updates the draft without enabling business runtime behavior", async () => {
    const res = makeResponse();

    await POST(
      makeRequest({
        moduleKey: "livestream",
        switchOn: true,
      }),
      res,
    );

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      updated: expect.objectContaining({
        moduleKey: "livestream",
        switchOn: true,
      }),
      platformModuleSwitches: expect.objectContaining({
        note: expect.stringContaining("does not grant RBAC"),
        items: expect.arrayContaining([
          expect.objectContaining({
            moduleKey: "livestream",
            switchOn: true,
          }),
        ]),
      }),
    });
  });

  it("rejects malformed update payloads before changing the draft", async () => {
    const res = makeResponse();

    await POST(makeRequest({ moduleKey: "livestream" }), res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "invalid_platform_module_switch_update",
      message: "moduleKey and switchOn are required.",
    });
  });

  it("resets the draft back to default platform switches", async () => {
    await POST(
      makeRequest({
        moduleKey: "livestream",
        switchOn: true,
      }),
      makeResponse(),
    );

    const res = makeResponse();

    await DELETE(makeRequest(), res);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      platformModuleSwitches: expect.objectContaining({
        items: expect.arrayContaining([
          expect.objectContaining({
            moduleKey: "livestream",
            switchOn: false,
          }),
        ]),
      }),
    });
  });
});
