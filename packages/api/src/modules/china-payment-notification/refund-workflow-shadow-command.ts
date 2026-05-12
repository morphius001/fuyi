import {
  RefundStateOwnerHandoffDecision,
  RefundStateOwnerHandoffDecisionType,
} from "./refund-state-owner-handoff";

export type RefundWorkflowShadowCommandSource =
  | "provider_inbox"
  | "manual_review"
  | "reconciliation";

export type RefundWorkflowShadowCommandDecisionType =
  | "shadow_command_recorded"
  | "manual_review_audit_recorded"
  | "query_follow_up_required"
  | "reconciliation_required"
  | "blocked";

export type RefundWorkflowShadowCommandAuditAction =
  | "refund_workflow_shadow_command_prepared"
  | "refund_manual_review_required"
  | "refund_query_follow_up_required"
  | "refund_reconciliation_required"
  | "refund_workflow_shadow_blocked";

export type RefundWorkflowShadowCommandInput = {
  handoffDecision: RefundStateOwnerHandoffDecision;
  requestedAt: string;
  source: RefundWorkflowShadowCommandSource;
  auditContext: {
    inboxRecordId: string;
    provider: "wechat_pay" | "alipay" | "mock_china_pay";
    providerEventId?: string;
    providerRefundId?: string;
    localRefundCommandKey?: string;
    actorType: "system_job" | "admin" | "vendor";
    actorId?: string;
    amountMinor?: number;
    currency?: "CNY";
    metadata?: Record<string, unknown>;
  };
};

export type RefundWorkflowShadowCommandDecision = {
  decision: RefundWorkflowShadowCommandDecisionType;
  executable: false;
  workflowExecutionAllowed: false;
  runtimeMutationBlocked: true;
  refundSuccessState: false;
  idempotencyKey: string;
  command?: {
    commandType: "refund_workflow_shadow";
    workflowName: "refund_payment";
    shadowOnly: true;
    provider: string;
    inboxRecordId: string;
    providerRefundId?: string;
    localRefundCommandKey?: string;
    amountMinor?: number;
    currency?: "CNY";
  };
  auditEvent: {
    action: RefundWorkflowShadowCommandAuditAction;
    metadata: Record<string, unknown>;
  };
};

const deniedMetadataKeys = new Set([
  "rawProviderPayload",
  "rawPayload",
  "signature",
  "secret",
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

const decisionMap: Record<
  RefundStateOwnerHandoffDecisionType,
  {
    decision: RefundWorkflowShadowCommandDecisionType;
    action: RefundWorkflowShadowCommandAuditAction;
  }
> = {
  shadow_command_prepared: {
    decision: "shadow_command_recorded",
    action: "refund_workflow_shadow_command_prepared",
  },
  manual_review_required: {
    decision: "manual_review_audit_recorded",
    action: "refund_manual_review_required",
  },
  query_required: {
    decision: "query_follow_up_required",
    action: "refund_query_follow_up_required",
  },
  reconciliation_required: {
    decision: "reconciliation_required",
    action: "refund_reconciliation_required",
  },
  blocked: {
    decision: "blocked",
    action: "refund_workflow_shadow_blocked",
  },
};

const stableShadowIdempotencyKey = (
  input: RefundWorkflowShadowCommandInput,
): string =>
  [
    "refund_workflow_shadow",
    input.handoffDecision.idempotencyKey,
    input.handoffDecision.decision,
    input.source,
    input.auditContext.providerRefundId ?? "no_provider_refund_id",
  ]
    .join(":")
    .replace(/[^a-zA-Z0-9:_-]+/g, "_");

const baseDecision = (
  input: RefundWorkflowShadowCommandInput,
): Omit<RefundWorkflowShadowCommandDecision, "command"> => {
  const mapped = decisionMap[input.handoffDecision.decision];

  return {
    decision: mapped.decision,
    executable: false,
    workflowExecutionAllowed: false,
    runtimeMutationBlocked: true,
    refundSuccessState: false,
    idempotencyKey: stableShadowIdempotencyKey(input),
    auditEvent: {
      action: mapped.action,
      metadata: {
        inboxRecordId: input.auditContext.inboxRecordId,
        provider: input.auditContext.provider,
        providerEventId: input.auditContext.providerEventId,
        providerRefundId: input.auditContext.providerRefundId,
        localRefundCommandKey: input.auditContext.localRefundCommandKey,
        actorType: input.auditContext.actorType,
        actorId: input.auditContext.actorId,
        amountMinor: input.auditContext.amountMinor,
        currency: input.auditContext.currency,
        source: input.source,
        requestedAt: input.requestedAt,
        handoffDecision: input.handoffDecision.decision,
        handoffBlockCodes: input.handoffDecision.blockCodes,
        ...sanitizeMetadata(input.auditContext.metadata),
      },
    },
  };
};

export const mapRefundHandoffToWorkflowShadowCommand = (
  input: RefundWorkflowShadowCommandInput,
): RefundWorkflowShadowCommandDecision => {
  const base = baseDecision(input);

  if (
    input.handoffDecision.decision !== "shadow_command_prepared" ||
    !input.handoffDecision.shadowCommand
  ) {
    return base;
  }

  return {
    ...base,
    command: {
      commandType: "refund_workflow_shadow",
      workflowName: "refund_payment",
      shadowOnly: true,
      provider: input.handoffDecision.shadowCommand.provider,
      inboxRecordId: input.handoffDecision.shadowCommand.inboxRecordId,
      providerRefundId: input.handoffDecision.shadowCommand.providerRefundId,
      localRefundCommandKey:
        input.handoffDecision.shadowCommand.localRefundCommandKey,
      amountMinor: input.handoffDecision.shadowCommand.amountMinor,
      currency: input.handoffDecision.shadowCommand.currency,
    },
  };
};
