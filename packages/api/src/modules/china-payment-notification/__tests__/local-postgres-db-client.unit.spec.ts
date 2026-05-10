import {
  createLocalPaymentNotificationPostgresClient,
  createLocalRefundInboxPostgresClient,
  LocalPostgresConnection,
  LocalPostgresDriver,
  PaymentNotificationDbInboxRow,
  RefundInboxDbRow,
} from "..";

const safeDatabaseUrl =
  "postgres://codex@127.0.0.1:15432/fuyi_payment_notification_route_dry_run_unit";
const safeRefundDatabaseUrl =
  "postgres://codex@127.0.0.1:15432/fuyi_refund_inbox_route_dry_run_unit";

const makeRow = (
  overrides: Partial<PaymentNotificationDbInboxRow> = {},
): PaymentNotificationDbInboxRow => ({
  id: "pinbox_mock_china_pay_key_001",
  provider: "mock_china_pay",
  eventId: "evt_001",
  eventType: "payment.succeeded",
  idempotencyKey: "mock_china_pay:event:evt_001",
  merchantOrderRef: "pay_mock_001",
  paymentSessionId: "payses_mock_001",
  providerTransactionId: "mock_txn_001",
  providerRefundId: null,
  amountValue: 128560,
  currency: "CNY",
  signatureStatus: "verified",
  rawPayloadDigest: "sha256:digest",
  processingStatus: "verified",
  retryCount: 0,
  receivedAt: "2026-05-07T00:00:00.000Z",
  createdAt: "2026-05-07T00:00:00.000Z",
  updatedAt: "2026-05-07T00:00:00.000Z",
  ...overrides,
});

const makeRefundRow = (
  overrides: Partial<RefundInboxDbRow> = {},
): RefundInboxDbRow => ({
  id: "rinbox_mock_china_pay_key_001",
  provider: "mock_china_pay",
  eventId: "evt_refund_001",
  eventType: "refund.succeeded",
  idempotencyKey: "refund_notify:mock_china_pay:evt_refund_001",
  merchantOrderRef: "pay_mock_001",
  paymentSessionId: "payses_001",
  providerRefundId: "refund_fake_001",
  amountMinor: 128560,
  currency: "CNY",
  signatureStatus: "verified",
  rawPayloadDigest: "sha256:refunddigest",
  processingStatus: "received",
  retryCount: 0,
  createdAt: "2026-05-10T00:00:00.000Z",
  updatedAt: "2026-05-10T00:00:00.000Z",
  ...overrides,
});

const makeConnection = () => {
  const connection: LocalPostgresConnection & {
    query: jest.Mock;
    release: jest.Mock;
  } = {
    query: jest.fn(async () => ({ rows: [] })),
    release: jest.fn(),
  };
  const driver: LocalPostgresDriver & { connect: jest.Mock } = {
    connect: jest.fn(async () => connection),
  };

  return { connection, driver };
};

const createClient = (driver: LocalPostgresDriver) =>
  createLocalPaymentNotificationPostgresClient({
    databaseUrl: safeDatabaseUrl,
    localDbEnabled: true,
    nodeEnv: "development",
    driver,
  });

const createRefundClient = (driver: LocalPostgresDriver) =>
  createLocalRefundInboxPostgresClient({
    databaseUrl: safeRefundDatabaseUrl,
    localDbEnabled: true,
    nodeEnv: "development",
    driver,
  });

describe("createLocalPaymentNotificationPostgresClient", () => {
  it("refuses production environments", () => {
    const { driver } = makeConnection();

    expect(() =>
      createLocalPaymentNotificationPostgresClient({
        databaseUrl: safeDatabaseUrl,
        localDbEnabled: true,
        nodeEnv: "production",
        driver,
      }),
    ).toThrow("LOCAL_DB_CLIENT_REFUSED");
  });

  it("refuses when the local DB flag is missing", () => {
    const { driver } = makeConnection();

    expect(() =>
      createLocalPaymentNotificationPostgresClient({
        databaseUrl: safeDatabaseUrl,
        localDbEnabled: false,
        nodeEnv: "development",
        driver,
      }),
    ).toThrow("LOCAL_DB_CLIENT_REFUSED");
  });

  it("refuses unsafe database names", () => {
    const { driver } = makeConnection();

    expect(() =>
      createLocalPaymentNotificationPostgresClient({
        databaseUrl: "postgres://codex@127.0.0.1:15432/mercur",
        localDbEnabled: true,
        nodeEnv: "development",
        driver,
      }),
    ).toThrow("LOCAL_DB_CLIENT_REFUSED");
  });

  it("always refuses remote hosts", () => {
    const { driver } = makeConnection();

    expect(() =>
      createLocalPaymentNotificationPostgresClient({
        databaseUrl:
          "postgres://codex@10.0.0.5:5432/fuyi_payment_notification_route_dry_run_unit",
        localDbEnabled: true,
        nodeEnv: "development",
        driver,
      }),
    ).toThrow("LOCAL_DB_CLIENT_REFUSED");
  });

  it("commits successful transactions and releases the connection", async () => {
    const { connection, driver } = makeConnection();
    const client = createClient(driver);
    const calls: string[] = [];

    connection.query.mockImplementation(async (sql: string) => {
      calls.push(sql.trim());

      return { rows: [] };
    });

    await client.transaction(async () => {
      calls.push("handler");

      return "ok";
    });

    expect(calls).toEqual(["begin", "handler", "commit"]);
    expect(connection.release).toHaveBeenCalledTimes(1);
  });

  it("rolls back failed transactions and releases the connection", async () => {
    const { connection, driver } = makeConnection();
    const client = createClient(driver);
    const calls: string[] = [];

    connection.query.mockImplementation(async (sql: string) => {
      calls.push(sql.trim());

      return { rows: [] };
    });

    await expect(
      client.transaction(async () => {
        calls.push("handler");
        throw new Error("HANDLER_FAILED");
      }),
    ).rejects.toThrow("HANDLER_FAILED");

    expect(calls).toEqual(["begin", "handler", "rollback"]);
    expect(connection.release).toHaveBeenCalledTimes(1);
  });

  it("inserts inbox rows without raw payload or secret columns", async () => {
    const { connection, driver } = makeConnection();
    const client = createClient(driver);
    const row = makeRow();

    connection.query.mockImplementation(async (sql: string) => {
      if (sql.includes("select id") && sql.includes("provider = $1")) {
        return { rows: [] };
      }

      if (sql.includes("insert into payment_notification_inbox")) {
        return { rows: [{ id: row.id }] };
      }

      return { rows: [] };
    });

    await client.transaction(async (transaction) => {
      await transaction.insertInbox(row);
    });

    const [sql, params] = connection.query.mock.calls.find(([sql]) =>
      String(sql).includes("insert into payment_notification_inbox"),
    );

    expect(sql).toContain("raw_payload_digest");
    expect(sql).not.toContain("raw_payload_ref");
    expect(sql).not.toContain("signature ");
    expect(sql).not.toContain("secret");
    expect(JSON.stringify(params)).not.toContain("mock_test_secret");
  });

  it("maps duplicate inserts to stable unique conflict errors", async () => {
    const { connection, driver } = makeConnection();
    const client = createClient(driver);

    connection.query.mockImplementation(async (sql: string) => {
      if (sql.includes("select id") && sql.includes("provider = $1")) {
        return { rows: [{ id: "pinbox_existing" }] };
      }

      if (sql.includes("insert into payment_notification_inbox")) {
        throw new Error("insert should not run for known duplicates");
      }

      return { rows: [] };
    });

    await expect(
      client.transaction((transaction) => transaction.insertInbox(makeRow())),
    ).rejects.toMatchObject({
      code: "DB_UNIQUE_CONFLICT",
    });
  });

  it("treats rowCount-only inbox inserts as successful", async () => {
    const { connection, driver } = makeConnection();
    const client = createClient(driver);

    connection.query.mockImplementation(async (sql: string) => {
      if (sql.includes("select id") && sql.includes("provider = $1")) {
        return { rows: [] };
      }

      if (sql.includes("insert into payment_notification_inbox")) {
        return { rows: [], rowCount: 1 };
      }

      return { rows: [] };
    });

    await expect(
      client.transaction((transaction) => transaction.insertInbox(makeRow())),
    ).resolves.toBeUndefined();
  });

  it("updates inbox rows and returns mapped rows", async () => {
    const { connection, driver } = makeConnection();
    const client = createClient(driver);

    connection.query.mockImplementation(async (sql: string) => {
      if (sql.includes("update payment_notification_inbox")) {
        return {
          rows: [
            {
              id: "pinbox_001",
              provider: "mock_china_pay",
              event_id: "evt_001",
              event_type: "payment.succeeded",
              idempotency_key: "mock_key",
              merchant_order_ref: "pay_mock_001",
              payment_session_id: "payses_mock_001",
              provider_transaction_id: "mock_txn_001",
              provider_refund_id: null,
              amount_value: 128560,
              currency: "CNY",
              signature_status: "verified",
              raw_payload_digest: "sha256:digest",
              processing_status: "processed",
              retry_count: 0,
              received_at: "2026-05-07T00:00:00.000Z",
              processed_at: "2026-05-07T00:02:00.000Z",
              created_at: "2026-05-07T00:00:00.000Z",
              updated_at: "2026-05-07T00:02:00.000Z",
            },
          ],
        };
      }

      return { rows: [] };
    });

    const updated = await client.transaction((transaction) =>
      transaction.updateInbox("mock_key", {
        processingStatus: "processed",
        processedAt: "2026-05-07T00:02:00.000Z",
      }),
    );

    expect(updated.processingStatus).toBe("processed");
    expect(updated.currency).toBe("CNY");
  });

  it("returns null when idempotency lookups miss", async () => {
    const { driver } = makeConnection();
    const client = createClient(driver);

    const result = await client.transaction((transaction) =>
      transaction.findInboxByIdempotencyKey("missing"),
    );

    expect(result).toBeNull();
  });

  it("serializes only allowlisted event log metadata fields", async () => {
    const { connection, driver } = makeConnection();
    const client = createClient(driver);

    await client.transaction((transaction) =>
      transaction.insertEventLog({
        id: "plog_001",
        inboxId: "pinbox_001",
        action: "received",
        actorType: "provider",
        message: "Payment notification received.",
        metadata: {
          provider: "mock_china_pay",
          eventId: "evt_001",
          retryCount: 1,
          rawPayload: "{\"secret\":true}",
          raw_body: "{\"secret\":true}",
          signature: "sha256=secret",
          Signature: "sha256=secret",
          secret: "secret",
          secretKey: "secret",
          authorization: "Bearer secret",
          token: "secret",
          databaseUrl: "postgres://user:password@localhost/db",
          nested: {
            databaseUrl: "postgres://user:password@localhost/db",
            signature: "sha256=secret",
          },
        },
        createdAt: "2026-05-07T00:00:00.000Z",
      }),
    );

    const [, params] = connection.query.mock.calls.find(([sql]) =>
      String(sql).includes("insert into payment_notification_event_log"),
    );
    const metadata = JSON.parse(String(params[5]));

    expect(metadata).toEqual({
      provider: "mock_china_pay",
      eventId: "evt_001",
      retryCount: 1,
    });
    expect(JSON.stringify(metadata)).not.toContain("secret");
    expect(JSON.stringify(metadata)).not.toContain("postgres://");
    expect(JSON.stringify(metadata)).not.toContain("signature");
  });
});

describe("createLocalRefundInboxPostgresClient", () => {
  it("refuses unsafe refund database names", () => {
    const { driver } = makeConnection();

    expect(() =>
      createLocalRefundInboxPostgresClient({
        databaseUrl: "postgres://codex@127.0.0.1:15432/mercur",
        localDbEnabled: true,
        nodeEnv: "development",
        driver,
      }),
    ).toThrow("LOCAL_DB_CLIENT_REFUSED");
  });

  it("refuses preproduction environments", () => {
    const { driver } = makeConnection();

    expect(() =>
      createLocalRefundInboxPostgresClient({
        databaseUrl: safeRefundDatabaseUrl,
        localDbEnabled: true,
        nodeEnv: "preprod",
        driver,
      }),
    ).toThrow("LOCAL_DB_CLIENT_REFUSED");
  });

  it("inserts refund inbox rows using shared local DB tables", async () => {
    const { connection, driver } = makeConnection();
    const client = createRefundClient(driver);
    const row = makeRefundRow();

    connection.query.mockImplementation(async (sql: string) => {
      if (sql.includes("select id") && sql.includes("provider = $1")) {
        return { rows: [] };
      }

      if (sql.includes("insert into payment_notification_inbox")) {
        return { rows: [{ id: row.id }], rowCount: 1 };
      }

      return { rows: [] };
    });

    await client.transaction((transaction) => transaction.insertInbox(row));

    const [sql, params] = connection.query.mock.calls.find(([sql]) =>
      String(sql).includes("insert into payment_notification_inbox"),
    );

    expect(sql).toContain("provider_refund_id");
    expect(params).toContain("refund.succeeded");
    expect(params).toContain("refund_fake_001");
    expect(params).toContain("received");
    expect(JSON.stringify(params)).not.toContain("providerRefundRequest");
  });

  it("writes and returns refund route-only states without DB-safe mapping", async () => {
    const { connection, driver } = makeConnection();
    const client = createRefundClient(driver);

    connection.query.mockImplementation(async (sql: string, params: unknown[]) => {
      if (sql.includes("update payment_notification_inbox")) {
        return {
          rows: [
            {
              id: "rinbox_001",
              provider: "mock_china_pay",
              event_id: "evt_refund_001",
              event_type: "refund.succeeded",
              idempotency_key: "refund_notify:mock_china_pay:evt_refund_001",
              merchant_order_ref: "pay_mock_001",
              payment_session_id: "payses_001",
              provider_refund_id: "refund_fake_001",
              amount_value: 128560,
              currency: "CNY",
              signature_status: "verified",
              raw_payload_digest: "sha256:refunddigest",
              processing_status: params[1],
              retry_count: 0,
              created_at: "2026-05-10T00:00:00.000Z",
              updated_at: "2026-05-10T00:02:00.000Z",
            },
          ],
        };
      }

      return { rows: [] };
    });

    const updated = await client.transaction((transaction) =>
      transaction.updateInbox("refund_notify:mock_china_pay:evt_refund_001", {
        processingStatus: "normalized",
        updatedAt: "2026-05-10T00:02:00.000Z",
      }),
    );

    const [, params] = connection.query.mock.calls.find(([sql]) =>
      String(sql).includes("update payment_notification_inbox"),
    );

    expect(params[1]).toBe("normalized");
    expect(updated.processingStatus).toBe("normalized");
  });

  it("writes refund system_job audit events without DB-safe actor mapping", async () => {
    const { connection, driver } = makeConnection();
    const client = createRefundClient(driver);

    await client.transaction((transaction) =>
      transaction.insertEventLog({
        id: "rlog_001",
        inboxId: "rinbox_001",
        action: "refund_runtime_mutation_blocked",
        actorType: "system_job",
        message: "Refund runtime mutation remains blocked.",
        metadata: {
          auditEventId: "raudit_001",
          providerRefundRequest: "must-not-be-written-by-repository",
          nested: {
            workflowCommand: "must-not-be-written",
            safeNote: "kept",
          },
        },
        createdAt: "2026-05-10T00:00:00.000Z",
      }),
    );

    const [, params] = connection.query.mock.calls.find(([sql]) =>
      String(sql).includes("insert into payment_notification_event_log"),
    );

    expect(params[3]).toBe("system_job");
    expect(params[2]).toBe("refund_runtime_mutation_blocked");
    expect(String(params[5])).toContain("safeNote");
    expect(String(params[5])).not.toContain("providerRefundRequest");
    expect(String(params[5])).not.toContain("workflowCommand");
  });
});
