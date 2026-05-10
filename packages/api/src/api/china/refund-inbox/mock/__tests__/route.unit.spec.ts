import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

import {
  buildMockPaymentSignature,
  digestRawPayload,
} from "../../../../../modules/china-payment-notification";
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

const localDbName = "fuyi_refund_inbox_route_dry_run_unit";
const localDbUrl = `postgres://codex@127.0.0.1:15432/${localDbName}`;

const setLocalDbEnv = (secret: string) => {
  process.env.NODE_ENV = "development";
  process.env.CHINA_REFUND_INBOX_ROUTE_ENABLED = "true";
  process.env.CHINA_REFUND_INBOX_ROUTE_MODE = "mock_local_db_inbox_only";
  process.env.CHINA_REFUND_INBOX_PROVIDER = "mock_china_pay";
  process.env.CHINA_REFUND_INBOX_LOCAL_DB = "true";
  process.env.CHINA_REFUND_INBOX_LOCAL_DB_URL = localDbUrl;
  process.env.CHINA_REFUND_INBOX_LOCAL_DB_NAME = localDbName;
  process.env.CHINA_REFUND_INBOX_MOCK_SECRET = secret;
};

const makeLocalDbRequest = ({
  rawBody,
  headers,
  query,
  databaseName = localDbName,
  serverHost = "127.0.0.1",
  serverPort = 15432,
}: {
  rawBody: string;
  headers: Record<string, string>;
  query: jest.Mock;
  databaseName?: string;
  serverHost?: string;
  serverPort?: number;
}) =>
  ({
    text: jest.fn(async () => rawBody),
    headers,
    scope: {
      resolve: jest.fn(() => ({
        raw: jest.fn(async (sql: string) => {
          if (sql.includes("current_database")) {
            return {
              rows: [{ database_name: databaseName }],
            };
          }

          if (sql.includes("inet_server_addr")) {
            return {
              rows: [{ server_host: serverHost, server_port: serverPort }],
            };
          }

          return { rows: [] };
        }),
        transaction: jest.fn(async () => ({
          raw: query,
          commit: jest.fn(async () => undefined),
          rollback: jest.fn(async () => undefined),
        })),
      })),
    },
  }) as unknown as MedusaRequest & { text: jest.Mock };

const makeLocalDbRow = ({
  eventId,
  rawBody,
  processingStatus = "verified",
}: {
  eventId: string;
  rawBody: string;
  processingStatus?: string;
}) => ({
  id: `rinbox_mock_china_pay_${eventId}`,
  provider: "mock_china_pay",
  event_id: eventId,
  event_type: "refund.succeeded",
  idempotency_key: `refund_notify:mock_china_pay:${eventId}`,
  merchant_order_ref: "pay_mock_001",
  payment_session_id: "payses_001",
  provider_transaction_id: "mock_txn_001",
  provider_refund_id: "refund_fake_001",
  amount_value: 128560,
  currency: "CNY",
  signature_status: "verified",
  raw_payload_digest: digestRawPayload(rawBody),
  processing_status: processingStatus,
  retry_count: 0,
  received_at: "2026-05-10T00:00:00.000Z",
  created_at: "2026-05-10T00:00:00.000Z",
  updated_at: "2026-05-10T00:00:00.000Z",
});

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

  it("keeps local DB route disabled when DB env is incomplete without reading body", async () => {
    const secret = "refund_local_db_secret";
    process.env.NODE_ENV = "development";
    process.env.CHINA_REFUND_INBOX_ROUTE_ENABLED = "true";
    process.env.CHINA_REFUND_INBOX_ROUTE_MODE = "mock_local_db_inbox_only";
    process.env.CHINA_REFUND_INBOX_PROVIDER = "mock_china_pay";
    process.env.CHINA_REFUND_INBOX_LOCAL_DB = "true";
    process.env.CHINA_REFUND_INBOX_MOCK_SECRET = secret;
    const req = makeRequest();
    const res = makeResponse();

    await POST(req, res);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith({
      status: "disabled",
      surface: "refund_inbox",
      provider: "mock_china_pay",
      runtime: "disabled",
      code: "LOCAL_DB_REQUIRED",
      runtimeMutationBlocked: true,
      reason:
        "Refund inbox route requires explicit local disposable DB inbox mode.",
      runtimeRequested: true,
    });
    expect(req.text).not.toHaveBeenCalled();
    expect(JSON.stringify(res.json.mock.calls[0]?.[0])).not.toContain(secret);
  });

  it("keeps local DB route disabled when actual DB host is remote without reading body", async () => {
    const secret = "refund_local_db_secret";
    const eventId = "evt_refund_local_db_remote_host_001";
    const rawBody = JSON.stringify(makeBody(eventId));
    setLocalDbEnv(secret);
    const req = makeLocalDbRequest({
      rawBody,
      headers: {
        "x-mock-refund-signature": buildMockPaymentSignature(rawBody, secret),
      },
      query: jest.fn(),
      serverHost: "10.0.0.5",
    });
    const res = makeResponse();

    await POST(req, res);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(req.text).not.toHaveBeenCalled();
    expect(JSON.stringify(res.json.mock.calls[0]?.[0])).not.toContain(
      localDbUrl,
    );
    expect(JSON.stringify(res.json.mock.calls[0]?.[0])).not.toContain(secret);
  });

  it("keeps local DB route disabled when actual DB name mismatches without reading body", async () => {
    const secret = "refund_local_db_secret";
    const eventId = "evt_refund_local_db_name_mismatch_001";
    const rawBody = JSON.stringify(makeBody(eventId));
    setLocalDbEnv(secret);
    const req = makeLocalDbRequest({
      rawBody,
      headers: {
        "x-mock-refund-signature": buildMockPaymentSignature(rawBody, secret),
      },
      query: jest.fn(),
      databaseName: "fuyi_refund_inbox_route_dry_run_other",
    });
    const res = makeResponse();

    await POST(req, res);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(req.text).not.toHaveBeenCalled();
  });

  it("keeps local DB route disabled when actual DB port mismatches without reading body", async () => {
    const secret = "refund_local_db_secret";
    const eventId = "evt_refund_local_db_port_mismatch_001";
    const rawBody = JSON.stringify(makeBody(eventId));
    setLocalDbEnv(secret);
    const req = makeLocalDbRequest({
      rawBody,
      headers: {
        "x-mock-refund-signature": buildMockPaymentSignature(rawBody, secret),
      },
      query: jest.fn(),
      serverPort: 15433,
    });
    const res = makeResponse();

    await POST(req, res);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(req.text).not.toHaveBeenCalled();
  });

  it("accepts fake local DB refund notifications without exposing raw data", async () => {
    const secret = "refund_local_db_secret";
    const eventId = "evt_refund_local_db_accepted_001";
    const rawBody = JSON.stringify(makeBody(eventId));
    const row = makeLocalDbRow({ eventId, rawBody });
    setLocalDbEnv(secret);
    const query = jest.fn(async (sql: string) => {
      if (sql.includes("select id") && sql.includes("provider = ?")) {
        return { rows: [] };
      }

      if (sql.includes("insert into payment_notification_inbox")) {
        return { rows: [{ id: row.id }], rowCount: 1 };
      }

      if (sql.includes("update payment_notification_inbox")) {
        return { rows: [row] };
      }

      if (sql.includes("insert into payment_notification_event_log")) {
        return { rows: [] };
      }

      return { rows: [] };
    });
    const req = makeLocalDbRequest({
      rawBody,
      headers: {
        "x-mock-refund-signature": buildMockPaymentSignature(rawBody, secret),
        "x-mock-refund-event-id": eventId,
      },
      query,
    });
    const res = makeResponse();

    await POST(req, res);

    expect(res.status).toHaveBeenCalledWith(202);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "accepted",
        mode: "mock_local_db_inbox_only",
        storage: "local_disposable_db",
        runtimeMutationBlocked: true,
        record: expect.objectContaining({
          eventId,
          idempotencyKey: `refund_notify:mock_china_pay:${eventId}`,
          providerRefundId: "refund_fake_001",
          processingStatus: "normalized",
        }),
      }),
    );
    expect(req.text).toHaveBeenCalledTimes(1);
    const sqlCalls = query.mock.calls.map(([sql]) => String(sql));

    expect(sqlCalls).toEqual(
      expect.arrayContaining([
        expect.stringContaining("insert into payment_notification_inbox"),
        expect.stringContaining("update payment_notification_inbox"),
        expect.stringContaining("insert into payment_notification_event_log"),
      ]),
    );
    expect(sqlCalls.join("\n")).not.toContain("providerRefundRequest");
    expectSafeInboxResponse({
      body: res.json.mock.calls[0]?.[0],
      rawBody,
      secret,
    });
    expect(JSON.stringify(res.json.mock.calls[0]?.[0])).not.toContain(
      localDbUrl,
    );
  });

  it("returns duplicate for same digest local DB replays", async () => {
    const secret = "refund_local_db_secret";
    const eventId = "evt_refund_local_db_duplicate_001";
    const rawBody = JSON.stringify(makeBody(eventId));
    const row = makeLocalDbRow({ eventId, rawBody });
    setLocalDbEnv(secret);
    const query = jest.fn(async (sql: string) => {
      if (sql.includes("select id") && sql.includes("provider = ?")) {
        return { rows: [{ id: row.id }] };
      }

      if (sql.includes("select *") && sql.includes("idempotency_key = ?")) {
        return { rows: [row] };
      }

      if (sql.includes("insert into payment_notification_event_log")) {
        return { rows: [] };
      }

      return { rows: [] };
    });
    const req = makeLocalDbRequest({
      rawBody,
      headers: {
        "x-mock-refund-signature": buildMockPaymentSignature(rawBody, secret),
        "x-mock-refund-event-id": eventId,
      },
      query,
    });
    const res = makeResponse();

    await POST(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "duplicate",
        mode: "mock_local_db_inbox_only",
        storage: "local_disposable_db",
        runtimeMutationBlocked: true,
        record: expect.objectContaining({
          idempotencyKey: `refund_notify:mock_china_pay:${eventId}`,
          processingStatus: "duplicate_seen",
        }),
      }),
    );
    expectSafeInboxResponse({
      body: res.json.mock.calls[0]?.[0],
      rawBody,
      secret,
    });
  });

  it("requires manual review for local DB digest conflicts", async () => {
    const secret = "refund_local_db_secret";
    const eventId = "evt_refund_local_db_digest_conflict_001";
    const rawBody = JSON.stringify(makeBody(eventId));
    const row = {
      ...makeLocalDbRow({ eventId, rawBody }),
      raw_payload_digest: "sha256:existing_different_digest",
    };
    setLocalDbEnv(secret);
    const query = jest.fn(async (sql: string) => {
      if (sql.includes("select id") && sql.includes("provider = ?")) {
        return { rows: [{ id: row.id }] };
      }

      if (sql.includes("select *") && sql.includes("idempotency_key = ?")) {
        return { rows: [row] };
      }

      if (sql.includes("update payment_notification_inbox")) {
        return { rows: [row] };
      }

      if (sql.includes("insert into payment_notification_event_log")) {
        return { rows: [] };
      }

      return { rows: [] };
    });
    const req = makeLocalDbRequest({
      rawBody,
      headers: {
        "x-mock-refund-signature": buildMockPaymentSignature(rawBody, secret),
        "x-mock-refund-event-id": eventId,
      },
      query,
    });
    const res = makeResponse();

    await POST(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "manual_review_required",
        code: "DIGEST_CONFLICT",
        mode: "mock_local_db_inbox_only",
        storage: "local_disposable_db",
        runtimeMutationBlocked: true,
        record: expect.objectContaining({
          idempotencyKey: `refund_notify:mock_china_pay:${eventId}`,
          processingStatus: "digest_conflict_manual_review",
        }),
      }),
    );
    expectSafeInboxResponse({
      body: res.json.mock.calls[0]?.[0],
      rawBody,
      secret,
    });
  });
});
