import {
  RefundStateMutationReadinessDecision,
  RefundStateMutationReadinessDecisionType,
} from "./refund-state-mutation-readiness";

export type RefundStateMutationShadowCommandDecisionType =
  | "state_shadow_command_recorded"
  | "manual_review_audit_recorded"
  | "reconciliation_audit_recorded"
  | "state_shadow_command_blocked";

export type RefundStateMutationShadowTargetState =
  | "succeeded_shadow_reviewed"
  | "failed_shadow_reviewed"
  | "manual_review_shadow";

export type RefundStateMutationShadowCommandInput = {
  readinessDecision: RefundStateMutationReadinessDecision;
  requestedAt: string;
  auditContext: {
    actorType: "system_job" | "admin" | "vendor";
    actorId?: string;
    targetState?: RefundStateMutationShadowTargetState;
    metadata?: Record<string, unknown>;
  };
};

export type RefundStateMutationShadowCommandDecision = {
  decision: RefundStateMutationShadowCommandDecisionType;
  executable: false;
  workflowExecutionAllowed: false;
  stateMutationAllowed: false;
  runtimeMutationBlocked: true;
  refundSuccessState: false;
  idempotencyKey: string;
  command?: {
    commandType: "refund_state_mutation_shadow";
    shadowOnly: true;
    targetState: RefundStateMutationShadowTargetState;
    provider: string;
    source: string;
    localRefundCommandKey: string;
    providerRefundId: string;
    amountMinor: number;
    currency: "CNY";
    stateMutationAllowed: false;
    workflowExecutionAllowed: false;
    financialMutationAllowed: false;
    fulfillmentMutationAllowed: false;
  };
  auditEvent: {
    action:
      | "refund_state_shadow_command_recorded"
      | "refund_state_shadow_manual_review_recorded"
      | "refund_state_shadow_reconciliation_recorded"
      | "refund_state_shadow_command_blocked";
    metadata: Record<string, unknown>;
  };
};

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
  "executable",
  "workflowExecutionAllowed",
  "stateMutationAllowed",
  "runtimeMutationBlocked",
  "refundSuccessState",
  "financialMutationAllowed",
  "permissionMutationAllowed",
  "fulfillmentMutationAllowed",
  "logisticsMutationAllowed",
  "providerQueryAllowed",
  "networkRequestAllowed",
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
  RefundStateMutationReadinessDecisionType,
  {
    decision: RefundStateMutationShadowCommandDecisionType;
    action: RefundStateMutationShadowCommandDecision["auditEvent"]["action"];
  }
> = {
  ready_for_shadow_state_command: {
    decision: "state_shadow_command_recorded",
    action: "refund_state_shadow_command_recorded",
  },
  manual_review_required: {
    decision: "manual_review_audit_recorded",
    action: "refund_state_shadow_manual_review_recorded",
  },
  reconciliation_required: {
    decision: "reconciliation_audit_recorded",
    action: "refund_state_shadow_reconciliation_recorded",
  },
  blocked: {
    decision: "state_shadow_command_blocked",
    action: "refund_state_shadow_command_blocked",
  },
};

const isReadinessSafe = (
  readinessDecision: RefundStateMutationReadinessDecision,
): boolean =>
  readinessDecision.executable === false &&
  readinessDecision.workflowExecutionAllowed === false &&
  readinessDecision.stateMutationAllowed === false &&
  readinessDecision.runtimeMutationBlocked === true &&
  readinessDecision.refundSuccessState === false;

const idempotencyKey = (
  input: RefundStateMutationShadowCommandInput,
): string =>
  [
    "refund_state_mutation_shadow",
    input.readinessDecision.idempotencyKey,
    input.readinessDecision.decision,
    input.auditContext.targetState ?? "no_target_state",
  ]
    .join(":")
    .replace(/[^a-zA-Z0-9:_-]+/g, "_");

const baseDecision = (
  input: RefundStateMutationShadowCommandInput,
  override?: {
    decision: RefundStateMutationShadowCommandDecisionType;
    action: RefundStateMutationShadowCommandDecision["auditEvent"]["action"];
  },
): Omit<RefundStateMutationShadowCommandDecision, "command"> => {
  const mapped = override ?? decisionMap[input.readinessDecision.decision];

  return {
    decision: mapped.decision,
    executable: false,
    workflowExecutionAllowed: false,
    stateMutationAllowed: false,
    runtimeMutationBlocked: true,
    refundSuccessState: false,
    idempotencyKey: idempotencyKey(input),
    auditEvent: {
      action: mapped.action,
      metadata: {
        requestedAt: input.requestedAt,
        actorType: input.auditContext.actorType,
        actorId: input.auditContext.actorId,
        readinessDecision: input.readinessDecision.decision,
        readinessBlockCodes: input.readinessDecision.blockCodes,
        readinessIdempotencyKey: input.readinessDecision.idempotencyKey,
        targetState: input.auditContext.targetState,
        ...sanitizeMetadata(input.readinessDecision.auditEvent.metadata),
        ...sanitizeMetadata(input.auditContext.metadata),
      },
    },
  };
};

export const mapRefundReadinessToStateMutationShadowCommand = (
  input: RefundStateMutationShadowCommandInput,
): RefundStateMutationShadowCommandDecision => {
  if (!isReadinessSafe(input.readinessDecision)) {
    return baseDecision(input, {
      decision: "state_shadow_command_blocked",
      action: "refund_state_shadow_command_blocked",
    });
  }

  const base = baseDecision(input);

  if (
    input.readinessDecision.decision !== "ready_for_shadow_state_command" ||
    !input.readinessDecision.shadowCommand
  ) {
    return base;
  }

  return {
    ...base,
    command: {
      commandType: "refund_state_mutation_shadow",
      shadowOnly: true,
      targetState:
        input.auditContext.targetState ?? "succeeded_shadow_reviewed",
      provider: input.readinessDecision.shadowCommand.provider,
      source: input.readinessDecision.shadowCommand.source,
      localRefundCommandKey:
        input.readinessDecision.shadowCommand.localRefundCommandKey,
      providerRefundId: input.readinessDecision.shadowCommand.providerRefundId,
      amountMinor: input.readinessDecision.shadowCommand.amountMinor,
      currency: input.readinessDecision.shadowCommand.currency,
      stateMutationAllowed: false,
      workflowExecutionAllowed: false,
      financialMutationAllowed: false,
      fulfillmentMutationAllowed: false,
    },
  };
};
