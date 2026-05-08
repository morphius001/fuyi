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

const localDbName = "fuyi_payment_notification_route_dry_run_unit";
const localDbUrl = `postgres://codex@127.0.0.1:15432/${localDbName}`;

const makeLocalDbRequest = ({
  rawBody,
  headers = {},
  query,
}: {
  rawBody: string;
  headers?: Record<string, string>;
  query: jest.Mock;
}) =>
  ({
    headers,
    text: jest.fn(async () => rawBody),
    scope: {
      resolve: jest.fn(() => ({
        raw: jest.fn(async () => ({
          rows: [{ database_name: localDbName }],
        })),
        transaction: jest.fn(async () => ({
          raw: query,
          commit: jest.fn(async () => undefined),
          rollback: jest.fn(async () => undefined),
        })),
      })),
    },
  }) as unknown as MedusaRequest;

const localDbInboxRow = {
  id: "pinbox_mock_china_pay_key_001",
  provider: "mock_china_pay",
  event_id: "evt_local_db_001",
  event_type: "payment.succeeded",
  idempotency_key: "mock_china_pay:event:evt_local_db_001",
  merchant_order_ref: "pay_local_db_001",
  payment_session_id: "payses_local_db_001",
  provider_transaction_id: "mock_txn_local_db_001",
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
  process.env.CHINA_PAYMENT_NOTIFICATION_LOCAL_DB = "true";
  process.env.CHINA_PAYMENT_NOTIFICATION_LOCAL_DB_URL = localDbUrl;
  process.env.CHINA_PAYMENT_NOTIFICATION_LOCAL_DB_NAME = localDbName;
  process.env.CHINA_PAYMENT_NOTIFICATION_MOCK_SECRET = secret;
  process.env.NODE_ENV = "development";
};

describe("neutral china mock payment webhook disabled route", () => {
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
      route: "mock_payment_webhook_neutral_disabled_only",
      runtimeRequested: false,
    });
    expect((req as unknown as { text: jest.Mock }).text).not.toHaveBeenCalled();
  });

  it("stays disabled when mock runtime env is requested without local in-memory gate", async () => {
    process.env.CHINA_PAYMENT_NOTIFICATION_RUNTIME_ENABLED = "true";
    process.env.CHINA_PAYMENT_NOTIFICATION_WEBHOOK_MODE = "mock_inbox_only";
    process.env.CHINA_PAYMENT_NOTIFICATION_PROVIDER = "mock_china_pay";
    process.env.CHINA_PAYMENT_NOTIFICATION_MOCK_SECRET = "neutral_route_secret";
    process.env.NODE_ENV = "development";

    const req = {
      text: jest.fn(),
    } as unknown as MedusaRequest;
    const res = makeResponse();

    await POST(req, res);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith({
      status: "disabled",
      code: "RUNTIME_DISABLED",
      route: "mock_payment_webhook_neutral_disabled_only",
      runtimeRequested: true,
    });
    expect((req as unknown as { text: jest.Mock }).text).not.toHaveBeenCalled();
  });

  it("keeps local DB route skeleton disabled without repository injection", async () => {
    process.env.CHINA_PAYMENT_NOTIFICATION_RUNTIME_ENABLED = "true";
    process.env.CHINA_PAYMENT_NOTIFICATION_WEBHOOK_MODE = "mock_inbox_only";
    process.env.CHINA_PAYMENT_NOTIFICATION_PROVIDER = "mock_china_pay";
    process.env.CHINA_PAYMENT_NOTIFICATION_LOCAL_DB = "true";
    process.env.CHINA_PAYMENT_NOTIFICATION_MOCK_SECRET = "neutral_route_secret";
    process.env.NODE_ENV = "development";

    const req = {
      text: jest.fn(async () => {
        throw new Error("body should not be read before repository is available");
      }),
    } as unknown as MedusaRequest;
    const res = makeResponse();

    await POST(req, res);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith({
      status: "disabled",
      code: "RUNTIME_DISABLED",
      route: "mock_payment_webhook_neutral_disabled_only",
      runtimeRequested: true,
    });
    expect((req as unknown as { text: jest.Mock }).text).not.toHaveBeenCalled();
  });

  it("keeps local DB skeleton disabled even if local in-memory is also enabled", async () => {
    process.env.CHINA_PAYMENT_NOTIFICATION_RUNTIME_ENABLED = "true";
    process.env.CHINA_PAYMENT_NOTIFICATION_WEBHOOK_MODE = "mock_inbox_only";
    process.env.CHINA_PAYMENT_NOTIFICATION_PROVIDER = "mock_china_pay";
    process.env.CHINA_PAYMENT_NOTIFICATION_LOCAL_DB = "true";
    process.env.CHINA_PAYMENT_NOTIFICATION_LOCAL_INMEMORY = "true";
    process.env.CHINA_PAYMENT_NOTIFICATION_MOCK_SECRET = "neutral_route_secret";
    process.env.NODE_ENV = "development";

    const req = {
      text: jest.fn(async () => {
        throw new Error("local DB gate should run before in-memory smoke");
      }),
    } as unknown as MedusaRequest;
    const res = makeResponse();

    await POST(req, res);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith({
      status: "disabled",
      code: "RUNTIME_DISABLED",
      route: "mock_payment_webhook_neutral_disabled_only",
      runtimeRequested: true,
    });
    expect((req as unknown as { text: jest.Mock }).text).not.toHaveBeenCalled();
  });

  it("accepts local DB signed payloads when disposable DB gates pass", async () => {
    const secret = "neutral_local_db_secret";
    const rawBody = JSON.stringify({
      event_id: "evt_local_db_001",
      event_type: "payment.succeeded",
      merchant_order_ref: "pay_local_db_001",
      payment_session_id: "payses_local_db_001",
      provider_transaction_id: "mock_txn_local_db_001",
      amount: 128560,
      currency: "CNY",
    });
    setLocalDbEnv(secret);
    const query = jest.fn(async (sql: string) => {
      if (sql.includes("insert into payment_notification_inbox")) {
        return { rows: [{ id: "pinbox_mock_china_pay_key_001" }], rowCount: 1 };
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

    expect(res.status).toHaveBeenCalledWith(202);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "accepted",
        route: "mock_payment_webhook_neutral_local_db",
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
    expect(sqlCalls).not.toContain("begin");
    expect(sqlCalls).not.toContain("commit");

    const responseBody = JSON.stringify(res.json.mock.calls[0][0]);
    expect(responseBody).not.toContain(rawBody);
    expect(responseBody).not.toContain(secret);
    expect(responseBody).not.toContain(localDbUrl);
  });

  it("returns duplicate for local DB idempotency replays", async () => {
    const secret = "neutral_local_db_secret";
    const rawBody = JSON.stringify({
      event_id: "evt_local_db_001",
      event_type: "payment.succeeded",
      merchant_order_ref: "pay_local_db_001",
      payment_session_id: "payses_local_db_001",
      provider_transaction_id: "mock_txn_local_db_001",
      amount: 128560,
      currency: "CNY",
    });
    setLocalDbEnv(secret);
    const query = jest.fn(async (sql: string) => {
      if (sql.includes("insert into payment_notification_inbox")) {
        return { rows: [] };
      }

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
        route: "mock_payment_webhook_neutral_local_db",
      }),
    );
  });

  it("accepts local in-memory signed payloads when explicitly enabled", async () => {
    const secret = "neutral_local_inmemory_secret";
    const rawBody = JSON.stringify({
      event_id: "evt_neutral_inmemory_001",
      event_type: "payment.succeeded",
      merchant_order_ref: "pay_neutral_inmemory_001",
      payment_session_id: "payses_neutral_inmemory_001",
      provider_transaction_id: "mock_txn_neutral_inmemory_001",
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
        "x-mock-payment-event-id": "evt_neutral_inmemory_001",
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
        route: "mock_payment_webhook_neutral_local_inmemory",
        safeDebug: expect.objectContaining({
          hasRawBody: true,
          runtimeRequested: true,
        }),
      }),
    );

    const responseBody = JSON.stringify(res.json.mock.calls[0][0]);
    expect(responseBody).not.toContain(rawBody);
    expect(responseBody).not.toContain(secret);
    expect(responseBody).not.toContain(
      buildMockPaymentSignature(rawBody, secret),
    );
  });

  it("accepts local in-memory parsed JSON bodies when framework body parsing ran first", async () => {
    const secret = "neutral_local_inmemory_secret";
    const parsedBody = {
      event_id: "evt_neutral_inmemory_parsed_001",
      event_type: "payment.succeeded",
      merchant_order_ref: "pay_neutral_inmemory_parsed_001",
      payment_session_id: "payses_neutral_inmemory_parsed_001",
      provider_transaction_id: "mock_txn_neutral_inmemory_parsed_001",
      amount: 128560,
      currency: "CNY",
    };
    const rawBody = JSON.stringify(parsedBody);
    process.env.CHINA_PAYMENT_NOTIFICATION_RUNTIME_ENABLED = "true";
    process.env.CHINA_PAYMENT_NOTIFICATION_WEBHOOK_MODE = "mock_inbox_only";
    process.env.CHINA_PAYMENT_NOTIFICATION_PROVIDER = "mock_china_pay";
    process.env.CHINA_PAYMENT_NOTIFICATION_LOCAL_INMEMORY = "true";
    process.env.CHINA_PAYMENT_NOTIFICATION_MOCK_SECRET = secret;
    process.env.NODE_ENV = "development";

    const req = {
      body: parsedBody,
      headers: {
        "x-mock-payment-signature": buildMockPaymentSignature(rawBody, secret),
        "x-mock-payment-event-id": "evt_neutral_inmemory_parsed_001",
      },
    } as unknown as MedusaRequest;
    const res = makeResponse();

    await POST(req, res);

    expect(res.status).toHaveBeenCalledWith(202);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "accepted",
        mode: "mock_inbox_only",
        route: "mock_payment_webhook_neutral_local_inmemory",
      }),
    );
  });

  it("rejects local in-memory requests without signatures", async () => {
    process.env.CHINA_PAYMENT_NOTIFICATION_RUNTIME_ENABLED = "true";
    process.env.CHINA_PAYMENT_NOTIFICATION_WEBHOOK_MODE = "mock_inbox_only";
    process.env.CHINA_PAYMENT_NOTIFICATION_PROVIDER = "mock_china_pay";
    process.env.CHINA_PAYMENT_NOTIFICATION_LOCAL_INMEMORY = "true";
    process.env.CHINA_PAYMENT_NOTIFICATION_MOCK_SECRET = "neutral_secret";
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
        route: "mock_payment_webhook_neutral_local_inmemory",
      }),
    );

    const responseBody = JSON.stringify(res.json.mock.calls[0][0]);
    expect(responseBody).not.toContain("neutral_secret");
    expect(responseBody).not.toContain("{\"ok\":true}");
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
