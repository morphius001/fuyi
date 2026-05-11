import { MedusaRequest } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

import {
  createLocalRefundInboxPostgresClient,
  DbRefundInboxRepository,
  LocalPostgresConnection,
  LocalPostgresDriver,
  RefundInboxDbClient,
  RefundInboxRepositoryContract,
} from "../../../modules/china-payment-notification";

type KnexPgConnection = {
  raw: (
    sql: string,
    params?: unknown[],
  ) => Promise<{ rows?: Record<string, unknown>[]; rowCount?: number }>;
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

export const resolveRefundProviderLocalDbRepository = async (
  req: MedusaRequest,
): Promise<RefundInboxRepositoryContract | undefined> => {
  const databaseUrl =
    process.env.CHINA_REFUND_INBOX_DATABASE_URL ??
    process.env.CHINA_REFUND_INBOX_LOCAL_DB_URL;
  const databaseName =
    process.env.CHINA_REFUND_INBOX_DATABASE_NAME ??
    process.env.CHINA_REFUND_INBOX_LOCAL_DB_NAME ??
    getLocalDbNameFromUrl(databaseUrl);

  if (!databaseUrl || !databaseName) {
    return undefined;
  }

  const scope = (req as unknown as { scope?: { resolve?: unknown } }).scope;

  if (!scope || typeof scope.resolve !== "function") {
    return undefined;
  }

  let pg: KnexPgConnection;

  try {
    pg = scope.resolve(ContainerRegistrationKeys.PG_CONNECTION) as KnexPgConnection;
  } catch {
    return undefined;
  }

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
