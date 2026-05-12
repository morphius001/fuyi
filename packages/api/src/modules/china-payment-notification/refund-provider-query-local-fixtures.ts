import { digestRawPayload } from "./idempotency";
import {
  RefundProviderQueryReconciliationInput,
  RefundProviderQuerySnapshot,
} from "./refund-provider-query-reconciliation";

export type RefundProviderQueryLocalFixtureName =
  | "wechat_pay_query_success_snapshot"
  | "alipay_query_processing_snapshot"
  | "alipay_query_mismatch_snapshot";

export type RefundProviderQueryLocalFixture = {
  name: RefundProviderQueryLocalFixtureName;
  fixtureOnly: true;
  executable: false;
  networkRequestAllowed: false;
  providerQueryAllowed: false;
  runtimeMutationBlocked: true;
  refundSuccessState: false;
  snapshot: RefundProviderQuerySnapshot;
  expectedRefund: RefundProviderQueryReconciliationInput["expectedRefund"];
  expectedReconciliationDecision:
    | "ready_for_manual_review"
    | "mismatch_requires_review"
    | "provider_still_processing";
};

const buildSnapshotDigest = (snapshot: RefundProviderQuerySnapshot): string =>
  digestRawPayload(
    JSON.stringify({
      provider: snapshot.provider,
      queryFollowUpId: snapshot.queryFollowUpId,
      providerRefundId: snapshot.providerRefundId,
      localRefundCommandKey: snapshot.localRefundCommandKey,
      merchantOrderReference: snapshot.merchantOrderReference,
      paymentProviderSessionId: snapshot.paymentProviderSessionId,
      providerRefundState: snapshot.providerRefundState,
      amount: snapshot.amount,
      queriedAt: snapshot.queriedAt,
    }),
  );

const buildFixture = (
  name: RefundProviderQueryLocalFixtureName,
  snapshot: Omit<RefundProviderQuerySnapshot, "rawPayloadDigest">,
  expectedRefund: RefundProviderQueryLocalFixture["expectedRefund"],
  expectedReconciliationDecision:
    RefundProviderQueryLocalFixture["expectedReconciliationDecision"],
): RefundProviderQueryLocalFixture => ({
  name,
  fixtureOnly: true,
  executable: false,
  networkRequestAllowed: false,
  providerQueryAllowed: false,
  runtimeMutationBlocked: true,
  refundSuccessState: false,
  snapshot: {
    ...snapshot,
    rawPayloadDigest: buildSnapshotDigest(snapshot),
  },
  expectedRefund,
  expectedReconciliationDecision,
});

const baseExpectedRefund = {
  localRefundCommandKey: "refund_cmd_query_fixture_001",
  providerRefundId: "refund_provider_query_fixture_001",
  merchantOrderReference: "pay_order_query_fixture_001",
  paymentProviderSessionId: "payses_query_fixture_001",
  amountMinor: 128560,
  currency: "CNY" as const,
  currentPlatformRefundState: "pending" as const,
};

const baseSnapshot = {
  source: "provider_query_snapshot" as const,
  queryFollowUpId: "rqf_query_fixture_001",
  providerRefundId: "refund_provider_query_fixture_001",
  localRefundCommandKey: "refund_cmd_query_fixture_001",
  merchantOrderReference: "pay_order_query_fixture_001",
  paymentProviderSessionId: "payses_query_fixture_001",
  amount: {
    value: 128560,
    currency: "CNY" as const,
  },
  queriedAt: "2026-05-12T00:45:00.000Z",
  redactionApplied: true,
  providerQueryAllowed: false,
  runtimeMutationBlocked: true,
  refundSuccessState: false,
  metadata: {
    fixture: "redacted_provider_query_snapshot",
    rawPayloadDigestOnly: true,
  },
};

export const wechatPayQuerySuccessSnapshotFixture = buildFixture(
  "wechat_pay_query_success_snapshot",
  {
    ...baseSnapshot,
    provider: "wechat_pay",
    providerRefundState: "succeeded",
  },
  baseExpectedRefund,
  "ready_for_manual_review",
);

export const alipayQueryProcessingSnapshotFixture = buildFixture(
  "alipay_query_processing_snapshot",
  {
    ...baseSnapshot,
    provider: "alipay",
    queryFollowUpId: "rqf_query_fixture_alipay_processing_001",
    providerRefundId: "refund_provider_query_alipay_processing_001",
    localRefundCommandKey: "refund_cmd_query_alipay_processing_001",
    providerRefundState: "processing",
  },
  {
    ...baseExpectedRefund,
    localRefundCommandKey: "refund_cmd_query_alipay_processing_001",
    providerRefundId: "refund_provider_query_alipay_processing_001",
  },
  "provider_still_processing",
);

export const alipayQueryMismatchSnapshotFixture = buildFixture(
  "alipay_query_mismatch_snapshot",
  {
    ...baseSnapshot,
    provider: "alipay",
    queryFollowUpId: "rqf_query_fixture_alipay_mismatch_001",
    providerRefundId: "refund_provider_query_alipay_mismatch_001",
    localRefundCommandKey: "refund_cmd_query_alipay_mismatch_001",
    providerRefundState: "succeeded",
    amount: {
      value: 128500,
      currency: "CNY",
    },
  },
  {
    ...baseExpectedRefund,
    localRefundCommandKey: "refund_cmd_query_alipay_mismatch_001",
    providerRefundId: "refund_provider_query_alipay_mismatch_001",
  },
  "mismatch_requires_review",
);

export const refundProviderQueryLocalFixtures = [
  wechatPayQuerySuccessSnapshotFixture,
  alipayQueryProcessingSnapshotFixture,
  alipayQueryMismatchSnapshotFixture,
] as const;
