import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

import {
  buildRefundProviderInboxRouteSafeResponse,
  InMemoryRefundProviderInboxRouteRepository,
  normalizeWechatRefundProviderInboxRouteResult,
  parseRefundProviderInboxRouteConfig,
  verifyWechatPayRefundNotificationContract,
  WechatPayRefundDecryptedResource,
} from "../../../../modules/china-payment-notification";

const repository = new InMemoryRefundProviderInboxRouteRepository();

const methodNotAllowedBody = () => ({
  status: "disabled",
  surface: "refund_provider_inbox",
  provider: "wechat_pay",
  runtime: "method_not_allowed",
  runtimeMutationBlocked: true,
  stateMutationBlocked: true,
  allowedMethods: ["POST"],
});

export const POST = async (_req: MedusaRequest, res: MedusaResponse) => {
  const decision = parseRefundProviderInboxRouteConfig(
    process.env,
    "wechat_pay",
  );

  if (!decision.enabled) {
    return res.status(503).json(
      buildRefundProviderInboxRouteSafeResponse({
        status: "disabled",
        provider: "wechat_pay",
        mode: decision.mode,
        code: decision.code,
        reason: decision.reason,
      }),
    );
  }

  const fixture = parseWechatFixtureConfig(process.env);

  if (!fixture) {
    return res.status(503).json(
      buildRefundProviderInboxRouteSafeResponse({
        status: "disabled",
        provider: "wechat_pay",
        mode: decision.mode,
        code: "WECHAT_REFUND_FIXTURE_CONFIG_MISSING",
        reason:
          "WeChat Pay refund route local wiring requires fake fixture config.",
      }),
    );
  }

  const rawBody = await readRawBody(_req);

  if (!rawBody) {
    return res.status(400).json(
      buildRefundProviderInboxRouteSafeResponse({
        status: "rejected",
        provider: "wechat_pay",
        mode: decision.mode,
        code: "WECHAT_REFUND_BODY_MISSING",
        reason: "WeChat Pay refund notification body is missing.",
      }),
    );
  }

  const verification = verifyWechatPayRefundNotificationContract({
    rawNotification: {
      rawBody,
      headers: buildHeadersRecord(_req.headers),
      receivedAt: new Date().toISOString(),
    },
    currentUnixSeconds: fixture.currentUnixSeconds,
    trustedPlatformCertificates: [
      {
        serial: fixture.platformSerial,
        publicKeyRef: "fixture_only_public_key",
      },
    ],
    expectedSignature: fixture.expectedSignature,
    expectedCiphertext: fixture.expectedCiphertext,
    decryptedResource: fixture.decryptedResource,
    expectedMchId: fixture.expectedMchId,
    expectedAppId: fixture.expectedAppId,
    expectedOutTradeNo: fixture.expectedOutTradeNo,
    expectedOutRefundNo: fixture.expectedOutRefundNo,
    expectedAmountValue: fixture.expectedAmountValue,
    expectedCurrency: "CNY",
  });
  const normalized = normalizeWechatRefundProviderInboxRouteResult(verification);

  return handleNormalizedDecision(normalized, decision.mode, res);
};

export const GET = async (_req: MedusaRequest, res: MedusaResponse) =>
  res.status(405).json(methodNotAllowedBody());

const buildHeadersRecord = (
  headers: MedusaRequest["headers"],
): Record<string, string | undefined> => {
  if (!headers) {
    return {};
  }

  const maybeHeaders = headers as unknown as Headers;

  if (typeof maybeHeaders.forEach === "function") {
    const result: Record<string, string> = {};
    maybeHeaders.forEach((value, key) => {
      result[key.toLowerCase()] = value;
    });

    return result;
  }

  return Object.fromEntries(
    Object.entries(headers as Record<string, string | string[] | undefined>).map(
      ([key, value]) => [key.toLowerCase(), Array.isArray(value) ? value[0] : value],
    ),
  );
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

const parseWechatFixtureConfig = (
  env: Record<string, string | undefined>,
):
  | {
      currentUnixSeconds: number;
      expectedSignature: string;
      expectedCiphertext: string;
      platformSerial: string;
      decryptedResource: WechatPayRefundDecryptedResource;
      expectedMchId: string;
      expectedAppId?: string;
      expectedOutTradeNo?: string;
      expectedOutRefundNo?: string;
      expectedAmountValue?: number;
    }
  | undefined => {
  const decryptedResourceJson =
    env.CHINA_REFUND_WECHAT_FIXTURE_DECRYPTED_RESOURCE_JSON;

  if (
    !env.CHINA_REFUND_WECHAT_FIXTURE_EXPECTED_SIGNATURE ||
    !env.CHINA_REFUND_WECHAT_FIXTURE_EXPECTED_CIPHERTEXT ||
    !env.CHINA_REFUND_WECHAT_FIXTURE_PLATFORM_SERIAL ||
    !env.CHINA_REFUND_WECHAT_EXPECTED_MCH_ID ||
    !decryptedResourceJson
  ) {
    return undefined;
  }

  try {
    return {
      currentUnixSeconds: Number(
        env.CHINA_REFUND_WECHAT_FIXTURE_CURRENT_UNIX_SECONDS ?? Date.now() / 1000,
      ),
      expectedSignature: env.CHINA_REFUND_WECHAT_FIXTURE_EXPECTED_SIGNATURE,
      expectedCiphertext: env.CHINA_REFUND_WECHAT_FIXTURE_EXPECTED_CIPHERTEXT,
      platformSerial: env.CHINA_REFUND_WECHAT_FIXTURE_PLATFORM_SERIAL,
      decryptedResource: JSON.parse(
        decryptedResourceJson,
      ) as WechatPayRefundDecryptedResource,
      expectedMchId: env.CHINA_REFUND_WECHAT_EXPECTED_MCH_ID,
      expectedAppId: env.CHINA_REFUND_WECHAT_EXPECTED_APP_ID,
      expectedOutTradeNo: env.CHINA_REFUND_WECHAT_EXPECTED_OUT_TRADE_NO,
      expectedOutRefundNo: env.CHINA_REFUND_WECHAT_EXPECTED_OUT_REFUND_NO,
      expectedAmountValue: env.CHINA_REFUND_WECHAT_EXPECTED_AMOUNT_VALUE
        ? Number(env.CHINA_REFUND_WECHAT_EXPECTED_AMOUNT_VALUE)
        : undefined,
    };
  } catch {
    return undefined;
  }
};

const handleNormalizedDecision = async (
  normalized: ReturnType<typeof normalizeWechatRefundProviderInboxRouteResult>,
  mode: string,
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
        provider: "wechat_pay",
        mode,
        code: normalized.code,
        reason: normalized.reason,
      }),
    );
  }

  const receiveResult = await repository.receiveNotification({
    envelope: normalized.envelope,
    receivedAt: normalized.envelope.receivedAt,
    sanitizedMetadata: {
      provider: "wechat_pay",
      localWiring: true,
    },
  });

  if (receiveResult.status === "duplicate_same_digest") {
    return res.status(200).json(
      buildRefundProviderInboxRouteSafeResponse({
        status: "duplicate",
        provider: "wechat_pay",
        mode,
        record: receiveResult.record,
      }),
    );
  }

  if (receiveResult.status === "duplicate_digest_conflict") {
    await repository.markManualReviewRequired({
      idempotencyKey: receiveResult.record.idempotencyKey,
      reasonCodes: ["digest_conflict"],
      severity: "high",
    });

    return res.status(409).json(
      buildRefundProviderInboxRouteSafeResponse({
        status: "manual_review",
        provider: "wechat_pay",
        mode,
        code: "DIGEST_CONFLICT",
        reason: "Refund notification digest conflict requires manual review.",
        record: receiveResult.record,
      }),
    );
  }

  await repository.markSignatureVerified(receiveResult.record.idempotencyKey);
  await repository.markNormalized(receiveResult.record.idempotencyKey);

  if (normalized.status === "manual_review") {
    const record = await repository.markManualReviewRequired({
      idempotencyKey: receiveResult.record.idempotencyKey,
      reasonCodes: ["provider_non_success_event"],
      severity: "high",
    });

    return res.status(409).json(
      buildRefundProviderInboxRouteSafeResponse({
        status: "manual_review",
        provider: "wechat_pay",
        mode,
        reason: normalized.reason,
        record,
      }),
    );
  }

  const record = await repository.markRuntimeMutationBlocked({
    idempotencyKey: receiveResult.record.idempotencyKey,
    reason: "Provider inbox local wiring does not mutate refund state.",
  });

  return res.status(202).json(
    buildRefundProviderInboxRouteSafeResponse({
      status: "accepted",
      provider: "wechat_pay",
      mode,
      reason: normalized.reason,
      record,
    }),
  );
};
