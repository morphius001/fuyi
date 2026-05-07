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

describe("admin china mock payment webhook disabled route", () => {
  beforeEach(() => {
    process.env = { ...oldEnv };
  });

  afterAll(() => {
    process.env = oldEnv;
  });

  it("returns disabled by default without reading request body", async () => {
    const req = {
      text: jest.fn(),
    } as unknown as MedusaRequest;
    const res = makeResponse();

    await POST(req, res);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith({
      status: "disabled",
      code: "RUNTIME_DISABLED",
      route: "mock_payment_webhook_disabled_only",
      runtimeRequested: false,
    });
    expect((req as unknown as { text: jest.Mock }).text).not.toHaveBeenCalled();
  });

  it("stays disabled without reading body when mock runtime env is requested", async () => {
    process.env.CHINA_PAYMENT_NOTIFICATION_RUNTIME_ENABLED = "true";
    process.env.CHINA_PAYMENT_NOTIFICATION_WEBHOOK_MODE = "mock_inbox_only";
    process.env.CHINA_PAYMENT_NOTIFICATION_PROVIDER = "mock_china_pay";

    const req = {
      text: jest.fn(),
    } as unknown as MedusaRequest;
    const res = makeResponse();

    await POST(req, res);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "disabled",
        code: "RUNTIME_DISABLED",
        runtimeRequested: true,
      }),
    );
    expect((req as unknown as { text: jest.Mock }).text).not.toHaveBeenCalled();
  });

  it("stays disabled without reading body when local in-memory env is requested", async () => {
    process.env.CHINA_PAYMENT_NOTIFICATION_RUNTIME_ENABLED = "true";
    process.env.CHINA_PAYMENT_NOTIFICATION_WEBHOOK_MODE = "mock_inbox_only";
    process.env.CHINA_PAYMENT_NOTIFICATION_PROVIDER = "mock_china_pay";
    process.env.CHINA_PAYMENT_NOTIFICATION_LOCAL_INMEMORY = "true";
    process.env.CHINA_PAYMENT_NOTIFICATION_MOCK_SECRET = "admin_route_secret";
    process.env.NODE_ENV = "development";

    const req = {
      text: jest.fn(async () => {
        throw new Error("body should not be read");
      }),
    } as unknown as MedusaRequest;
    const res = makeResponse();

    await POST(req, res);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "disabled",
        code: "RUNTIME_DISABLED",
        route: "mock_payment_webhook_disabled_only",
        runtimeRequested: true,
      }),
    );
    expect((req as unknown as { text: jest.Mock }).text).not.toHaveBeenCalled();
    expect(JSON.stringify(res.json.mock.calls[0]?.[0])).not.toContain(
      "admin_route_secret",
    );
  });

  it("keeps local in-memory route disabled in production", async () => {
    process.env.CHINA_PAYMENT_NOTIFICATION_RUNTIME_ENABLED = "true";
    process.env.CHINA_PAYMENT_NOTIFICATION_WEBHOOK_MODE = "mock_inbox_only";
    process.env.CHINA_PAYMENT_NOTIFICATION_PROVIDER = "mock_china_pay";
    process.env.CHINA_PAYMENT_NOTIFICATION_LOCAL_INMEMORY = "true";
    process.env.NODE_ENV = "production";

    const req = {
      text: jest.fn(),
    } as unknown as MedusaRequest;
    const res = makeResponse();

    await POST(req, res);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "disabled",
        code: "RUNTIME_DISABLED",
        route: "mock_payment_webhook_disabled_only",
        runtimeRequested: true,
      }),
    );
    expect((req as unknown as { text: jest.Mock }).text).not.toHaveBeenCalled();
  });
});
