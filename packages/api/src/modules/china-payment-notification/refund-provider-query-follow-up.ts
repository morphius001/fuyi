export type RefundProviderQueryFollowUpProvider = "wechat_pay" | "alipay";

export type RefundProviderQueryFollowUpTrigger =
  | "missing_provider_refund_id"
  | "query_required_notification"
  | "delayed_provider_state"
  | "manual_review_follow_up"
  | "reconciliation_follow_up";

export type RefundProviderQueryFollowUpRequestedBy =
  | "system_job"
  | "operator_shadow"
  | "reconciliation_shadow";

export type RefundProviderQueryFollowUpDecisionType =
  | "query_follow_up_planned"
  | "manual_review_required"
  | "blocked";

export type RefundProviderQueryFollowUpBlockCode =
  | "SIGNATURE_NOT_VERIFIED"
  | "AMOUNT_MISMATCH"
  | "CURRENCY_MISMATCH"
  | "OWNERSHIP_CHECK_FAILED"
  | "PERMISSION_CHECK_FAILED"
  | "TERMINAL_STATE_CONFLICT"
  | "RUNTIME_MUTATION_REQUESTED"
  | "QUERY_KEY_MISSING"
  | "UNSUPPORTED_PROVIDER";

export type RefundProviderQueryFollowUpQueryKey = {
  providerRefundId?: string;
  outRefundNo?: string;
  outRequestNo?: string;
  tradeNo?: string;
  outTradeNo?: string;
};

export type RefundProviderQueryFollowUpInput = {
  provider: RefundProviderQueryFollowUpProvider;
  trigger: RefundProviderQueryFollowUpTrigger;
  requestedAt: string;
  requestedBy: RefundProviderQueryFollowUpRequestedBy;
  queryKey: RefundProviderQueryFollowUpQueryKey;
  expectedRefund: {
    localRefundCommandKey?: string;
    amountMinor?: number;
    currency?: "CNY";
    merchantOrderReference?: string;
    paymentProviderSessionId?: string;
    currentPlatformRefundState?:
      | "none"
      | "pending"
      | "review_required"
      | "shadow_prepared"
      | "succeeded"
      | "failed"
      | "canceled";
  };
  safetyChecks: {
    signatureVerified: boolean;
    amountMatches?: boolean;
    currencyMatches?: boolean;
    ownershipPassed: boolean;
    permissionPassed: boolean;
    terminalStateConflict?: boolean;
    runtimeMutationRequested?: boolean;
  };
  auditContext?: {
    sourceInboxId?: string;
    sourceAuditEventId?: string;
    providerEventId?: string;
    actorId?: string;
    merchantRef?: string;
    metadata?: Record<string, unknown>;
  };
};

export type RefundProviderQueryFollowUpAuditAction =
  | "provider_refund_query_follow_up_planned"
  | "provider_refund_query_follow_up_manual_review"
  | "provider_refund_query_follow_up_blocked";

export type RefundProviderQueryFollowUpDecision = {
  decision: RefundProviderQueryFollowUpDecisionType;
  executable: false;
  providerQueryAllowed: false;
  runtimeMutationBlocked: true;
  refundSuccessState: false;
  blockCodes: RefundProviderQueryFollowUpBlockCode[];
  idempotencyKey: string;
  queryCommand?: {
    commandType: "provider_refund_query_shadow";
    shadowOnly: true;
    provider: RefundProviderQueryFollowUpProvider;
    queryBy:
      | "providerRefundId"
      | "outRefundNo"
      | "outRequestNo"
      | "tradeNo"
      | "outTradeNo";
    queryKeyRef: string;
    localRefundCommandKey?: string;
    credentialProfileRef: "redacted";
    providerQueryAllowed: false;
  };
  auditEvent: {
    action: RefundProviderQueryFollowUpAuditAction;
    metadata: Record<string, unknown>;
  };
};

const terminalPlatformStates = new Set(["succeeded", "failed", "canceled"]);

const deniedMetadataKeys = new Set([
  "rawProviderPayload",
  "rawPayload",
  "signature",
  "secret",
  "privateKey",
  "certificate",
  "apiV3Key",
  "webhookSecret",
  "databaseUrl",
  "providerRefundRequest",
  "providerRefundQuery",
  "refundQuery",
  "workflowExecution",
  "executeWorkflow",
  "refundStateMutation",
  "settlementAdjustment",
  "commissionAdjustment",
  "payoutAdjustment",
  "fulfillmentMutation",
  "logisticsMutation",
  "fullPhone",
  "fullAddress",
  "identityNumber",
  "bankCardNumber",
].map((key) => key.toLowerCase().replace(/[^a-z0-9]/g, "")));

const normalizeMetadataKey = (key: string): string =>
  key.toLowerCase().replace(/[^a-z0-9]/g, "");

const sanitizeMetadataValue = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(sanitizeMetadataValue);
  }

  if (value && typeof value === "object") {
    return sanitizeMetadata(value as Record<string, unknown>);
  }

  return value;
};

const sanitizeMetadata = (
  metadata: Record<string, unknown> = {},
): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(metadata)
      .filter(([key]) => !deniedMetadataKeys.has(normalizeMetadataKey(key)))
      .map(([key, value]) => [key, sanitizeMetadataValue(value)]),
  );

const selectQueryKey = (
  provider: RefundProviderQueryFollowUpProvider,
  queryKey: RefundProviderQueryFollowUpQueryKey,
):
  | {
      queryBy: NonNullable<
        RefundProviderQueryFollowUpDecision["queryCommand"]
      >["queryBy"];
      queryKeyRef: string;
    }
  | undefined => {
  if (provider === "wechat_pay") {
    if (queryKey.providerRefundId) {
      return {
        queryBy: "providerRefundId",
        queryKeyRef: queryKey.providerRefundId,
      };
    }

    if (queryKey.outRefundNo) {
      return {
        queryBy: "outRefundNo",
        queryKeyRef: queryKey.outRefundNo,
      };
    }
  }

  if (provider === "alipay") {
    if (queryKey.outRequestNo) {
      return {
        queryBy: "outRequestNo",
        queryKeyRef: queryKey.outRequestNo,
      };
    }

    if (queryKey.tradeNo) {
      return {
        queryBy: "tradeNo",
        queryKeyRef: queryKey.tradeNo,
      };
    }

    if (queryKey.outTradeNo) {
      return {
        queryBy: "outTradeNo",
        queryKeyRef: queryKey.outTradeNo,
      };
    }
  }

  return undefined;
};

const buildIdempotencyKey = (
  input: RefundProviderQueryFollowUpInput,
  queryKeyRef: string,
): string =>
  [
    "provider_refund_query_follow_up",
    input.provider,
    input.trigger,
    input.expectedRefund.localRefundCommandKey ?? "no_local_refund_command",
    queryKeyRef,
  ]
    .join(":")
    .replace(/[^a-zA-Z0-9:_-]+/g, "_");

const baseMetadata = (
  input: RefundProviderQueryFollowUpInput,
  queryKeyRef: string,
) => ({
  provider: input.provider,
  trigger: input.trigger,
  requestedAt: input.requestedAt,
  requestedBy: input.requestedBy,
  queryKeyRef,
  localRefundCommandKey: input.expectedRefund.localRefundCommandKey,
  amountMinor: input.expectedRefund.amountMinor,
  currency: input.expectedRefund.currency,
  merchantOrderReference: input.expectedRefund.merchantOrderReference,
  paymentProviderSessionId: input.expectedRefund.paymentProviderSessionId,
  currentPlatformRefundState:
    input.expectedRefund.currentPlatformRefundState,
  sourceInboxId: input.auditContext?.sourceInboxId,
  sourceAuditEventId: input.auditContext?.sourceAuditEventId,
  providerEventId: input.auditContext?.providerEventId,
  actorId: input.auditContext?.actorId,
  merchantRef: input.auditContext?.merchantRef,
  ...sanitizeMetadata(input.auditContext?.metadata),
});

const decision = (
  input: RefundProviderQueryFollowUpInput,
  decisionType: RefundProviderQueryFollowUpDecisionType,
  blockCodes: RefundProviderQueryFollowUpBlockCode[],
  queryKeyRef: string,
): RefundProviderQueryFollowUpDecision => {
  const action: RefundProviderQueryFollowUpAuditAction =
    decisionType === "query_follow_up_planned"
      ? "provider_refund_query_follow_up_planned"
      : decisionType === "manual_review_required"
        ? "provider_refund_query_follow_up_manual_review"
        : "provider_refund_query_follow_up_blocked";

  return {
    decision: decisionType,
    executable: false,
    providerQueryAllowed: false,
    runtimeMutationBlocked: true,
    refundSuccessState: false,
    blockCodes,
    idempotencyKey: buildIdempotencyKey(input, queryKeyRef),
    auditEvent: {
      action,
      metadata: {
        ...baseMetadata(input, queryKeyRef),
        decision: decisionType,
        blockCodes,
      },
    },
  };
};

export const planRefundProviderQueryFollowUp = (
  input: RefundProviderQueryFollowUpInput,
): RefundProviderQueryFollowUpDecision => {
  const selectedQueryKey = selectQueryKey(input.provider, input.queryKey);
  const queryKeyRef = selectedQueryKey?.queryKeyRef ?? "missing_query_key";

  if (!input.safetyChecks.signatureVerified) {
    return decision(input, "blocked", ["SIGNATURE_NOT_VERIFIED"], queryKeyRef);
  }

  if (input.safetyChecks.amountMatches === false) {
    return decision(input, "blocked", ["AMOUNT_MISMATCH"], queryKeyRef);
  }

  if (input.safetyChecks.currencyMatches === false) {
    return decision(input, "blocked", ["CURRENCY_MISMATCH"], queryKeyRef);
  }

  if (!input.safetyChecks.ownershipPassed) {
    return decision(input, "blocked", ["OWNERSHIP_CHECK_FAILED"], queryKeyRef);
  }

  if (!input.safetyChecks.permissionPassed) {
    return decision(input, "blocked", ["PERMISSION_CHECK_FAILED"], queryKeyRef);
  }

  if (
    input.safetyChecks.terminalStateConflict ||
    (input.expectedRefund.currentPlatformRefundState &&
      terminalPlatformStates.has(input.expectedRefund.currentPlatformRefundState))
  ) {
    return decision(input, "manual_review_required", [
      "TERMINAL_STATE_CONFLICT",
    ], queryKeyRef);
  }

  if (input.safetyChecks.runtimeMutationRequested) {
    return decision(input, "blocked", [
      "RUNTIME_MUTATION_REQUESTED",
    ], queryKeyRef);
  }

  if (!selectedQueryKey) {
    return decision(input, "manual_review_required", [
      "QUERY_KEY_MISSING",
    ], queryKeyRef);
  }

  return {
    ...decision(input, "query_follow_up_planned", [], queryKeyRef),
    queryCommand: {
      commandType: "provider_refund_query_shadow",
      shadowOnly: true,
      provider: input.provider,
      queryBy: selectedQueryKey.queryBy,
      queryKeyRef: selectedQueryKey.queryKeyRef,
      localRefundCommandKey: input.expectedRefund.localRefundCommandKey,
      credentialProfileRef: "redacted",
      providerQueryAllowed: false,
    },
  };
};
