import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

import {
  createLocalPaymentNotificationPostgresClient,
  DbPaymentNotificationInboxRepository,
  handleMockPaymentWebhookNotification,
  InMemoryPaymentNotificationInboxRepository,
  LocalPostgresConnection,
  LocalPostgresDriver,
  mapMockPaymentWebhookResponse,
  PaymentNotificationDbClient,
  parsePaymentNotificationRuntimeConfig,
  PaymentNotificationInboxRepositoryContract,
  resolveMockWebhookInboxRepository,
} from "../../../../modules/china-payment-notification";

const buildRuntimeConfigInput = () => ({
  CHINA_PAYMENT_NOTIFICATION_RUNTIME_ENABLED:
    process.env.CHINA_PAYMENT_NOTIFICATION_RUNTIME_ENABLED,
  CHINA_PAYMENT_NOTIFICATION_WEBHOOK_MODE:
    process.env.CHINA_PAYMENT_NOTIFICATION_WEBHOOK_MODE,
  CHINA_PAYMENT_NOTIFICATION_PROVIDER:
    process.env.CHINA_PAYMENT_NOTIFICATION_PROVIDER,
  CHINA_PAYMENT_NOTIFICATION_LOCAL_DB:
    process.env.CHINA_PAYMENT_NOTIFICATION_LOCAL_DB,
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

const buildLocalInMemoryRepository = (): PaymentNotificationInboxRepositoryContract => {
  const repository = new InMemoryPaymentNotificationInboxRepository();

  return {
    receive: async (envelope) => {
      const result = repository.receive(envelope);

      return {
        status: result.replayed ? "duplicate" : "received",
        record: result.record,
      };
    },
    appendEvent: async () => undefined,
    markProcessing: async (idempotencyKey) =>
      repository.markProcessing(idempotencyKey),
    markProcessed: async (idempotencyKey) =>
      repository.markProcessed(idempotencyKey),
    markRetryableFailed: async (input) =>
      repository.markRetryableFailed(
        input.idempotencyKey,
        input.errorCode,
        input.errorMessage,
      ),
    markTerminalFailed: async (input) =>
      repository.markRetryableFailed(
        input.idempotencyKey,
        input.errorCode,
        input.errorMessage,
      ),
    getByIdempotencyKey: async (idempotencyKey) =>
      repository.getByIdempotencyKey(idempotencyKey) ?? null,
  };
};

const isLocalInMemoryEnabled = () =>
  process.env.CHINA_PAYMENT_NOTIFICATION_LOCAL_INMEMORY === "true" &&
  process.env.NODE_ENV !== "production";

const isLocalDbRequested = () =>
  process.env.CHINA_PAYMENT_NOTIFICATION_LOCAL_DB === "true";

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

const disabledResponse = (runtimeRequested: boolean) => {
  const response = mapMockPaymentWebhookResponse({
    status: "disabled",
    code: "RUNTIME_DISABLED",
  });

  return {
    response,
    body: {
      ...response.body,
      route: "mock_payment_webhook_neutral_disabled_only",
      runtimeRequested,
    },
  };
};

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

const readCurrentDatabaseName = async (pg: KnexPgConnection) => {
  const result = await pg.raw("select current_database() as database_name");

  return result.rows?.[0]?.database_name
    ? String(result.rows[0].database_name)
    : undefined;
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

          return {
            rows: [],
          };
        }

        if (normalizedSql === "commit") {
          await transaction?.commit();
          transaction = undefined;

          return {
            rows: [],
          };
        }

        if (normalizedSql === "rollback") {
          await transaction?.rollback();
          transaction = undefined;

          return {
            rows: [],
          };
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
  const databaseUrl = process.env.CHINA_PAYMENT_NOTIFICATION_LOCAL_DB_URL;
  const databaseName =
    process.env.CHINA_PAYMENT_NOTIFICATION_LOCAL_DB_NAME ??
    getLocalDbNameFromUrl(databaseUrl);

  if (!databaseUrl || !databaseName) {
    return undefined;
  }

  const pg = req.scope.resolve(
    ContainerRegistrationKeys.PG_CONNECTION,
  ) as KnexPgConnection;
  const currentDatabaseName = await readCurrentDatabaseName(pg).catch(
    () => undefined,
  );

  if (currentDatabaseName !== databaseName) {
    return undefined;
  }

  const client = createLocalPaymentNotificationPostgresClient({
    databaseUrl,
    databaseName,
    localDbEnabled: true,
    nodeEnv: process.env.NODE_ENV,
    driver: buildKnexLocalPostgresDriver(pg),
  });
  const resolution = resolveMockWebhookInboxRepository({
    runtimeConfigInput: buildRuntimeConfigInput(),
    nodeEnv: process.env.NODE_ENV,
    transactionClient: client,
    repositoryFactory: (transactionClient) =>
      new DbPaymentNotificationInboxRepository(
        transactionClient as PaymentNotificationDbClient,
      ),
  });

  return resolution.status === "available" ? resolution.repository : undefined;
};

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const runtimeConfig = parsePaymentNotificationRuntimeConfig(
    buildRuntimeConfigInput(),
  );
  if (isLocalDbRequested()) {
    const repository = await resolveLocalDbRepository(req);

    if (!repository) {
      const disabled = disabledResponse(runtimeConfig.enabled);

      return res.status(disabled.response.httpStatus).json(disabled.body);
    }

    const rawBody = await readRawBody(req);

    if (rawBody === null) {
      const response = mapMockPaymentWebhookResponse({
        status: "rejected",
        code: "PAYLOAD_INVALID",
      });

      return res.status(response.httpStatus).json({
        ...response.body,
        route: "mock_payment_webhook_neutral_local_db",
      });
    }

    const result = await handleMockPaymentWebhookNotification({
      runtimeConfigInput: buildRuntimeConfigInput(),
      rawBody,
      headers: buildHeadersRecord(req.headers),
      secret: process.env.CHINA_PAYMENT_NOTIFICATION_MOCK_SECRET,
      receivedAt: new Date().toISOString(),
      repository,
    });

    return res.status(result.response.httpStatus).json({
      ...result.response.body,
      route: "mock_payment_webhook_neutral_local_db",
      safeDebug: result.safeDebug,
    });
  }

  const routeEnabled =
    runtimeConfig.enabled &&
    runtimeConfig.mode === "mock_inbox_only" &&
    isLocalInMemoryEnabled();

  if (!routeEnabled) {
    const disabled = disabledResponse(runtimeConfig.enabled);

    return res.status(disabled.response.httpStatus).json(disabled.body);
  }

  const rawBody = await readRawBody(req);

  if (rawBody === null) {
    const response = mapMockPaymentWebhookResponse({
      status: "rejected",
      code: "PAYLOAD_INVALID",
    });

    return res.status(response.httpStatus).json({
      ...response.body,
      route: "mock_payment_webhook_neutral_local_inmemory",
    });
  }

  const result = await handleMockPaymentWebhookNotification({
    runtimeConfigInput: buildRuntimeConfigInput(),
    rawBody,
    headers: buildHeadersRecord(req.headers),
    secret: process.env.CHINA_PAYMENT_NOTIFICATION_MOCK_SECRET,
    receivedAt: new Date().toISOString(),
    repository: buildLocalInMemoryRepository(),
  });

  return res.status(result.response.httpStatus).json({
    ...result.response.body,
    route: "mock_payment_webhook_neutral_local_inmemory",
    safeDebug: result.safeDebug,
  });
}
