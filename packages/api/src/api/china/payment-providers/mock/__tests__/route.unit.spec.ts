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

const localDbName = "fuyi_payment_notification_route_dry_run_provider_unit";
const localDbUrl = `postgres://codex@127.0.0.1:15432/${localDbName}`;

const makeLocalDbRequest = ({
  rawBody,
  headers = {},
  query,
  serverHost = "127.0.0.1",
  serverPort = 15432,
}: {
  rawBody: string;
  headers?: Record<string, string>;
  query: jest.Mock;
  serverHost?: string;
  serverPort?: number;
}) =>
  ({
    headers,
    text: jest.fn(async () => rawBody),
    scope: {
      resolve: jest.fn(() => ({
        raw: jest.fn(async (sql: string) => {
          if (sql.includes("current_database")) {
            return {
              rows: [{ database_name: localDbName }],
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
  }) as unknown as MedusaRequest;

const localDbInboxRow = {
  id: "pinbox_mock_china_pay_provider_key_001",
  provider: "mock_china_pay",
  event_id: "evt_provider_local_db_001",
  event_type: "payment.succeeded",
  idempotency_key: "mock_china_pay:event:evt_provider_local_db_001",
  merchant_order_ref: "pay_provider_local_db_001",
  payment_session_id: "payses_provider_local_db_001",
  provider_transaction_id: "mock_txn_provider_local_db_001",
  provider_refund_id: null,
  amount_value: 128560,
  currency: "CNY",
  signature_status: "verified",
  raw_payload_digest: "sha256:digest",
  processing_status: "verified",
  retry_count: 0,
  received_at: "2026-05-07T00:00:00.000Z",
  created_at: "2026-05-07T00:00:00.000Z",
  updated_at: "2026-05-07T00:00:00.000Z",
};

const setLocalDbEnv = (secret: string) => {
  process.env.CHINA_PAYMENT_NOTIFICATION_RUNTIME_ENABLED = "true";
  process.env.CHINA_PAYMENT_NOTIFICATION_WEBHOOK_MODE = "mock_inbox_only";
  process.env.CHINA_PAYMENT_NOTIFICATION_PROVIDER = "mock_china_pay";
  process.env.CHINA_PAYMENT_PROVIDER_REGISTRY_MODE = "mock_contract_only";
  process.env.CHINA_PAYMENT_NOTIFICATION_LOCAL_DB = "true";
  process.env.CHINA_PAYMENT_NOTIFICATION_LOCAL_DB_URL = localDbUrl;
  process.env.CHINA_PAYMENT_NOTIFICATION_LOCAL_DB_NAME = localDbName;
  process.env.CHINA_PAYMENT_NOTIFICATION_MOCK_SECRET = secret;
  process.env.NODE_ENV = "development";
};

const expectInboxOnlySafeResponse = ({
  body,
  rawBody,
  secret,
}: {
  body: unknown;
  rawBody?: string;
  secret?: string;
}) => {
  const responseBody = JSON.stringify(body);

  if (rawBody) {
    expect(responseBody).not.toContain(rawBody);
  }

  if (secret) {
    expect(responseBody).not.toContain(secret);
    expect(responseBody).not.toContain(
      buildMockPaymentSignature(rawBody ?? "", secret),
    );
  }

  expect(responseBody).not.toContain(localDbUrl);
  expect(responseBody).not.toContain("x-mock-payment-signature");
  expect(responseBody).not.toContain("execute_workflow");
  expect(responseBody).not.toContain("checkout");
  expect(responseBody).not.toContain("paymentStateCommand");
  expect(responseBody).not.toContain("orderStateCommand");
  expect(responseBody).not.toContain("payment.succeeded");
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
    process.env.CHINA_PAYMENT_NOTIFICATION_MOCK_SECRET =
      "mock_secret_should_not_leak";

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

  it("keeps local DB requested route disabled until registry mode is explicit", async () => {
    process.env.CHINA_PAYMENT_NOTIFICATION_RUNTIME_ENABLED = "true";
    process.env.CHINA_PAYMENT_NOTIFICATION_WEBHOOK_MODE = "mock_inbox_only";
    process.env.CHINA_PAYMENT_NOTIFICATION_PROVIDER = "mock_china_pay";
    process.env.CHINA_PAYMENT_NOTIFICATION_LOCAL_DB = "true";
    process.env.CHINA_PAYMENT_NOTIFICATION_MOCK_SECRET =
      "mock_secret_should_not_leak";
    process.env.NODE_ENV = "development";

    const req = {
      text: jest.fn(async () => {
        throw new Error("body should not be read before registry gate");
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

  it("keeps local DB route disabled when the actual DB connection is remote", async () => {
    const rawBody = JSON.stringify({
      event_id: "evt_provider_remote_scope_001",
      event_type: "payment.succeeded",
      merchant_order_ref: "pay_provider_remote_scope_001",
      amount: 128560,
      currency: "CNY",
    });
    setLocalDbEnv("mock_secret_should_not_leak");
    const req = makeLocalDbRequest({
      rawBody,
      query: jest.fn(),
      serverHost: "10.0.0.12",
      serverPort: 15432,
    }) as unknown as MedusaRequest & { text: jest.Mock };
    req.text = jest.fn(async () => {
      throw new Error("body should not be read before actual local DB check");
    });
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
    expect(req.text).not.toHaveBeenCalled();
    expect(JSON.stringify(res.json.mock.calls[0]?.[0])).not.toContain(
      "mock_secret_should_not_leak",
    );
  });

  it("keeps local DB route disabled when the actual DB port does not match the local URL", async () => {
    const rawBody = JSON.stringify({
      event_id: "evt_provider_port_mismatch_001",
      event_type: "payment.succeeded",
      merchant_order_ref: "pay_provider_port_mismatch_001",
      amount: 128560,
      currency: "CNY",
    });
    setLocalDbEnv("mock_secret_should_not_leak");
    const req = makeLocalDbRequest({
      rawBody,
      query: jest.fn(),
      serverHost: "127.0.0.1",
      serverPort: 15433,
    }) as unknown as MedusaRequest & { text: jest.Mock };
    req.text = jest.fn(async () => {
      throw new Error("body should not be read before actual local DB check");
    });
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
    expect(req.text).not.toHaveBeenCalled();
    expect(JSON.stringify(res.json.mock.calls[0]?.[0])).not.toContain(
      "mock_secret_should_not_leak",
    );
  });

  it("keeps local DB route disabled without Medusa DB scope injection", async () => {
    setLocalDbEnv("mock_secret_should_not_leak");

    const req = {
      text: jest.fn(async () => {
        throw new Error("body should not be read before DB scope is available");
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

  it("accepts local DB signed payloads when all local inbox gates pass", async () => {
    const secret = "provider_local_db_secret";
    const rawBody = JSON.stringify({
      event_id: "evt_provider_local_db_001",
      event_type: "payment.succeeded",
      merchant_order_ref: "pay_provider_local_db_001",
      payment_session_id: "payses_provider_local_db_001",
      provider_transaction_id: "mock_txn_provider_local_db_001",
      amount: 128560,
      currency: "CNY",
    });
    setLocalDbEnv(secret);
    const query = jest.fn(async (sql: string) => {
      if (sql.includes("insert into payment_notification_inbox")) {
        return {
          rows: [{ id: "pinbox_mock_china_pay_provider_key_001" }],
          rowCount: 1,
        };
      }

      if (sql.includes("insert into payment_notification_event_log")) {
        return { rows: [] };
      }

      return { rows: [] };
    });
    const req = makeLocalDbRequest({
      rawBody,
      headers: {
        "x-mock-payment-signature": buildMockPaymentSignature(rawBody, secret),
      },
      query,
      serverHost: "127.0.0.1/32",
    });
    const res = makeResponse();

    await POST(req, res);

    expect(res.status).toHaveBeenCalledWith(202);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "accepted",
        mode: "mock_inbox_only",
        route: "mock_payment_provider_runtime_local_inbox_only",
        safeDebug: expect.objectContaining({
          hasRawBody: true,
          runtimeRequested: true,
        }),
      }),
    );
    const sqlCalls = query.mock.calls.map(([sql]) => String(sql).trim());
    expect(sqlCalls).toEqual(
      expect.arrayContaining([
        expect.stringContaining("from payment_notification_inbox"),
        expect.stringContaining("insert into payment_notification_inbox"),
        expect.stringContaining("insert into payment_notification_event_log"),
      ]),
    );

    expectInboxOnlySafeResponse({
      body: res.json.mock.calls[0][0],
      rawBody,
      secret,
    });
  });

  it("returns duplicate for local DB idempotency replays", async () => {
    const secret = "provider_local_db_secret";
    const rawBody = JSON.stringify({
      event_id: "evt_provider_local_db_001",
      event_type: "payment.succeeded",
      merchant_order_ref: "pay_provider_local_db_001",
      payment_session_id: "payses_provider_local_db_001",
      provider_transaction_id: "mock_txn_provider_local_db_001",
      amount: 128560,
      currency: "CNY",
    });
    setLocalDbEnv(secret);
    const query = jest.fn(async (sql: string) => {
      if (sql.includes("from payment_notification_inbox")) {
        return { rows: [localDbInboxRow] };
      }

      if (sql.includes("insert into payment_notification_event_log")) {
        return { rows: [] };
      }

      return { rows: [] };
    });
    const req = makeLocalDbRequest({
      rawBody,
      headers: {
        "x-mock-payment-signature": buildMockPaymentSignature(rawBody, secret),
      },
      query,
    });
    const res = makeResponse();

    await POST(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "duplicate",
        mode: "mock_inbox_only",
        route: "mock_payment_provider_runtime_local_inbox_only",
      }),
    );
    expectInboxOnlySafeResponse({
      body: res.json.mock.calls[0][0],
      rawBody,
      secret,
    });
  });

  it("rejects local DB payloads without signatures", async () => {
    const secret = "provider_local_db_secret";
    const rawBody = JSON.stringify({
      event_id: "evt_provider_unsigned_001",
      event_type: "payment.succeeded",
      merchant_order_ref: "pay_provider_unsigned_001",
      amount: 128560,
      currency: "CNY",
    });
    setLocalDbEnv(secret);
    const query = jest.fn(async (sql: string) => {
      if (sql.includes("insert into payment_notification_inbox")) {
        return {
          rows: [{ id: "pinbox_mock_china_pay_provider_unsigned_001" }],
          rowCount: 1,
        };
      }

      if (sql.includes("insert into payment_notification_event_log")) {
        return { rows: [] };
      }

      return { rows: [] };
    });
    const req = makeLocalDbRequest({
      rawBody,
      headers: {},
      query,
    });
    const res = makeResponse();

    await POST(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "rejected",
        code: "SIGNATURE_MISSING",
        route: "mock_payment_provider_runtime_local_inbox_only",
      }),
    );

    expectInboxOnlySafeResponse({
      body: res.json.mock.calls[0][0],
      rawBody,
      secret,
    });
  });

  it("rejects local DB payloads with invalid signatures without leaking runtime material", async () => {
    const secret = "provider_local_db_secret";
    const rawBody = JSON.stringify({
      event_id: "evt_provider_invalid_signature_001",
      event_type: "payment.succeeded",
      merchant_order_ref: "pay_provider_invalid_signature_001",
      amount: 128560,
      currency: "CNY",
    });
    setLocalDbEnv(secret);
    const req = makeLocalDbRequest({
      rawBody,
      headers: {
        "x-mock-payment-signature": "bad_signature",
      },
      query: jest.fn(),
    });
    const res = makeResponse();

    await POST(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "rejected",
        code: "SIGNATURE_INVALID",
        route: "mock_payment_provider_runtime_local_inbox_only",
      }),
    );
    expectInboxOnlySafeResponse({
      body: res.json.mock.calls[0][0],
      rawBody,
      secret,
    });
    expect(JSON.stringify(res.json.mock.calls[0][0])).not.toContain(
      "bad_signature",
    );
  });
});
