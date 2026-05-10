import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

import {
  AppendRefundInboxEventInput,
  buildMockPaymentSignature,
  createLocalRefundInboxPostgresClient,
  DbRefundInboxRepository,
  MarkRefundGuardCheckedInput,
  MarkRefundInboxFailedInput,
  MarkRefundManualReviewRequiredInput,
  MarkRefundRuntimeMutationBlockedInput,
  LocalPostgresConnection,
  LocalPostgresDriver,
  RefundInboxDbClient,
  normalizeRefundNotificationContract,
  ReceiveRefundNotificationInput,
  RefundFakeNotificationBody,
  RefundInboxRecord,
  RefundInboxRepositoryContract,
  RefundInboxReceiveResult,
  verifyRefundNotificationContract,
} from "../../../../modules/china-payment-notification";

type RefundInboxRouteStatus =
  | "accepted"
  | "disabled"
  | "duplicate"
  | "manual_review_required"
  | "rejected";

const runtimeRequested = () =>
  process.env.CHINA_REFUND_INBOX_ROUTE_ENABLED === "true" ||
  process.env.CHINA_REFUND_INBOX_ROUTE_MODE === "mock_local_inbox_only" ||
  process.env.CHINA_REFUND_INBOX_ROUTE_MODE === "mock_local_db_inbox_only";

const routeMode = () => process.env.CHINA_REFUND_INBOX_ROUTE_MODE;

const localInMemoryRequested = () =>
  process.env.CHINA_REFUND_INBOX_LOCAL_INMEMORY === "true";

const localDbRequested = () =>
  process.env.CHINA_REFUND_INBOX_LOCAL_DB === "true";

const productionLikeEnvironment = () =>
  ["production", "prod", "preprod", "staging"].includes(
    String(process.env.NODE_ENV ?? "").toLowerCase(),
  );

const localInboxGateAllowsInMemory = () =>
  process.env.CHINA_REFUND_INBOX_ROUTE_ENABLED === "true" &&
  routeMode() === "mock_local_inbox_only" &&
  process.env.CHINA_REFUND_INBOX_PROVIDER === "mock_china_pay" &&
  Boolean(process.env.CHINA_REFUND_INBOX_MOCK_SECRET) &&
  localInMemoryRequested() &&
  !localDbRequested() &&
  !productionLikeEnvironment();

const localDbGateRequested = () =>
  process.env.CHINA_REFUND_INBOX_ROUTE_ENABLED === "true" &&
  routeMode() === "mock_local_db_inbox_only" &&
  process.env.CHINA_REFUND_INBOX_PROVIDER === "mock_china_pay" &&
  Boolean(process.env.CHINA_REFUND_INBOX_MOCK_SECRET) &&
  localDbRequested() &&
  !localInMemoryRequested() &&
  !productionLikeEnvironment();

const disabledBody = (productionBlocked: boolean) => ({
  status: "disabled",
  surface: "refund_inbox",
  provider: "mock_china_pay",
  runtime: productionBlocked ? "production_blocked" : "disabled",
  runtimeMutationBlocked: true,
  reason: productionBlocked
    ? "Refund inbox route is blocked in production."
    : "Refund inbox route is disabled.",
  runtimeRequested: runtimeRequested(),
});

const disabledWithCodeBody = (code: string, reason: string) => ({
  status: "disabled" as RefundInboxRouteStatus,
  surface: "refund_inbox",
  provider: "mock_china_pay",
  runtime: "disabled",
  code,
  reason,
  runtimeMutationBlocked: true,
  runtimeRequested: runtimeRequested(),
});

const methodNotAllowedBody = () => ({
  status: "disabled",
  surface: "refund_inbox",
  runtime: "method_not_allowed",
  runtimeMutationBlocked: true,
  allowedMethods: ["POST"],
});

const buildHeadersRecord = (
  headers: MedusaRequest["headers"],
): Record<string, string | string[] | undefined> => {
  if (!headers) {
    return {};
  }

  const maybeHeaders = headers as unknown as Headers;

  if (typeof maybeHeaders.forEach === "function") {
    const result: Record<string, string> = {};
    maybeHeaders.forEach((value, key) => {
      result[key] = value;
    });

    return result;
  }

  return headers as Record<string, string | string[] | undefined>;
};

const getHeaderValue = (
  headers: Record<string, string | string[] | undefined>,
  name: string,
): string | undefined => {
  const match = headers[name] ?? headers[name.toLowerCase()];
  const value = Array.isArray(match) ? match[0] : match;

  return value ? String(value) : undefined;
};

const readRawBody = async (req: MedusaRequest): Promise<string | null> => {
  if (typeof (req as unknown as { text?: unknown }).text === "function") {
    return (req as unknown as { text: () => Promise<string> }).text();
  }

  const body = (req as unknown as { body?: unknown }).body;

  if (typeof body === "string") {
    return body;
  }

  if (Buffer.isBuffer(body)) {
    return body.toString("utf8");
  }

  if (body && typeof body === "object") {
    return JSON.stringify(body);
  }

  return null;
};

const parseRefundBody = (rawBody: string): RefundFakeNotificationBody | null => {
  try {
    return JSON.parse(rawBody) as RefundFakeNotificationBody;
  } catch {
    return null;
  }
};

const buildExpectedRequest = (body: RefundFakeNotificationBody) => ({
  provider: "mock_china_pay" as const,
  refundRequestIdempotencyKey: body.refund_request_key,
  merchantOrderRef: body.merchant_order_ref,
  paymentSessionId: body.payment_session_id,
  requestedAmountMinor: body.amount,
  currency: "CNY" as const,
  providerTransactionId: body.provider_transaction_id,
  providerRefundId: body.provider_refund_id,
});

const routeSafeBody = (input: {
  status: RefundInboxRouteStatus;
  httpStatus: number;
  code?: string;
  mode?: "mock_local_inbox_only" | "mock_local_db_inbox_only";
  storage?: "local_inmemory" | "local_disposable_db";
  record?: RefundInboxRecord;
}) => ({
  status: input.status,
  surface: "refund_inbox",
  provider: "mock_china_pay",
  mode: input.mode,
  storage: input.storage,
  code: input.code,
  runtimeMutationBlocked: true,
  record: input.record
    ? {
        id: input.record.id,
        eventId: input.record.eventId,
        idempotencyKey: input.record.idempotencyKey,
        providerRefundId: input.record.providerRefundId,
        processingStatus: input.record.processingStatus,
      }
    : undefined,
});

type KnexPgConnection = {
  raw: (
    sql: string,
    params?: unknown[],
  ) => Promise<{ rows?: Record<string, unknown>[] }>;
  transaction?: () => Promise<{
    raw: (
      sql: string,
      params?: unknown[],
    ) => Promise<{ rows?: Record<string, unknown>[]; rowCount?: number }>;
    commit: () => Promise<unknown>;
    rollback: () => Promise<unknown>;
  }>;
};

const localServerHosts = new Set([
  "127.0.0.1",
  "::1",
  "localhost",
  "local_socket",
]);

const getLocalDbNameFromUrl = (databaseUrl?: string) => {
  if (!databaseUrl) {
    return undefined;
  }

  try {
    return decodeURIComponent(new URL(databaseUrl).pathname.replace(/^\//, ""));
  } catch {
    return undefined;
  }
};

const getLocalDbPortFromUrl = (databaseUrl?: string) => {
  if (!databaseUrl) {
    return undefined;
  }

  try {
    const port = new URL(databaseUrl).port;

    return port ? Number(port) : undefined;
  } catch {
    return undefined;
  }
};

const readCurrentDatabaseName = async (pg: KnexPgConnection) => {
  const result = await pg.raw("select current_database() as database_name");

  return result.rows?.[0]?.database_name
    ? String(result.rows[0].database_name)
    : undefined;
};

const readCurrentServerInfo = async (pg: KnexPgConnection) => {
  const result = await pg.raw(
    "select coalesce(inet_server_addr()::text, 'local_socket') as server_host, inet_server_port() as server_port",
  );
  const row = result.rows?.[0];
  const host = row?.server_host ? String(row.server_host) : undefined;

  return {
    host: host?.replace(/\/\d+$/, ""),
    port:
      typeof row?.server_port === "number"
        ? row.server_port
        : row?.server_port
          ? Number(row.server_port)
          : undefined,
  };
};

const isActualLocalDbConnection = async (
  pg: KnexPgConnection,
  databaseName: string,
  databaseUrl?: string,
) => {
  const [currentDatabaseName, serverInfo] = await Promise.all([
    readCurrentDatabaseName(pg).catch(() => undefined),
    readCurrentServerInfo(pg).catch(() => ({
      host: undefined,
      port: undefined,
    })),
  ]);
  const expectedPort = getLocalDbPortFromUrl(databaseUrl);

  if (currentDatabaseName !== databaseName) {
    return false;
  }

  if (!serverInfo.host || !localServerHosts.has(serverInfo.host)) {
    return false;
  }

  return !expectedPort || !serverInfo.port || serverInfo.port === expectedPort;
};

const toKnexRawSql = (sql: string) => sql.replace(/\$\d+/g, "?");
const toKnexRawParams = (params?: unknown[]) =>
  params?.map((param) => (param === undefined ? null : param));

const buildKnexLocalPostgresDriver = (
  pg: KnexPgConnection,
): LocalPostgresDriver => ({
  connect: async (): Promise<LocalPostgresConnection> => {
    let transaction:
      | Awaited<ReturnType<NonNullable<KnexPgConnection["transaction"]>>>
      | undefined;

    const ensureTransaction = async () => {
      if (!pg.transaction) {
        throw Object.assign(new Error("LOCAL_DB_CLIENT_REFUSED"), {
          code: "LOCAL_DB_CLIENT_REFUSED",
        });
      }

      transaction ??= await pg.transaction();

      return transaction;
    };

    return {
      query: async (sql, params) => {
        const normalizedSql = sql.trim().toLowerCase();

        if (normalizedSql === "begin") {
          await ensureTransaction();

          return { rows: [] };
        }

        if (normalizedSql === "commit") {
          await transaction?.commit();
          transaction = undefined;

          return { rows: [] };
        }

        if (normalizedSql === "rollback") {
          await transaction?.rollback();
          transaction = undefined;

          return { rows: [] };
        }

        const activeTransaction = await ensureTransaction();
        const result = await activeTransaction.raw(
          toKnexRawSql(sql),
          toKnexRawParams(params),
        );

        return {
          rows: (result.rows ?? []) as never[],
          rowCount:
            "rowCount" in result &&
            typeof result.rowCount === "number" &&
            result.rowCount > 0
              ? result.rowCount
              : undefined,
        };
      },
      release: async () => undefined,
    };
  },
});

const resolveLocalDbRepository = async (req: MedusaRequest) => {
  if (!localDbGateRequested()) {
    return undefined;
  }

  const databaseUrl = process.env.CHINA_REFUND_INBOX_LOCAL_DB_URL;
  const databaseName =
    process.env.CHINA_REFUND_INBOX_LOCAL_DB_NAME ??
    getLocalDbNameFromUrl(databaseUrl);

  if (!databaseUrl || !databaseName) {
    return undefined;
  }

  const scope = (req as unknown as { scope?: { resolve?: unknown } }).scope;

  if (!scope || typeof scope.resolve !== "function") {
    return undefined;
  }

  const pg = scope.resolve(
    ContainerRegistrationKeys.PG_CONNECTION,
  ) as KnexPgConnection;

  if (!(await isActualLocalDbConnection(pg, databaseName, databaseUrl))) {
    return undefined;
  }

  try {
    const client = createLocalRefundInboxPostgresClient({
      databaseUrl,
      databaseName,
      localDbEnabled: true,
      nodeEnv: process.env.NODE_ENV,
      driver: buildKnexLocalPostgresDriver(pg),
    }) as RefundInboxDbClient;

    return new DbRefundInboxRepository(client);
  } catch {
    return undefined;
  }
};

const nowIso = () => new Date().toISOString();

const stableRefundInboxRecordId = (idempotencyKey: string) =>
  `rinbox_${idempotencyKey.replace(/[^a-zA-Z0-9]+/g, "_").slice(0, 56)}`;

const buildRecord = (
  input: ReceiveRefundNotificationInput,
): RefundInboxRecord => ({
  id: stableRefundInboxRecordId(input.envelope.idempotencyKey),
  provider: input.envelope.provider,
  eventId: input.envelope.eventId,
  eventType: input.envelope.eventType as "refund.succeeded" | "refund.failed",
  idempotencyKey: input.envelope.idempotencyKey,
  providerRefundId: input.envelope.providerRefundId ?? "",
  merchantOrderRef: input.envelope.merchantOrderRef,
  paymentSessionId: input.envelope.paymentSessionId,
  amountMinor: input.envelope.amount.value,
  currency: input.envelope.amount.currency,
  signatureStatus: input.envelope.signature.status,
  rawPayloadDigest: input.envelope.rawPayloadDigest,
  processingStatus: "received",
  retryCount: 0,
  createdAt: input.receivedAt,
  updatedAt: input.receivedAt,
});

const updateRecordState = (
  record: RefundInboxRecord,
  processingStatus: RefundInboxRecord["processingStatus"],
): RefundInboxRecord => ({
  ...record,
  processingStatus,
  updatedAt: nowIso(),
  processedAt:
    processingStatus === "processed_for_audit_only"
      ? nowIso()
      : record.processedAt,
});

class InMemoryRefundInboxRouteRepository
  implements RefundInboxRepositoryContract
{
  private readonly records = new Map<string, RefundInboxRecord>();
  private readonly events: AppendRefundInboxEventInput[] = [];

  async receiveNotification(
    input: ReceiveRefundNotificationInput,
  ): Promise<RefundInboxReceiveResult> {
    const existing = this.records.get(input.envelope.idempotencyKey);

    if (existing) {
      const sameDigest =
        existing.rawPayloadDigest === input.envelope.rawPayloadDigest;
      const record = updateRecordState(
        existing,
        sameDigest ? "duplicate_seen" : "digest_conflict_manual_review",
      );
      this.records.set(record.idempotencyKey, record);

      return {
        status: sameDigest
          ? "duplicate_same_digest"
          : "duplicate_digest_conflict",
        record,
        fixtureOnly: true,
        executable: false,
      };
    }

    const record = buildRecord(input);
    this.records.set(record.idempotencyKey, record);

    return {
      status: "received",
      record,
      fixtureOnly: true,
      executable: false,
    };
  }

  async appendEvent(input: AppendRefundInboxEventInput): Promise<void> {
    this.events.push(input);
  }

  async markSignatureVerified(
    idempotencyKey: string,
  ): Promise<RefundInboxRecord> {
    return this.markState(idempotencyKey, "signature_verified");
  }

  async markNormalized(idempotencyKey: string): Promise<RefundInboxRecord> {
    return this.markState(idempotencyKey, "normalized");
  }

  async markGuardChecked(
    input: MarkRefundGuardCheckedInput,
  ): Promise<RefundInboxRecord> {
    return this.markState(input.idempotencyKey, "guard_checked");
  }

  async markManualReviewRequired(
    input: MarkRefundManualReviewRequiredInput,
  ): Promise<RefundInboxRecord> {
    return this.markState(
      input.idempotencyKey,
      "manual_review_required",
    );
  }

  async markRuntimeMutationBlocked(
    input: MarkRefundRuntimeMutationBlockedInput,
  ): Promise<RefundInboxRecord> {
    return this.markState(input.idempotencyKey, "runtime_mutation_blocked");
  }

  async markProcessedForAuditOnly(
    idempotencyKey: string,
  ): Promise<RefundInboxRecord> {
    return this.markState(idempotencyKey, "processed_for_audit_only");
  }

  async markTerminalRejected(
    input: MarkRefundInboxFailedInput,
  ): Promise<RefundInboxRecord> {
    const record = await this.markState(
      input.idempotencyKey,
      "terminal_rejected",
    );

    return {
      ...record,
      lastErrorCode: input.errorCode,
      lastErrorMessage: input.errorMessage,
    };
  }

  async getByIdempotencyKey(
    idempotencyKey: string,
  ): Promise<RefundInboxRecord | null> {
    return this.records.get(idempotencyKey) ?? null;
  }

  async getByProviderRefundId(
    provider: string,
    providerRefundId: string,
  ): Promise<RefundInboxRecord[]> {
    return Array.from(this.records.values()).filter(
      (record) =>
        record.provider === provider &&
        record.providerRefundId === providerRefundId,
    );
  }

  private async markState(
    idempotencyKey: string,
    processingStatus: RefundInboxRecord["processingStatus"],
  ): Promise<RefundInboxRecord> {
    const record = this.records.get(idempotencyKey);

    if (!record) {
      throw new Error(`Refund inbox record not found: ${idempotencyKey}`);
    }

    const updated = updateRecordState(record, processingStatus);
    this.records.set(updated.idempotencyKey, updated);

    return updated;
  }
}

const inMemoryRepository = new InMemoryRefundInboxRouteRepository();

const appendAuditTrail = async (
  repository: RefundInboxRepositoryContract,
  record: RefundInboxRecord,
) => {
  await repository.appendEvent({
    inboxId: record.id,
    action: "refund_notification_verified",
    actorType: "system_job",
    message: "Fake refund notification signature verified.",
    metadata: {
      auditEventId: `${record.id}:verified`,
      decisionType: "verified",
    },
  });
  await repository.appendEvent({
    inboxId: record.id,
    action: "refund_notification_normalized",
    actorType: "system_job",
    message: "Fake refund notification normalized.",
    metadata: {
      auditEventId: `${record.id}:normalized`,
      decisionType: "normalized",
    },
  });
  await repository.appendEvent({
    inboxId: record.id,
    action: "refund_runtime_mutation_blocked",
    actorType: "system_job",
    message: "Refund runtime mutation remains blocked.",
    metadata: {
      auditEventId: `${record.id}:runtime_blocked`,
      decisionType: "runtime_blocked",
    },
  });
  await repository.appendEvent({
    inboxId: record.id,
    action: "refund_settlement_blocked",
    actorType: "system_job",
    message: "Settlement, commission, and payout remain blocked.",
    metadata: {
      auditEventId: `${record.id}:settlement_blocked`,
      decisionType: "settlement_blocked",
    },
  });
};

const handleLocalInMemoryInbox = async (
  req: MedusaRequest,
  res: MedusaResponse,
) => handleLocalInbox(req, res, inMemoryRepository, "local_inmemory");

const handleLocalInbox = async (
  req: MedusaRequest,
  res: MedusaResponse,
  repository: RefundInboxRepositoryContract,
  storage: "local_inmemory" | "local_disposable_db",
) => {
  const rawBody = await readRawBody(req);

  if (!rawBody) {
    return res.status(400).json(
      routeSafeBody({
        status: "rejected",
        httpStatus: 400,
        code: "PAYLOAD_INVALID",
      }),
    );
  }

  const headers = buildHeadersRecord(req.headers);
  const receivedAt = nowIso();
  const secret = process.env.CHINA_REFUND_INBOX_MOCK_SECRET ?? "";
  const verification = verifyRefundNotificationContract({
    rawBody,
    headers: {
      signature: getHeaderValue(headers, "x-mock-refund-signature"),
      algorithm:
        getHeaderValue(headers, "x-mock-refund-algorithm") ?? "MOCK_SHA256",
      eventId: getHeaderValue(headers, "x-mock-refund-event-id"),
      provider: getHeaderValue(headers, "x-mock-refund-provider"),
      keyId: getHeaderValue(headers, "x-mock-refund-key-id"),
    },
    expectedFakeSignature: buildMockPaymentSignature(rawBody, secret),
    receivedAt,
  });

  if (!verification.verified) {
    return res.status(400).json(
      routeSafeBody({
        status: "rejected",
        httpStatus: 400,
        code: verification.failureCode ?? "SIGNATURE_INVALID",
      }),
    );
  }

  const body = parseRefundBody(rawBody);

  if (!body) {
    return res.status(400).json(
      routeSafeBody({
        status: "rejected",
        httpStatus: 400,
        code: "PAYLOAD_INVALID",
      }),
    );
  }

  const normalized = normalizeRefundNotificationContract({
    verification,
    body,
    expectedRequest: buildExpectedRequest(body),
  });

  if (!normalized.normalized) {
    return res.status(
      normalized.failureCode === "REFUND_NOTIFICATION_AMOUNT_MISMATCH"
        ? 409
        : 400,
    ).json(
      routeSafeBody({
        status:
          normalized.failureCode === "REFUND_NOTIFICATION_AMOUNT_MISMATCH"
            ? "manual_review_required"
            : "rejected",
        httpStatus: 400,
        code: normalized.failureCode,
      }),
    );
  }

  const receiveResult = await repository.receiveNotification({
    envelope: normalized.envelope,
    receivedAt,
    sanitizedMetadata: {
      fixtureOnly: true,
      route:
        storage === "local_disposable_db"
          ? "refund_inbox_mock_local_db"
          : "refund_inbox_mock_local_inmemory",
    },
  });

  if (receiveResult.status === "received") {
    await repository.markSignatureVerified(
      receiveResult.record.idempotencyKey,
    );
    const normalizedRecord = await repository.markNormalized(
      receiveResult.record.idempotencyKey,
    );
    await appendAuditTrail(repository, normalizedRecord);

    return res.status(202).json(
      routeSafeBody({
        status: "accepted",
        mode:
          storage === "local_disposable_db"
            ? "mock_local_db_inbox_only"
            : "mock_local_inbox_only",
        storage,
        httpStatus: 202,
        record: normalizedRecord,
      }),
    );
  }

  if (receiveResult.status === "duplicate_same_digest") {
    return res.status(200).json(
      routeSafeBody({
        status: "duplicate",
        mode:
          storage === "local_disposable_db"
            ? "mock_local_db_inbox_only"
            : "mock_local_inbox_only",
        storage,
        httpStatus: 200,
        record: receiveResult.record,
      }),
    );
  }

  await repository.markManualReviewRequired({
    idempotencyKey: receiveResult.record.idempotencyKey,
    reasonCodes: ["digest_conflict"],
    severity: "high",
  });

  return res.status(409).json(
    routeSafeBody({
      status: "manual_review_required",
      mode:
        storage === "local_disposable_db"
          ? "mock_local_db_inbox_only"
          : "mock_local_inbox_only",
      storage,
      httpStatus: 409,
      code: "DIGEST_CONFLICT",
      record: receiveResult.record,
    }),
  );
};

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const productionBlocked = productionLikeEnvironment();

  if (productionBlocked) {
    return res.status(503).json(disabledBody(true));
  }

  if (!runtimeRequested()) {
    return res.status(503).json(disabledBody(false));
  }

  if (!localInboxGateAllowsInMemory()) {
    if (localDbRequested()) {
      const repository = await resolveLocalDbRepository(req);

      if (!repository) {
        return res.status(503).json(
          disabledWithCodeBody(
            "LOCAL_DB_REQUIRED",
            "Refund inbox route requires explicit local disposable DB inbox mode.",
          ),
        );
      }

      return handleLocalInbox(req, res, repository, "local_disposable_db");
    }

    return res.status(503).json(
      disabledWithCodeBody(
        "LOCAL_INMEMORY_REPOSITORY_REQUIRED",
        "Refund inbox route requires explicit local in-memory inbox mode.",
      ),
    );
  }

  return handleLocalInMemoryInbox(req, res);
};

export const GET = async (_req: MedusaRequest, res: MedusaResponse) =>
  res.status(405).json(methodNotAllowedBody());
