import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

import {
  createLocalPaymentNotificationPostgresClient,
  DbPaymentNotificationInboxRepository,
  evaluatePaymentNotificationRuntimeGate,
  handleMockPaymentWebhookNotification,
  LocalPostgresConnection,
  LocalPostgresDriver,
  mapMockPaymentWebhookResponse,
  parsePaymentNotificationRuntimeConfig,
  PaymentNotificationDbClient,
  resolveChinaPaymentProviderAdapter,
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

const runtimeRequested = () =>
  process.env.CHINA_PAYMENT_NOTIFICATION_RUNTIME_ENABLED === "true" ||
  process.env.CHINA_PAYMENT_PROVIDER_REGISTRY_MODE === "mock_contract_only";

const isLocalDbRequested = () =>
  process.env.CHINA_PAYMENT_NOTIFICATION_LOCAL_DB === "true";

const disabledBody = (productionBlocked: boolean, reason?: string) => ({
  status: "disabled",
  provider: "mock_china_pay",
  runtime: productionBlocked ? "production_blocked" : "disabled",
  reason:
    reason ??
    (productionBlocked
      ? "Mock China payment provider runtime is blocked in production."
      : "Mock China payment provider runtime is disabled."),
  runtimeRequested: runtimeRequested(),
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

const localServerHosts = new Set([
  "127.0.0.1",
  "::1",
  "localhost",
  "local_socket",
]);

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
  const databaseUrl = process.env.CHINA_PAYMENT_NOTIFICATION_LOCAL_DB_URL;
  const databaseName =
    process.env.CHINA_PAYMENT_NOTIFICATION_LOCAL_DB_NAME ??
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

  let client: PaymentNotificationDbClient;

  try {
    client = createLocalPaymentNotificationPostgresClient({
      databaseUrl,
      databaseName,
      localDbEnabled: true,
      nodeEnv: process.env.NODE_ENV,
      driver: buildKnexLocalPostgresDriver(pg),
    });
  } catch {
    return undefined;
  }
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

const runtimeGateAllowsLocalInboxOnly = () => {
  const runtimeConfig = parsePaymentNotificationRuntimeConfig(
    buildRuntimeConfigInput(),
  );
  const adapterDecision = resolveChinaPaymentProviderAdapter({
    provider: process.env.CHINA_PAYMENT_NOTIFICATION_PROVIDER,
    mode: process.env.CHINA_PAYMENT_PROVIDER_REGISTRY_MODE,
    nodeEnv: process.env.NODE_ENV,
  });
  const gateDecision = evaluatePaymentNotificationRuntimeGate({
    runtimeConfig,
    nodeEnv: process.env.NODE_ENV,
    dbRuntimeEnabled: isLocalDbRequested(),
    migrationRegistered: true,
    preprodDisposableDbVerified: true,
    providerAdapterVerified: adapterDecision.resolved,
    workflowExecutionEnabled: false,
  });

  return (
    adapterDecision.resolved &&
    gateDecision.allowed &&
    gateDecision.stage === "inbox_only"
  );
};

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const productionBlocked = process.env.NODE_ENV === "production";

  if (productionBlocked || !runtimeGateAllowsLocalInboxOnly()) {
    return res.status(503).json(disabledBody(productionBlocked));
  }

  const repository = await resolveLocalDbRepository(req);

  if (!repository) {
    return res.status(503).json(disabledBody(false));
  }

  const rawBody = await readRawBody(req);

  if (rawBody === null) {
    const response = mapMockPaymentWebhookResponse({
      status: "rejected",
      code: "PAYLOAD_INVALID",
    });

    return res.status(response.httpStatus).json({
      ...response.body,
      route: "mock_payment_provider_runtime_local_inbox_only",
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
    route: "mock_payment_provider_runtime_local_inbox_only",
    safeDebug: {
      receivedAt: result.safeDebug.receivedAt,
      hasRawBody: result.safeDebug.hasRawBody,
      runtimeRequested: result.safeDebug.runtimeRequested,
    },
  });
};
