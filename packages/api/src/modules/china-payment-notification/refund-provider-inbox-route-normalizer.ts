import { AlipayRefundVerifierContractResult } from "./alipay-refund-notification-verifier";
import { ChinaPaymentNotificationEnvelope } from "./types";
import { WechatPayRefundVerifierContractResult } from "./wechat-pay-refund-notification-verifier";

export type RefundProviderInboxRouteDecisionStatus =
  | "accepted"
  | "manual_review"
  | "processed_for_audit_only"
  | "query_required"
  | "rejected";

export type RefundProviderInboxRouteNormalizationDecision =
  | {
      status: Exclude<
        RefundProviderInboxRouteDecisionStatus,
        "processed_for_audit_only" | "query_required" | "rejected"
      >;
      envelope: ChinaPaymentNotificationEnvelope;
      reason: string;
      fixtureOnly: true;
      executable: false;
    }
  | {
      status: "processed_for_audit_only" | "query_required" | "rejected";
      code: string;
      reason: string;
      fixtureOnly: true;
      executable: false;
    };

const rejected = (
  code: string,
  reason: string,
): RefundProviderInboxRouteNormalizationDecision => ({
  status: "rejected",
  code,
  reason,
  fixtureOnly: true,
  executable: false,
});

const auditOnly = (
  status: "processed_for_audit_only" | "query_required",
  code: string,
  reason: string,
): RefundProviderInboxRouteNormalizationDecision => ({
  status,
  code,
  reason,
  fixtureOnly: true,
  executable: false,
});

const hasEnvelopeCore = (result: {
  eventId?: string;
  idempotencyKey?: string;
  providerRefundId?: string;
  merchantOrderRef?: string;
  amountValue?: number;
  currency?: "CNY";
}) =>
  Boolean(
    result.eventId &&
      result.idempotencyKey &&
      result.providerRefundId &&
      result.merchantOrderRef &&
      result.amountValue &&
      result.currency === "CNY",
  );

export const normalizeWechatRefundProviderInboxRouteResult = (
  result: WechatPayRefundVerifierContractResult,
): RefundProviderInboxRouteNormalizationDecision => {
  if (result.signatureStatus !== "verified" || result.decryptStatus !== "decrypted") {
    return rejected(
      result.failureCode ?? "WECHAT_REFUND_VERIFICATION_FAILED",
      result.failureMessage ?? "WeChat Pay refund notification verification failed.",
    );
  }

  if (!hasEnvelopeCore(result)) {
    return rejected(
      result.failureCode ?? "WECHAT_REFUND_ENVELOPE_INCOMPLETE",
      result.failureMessage ?? "WeChat Pay refund notification envelope is incomplete.",
    );
  }

  const isSuccess = result.eventType === "refund.succeeded";
  const eventId = result.eventId;
  const providerRefundId = result.providerRefundId;
  const merchantOrderRef = result.merchantOrderRef;
  const amountValue = result.amountValue;
  const currency = result.currency;
  const idempotencyKey = result.idempotencyKey;

  if (
    !eventId ||
    !providerRefundId ||
    !merchantOrderRef ||
    !amountValue ||
    currency !== "CNY" ||
    !idempotencyKey
  ) {
    return rejected(
      "WECHAT_REFUND_ENVELOPE_INCOMPLETE",
      "WeChat Pay refund notification envelope is incomplete.",
    );
  }

  return {
    status: isSuccess ? "accepted" : "manual_review",
    envelope: {
      provider: "wechat_pay",
      eventId,
      eventType: isSuccess ? "refund.succeeded" : "refund.failed",
      providerTransactionId: result.providerTransactionId,
      providerRefundId,
      merchantOrderRef,
      amount: {
        value: amountValue,
        currency,
      },
      occurredAt: result.receivedAt,
      receivedAt: result.receivedAt,
      idempotencyKey,
      signature: {
        status: "verified",
        verifiedAt: result.receivedAt,
      },
      rawPayloadDigest: result.rawPayloadDigest,
      riskFlags: isSuccess ? [] : [`wechat_${result.eventType}`],
    },
    reason: isSuccess
      ? "WeChat Pay refund notification accepted for local inbox only."
      : "WeChat Pay non-success refund notification requires manual review.",
    fixtureOnly: true,
    executable: false,
  };
};

export const normalizeAlipayRefundProviderInboxRouteResult = (
  result: AlipayRefundVerifierContractResult,
): RefundProviderInboxRouteNormalizationDecision => {
  if (result.signatureStatus !== "verified") {
    return rejected(
      result.failureCode ?? "ALIPAY_REFUND_VERIFICATION_FAILED",
      result.failureMessage ?? "Alipay refund notification verification failed.",
    );
  }

  if (result.productModeStatus === "query_required") {
    return auditOnly(
      "query_required",
      result.failureCode ?? "ALIPAY_REFUND_QUERY_REQUIRED",
      "Alipay refund notification requires query follow-up, which remains disabled.",
    );
  }

  if (result.eventType === "trade.updated") {
    return auditOnly(
      "processed_for_audit_only",
      result.failureCode ?? "ALIPAY_REFUND_TRADE_ONLY",
      "Alipay trade-only notification is processed for audit only.",
    );
  }

  if (
    !result.notifyId ||
    !result.idempotencyKey ||
    !result.merchantRefundRequestRef ||
    !result.merchantOrderRef ||
    !result.amountValue ||
    result.currency !== "CNY"
  ) {
    return rejected(
      result.failureCode ?? "ALIPAY_REFUND_ENVELOPE_INCOMPLETE",
      result.failureMessage ?? "Alipay refund notification envelope is incomplete.",
    );
  }

  const isSuccess = result.eventType === "refund.succeeded";

  return {
    status: isSuccess ? "accepted" : "manual_review",
    envelope: {
      provider: "alipay",
      eventId: result.notifyId ?? result.idempotencyKey,
      eventType: isSuccess ? "refund.succeeded" : "refund.failed",
      providerTransactionId: result.tradeNo,
      providerRefundId: result.merchantRefundRequestRef,
      merchantOrderRef: result.merchantOrderRef,
      amount: {
        value: result.amountValue,
        currency: result.currency,
      },
      occurredAt: result.receivedAt,
      receivedAt: result.receivedAt,
      idempotencyKey: result.idempotencyKey,
      signature: {
        status: "verified",
        verifiedAt: result.receivedAt,
      },
      rawPayloadDigest: result.rawPayloadDigest,
      riskFlags: isSuccess ? [] : [`alipay_${result.eventType}`],
    },
    reason: isSuccess
      ? "Alipay refund notification accepted for local inbox only."
      : "Alipay non-success refund notification requires manual review.",
    fixtureOnly: true,
    executable: false,
  };
};
