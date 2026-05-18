import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

import {
  alipayRefundQueryRequiredNotifyVector,
  alipayRefundSuccessNotifyVector,
  alipayRefundTradeOnlyNotifyVector,
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
      throw new Error("provider refund route disabled skeleton must not read body");
    }),
    body: {
      rawProviderPayload: "must-not-be-read",
      providerRefundQuery: "must-not-be-read",
    },
    headers: {
      sign: "sign_should_not_leak",
    },
  }) as unknown as MedusaRequest & { text: jest.Mock };

const enableLocalAlipay = () => {
  process.env.NODE_ENV = "development";
  process.env.CHINA_REFUND_RUNTIME_ENABLED = "true";
  process.env.CHINA_REFUND_NOTIFY_ROUTE_ENABLED = "true";
  process.env.CHINA_REFUND_STATE_MUTATION_ENABLED = "false";
  process.env.CHINA_REFUND_PROVIDER = "alipay";
  process.env.CHINA_REFUND_ROUTE_MODE = "provider_inbox_only";
  process.env.CHINA_REFUND_TARGET_ENV = "local";
  process.env.CHINA_REFUND_INBOX_LOCAL_INMEMORY = "true";
  process.env.CHINA_REFUND_ALIPAY_FIXTURE_EXPECTED_SIGNATURE =
    alipayRefundSuccessNotifyVector.expectedFakeSignature;
  process.env.CHINA_REFUND_ALIPAY_EXPECTED_APP_ID = "app_fake_refund_001";
  process.env.CHINA_REFUND_ALIPAY_EXPECTED_SELLER_ID =
    "merchant_fake_refund_001";
  process.env.CHINA_REFUND_ALIPAY_EXPECTED_OUT_TRADE_NO =
    "pay_alipay_refund_order_001";
  process.env.CHINA_REFUND_ALIPAY_EXPECTED_TRADE_NO =
    "trade_alipay_refund_001";
  process.env.CHINA_REFUND_ALIPAY_EXPECTED_OUT_REQUEST_NO =
    "refund_req_alipay_001";
  process.env.CHINA_REFUND_ALIPAY_EXPECTED_AMOUNT_VALUE = "128560";
  process.env.CHINA_REFUND_ALIPAY_REFUND_NOTIFY_MODE =
    "product_specific_refund_notify";
};

const localDbName = "fuyi_refund_provider_inbox_route_dry_run_unit";
const localDbUrl = `postgres://codex@127.0.0.1:15432/${localDbName}`;

const enableLocalAlipayDb = () => {
  enableLocalAlipay();
  process.env.CHINA_REFUND_INBOX_LOCAL_INMEMORY = "false";
  process.env.CHINA_REFUND_INBOX_LOCAL_DB = "true";
  process.env.CHINA_REFUND_INBOX_DATABASE_URL = localDbUrl;
  process.env.CHINA_REFUND_INBOX_DATABASE_NAME = localDbName;
};

const makeAlipayRequest = (form = alipayRefundSuccessNotifyVector.rawNotification.form) =>
  ({
    body: form,
    headers: {},
  }) as unknown as MedusaRequest & { text?: jest.Mock };

const makeAlipayLocalDbRequest = ({
  query,
  databaseName = localDbName,
  serverHost = "127.0.0.1",
  serverPort = 15432,
}: {
  query: jest.Mock;
  databaseName?: string;
  serverHost?: string;
  serverPort?: number;
}) =>
  ({
    body: alipayRefundSuccessNotifyVector.rawNotification.form,
    headers: {},
    scope: {
      resolve: jest.fn(() => ({
        raw: jest.fn(async (sql: string) => {
          if (sql.includes("current_database")) {
            return { rows: [{ database_name: databaseName }] };
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
  }) as unknown as MedusaRequest & { text?: jest.Mock };

const makeLocalDbRow = (processingStatus = "normalized") => ({
  id: "rinbox_alipay_provider_route_001",
  provider: "alipay",
  event_id: alipayRefundSuccessNotifyVector.notifyId,
  event_type: "refund.succeeded",
  idempotency_key: `refund_notify:alipay:${alipayRefundSuccessNotifyVector.notifyId}`,
  merchant_order_ref: "pay_alipay_refund_order_001",
  payment_session_id: null,
  provider_refund_id: "refund_req_alipay_001",
  amount_value: 128560,
  currency: "CNY",
  signature_status: "verified",
  raw_payload_digest: "sha256:alipay_provider_route_digest",
  processing_status: processingStatus,
  retry_count: 0,
  received_at: "2026-05-12T00:00:00.000Z",
  created_at: "2026-05-12T00:00:00.000Z",
  updated_at: "2026-05-12T00:00:00.000Z",
});

const expectSafeBody = (body: unknown) => {
  const serialized = JSON.stringify(body);

  expect(serialized).not.toContain("must-not-be-read");
  expect(serialized).not.toContain("sign_should_not_leak");
  expect(serialized).not.toContain("rawProviderPayload");
  expect(serialized).not.toContain("providerRefundQuery");
  expect(serialized).not.toContain("workflowCommand");
  expect(serialized).not.toContain("refundStateMutation");
  expect(serialized).not.toContain("providerRefundRequest");
  expect(serialized).not.toContain("settlement");
  expect(serialized).not.toContain("commission");
  expect(serialized).not.toContain("payout");
  expect(serialized).not.toContain("fulfillment");
  expect(serialized).not.toContain("logistics");
  expect(serialized).not.toContain("refundSuccessState\":true");
};

describe("Alipay refund provider inbox route disabled skeleton", () => {
  beforeEach(() => {
    process.env = { ...oldEnv };
  });

  afterAll(() => {
    process.env = oldEnv;
  });

  it("returns disabled by default without reading body", async () => {
    const req = makeRequest();
    const res = makeResponse();

    await POST(req, res);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(req.text).not.toHaveBeenCalled();
    expect(res.json.mock.calls[0]?.[0]).toMatchObject({
      status: "disabled",
      provider: "alipay",
      runtimeMutationBlocked: true,
      stateMutationBlocked: true,
      refundSuccessState: false,
    });
    expectSafeBody(res.json.mock.calls[0]?.[0]);
  });

  it("blocks production-like route config before reading body or resolving local DB", async () => {
    enableLocalAlipayDb();
    process.env.APP_ENV = "preprod";
    process.env.CHINA_REFUND_STATE_MUTATION_ENABLED = "true";
    const query = jest.fn();
    const req = {
      ...makeRequest(),
      scope: makeAlipayLocalDbRequest({ query }).scope,
    } as unknown as MedusaRequest & { text: jest.Mock; scope: { resolve: jest.Mock } };
    const res = makeResponse();

    await POST(req, res);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(req.text).not.toHaveBeenCalled();
    expect(req.scope.resolve).not.toHaveBeenCalled();
    expect(query).not.toHaveBeenCalled();
    expect(res.json.mock.calls[0]?.[0]).toMatchObject({
      status: "disabled",
      provider: "alipay",
      code: "REFUND_PROVIDER_ROUTE_PRODUCTION_BLOCKED",
      runtimeMutationBlocked: true,
      stateMutationBlocked: true,
      refundSuccessState: false,
    });
    expectSafeBody(res.json.mock.calls[0]?.[0]);
  });

  it("accepts verified local fixture into inbox-only response", async () => {
    enableLocalAlipay();
    const req = makeAlipayRequest();
    const res = makeResponse();

    await POST(req, res);

    expect(res.status).toHaveBeenCalledWith(202);
    expect(res.json.mock.calls[0]?.[0]).toMatchObject({
      status: "accepted",
      provider: "alipay",
      mode: "provider_inbox_only",
      refundSuccessState: false,
      record: {
        provider: "alipay",
        eventId: alipayRefundSuccessNotifyVector.notifyId,
        processingStatus: "runtime_mutation_blocked",
      },
    });
    expectSafeBody(res.json.mock.calls[0]?.[0]);
  });

  it("does not read body when local gate is enabled but fixture config is missing", async () => {
    enableLocalAlipay();
    delete process.env.CHINA_REFUND_ALIPAY_FIXTURE_EXPECTED_SIGNATURE;
    const req = makeRequest();
    const res = makeResponse();

    await POST(req, res);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(req.text).not.toHaveBeenCalled();
    expect(res.json.mock.calls[0]?.[0]).toMatchObject({
      status: "disabled",
      provider: "alipay",
      code: "ALIPAY_REFUND_FIXTURE_CONFIG_MISSING",
      refundSuccessState: false,
    });
    expectSafeBody(res.json.mock.calls[0]?.[0]);
  });

  it("does not read body when local DB gate lacks Medusa DB scope", async () => {
    enableLocalAlipayDb();
    const req = makeRequest();
    const res = makeResponse();

    await POST(req, res);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(req.text).not.toHaveBeenCalled();
    expect(res.json.mock.calls[0]?.[0]).toMatchObject({
      status: "disabled",
      provider: "alipay",
      code: "REFUND_PROVIDER_ROUTE_LOCAL_DB_UNAVAILABLE",
      refundSuccessState: false,
    });
    expectSafeBody(res.json.mock.calls[0]?.[0]);
  });

  it("does not read body or open a transaction when local DB name mismatches", async () => {
    enableLocalAlipayDb();
    const bodyRead = jest.fn(() => {
      throw new Error("local DB mismatch must not read body");
    });
    const query = jest.fn();
    const transaction = jest.fn(async () => ({
      raw: query,
      commit: jest.fn(async () => undefined),
      rollback: jest.fn(async () => undefined),
    }));
    const raw = jest.fn(async (sql: string) => {
      if (sql.includes("current_database")) {
        return { rows: [{ database_name: "unexpected_refund_inbox_db" }] };
      }

      if (sql.includes("inet_server_addr")) {
        return {
          rows: [{ server_host: "127.0.0.1", server_port: 15432 }],
        };
      }

      return { rows: [] };
    });
    const req = {
      text: jest.fn(async () => {
        throw new Error("local DB mismatch must not read raw body");
      }),
      headers: {
        sign: "sign_should_not_leak",
      },
      scope: {
        resolve: jest.fn(() => ({
          raw,
          transaction,
        })),
      },
    } as unknown as MedusaRequest & {
      text: jest.Mock;
      scope: { resolve: jest.Mock };
    };
    Object.defineProperty(req, "body", {
      get: bodyRead,
    });
    const res = makeResponse();

    await POST(req, res);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(bodyRead).not.toHaveBeenCalled();
    expect(req.text).not.toHaveBeenCalled();
    expect(req.scope.resolve).toHaveBeenCalledTimes(1);
    expect(raw).toHaveBeenCalledWith("select current_database() as database_name");
    expect(JSON.stringify(raw.mock.calls)).toContain("inet_server_addr");
    expect(transaction).not.toHaveBeenCalled();
    expect(query).not.toHaveBeenCalled();
    expect(JSON.stringify(raw.mock.calls)).not.toContain(
      "insert into payment_notification_inbox",
    );
    expect(JSON.stringify(raw.mock.calls)).not.toContain(
      "update payment_notification_inbox",
    );
    expect(res.json.mock.calls[0]?.[0]).toMatchObject({
      status: "disabled",
      provider: "alipay",
      code: "REFUND_PROVIDER_ROUTE_LOCAL_DB_UNAVAILABLE",
      refundSuccessState: false,
    });
    expectSafeBody(res.json.mock.calls[0]?.[0]);
  });

  it("accepts verified local fixture into disposable DB inbox-only response", async () => {
    enableLocalAlipayDb();
    const query = jest.fn(async (sql: string, params?: unknown[]) => {
      if (sql.includes("select id") && sql.includes("provider = ?")) {
        return { rows: [] };
      }

      if (sql.includes("insert into payment_notification_inbox")) {
        return { rows: [{ id: "rinbox_alipay_provider_route_001" }], rowCount: 1 };
      }

      if (sql.includes("update payment_notification_inbox")) {
        return { rows: [makeLocalDbRow(String(params?.[1]))] };
      }

      return { rows: [] };
    });
    const req = makeAlipayLocalDbRequest({ query });
    const res = makeResponse();

    await POST(req, res);

    expect(res.status).toHaveBeenCalledWith(202);
    expect(res.json.mock.calls[0]?.[0]).toMatchObject({
      status: "accepted",
      provider: "alipay",
      mode: "provider_inbox_only",
      refundSuccessState: false,
      record: {
        provider: "alipay",
        eventId: alipayRefundSuccessNotifyVector.notifyId,
        processingStatus: "runtime_mutation_blocked",
      },
    });
    expect(JSON.stringify(query.mock.calls)).toContain(
      "insert into payment_notification_inbox",
    );
    expectSafeBody(res.json.mock.calls[0]?.[0]);
  });

  it("returns duplicate for same verified local fixture digest", async () => {
    enableLocalAlipay();
    const firstRes = makeResponse();
    const secondRes = makeResponse();

    await POST(makeAlipayRequest(), firstRes);
    await POST(makeAlipayRequest(), secondRes);

    expect(secondRes.status).toHaveBeenCalledWith(200);
    expect(secondRes.json.mock.calls[0]?.[0]).toMatchObject({
      status: "duplicate",
      provider: "alipay",
      refundSuccessState: false,
    });
    expectSafeBody(secondRes.json.mock.calls[0]?.[0]);
  });

  it("processes Alipay trade-only notification for audit only", async () => {
    enableLocalAlipay();
    process.env.CHINA_REFUND_ALIPAY_REFUND_NOTIFY_MODE = "trade_async_notify";
    process.env.CHINA_REFUND_ALIPAY_EXPECTED_OUT_REQUEST_NO = "";
    process.env.CHINA_REFUND_ALIPAY_EXPECTED_AMOUNT_VALUE = "";
    const res = makeResponse();

    await POST(makeAlipayRequest(alipayRefundTradeOnlyNotifyVector.rawNotification.form), res);

    expect(res.status).toHaveBeenCalledWith(202);
    expect(res.json.mock.calls[0]?.[0]).toMatchObject({
      status: "processed_for_audit_only",
      provider: "alipay",
      refundSuccessState: false,
    });
    expectSafeBody(res.json.mock.calls[0]?.[0]);
  });

  it("marks Alipay query-required notification without calling query API", async () => {
    enableLocalAlipay();
    process.env.CHINA_REFUND_ALIPAY_REFUND_NOTIFY_MODE =
      "refund_query_follow_up";
    const res = makeResponse();

    await POST(makeAlipayRequest(alipayRefundQueryRequiredNotifyVector.rawNotification.form), res);

    expect(res.status).toHaveBeenCalledWith(202);
    expect(res.json.mock.calls[0]?.[0]).toMatchObject({
      status: "query_required",
      provider: "alipay",
      refundSuccessState: false,
    });
    expectSafeBody(res.json.mock.calls[0]?.[0]);
  });

  it("returns method not allowed for GET", async () => {
    const res = makeResponse();

    await GET(makeRequest(), res);

    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json.mock.calls[0]?.[0]).toMatchObject({
      status: "disabled",
      provider: "alipay",
      runtime: "method_not_allowed",
      allowedMethods: ["POST"],
    });
  });
});
