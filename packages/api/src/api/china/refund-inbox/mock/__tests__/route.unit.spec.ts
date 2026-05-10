import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

import { buildMockPaymentSignature } from "../../../../../modules/china-payment-notification";
import { GET, POST } from "../route";

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

const makeRequest = () =>
  ({
    text: jest.fn(async () => {
      throw new Error("refund inbox disabled route must not read body");
    }),
    body: {
      rawProviderPayload: "must-not-be-read",
      providerRefundRequest: "must-not-be-read",
      workflowCommand: "must-not-be-read",
    },
    headers: {
      "x-mock-refund-signature": "mock_signature_should_not_leak",
    },
  }) as unknown as MedusaRequest & { text: jest.Mock };

const makeBody = (eventId: string, amount = 128560) => ({
  event_id: eventId,
  event_type: "refund.succeeded",
  provider: "mock_china_pay",
  merchant_order_ref: "pay_mock_001",
  payment_session_id: "payses_001",
  provider_transaction_id: "mock_txn_001",
  provider_refund_id: "refund_fake_001",
  amount,
  currency: "CNY",
  occurred_at: "2026-05-10T12:30:00+08:00",
  refund_request_key:
    "refund_req:mock_china_pay:pay_mock_001:payses_001:128560:refund_cmd:mock_china_pay:order_001:pay_001:128560:admin:admin_001:customer_requested:2026-05-10",
});

const setLocalInMemoryEnv = (secret: string) => {
  process.env.NODE_ENV = "development";
  process.env.CHINA_REFUND_INBOX_ROUTE_ENABLED = "true";
  process.env.CHINA_REFUND_INBOX_ROUTE_MODE = "mock_local_inbox_only";
  process.env.CHINA_REFUND_INBOX_PROVIDER = "mock_china_pay";
  process.env.CHINA_REFUND_INBOX_LOCAL_INMEMORY = "true";
  process.env.CHINA_REFUND_INBOX_MOCK_SECRET = secret;
};

const makeSignedRequest = ({
  eventId,
  secret,
  body = makeBody(eventId),
  signature,
}: {
  eventId: string;
  secret: string;
  body?: Record<string, unknown>;
  signature?: string;
}) => {
  const rawBody = JSON.stringify(body);

  return {
    request: {
      text: jest.fn(async () => rawBody),
      headers: {
        "x-mock-refund-signature":
          signature ?? buildMockPaymentSignature(rawBody, secret),
        "x-mock-refund-event-id": eventId,
      },
    } as unknown as MedusaRequest & { text: jest.Mock },
    rawBody,
  };
};

const expectSafeDisabledResponse = (body: unknown) => {
  const serialized = JSON.stringify(body);

  expect(serialized).not.toContain("must-not-be-read");
  expect(serialized).not.toContain("mock_signature_should_not_leak");
  expect(serialized).not.toContain("rawProviderPayload");
  expect(serialized).not.toContain("providerRefundRequest");
  expect(serialized).not.toContain("workflowCommand");
  expect(serialized).not.toContain("refundStateMutation");
  expect(serialized).not.toContain("settlement_adjusted");
  expect(serialized).not.toContain("commission_adjusted");
  expect(serialized).not.toContain("payout_adjusted");
  expect(serialized).not.toContain("DATABASE_URL");
  expect(serialized).not.toContain("postgres://");
  expect(serialized).not.toContain("refund.succeeded");
  expect(serialized).not.toContain("accepted");
  expect(serialized).not.toContain("duplicate");
};

const expectSafeInboxResponse = ({
  body,
  rawBody,
  secret,
}: {
  body: unknown;
  rawBody: string;
  secret: string;
}) => {
  const serialized = JSON.stringify(body);

  expect(serialized).not.toContain(rawBody);
  expect(serialized).not.toContain(secret);
  expect(serialized).not.toContain(buildMockPaymentSignature(rawBody, secret));
  expect(serialized).not.toContain("x-mock-refund-signature");
  expect(serialized).not.toContain("rawProviderPayload");
  expect(serialized).not.toContain("providerRefundRequest");
  expect(serialized).not.toContain("workflowCommand");
  expect(serialized).not.toContain("refundStateMutation");
  expect(serialized).not.toContain("settlement_adjusted");
  expect(serialized).not.toContain("commission_adjusted");
  expect(serialized).not.toContain("payout_adjusted");
  expect(serialized).not.toContain("DATABASE_URL");
  expect(serialized).not.toContain("postgres://");
  expect(serialized).not.toContain("refund.succeeded");
};

describe("refund inbox mock disabled route", () => {
  beforeEach(() => {
    process.env = { ...oldEnv };
  });

  afterAll(() => {
    process.env = oldEnv;
  });

  it("returns disabled by default without reading request body", async () => {
    const req = makeRequest();
    const res = makeResponse();

    await POST(req, res);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith({
      status: "disabled",
      surface: "refund_inbox",
      provider: "mock_china_pay",
      runtime: "disabled",
      runtimeMutationBlocked: true,
      reason: "Refund inbox route is disabled.",
      runtimeRequested: false,
    });
    expect(req.text).not.toHaveBeenCalled();
    expectSafeDisabledResponse(res.json.mock.calls[0]?.[0]);
  });

  it("stays disabled when mock local inbox env is requested without local repository", async () => {
    process.env.CHINA_REFUND_INBOX_ROUTE_ENABLED = "true";
    process.env.CHINA_REFUND_INBOX_ROUTE_MODE = "mock_local_inbox_only";
    process.env.CHINA_REFUND_INBOX_PROVIDER = "mock_china_pay";
    process.env.CHINA_REFUND_INBOX_MOCK_SECRET = "refund_secret_should_not_leak";
    const req = makeRequest();
    const res = makeResponse();

    await POST(req, res);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith({
      status: "disabled",
      surface: "refund_inbox",
      provider: "mock_china_pay",
      runtime: "disabled",
      code: "LOCAL_INMEMORY_REPOSITORY_REQUIRED",
      runtimeMutationBlocked: true,
      reason:
        "Refund inbox route requires explicit local in-memory inbox mode.",
      runtimeRequested: true,
    });
    expect(req.text).not.toHaveBeenCalled();
    expect(JSON.stringify(res.json.mock.calls[0]?.[0])).not.toContain(
      "refund_secret_should_not_leak",
    );
    expectSafeDisabledResponse(res.json.mock.calls[0]?.[0]);
  });

  it("blocks production even when mock local inbox env is requested", async () => {
    process.env.NODE_ENV = "production";
    process.env.CHINA_REFUND_INBOX_ROUTE_ENABLED = "true";
    process.env.CHINA_REFUND_INBOX_ROUTE_MODE = "mock_local_inbox_only";
    process.env.CHINA_REFUND_INBOX_MOCK_SECRET = "refund_secret_should_not_leak";
    const req = makeRequest();
    const res = makeResponse();

    await POST(req, res);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith({
      status: "disabled",
      surface: "refund_inbox",
      provider: "mock_china_pay",
      runtime: "production_blocked",
      runtimeMutationBlocked: true,
      reason: "Refund inbox route is blocked in production.",
      runtimeRequested: true,
    });
    expect(req.text).not.toHaveBeenCalled();
    expect(JSON.stringify(res.json.mock.calls[0]?.[0])).not.toContain(
      "refund_secret_should_not_leak",
    );
    expectSafeDisabledResponse(res.json.mock.calls[0]?.[0]);
  });

  it("returns method not allowed for GET without reading request body", async () => {
    const req = makeRequest();
    const res = makeResponse();

    await GET(req, res);

    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith({
      status: "disabled",
      surface: "refund_inbox",
      runtime: "method_not_allowed",
      runtimeMutationBlocked: true,
      allowedMethods: ["POST"],
    });
    expect(req.text).not.toHaveBeenCalled();
    expectSafeDisabledResponse(res.json.mock.calls[0]?.[0]);
  });

  it("accepts fake local in-memory refund notifications without exposing raw data", async () => {
    const secret = "refund_local_inmemory_secret";
    const eventId = "evt_refund_local_inmemory_accepted_001";
    setLocalInMemoryEnv(secret);
    const { request, rawBody } = makeSignedRequest({ eventId, secret });
    const res = makeResponse();

    await POST(request, res);

    expect(res.status).toHaveBeenCalledWith(202);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "accepted",
        surface: "refund_inbox",
        provider: "mock_china_pay",
        mode: "mock_local_inbox_only",
        runtimeMutationBlocked: true,
        record: expect.objectContaining({
          eventId,
          idempotencyKey: `refund_notify:mock_china_pay:${eventId}`,
          providerRefundId: "refund_fake_001",
          processingStatus: "normalized",
        }),
      }),
    );
    expect(request.text).toHaveBeenCalledTimes(1);
    expectSafeInboxResponse({
      body: res.json.mock.calls[0]?.[0],
      rawBody,
      secret,
    });
  });

  it("returns duplicate for same digest local in-memory replays", async () => {
    const secret = "refund_local_inmemory_secret";
    const eventId = "evt_refund_local_inmemory_duplicate_001";
    setLocalInMemoryEnv(secret);
    const first = makeSignedRequest({ eventId, secret });
    const second = makeSignedRequest({ eventId, secret });
    const firstRes = makeResponse();
    const secondRes = makeResponse();

    await POST(first.request, firstRes);
    await POST(second.request, secondRes);

    expect(secondRes.status).toHaveBeenCalledWith(200);
    expect(secondRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "duplicate",
        mode: "mock_local_inbox_only",
        runtimeMutationBlocked: true,
        record: expect.objectContaining({
          idempotencyKey: `refund_notify:mock_china_pay:${eventId}`,
          processingStatus: "duplicate_seen",
        }),
      }),
    );
    expectSafeInboxResponse({
      body: secondRes.json.mock.calls[0]?.[0],
      rawBody: second.rawBody,
      secret,
    });
  });

  it("requires manual review for same idempotency key with a different digest", async () => {
    const secret = "refund_local_inmemory_secret";
    const eventId = "evt_refund_local_inmemory_digest_conflict_001";
    setLocalInMemoryEnv(secret);
    const first = makeSignedRequest({ eventId, secret });
    const changedBody = {
      ...makeBody(eventId),
      occurred_at: "2026-05-10T12:31:00+08:00",
    };
    const second = makeSignedRequest({
      eventId,
      secret,
      body: changedBody,
    });
    const firstRes = makeResponse();
    const secondRes = makeResponse();

    await POST(first.request, firstRes);
    await POST(second.request, secondRes);

    expect(secondRes.status).toHaveBeenCalledWith(409);
    expect(secondRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "manual_review_required",
        code: "DIGEST_CONFLICT",
        mode: "mock_local_inbox_only",
        runtimeMutationBlocked: true,
        record: expect.objectContaining({
          idempotencyKey: `refund_notify:mock_china_pay:${eventId}`,
          processingStatus: "digest_conflict_manual_review",
        }),
      }),
    );
    expectSafeInboxResponse({
      body: secondRes.json.mock.calls[0]?.[0],
      rawBody: second.rawBody,
      secret,
    });
  });

  it("rejects missing signatures without exposing raw data", async () => {
    const secret = "refund_local_inmemory_secret";
    const eventId = "evt_refund_local_inmemory_missing_signature_001";
    setLocalInMemoryEnv(secret);
    const { request, rawBody } = makeSignedRequest({
      eventId,
      secret,
      signature: "",
    });
    const res = makeResponse();

    await POST(request, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "rejected",
        code: "REFUND_NOTIFICATION_SIGNATURE_MISSING",
        runtimeMutationBlocked: true,
      }),
    );
    expectSafeInboxResponse({
      body: res.json.mock.calls[0]?.[0],
      rawBody,
      secret,
    });
  });

  it("rejects non-CNY fake notifications", async () => {
    const secret = "refund_local_inmemory_secret";
    const eventId = "evt_refund_local_inmemory_non_cny_001";
    setLocalInMemoryEnv(secret);
    const { request, rawBody } = makeSignedRequest({
      eventId,
      secret,
      body: {
        ...makeBody(eventId),
        currency: "USD",
      },
    });
    const res = makeResponse();

    await POST(request, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "rejected",
        code: "REFUND_NOTIFICATION_CURRENCY_UNSUPPORTED",
        runtimeMutationBlocked: true,
      }),
    );
    expectSafeInboxResponse({
      body: res.json.mock.calls[0]?.[0],
      rawBody,
      secret,
    });
  });
});
