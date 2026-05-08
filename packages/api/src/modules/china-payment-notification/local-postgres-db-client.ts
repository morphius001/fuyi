import {
  PaymentNotificationDbClient,
  PaymentNotificationDbEventLogRow,
  PaymentNotificationDbInboxRow,
  PaymentNotificationDbTransaction,
} from "./db-inbox-repository";

export type LocalPostgresQueryResult<Row = Record<string, unknown>> = {
  rows: Row[];
  rowCount?: number;
};

export type LocalPostgresConnection = {
  query<Row = Record<string, unknown>>(
    sql: string,
    params?: unknown[],
  ): Promise<LocalPostgresQueryResult<Row>>;
  release(): void | Promise<void>;
};

export type LocalPostgresDriver = {
  connect(databaseUrl: string): Promise<LocalPostgresConnection>;
};

export type LocalPaymentNotificationPostgresClientInput = {
  databaseUrl?: string;
  databaseName?: string;
  nodeEnv?: string;
  localDbEnabled?: boolean;
  driver: LocalPostgresDriver;
};

type LocalDbRefusalReason =
  | "database_url_missing"
  | "production_disabled"
  | "local_db_not_enabled"
  | "unsafe_database_name"
  | "remote_host_refused";

const dryRunDatabasePrefixes = [
  "fuyi_payment_notification_route_dry_run_",
  "fuyi_payment_notification_inbox_dry_run_",
];

const localHosts = new Set(["127.0.0.1", "localhost"]);

const createSafeError = (code: string, reason?: string): Error => {
  return Object.assign(new Error(code), {
    code,
    ...(reason ? { reason } : {}),
  });
};

const refuse = (reason: LocalDbRefusalReason): never => {
  throw createSafeError("LOCAL_DB_CLIENT_REFUSED", reason);
};

const mapDbErrorCode = (error: unknown): string => {
  const code =
    error && typeof error === "object" && "code" in error
      ? String((error as { code?: unknown }).code)
      : "";
  const message = error instanceof Error ? error.message : String(error);

  if (code === "23505" || code === "DB_UNIQUE_CONFLICT") {
    return "DB_UNIQUE_CONFLICT";
  }

  if (code === "40P01" || code === "55P03") {
    return "DB_LOCK_TIMEOUT";
  }

  if (
    code === "08006" ||
    message.includes("ECONNRESET") ||
    message.includes("ETIMEDOUT")
  ) {
    return "DB_CONNECTION_INTERRUPTED";
  }

  return "DB_UNKNOWN_ERROR";
};

const mapDbError = (error: unknown): Error =>
  createSafeError(mapDbErrorCode(error));

const databaseNameFromUrl = (databaseUrl: string): string => {
  try {
    const parsed = new URL(databaseUrl);

    return decodeURIComponent(parsed.pathname.replace(/^\//, ""));
  } catch {
    return "";
  }
};

const hostFromUrl = (databaseUrl: string): string => {
  try {
    return new URL(databaseUrl).hostname;
  } catch {
    return "";
  }
};

const assertLocalDbInput = (
  input: LocalPaymentNotificationPostgresClientInput,
): string => {
  if (input.nodeEnv === "production") {
    refuse("production_disabled");
  }

  if (!input.localDbEnabled) {
    refuse("local_db_not_enabled");
  }

  const databaseUrl = input.databaseUrl;

  if (!databaseUrl) {
    refuse("database_url_missing");
  }

  const safeDatabaseUrl = databaseUrl as string;
  const databaseName = input.databaseName ?? databaseNameFromUrl(safeDatabaseUrl);

  if (
    !dryRunDatabasePrefixes.some((prefix) => databaseName.startsWith(prefix))
  ) {
    refuse("unsafe_database_name");
  }

  const host = hostFromUrl(safeDatabaseUrl);

  if (!localHosts.has(host)) {
    refuse("remote_host_refused");
  }

  return safeDatabaseUrl;
};

const mapInboxRowFromDb = (
  row: Record<string, unknown>,
): PaymentNotificationDbInboxRow => ({
  id: String(row.id),
  provider: String(row.provider),
  eventId: row.event_id ? String(row.event_id) : null,
  eventType: String(row.event_type),
  idempotencyKey: String(row.idempotency_key),
  merchantOrderRef: String(row.merchant_order_ref),
  paymentSessionId: row.payment_session_id
    ? String(row.payment_session_id)
    : null,
  providerTransactionId: row.provider_transaction_id
    ? String(row.provider_transaction_id)
    : null,
  providerRefundId: row.provider_refund_id
    ? String(row.provider_refund_id)
    : null,
  amountValue: Number(row.amount_value),
  currency: "CNY",
  signatureStatus: String(row.signature_status),
  rawPayloadDigest: String(row.raw_payload_digest),
  processingStatus: String(
    row.processing_status,
  ) as PaymentNotificationDbInboxRow["processingStatus"],
  retryCount: Number(row.retry_count ?? 0),
  lastErrorCode: row.last_error_code
    ? String(row.last_error_code)
    : undefined,
  lastErrorMessage: row.last_error_message
    ? String(row.last_error_message)
    : undefined,
  occurredAt: row.occurred_at ? String(row.occurred_at) : undefined,
  receivedAt: String(row.received_at),
  processedAt: row.processed_at ? String(row.processed_at) : undefined,
  createdAt: String(row.created_at),
  updatedAt: String(row.updated_at),
});

const safeEventMetadata = (
  metadata: Record<string, unknown>,
): Record<string, unknown> => {
  const allowed = new Set([
    "idempotencyKey",
    "provider",
    "eventId",
    "signatureStatus",
    "processingStatus",
    "errorCode",
    "retryCount",
  ]);

  return Object.fromEntries(
    Object.entries(metadata).filter(([key, value]) => {
      if (!allowed.has(key)) {
        return false;
      }

      return (
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean" ||
        value === null
      );
    }),
  );
};

const createTransaction = (
  connection: LocalPostgresConnection,
): PaymentNotificationDbTransaction => ({
  insertInbox: async (row) => {
    const existing = await connection
      .query(
        `
          select id
          from payment_notification_inbox
          where provider = $1 and idempotency_key = $2
          limit 1
        `,
        [row.provider, row.idempotencyKey],
      )
      .catch((error) => {
        throw mapDbError(error);
      });

    if (existing.rows.length > 0) {
      throw createSafeError("DB_UNIQUE_CONFLICT");
    }

    const insertResult = await connection
      .query(
        `
          insert into payment_notification_inbox (
            id, provider, event_id, event_type, idempotency_key,
            merchant_order_ref, payment_session_id, provider_transaction_id,
            provider_refund_id, amount_value, currency, signature_status,
            raw_payload_digest, processing_status, retry_count,
            last_error_code, last_error_message, occurred_at, received_at,
            processed_at, created_at, updated_at
          )
          values (
            $1, $2, $3, $4, $5,
            $6, $7, $8,
            $9, $10, $11, $12,
            $13, $14, $15,
            $16, $17, $18, $19,
            $20, $21, $22
          )
          on conflict (provider, idempotency_key) do nothing
          returning id
        `,
        [
          row.id,
          row.provider,
          row.eventId,
          row.eventType,
          row.idempotencyKey,
          row.merchantOrderRef,
          row.paymentSessionId,
          row.providerTransactionId,
          row.providerRefundId,
          row.amountValue,
          row.currency,
          row.signatureStatus,
          row.rawPayloadDigest,
          row.processingStatus,
          row.retryCount,
          row.lastErrorCode,
          row.lastErrorMessage,
          row.occurredAt,
          row.receivedAt,
          row.processedAt,
          row.createdAt,
          row.updatedAt,
        ],
      )
      .catch((error) => {
        throw mapDbError(error);
      });

    if (insertResult.rowCount === 0) {
      throw createSafeError("DB_UNIQUE_CONFLICT");
    }
  },
  updateInbox: async (idempotencyKey, patch) => {
    const result = await connection
      .query(
        `
          update payment_notification_inbox
          set
            processing_status = coalesce($2, processing_status),
            retry_count = coalesce($3, retry_count),
            last_error_code = coalesce($4, last_error_code),
            last_error_message = coalesce($5, last_error_message),
            processed_at = coalesce($6, processed_at),
            updated_at = coalesce($7, updated_at)
          where idempotency_key = $1
          returning *
        `,
        [
          idempotencyKey,
          patch.processingStatus,
          patch.retryCount,
          patch.lastErrorCode,
          patch.lastErrorMessage,
          patch.processedAt,
          patch.updatedAt,
        ],
      )
      .catch((error) => {
        throw mapDbError(error);
      });

    if (result.rows.length === 0) {
      throw createSafeError("PAYMENT_NOTIFICATION_INBOX_RECORD_NOT_FOUND");
    }

    return mapInboxRowFromDb(result.rows[0]);
  },
  findInboxByIdempotencyKey: async (idempotencyKey) => {
    const result = await connection
      .query(
        `
          select *
          from payment_notification_inbox
          where idempotency_key = $1
          limit 1
        `,
        [idempotencyKey],
      )
      .catch((error) => {
        throw mapDbError(error);
      });

    return result.rows[0] ? mapInboxRowFromDb(result.rows[0]) : null;
  },
  insertEventLog: async (row) => {
    await connection
      .query(
        `
          insert into payment_notification_event_log (
            id, inbox_id, action, actor_type, message, metadata, created_at
          )
          values ($1, $2, $3, $4, $5, $6::jsonb, $7)
        `,
        [
          row.id,
          row.inboxId,
          row.action,
          row.actorType,
          row.message,
          JSON.stringify(safeEventMetadata(row.metadata)),
          row.createdAt,
        ],
      )
      .catch((error) => {
        throw mapDbError(error);
      });
  },
});

export const createLocalPaymentNotificationPostgresClient = (
  input: LocalPaymentNotificationPostgresClientInput,
): PaymentNotificationDbClient => {
  const databaseUrl = assertLocalDbInput(input);

  return {
    transaction: async (handler) => {
      const connection = await input.driver.connect(databaseUrl).catch((error) => {
        throw mapDbError(error);
      });

      try {
        await connection.query("begin").catch((error) => {
          throw mapDbError(error);
        });
        const result = await handler(createTransaction(connection));
        await connection.query("commit").catch((error) => {
          throw mapDbError(error);
        });

        return result;
      } catch (error) {
        await connection.query("rollback").catch(() => undefined);

        throw error;
      } finally {
        await connection.release();
      }
    },
  };
};
