import { RefundInboxRecord } from "./refund-inbox-repository-contract";
import {
  RefundProviderInboxRouteConfigDecision,
  RefundProviderInboxRouteProvider,
} from "./refund-provider-inbox-route-config";

export type RefundProviderInboxRouteResponseStatus =
  | "disabled"
  | "accepted"
  | "duplicate"
  | "manual_review"
  | "processed_for_audit_only"
  | "query_required"
  | "rejected"
  | "retryable_error";

export type RefundProviderInboxRouteSafeResponseInput = {
  status: RefundProviderInboxRouteResponseStatus;
  provider: RefundProviderInboxRouteProvider;
  mode?: string;
  code?: string;
  reason?: string;
  record?: RefundInboxRecord;
  metadata?: Record<string, unknown>;
};

const deniedKeyFragments = [
  "rawbody",
  "rawpayload",
  "rawproviderpayload",
  "signature",
  "sign",
  "nonce",
  "serial",
  "secret",
  "privatekey",
  "apiv3key",
  "certificate",
  "publickey",
  "webhooktoken",
  "databaseurl",
  "dburl",
  "providerrefundrequest",
  "providerrefundquery",
  "workflowcommand",
  "workflowexecution",
  "refundstatemutation",
  "fullphone",
  "identitynumber",
  "bankcardnumber",
  "fulladdress",
  "settlement",
  "commission",
  "payout",
  "fulfillment",
  "logistics",
];

const normalizeKey = (key: string): string =>
  key.toLowerCase().replace(/[^a-z0-9]/g, "");

const isDeniedKey = (key: string): boolean => {
  const normalized = normalizeKey(key);

  return deniedKeyFragments.some((fragment) => normalized.includes(fragment));
};

const deniedValuePatterns = [
  /postgres(?:ql)?:\/\//i,
  /BEGIN .*PRIVATE KEY/i,
  /PRIVATE KEY/i,
  /APIv3/i,
  /webhook[_-]?token/i,
  /secret/i,
  /signature/i,
  /rawProviderPayload/i,
  /rawPayload/i,
  /providerRefundRequest/i,
  /providerRefundQuery/i,
  /workflowCommand/i,
  /workflowExecution/i,
  /refundStateMutation/i,
  /settlement[_-]?adjust/i,
  /commission[_-]?adjust/i,
  /payout[_-]?adjust/i,
  /fulfillment/i,
  /logistics/i,
  /\b1[3-9]\d{9}\b/,
  /\b\d{15,19}\b/,
  /(?:省|市|区|县|街道|道路|小区|号楼|单元|室)/,
];

const sanitizeRefundProviderInboxRouteValue = (value: unknown): unknown => {
  if (typeof value === "string") {
    return deniedValuePatterns.some((pattern) => pattern.test(value))
      ? "[redacted]"
      : value;
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeRefundProviderInboxRouteValue);
  }

  if (value && typeof value === "object") {
    return redactRefundProviderInboxRouteMetadata(
      value as Record<string, unknown>,
    );
  }

  return value;
};

export const redactRefundProviderInboxRouteMetadata = (
  metadata: Record<string, unknown> = {},
): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(metadata)
      .filter(([key]) => !isDeniedKey(key))
      .map(([key, value]) => [
        key,
        sanitizeRefundProviderInboxRouteValue(value),
      ]),
  );

const safeRecord = (record?: RefundInboxRecord) =>
  record
    ? {
        id: record.id,
        provider: record.provider,
        eventId: record.eventId,
        eventType: record.eventType,
        idempotencyKey: record.idempotencyKey,
        providerRefundId: record.providerRefundId,
        processingStatus: record.processingStatus,
      }
    : undefined;

export const buildRefundProviderInboxRouteSafeResponse = (
  input: RefundProviderInboxRouteSafeResponseInput,
) => ({
  status: input.status,
  surface: "refund_provider_inbox",
  provider: input.provider,
  mode: input.mode,
  code: input.code,
  reason: input.reason,
  runtimeMutationBlocked: true,
  stateMutationBlocked: true,
  refundSuccessState: false,
  successMeans: "inbox_or_audit_only",
  record: safeRecord(input.record),
  metadata: input.metadata
    ? redactRefundProviderInboxRouteMetadata(input.metadata)
    : undefined,
});

export const buildRefundProviderInboxRouteDisabledResponse = (
  decision: RefundProviderInboxRouteConfigDecision,
) =>
  buildRefundProviderInboxRouteSafeResponse({
    status: "disabled",
    provider: decision.provider,
    mode: decision.mode,
    code: decision.enabled ? undefined : decision.code,
    reason: decision.enabled
      ? "Refund provider inbox route is enabled."
      : decision.reason,
  });
