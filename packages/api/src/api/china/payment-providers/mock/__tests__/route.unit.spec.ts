import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

import { POST } from "../route";

const oldEnv = process.env;

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

describe("mock China payment provider runtime disabled route", () => {
  beforeEach(() => {
    process.env = { ...oldEnv };
  });

  afterAll(() => {
    process.env = oldEnv;
  });

  it("returns disabled by default without reading request body", async () => {
    const req = {
      text: jest.fn(),
      body: {
        should: "not-be-read",
      },
    } as unknown as MedusaRequest;
    const res = makeResponse();

    await POST(req, res);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith({
      status: "disabled",
      provider: "mock_china_pay",
      runtime: "disabled",
      reason: "Mock China payment provider runtime is disabled.",
      runtimeRequested: false,
    });
    expect((req as unknown as { text: jest.Mock }).text).not.toHaveBeenCalled();
  });

  it("stays disabled when runtime env is requested", async () => {
    process.env.CHINA_PAYMENT_NOTIFICATION_RUNTIME_ENABLED = "true";
    process.env.CHINA_PAYMENT_PROVIDER_REGISTRY_MODE = "mock_contract_only";
    process.env.CHINA_PAYMENT_NOTIFICATION_MOCK_SECRET = "mock_secret_should_not_leak";

    const req = {
      text: jest.fn(async () => {
        throw new Error("body should not be read");
      }),
    } as unknown as MedusaRequest;
    const res = makeResponse();

    await POST(req, res);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith({
      status: "disabled",
      provider: "mock_china_pay",
      runtime: "disabled",
      reason: "Mock China payment provider runtime is disabled.",
      runtimeRequested: true,
    });
    expect((req as unknown as { text: jest.Mock }).text).not.toHaveBeenCalled();
    expect(JSON.stringify(res.json.mock.calls[0]?.[0])).not.toContain(
      "mock_secret_should_not_leak",
    );
  });

  it("blocks production even when runtime env is requested", async () => {
    process.env.NODE_ENV = "production";
    process.env.CHINA_PAYMENT_NOTIFICATION_RUNTIME_ENABLED = "true";
    process.env.CHINA_PAYMENT_PROVIDER_REGISTRY_MODE = "mock_contract_only";

    const req = {
      text: jest.fn(),
    } as unknown as MedusaRequest;
    const res = makeResponse();

    await POST(req, res);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith({
      status: "disabled",
      provider: "mock_china_pay",
      runtime: "production_blocked",
      reason: "Mock China payment provider runtime is blocked in production.",
      runtimeRequested: true,
    });
    expect((req as unknown as { text: jest.Mock }).text).not.toHaveBeenCalled();
  });

  it("does not expose workflow or checkout runtime fields", async () => {
    const req = {
      text: jest.fn(),
    } as unknown as MedusaRequest;
    const res = makeResponse();

    await POST(req, res);

    const body = JSON.stringify(res.json.mock.calls[0]?.[0]);
    expect(body).not.toContain("execute_workflow");
    expect(body).not.toContain("checkout");
    expect(body).not.toContain("paymentStateCommand");
    expect(body).not.toContain("orderStateCommand");
  });
});
