import knex from "knex";

import { GET } from "../../packages/api/src/api/admin/china/refund-review-query-surface/route";
import { PG_CONNECTION_SCOPE_KEY } from "../../packages/api/src/modules/china-payment-notification/pg-connection-scope-key";

const databaseUrl = process.argv[2];

if (!databaseUrl) {
  throw new Error("DATABASE_URL_REQUIRED");
}

const db = knex({
  client: "pg",
  connection: databaseUrl,
});

const originalEnv = { ...process.env };

const makeResponse = () => {
  const response = {
    statusCode: undefined as number | undefined,
    body: undefined as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
  };

  return response;
};

const assert = (condition: unknown, message: string) => {
  if (!condition) {
    throw new Error(message);
  }
};

try {
  process.env.CHINA_REFUND_REVIEW_QUERY_SURFACE_ENABLED = "true";
  process.env.CHINA_REFUND_REVIEW_QUERY_SURFACE_MODE =
    "isolated_preprod_repository";
  process.env.CHINA_REFUND_REVIEW_QUERY_SURFACE_TARGET_ENV = "isolated_preprod";
  process.env.APP_ENV = "staging";
  process.env.NODE_ENV = "test";

  const req = {
    query: {
      query_kind: "platform_refund_id",
      platform_refund_id: "refund_platform_001",
    },
    scope: {
      resolve(key: string) {
        if (key === PG_CONNECTION_SCOPE_KEY) {
          return db;
        }

        throw new Error(`UNRESOLVED_SCOPE_KEY:${key}`);
      },
    },
    async text() {
      throw new Error("route should not read body");
    },
  };

  const res = makeResponse();

  await GET(req as never, res as never);

  assert(res.statusCode === 200, `expected 200, got ${res.statusCode}`);

  const body = res.body as Record<string, unknown> | undefined;
  assert(body?.status === "resolved", `expected resolved body: ${JSON.stringify(body)}`);
  assert(
    body?.mode === "isolated_preprod_repository",
    `expected isolated_preprod_repository mode: ${JSON.stringify(body)}`,
  );

  const evidenceCounts = body?.evidenceCounts as
    | Record<string, unknown>
    | undefined;
  assert(
    evidenceCounts?.approvalRecords === 1 &&
      evidenceCounts?.auditRecords === 1 &&
      evidenceCounts?.runtimeAttemptRecords === 1 &&
      evidenceCounts?.terminalConflictSnapshots === 1,
    `unexpected evidence counts: ${JSON.stringify(evidenceCounts)}`,
  );

  const serialized = JSON.stringify(body);
  assert(
    !serialized.includes("reviewInput"),
    "route response leaked reviewInput",
  );
  assert(!serialized.includes("\"bundle\""), "route response leaked bundle");

  console.log("PASS refund review query surface repository route pg smoke");
} finally {
  process.env = originalEnv;
  await db.destroy();
}
