import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

import { buildMockPaymentSignature } from "../../../../../modules/china-payment-notification";
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

  it("stays disabled even when mock runtime env is requested", async () => {
    process.env.CHINA_PAYMENT_NOTIFICATION_RUNTIME_ENABLED = "true";
    process.env.CHINA_PAYMENT_NOTIFICATION_WEBHOOK_MODE = "mock_inbox_only";
    process.env.CHINA_PAYMENT_NOTIFICATION_PROVIDER = "mock_china_pay";

    const res = makeResponse();

    await POST({} as MedusaRequest, res);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "disabled",
        code: "RUNTIME_DISABLED",
        runtimeRequested: true,
      }),
    );
  });

  it("accepts local in-memory signed payloads when explicitly enabled", async () => {
    const secret = "local_inmemory_secret";
    const rawBody = JSON.stringify({
      event_id: "evt_local_inmemory_001",
      event_type: "payment.succeeded",
      merchant_order_ref: "pay_local_inmemory_001",
      payment_session_id: "payses_local_inmemory_001",
      provider_transaction_id: "mock_txn_local_inmemory_001",
      amount: 128560,
      currency: "CNY",
    });
    process.env.CHINA_PAYMENT_NOTIFICATION_RUNTIME_ENABLED = "true";
    process.env.CHINA_PAYMENT_NOTIFICATION_WEBHOOK_MODE = "mock_inbox_only";
    process.env.CHINA_PAYMENT_NOTIFICATION_PROVIDER = "mock_china_pay";
    process.env.CHINA_PAYMENT_NOTIFICATION_LOCAL_INMEMORY = "true";
    process.env.CHINA_PAYMENT_NOTIFICATION_MOCK_SECRET = secret;
    process.env.NODE_ENV = "development";

    const req = {
      headers: {
        "x-mock-payment-signature": buildMockPaymentSignature(rawBody, secret),
        "x-mock-payment-event-id": "evt_local_inmemory_001",
      },
      text: jest.fn(async () => rawBody),
    } as unknown as MedusaRequest;
    const res = makeResponse();

    await POST(req, res);

    expect(res.status).toHaveBeenCalledWith(202);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "accepted",
        mode: "mock_inbox_only",
        route: "mock_payment_webhook_local_inmemory",
        safeDebug: expect.objectContaining({
          hasRawBody: true,
          runtimeRequested: true,
        }),
      }),
    );
  });

  it("rejects local in-memory requests without signatures before inbox writes", async () => {
    process.env.CHINA_PAYMENT_NOTIFICATION_RUNTIME_ENABLED = "true";
    process.env.CHINA_PAYMENT_NOTIFICATION_WEBHOOK_MODE = "mock_inbox_only";
    process.env.CHINA_PAYMENT_NOTIFICATION_PROVIDER = "mock_china_pay";
    process.env.CHINA_PAYMENT_NOTIFICATION_LOCAL_INMEMORY = "true";
    process.env.CHINA_PAYMENT_NOTIFICATION_MOCK_SECRET = "local_inmemory_secret";
    process.env.NODE_ENV = "development";

    const req = {
      headers: {},
      text: jest.fn(async () => JSON.stringify({ ok: true })),
    } as unknown as MedusaRequest;
    const res = makeResponse();

    await POST(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "rejected",
        code: "SIGNATURE_MISSING",
        route: "mock_payment_webhook_local_inmemory",
      }),
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
    expect((req as unknown as { text: jest.Mock }).text).not.toHaveBeenCalled();
  });
});
