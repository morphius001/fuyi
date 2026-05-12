export type RefundStateMutationProductionFeatureFlagInput = {
  requestedAt: string;
  environment: "development" | "test" | "staging" | "production";
  mode: "disabled" | "dry_run" | "shadow_only" | "single_attempt" | "execute";
  scope: {
    provider: "wechat_pay" | "alipay" | "mock_china_pay";
    marketId?: string;
    merchantId?: string;
    allowlistedMerchantIds?: string[];
  };
  ownership: {
    ownerTeam?: string;
    approverId?: string;
    changeTicketId?: string;
    rollbackOwnerId?: string;
    rollbackDeadline?: string;
    auditEventId?: string;
  };
  gates: {
    globalKillSwitchOff: boolean;
    productionExplicitlyEnabled: boolean;
    scopedRolloutReady: boolean;
    rollbackRunbookReady: boolean;
    operatorNoticeReady: boolean;
    persistencePrerequisitesReady: boolean;
    workflowDryRunVerified: boolean;
  };
  metadata?: Record<string, unknown>;
};

export type RefundStateMutationProductionFeatureFlagDecisionType =
  | "production_feature_flag_disabled"
  | "production_feature_flag_shadow_only"
  | "production_feature_flag_dry_run"
  | "production_feature_flag_blocked";

export type RefundStateMutationProductionFeatureFlagDecision = {
  decision: RefundStateMutationProductionFeatureFlagDecisionType;
  featureFlagExecutionAllowed: false;
  productionExecutionAllowed: false;
  workflowExecutionAllowed: false;
  stateMutationAllowed: false;
  runtimeMutationBlocked: true;
  refundSuccessState: false;
  settlementMutationAllowed: false;
  commissionMutationAllowed: false;
  payoutMutationAllowed: false;
  permissionMutationAllowed: false;
  fulfillmentMutationAllowed: false;
  logisticsMutationAllowed: false;
  blockCodes: string[];
  flagSnapshotKey: string;
  auditEvent: {
    action:
      | "refund_state_production_feature_flag_disabled"
      | "refund_state_production_feature_flag_shadow_only"
      | "refund_state_production_feature_flag_dry_run"
      | "refund_state_production_feature_flag_blocked";
    metadata: Record<string, unknown>;
  };
};

const deniedMetadataKeys = new Set([
  "rawProviderPayload",
  "rawPayload",
  "signature",
  "secret",
  "key",
  "apiKey",
  "privateKey",
  "certificate",
  "apiV3Key",
  "webhookSecret",
  "dbUrl",
  "databaseUrl",
  "productionDbUrl",
  "providerRequest",
  "providerQuery",
  "providerRefundRequest",
  "providerRefundQuery",
  "featureFlagExecutionAllowed",
  "productionExecutionAllowed",
  "workflowExecutionAllowed",
  "stateMutationAllowed",
  "runtimeMutationBlocked",
  "refundSuccessState",
  "settlementMutationAllowed",
  "commissionMutationAllowed",
  "payoutMutationAllowed",
  "financialMutationAllowed",
  "permissionMutationAllowed",
  "fulfillmentMutationAllowed",
  "logisticsMutationAllowed",
  "workflowExecution",
  "executeWorkflow",
  "refundStateMutation",
  "globalKillSwitch",
  "productionEnabled",
  "fullPhone",
  "fullAddress",
  "identityNumber",
  "bankCardNumber",
  "blockCodes",
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

const blockCodes = (
  input: RefundStateMutationProductionFeatureFlagInput,
): string[] => {
  const codes = ["production_feature_flag_contract_disabled"];

  if (!input.gates.globalKillSwitchOff) {
    codes.push("global_kill_switch_not_off");
  }
  if (
    input.environment === "production" &&
    !input.gates.productionExplicitlyEnabled
  ) {
    codes.push("production_explicit_enable_missing");
  }
  if (input.mode === "execute") {
    codes.push("execute_mode_blocked_until_go");
  }
  if (!input.gates.scopedRolloutReady) {
    codes.push("scoped_rollout_missing");
  }
  if (!input.gates.rollbackRunbookReady) {
    codes.push("rollback_runbook_missing");
  }
  if (!input.gates.operatorNoticeReady) {
    codes.push("operator_notice_missing");
  }
  if (!input.gates.persistencePrerequisitesReady) {
    codes.push("persistence_prerequisites_missing");
  }
  if (!input.gates.workflowDryRunVerified) {
    codes.push("workflow_dry_run_missing");
  }
  if (!input.ownership.ownerTeam) {
    codes.push("owner_team_missing");
  }
  if (!input.ownership.approverId) {
    codes.push("approver_missing");
  }
  if (!input.ownership.changeTicketId) {
    codes.push("change_ticket_missing");
  }
  if (!input.ownership.rollbackOwnerId) {
    codes.push("rollback_owner_missing");
  }
  if (!input.ownership.rollbackDeadline) {
    codes.push("rollback_deadline_missing");
  }
  if (!input.ownership.auditEventId) {
    codes.push("audit_event_missing");
  }
  if (
    input.scope.merchantId &&
    input.scope.allowlistedMerchantIds?.length &&
    !input.scope.allowlistedMerchantIds.includes(input.scope.merchantId)
  ) {
    codes.push("merchant_not_allowlisted");
  }

  return codes;
};

const snapshotKey = (
  input: RefundStateMutationProductionFeatureFlagInput,
): string =>
  [
    "refund_state_mutation_production_feature_flag",
    input.environment,
    input.mode,
    input.scope.provider,
    input.scope.marketId ?? "market_none",
    input.scope.merchantId ?? "merchant_none",
    input.ownership.changeTicketId ?? "ticket_missing",
  ]
    .join(":")
    .replace(/[^a-zA-Z0-9:_-]+/g, "_");

const decisionFor = (
  input: RefundStateMutationProductionFeatureFlagInput,
  codes: string[],
): RefundStateMutationProductionFeatureFlagDecisionType => {
  if (
    codes.some((code) =>
      [
        "global_kill_switch_not_off",
        "production_explicit_enable_missing",
        "execute_mode_blocked_until_go",
        "scoped_rollout_missing",
        "rollback_runbook_missing",
        "operator_notice_missing",
        "persistence_prerequisites_missing",
        "workflow_dry_run_missing",
        "owner_team_missing",
        "approver_missing",
        "change_ticket_missing",
        "rollback_owner_missing",
        "rollback_deadline_missing",
        "audit_event_missing",
        "merchant_not_allowlisted",
      ].includes(code),
    )
  ) {
    return "production_feature_flag_blocked";
  }
  if (input.mode === "dry_run") {
    return "production_feature_flag_dry_run";
  }
  if (input.mode === "shadow_only" || input.mode === "single_attempt") {
    return "production_feature_flag_shadow_only";
  }
  return "production_feature_flag_disabled";
};

const actionFor = (
  decision: RefundStateMutationProductionFeatureFlagDecisionType,
): RefundStateMutationProductionFeatureFlagDecision["auditEvent"]["action"] => {
  if (decision === "production_feature_flag_shadow_only") {
    return "refund_state_production_feature_flag_shadow_only";
  }
  if (decision === "production_feature_flag_dry_run") {
    return "refund_state_production_feature_flag_dry_run";
  }
  if (decision === "production_feature_flag_blocked") {
    return "refund_state_production_feature_flag_blocked";
  }
  return "refund_state_production_feature_flag_disabled";
};

export const evaluateRefundStateMutationProductionFeatureFlag = (
  input: RefundStateMutationProductionFeatureFlagInput,
): RefundStateMutationProductionFeatureFlagDecision => {
  const codes = blockCodes(input);
  const decision = decisionFor(input, codes);

  return {
    decision,
    featureFlagExecutionAllowed: false,
    productionExecutionAllowed: false,
    workflowExecutionAllowed: false,
    stateMutationAllowed: false,
    runtimeMutationBlocked: true,
    refundSuccessState: false,
    settlementMutationAllowed: false,
    commissionMutationAllowed: false,
    payoutMutationAllowed: false,
    permissionMutationAllowed: false,
    fulfillmentMutationAllowed: false,
    logisticsMutationAllowed: false,
    blockCodes: codes,
    flagSnapshotKey: snapshotKey(input),
    auditEvent: {
      action: actionFor(decision),
      metadata: {
        requestedAt: input.requestedAt,
        environment: input.environment,
        mode: input.mode,
        provider: input.scope.provider,
        marketId: input.scope.marketId,
        merchantId: input.scope.merchantId,
        ownerTeam: input.ownership.ownerTeam,
        approverId: input.ownership.approverId,
        changeTicketId: input.ownership.changeTicketId,
        rollbackOwnerId: input.ownership.rollbackOwnerId,
        rollbackDeadline: input.ownership.rollbackDeadline,
        auditEventId: input.ownership.auditEventId,
        decision,
        blockCodes: codes,
        ...sanitizeMetadata(input.metadata),
      },
    },
  };
};
