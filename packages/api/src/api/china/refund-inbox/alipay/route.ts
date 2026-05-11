import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

import {
  AlipayRefundNotifyMode,
  buildRefundProviderInboxRouteSafeResponse,
  InMemoryRefundProviderInboxRouteRepository,
  normalizeAlipayRefundProviderInboxRouteResult,
  parseRefundProviderInboxRouteConfig,
  RefundInboxRepositoryContract,
  verifyAlipayRefundNotificationContract,
} from "../../../../modules/china-payment-notification";
import { resolveRefundProviderLocalDbRepository } from "../provider-local-db";

const repository = new InMemoryRefundProviderInboxRouteRepository();

const methodNotAllowedBody = () => ({
  status: "disabled",
  surface: "refund_provider_inbox",
  provider: "alipay",
  runtime: "method_not_allowed",
  runtimeMutationBlocked: true,
  stateMutationBlocked: true,
  allowedMethods: ["POST"],
});

export const POST = async (_req: MedusaRequest, res: MedusaResponse) => {
  const decision = parseRefundProviderInboxRouteConfig(process.env, "alipay");

  if (!decision.enabled) {
    return res.status(503).json(
      buildRefundProviderInboxRouteSafeResponse({
        status: "disabled",
        provider: "alipay",
        mode: decision.mode,
        code: decision.code,
        reason: decision.reason,
      }),
    );
  }

  const inboxRepository =
    decision.storage === "local_disposable_db"
      ? await resolveRefundProviderLocalDbRepository(_req)
      : repository;

  if (!inboxRepository) {
    return res.status(503).json(
      buildRefundProviderInboxRouteSafeResponse({
        status: "disabled",
        provider: "alipay",
        mode: decision.mode,
        code: "REFUND_PROVIDER_ROUTE_LOCAL_DB_UNAVAILABLE",
        reason:
          "Alipay refund provider inbox route requires an actual local disposable DB connection.",
      }),
    );
  }

  const fixture = parseAlipayFixtureConfig(process.env);

  if (!fixture) {
    return res.status(503).json(
      buildRefundProviderInboxRouteSafeResponse({
        status: "disabled",
        provider: "alipay",
        mode: decision.mode,
        code: "ALIPAY_REFUND_FIXTURE_CONFIG_MISSING",
        reason: "Alipay refund route local wiring requires fake fixture config.",
      }),
    );
  }

  const form = await readForm(_req);

  if (!form) {
    return res.status(400).json(
      buildRefundProviderInboxRouteSafeResponse({
        status: "rejected",
        provider: "alipay",
        mode: decision.mode,
        code: "ALIPAY_REFUND_BODY_INVALID",
        reason: "Alipay refund notification body is invalid.",
      }),
    );
  }

  const verification = verifyAlipayRefundNotificationContract({
    rawNotification: {
      form,
      headers: buildHeadersRecord(_req.headers),
      receivedAt: new Date().toISOString(),
    },
    expectedAppId: fixture.expectedAppId,
    expectedSellerId: fixture.expectedSellerId,
    expectedOutTradeNo: fixture.expectedOutTradeNo,
    expectedTradeNo: fixture.expectedTradeNo,
    expectedOutRequestNo: fixture.expectedOutRequestNo,
    expectedAmountValue: fixture.expectedAmountValue,
    expectedCurrency: "CNY",
    expectedFakeSignature: fixture.expectedSignature,
    refundNotifyMode: fixture.refundNotifyMode,
  });
  const normalized = normalizeAlipayRefundProviderInboxRouteResult(verification);

  return handleNormalizedDecision(
    normalized,
    decision.mode,
    inboxRepository,
    decision.storage,
    res,
  );
};

export const GET = async (_req: MedusaRequest, res: MedusaResponse) =>
  res.status(405).json(methodNotAllowedBody());

const buildHeadersRecord = (
  headers: MedusaRequest["headers"],
): Record<string, string | string[] | undefined> =>
  (headers ?? {}) as Record<string, string | string[] | undefined>;

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

const readForm = async (
  req: MedusaRequest,
): Promise<Record<string, string | undefined> | null> => {
  const body = (req as unknown as { body?: unknown }).body;

  if (body && typeof body === "object" && !Buffer.isBuffer(body)) {
    return Object.fromEntries(
      Object.entries(body as Record<string, unknown>).map(([key, value]) => [
        key,
        value === undefined ? undefined : String(value),
      ]),
    );
  }

  const rawBody = await readRawBody(req);

  if (!rawBody) {
    return null;
  }

  try {
    return Object.fromEntries(
      Object.entries(JSON.parse(rawBody) as Record<string, unknown>).map(
        ([key, value]) => [key, value === undefined ? undefined : String(value)],
      ),
    );
  } catch {
    return Object.fromEntries(new URLSearchParams(rawBody).entries());
  }
};

const parseAlipayFixtureConfig = (
  env: Record<string, string | undefined>,
):
  | {
      expectedSignature: string;
      expectedAppId: string;
      expectedSellerId?: string;
      expectedOutTradeNo?: string;
      expectedTradeNo?: string;
      expectedOutRequestNo?: string;
      expectedAmountValue?: number;
      refundNotifyMode: AlipayRefundNotifyMode;
    }
  | undefined => {
  if (
    !env.CHINA_REFUND_ALIPAY_FIXTURE_EXPECTED_SIGNATURE ||
    !env.CHINA_REFUND_ALIPAY_EXPECTED_APP_ID ||
    !env.CHINA_REFUND_ALIPAY_REFUND_NOTIFY_MODE
  ) {
    return undefined;
  }

  return {
    expectedSignature: env.CHINA_REFUND_ALIPAY_FIXTURE_EXPECTED_SIGNATURE,
    expectedAppId: env.CHINA_REFUND_ALIPAY_EXPECTED_APP_ID,
    expectedSellerId: env.CHINA_REFUND_ALIPAY_EXPECTED_SELLER_ID,
    expectedOutTradeNo: env.CHINA_REFUND_ALIPAY_EXPECTED_OUT_TRADE_NO,
    expectedTradeNo: env.CHINA_REFUND_ALIPAY_EXPECTED_TRADE_NO,
    expectedOutRequestNo: env.CHINA_REFUND_ALIPAY_EXPECTED_OUT_REQUEST_NO,
    expectedAmountValue: env.CHINA_REFUND_ALIPAY_EXPECTED_AMOUNT_VALUE
      ? Number(env.CHINA_REFUND_ALIPAY_EXPECTED_AMOUNT_VALUE)
      : undefined,
    refundNotifyMode: env.CHINA_REFUND_ALIPAY_REFUND_NOTIFY_MODE as AlipayRefundNotifyMode,
  };
};

const handleNormalizedDecision = async (
  normalized: ReturnType<typeof normalizeAlipayRefundProviderInboxRouteResult>,
  mode: string,
  inboxRepository: RefundInboxRepositoryContract,
  storage: "local_inmemory" | "local_disposable_db",
  res: MedusaResponse,
) => {
  if (!("envelope" in normalized)) {
    const httpStatus =
      normalized.status === "query_required" ||
      normalized.status === "processed_for_audit_only"
        ? 202
        : 400;

    return res.status(httpStatus).json(
      buildRefundProviderInboxRouteSafeResponse({
        status: normalized.status,
        provider: "alipay",
        mode,
        code: normalized.code,
        reason: normalized.reason,
      }),
    );
  }

  const receiveResult = await inboxRepository.receiveNotification({
    envelope: normalized.envelope,
    receivedAt: normalized.envelope.receivedAt,
    sanitizedMetadata: {
      provider: "alipay",
      storage,
      localWiring: storage === "local_inmemory",
      localDisposableDb: storage === "local_disposable_db",
    },
  });

  if (receiveResult.status === "duplicate_same_digest") {
    return res.status(200).json(
      buildRefundProviderInboxRouteSafeResponse({
        status: "duplicate",
        provider: "alipay",
        mode,
        record: receiveResult.record,
      }),
    );
  }

  if (receiveResult.status === "duplicate_digest_conflict") {
    await inboxRepository.markManualReviewRequired({
      idempotencyKey: receiveResult.record.idempotencyKey,
      reasonCodes: ["digest_conflict"],
      severity: "high",
    });

    return res.status(409).json(
      buildRefundProviderInboxRouteSafeResponse({
        status: "manual_review",
        provider: "alipay",
        mode,
        code: "DIGEST_CONFLICT",
        reason: "Refund notification digest conflict requires manual review.",
        record: receiveResult.record,
      }),
    );
  }

  await inboxRepository.markSignatureVerified(receiveResult.record.idempotencyKey);
  await inboxRepository.markNormalized(receiveResult.record.idempotencyKey);

  if (normalized.status === "manual_review") {
    const record = await inboxRepository.markManualReviewRequired({
      idempotencyKey: receiveResult.record.idempotencyKey,
      reasonCodes: ["provider_non_success_event"],
      severity: "high",
    });

    return res.status(409).json(
      buildRefundProviderInboxRouteSafeResponse({
        status: "manual_review",
        provider: "alipay",
        mode,
        reason: normalized.reason,
        record,
      }),
    );
  }

  const record = await inboxRepository.markRuntimeMutationBlocked({
    idempotencyKey: receiveResult.record.idempotencyKey,
    reason: "Provider inbox local wiring does not mutate refund state.",
  });

  return res.status(202).json(
    buildRefundProviderInboxRouteSafeResponse({
      status: "accepted",
      provider: "alipay",
      mode,
      reason: normalized.reason,
      record,
    }),
  );
};
