import { RefundStateMutationWorkflowAdapterDecision } from "./refund-state-mutation-workflow-adapter";

export type RefundStateMutationPreprodDryRunDecisionType =
  | "preprod_dry_run_request_recorded"
  | "preprod_dry_run_input_rejected"
  | "preprod_dry_run_blocked";

export type RefundStateMutationPreprodDryRunInput = {
  workflowDecision: RefundStateMutationWorkflowAdapterDecision;
  requestedAt: string;
  dryRunContext: {
    environment: "development" | "test" | "preprod" | "production";
    mode: "disabled" | "fixture" | "sandbox" | "production";
    featureFlagEnabled: boolean;
    sandboxProviderReady: boolean;
    productionDbBlocked: boolean;
    productionProviderBlocked: boolean;
    replayRunbookReady: boolean;
    metadata?: Record<string, unknown>;
  };
};

export type RefundStateMutationPreprodDryRunDecision = {
  decision: RefundStateMutationPreprodDryRunDecisionType;
  preprodDryRunEnabled: false;
  productionExecutionAllowed: false;
  executable: false;
  dryRunRequestPrepared: boolean;
  workflowDryRunOnly: true;
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
  idempotencyKey: string;
  dryRunRequest?: {
    requestType: "refund_state_mutation_preprod_dry_run_disabled";
    workflowAdapterIdempotencyKey: string;
    auditWriteIntentIdempotencyKey?: string;
    runtimeAdapterIdempotencyKey?: string;
    approvalCandidateIdempotencyKey?: string;
    targetState?: string;
    preprodDryRunEnabled: false;
    productionExecutionAllowed: false;
    workflowDryRunOnly: true;
    workflowExecutionAllowed: false;
    stateMutationAllowed: false;
    refundSuccessState: false;
  };
  auditEvent: {
    action:
      | "refund_state_preprod_dry_run_request_recorded"
      | "refund_state_preprod_dry_run_input_rejected"
      | "refund_state_preprod_dry_run_blocked";
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
  "providerRequestPayload",
  "providerQueryPayload",
  "providerRefundRequest",
  "providerRefundQuery",
  "providerRefundRequestPayload",
  "providerRefundQueryPayload",
  "refundQuery",
  "preprodDryRunEnabled",
  "productionExecutionAllowed",
  "adapterEnabled",
  "environmentAllowed",
  "enabled",
  "executable",
  "dryRunRequestPrepared",
  "workflowCommandPrepared",
  "workflowDryRunOnly",
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
  "providerQueryAllowed",
  "networkRequestAllowed",
  "workflowExecution",
  "executeWorkflow",
  "refundStateMutation",
  "auditWrite",
  "dbWrite",
  "workflowAdapter",
  "workflowCommand",
  "preprodDryRun",
  "dryRunRequest",
  "financialMutation",
  "settlementMutation",
  "commissionMutation",
  "payoutMutation",
  "settlementAdjustment",
  "commissionAdjustment",
  "payoutAdjustment",
  "fulfillmentMutation",
  "logisticsMutation",
  "fullPhone",
  "fullAddress",
  "identityNumber",
  "bankCardNumber",
  "blockCodes",
  "mode",
  "workflowDecision",
  "workflowAdapterIdempotencyKey",
  "auditWriteIntentIdempotencyKey",
  "runtimeAdapterIdempotencyKey",
  "approvalCandidateIdempotencyKey",
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

const isWorkflowDecisionSafe = (
  workflowDecision: RefundStateMutationWorkflowAdapterDecision,
): boolean =>
  workflowDecision.adapterEnabled === false &&
  workflowDecision.environmentAllowed === false &&
  workflowDecision.executable === false &&
  workflowDecision.workflowDryRunOnly === true &&
  workflowDecision.workflowExecutionAllowed === false &&
  workflowDecision.stateMutationAllowed === false &&
  workflowDecision.runtimeMutationBlocked === true &&
  workflowDecision.refundSuccessState === false &&
  workflowDecision.settlementMutationAllowed === false &&
  workflowDecision.commissionMutationAllowed === false &&
  workflowDecision.payoutMutationAllowed === false &&
  workflowDecision.permissionMutationAllowed === false &&
  workflowDecision.fulfillmentMutationAllowed === false &&
  workflowDecision.logisticsMutationAllowed === false &&
  (!workflowDecision.commandCandidate ||
    (workflowDecision.commandCandidate.workflowDryRunOnly === true &&
      workflowDecision.commandCandidate.workflowExecutionAllowed === false &&
      workflowDecision.commandCandidate.stateMutationAllowed === false &&
      workflowDecision.commandCandidate.refundSuccessState === false));

const blockCodes = (
  input: RefundStateMutationPreprodDryRunInput,
): string[] => {
  const codes = ["preprod_dry_run_disabled"];

  if (!isWorkflowDecisionSafe(input.workflowDecision)) {
    codes.push("unsafe_workflow_adapter_decision");
  }

  if (
    input.workflowDecision.decision !==
      "workflow_adapter_command_candidate_recorded" ||
    !input.workflowDecision.commandCandidate
  ) {
    codes.push("workflow_command_candidate_missing");
  }

  if (input.dryRunContext.environment === "production") {
    codes.push("production_environment_blocked");
  }

  if (input.dryRunContext.mode !== "disabled") {
    codes.push("dry_run_mode_ignored_until_go");
  }

  if (input.dryRunContext.featureFlagEnabled) {
    codes.push("feature_flag_ignored_until_go");
  }

  if (!input.dryRunContext.sandboxProviderReady) {
    codes.push("sandbox_provider_missing");
  }

  if (!input.dryRunContext.productionDbBlocked) {
    codes.push("production_db_not_blocked");
  }

  if (!input.dryRunContext.productionProviderBlocked) {
    codes.push("production_provider_not_blocked");
  }

  if (!input.dryRunContext.replayRunbookReady) {
    codes.push("replay_runbook_missing");
  }

  return codes;
};

const idempotencyKey = (
  input: RefundStateMutationPreprodDryRunInput,
): string =>
  [
    "refund_state_mutation_preprod_dry_run",
    input.workflowDecision.idempotencyKey,
    input.dryRunContext.environment,
    input.dryRunContext.mode,
  ]
    .join(":")
    .replace(/[^a-zA-Z0-9:_-]+/g, "_");

const actionFor = (
  decision: RefundStateMutationPreprodDryRunDecisionType,
): RefundStateMutationPreprodDryRunDecision["auditEvent"]["action"] => {
  if (decision === "preprod_dry_run_request_recorded") {
    return "refund_state_preprod_dry_run_request_recorded";
  }

  if (decision === "preprod_dry_run_input_rejected") {
    return "refund_state_preprod_dry_run_input_rejected";
  }

  return "refund_state_preprod_dry_run_blocked";
};

const decisionFor = (
  input: RefundStateMutationPreprodDryRunInput,
): RefundStateMutationPreprodDryRunDecisionType => {
  if (!isWorkflowDecisionSafe(input.workflowDecision)) {
    return "preprod_dry_run_blocked";
  }

  if (input.dryRunContext.environment === "production") {
    return "preprod_dry_run_blocked";
  }

  if (
    input.workflowDecision.decision !==
      "workflow_adapter_command_candidate_recorded" ||
    !input.workflowDecision.commandCandidate
  ) {
    return "preprod_dry_run_input_rejected";
  }

  return "preprod_dry_run_request_recorded";
};

export const mapWorkflowAdapterCommandToPreprodDryRun = (
  input: RefundStateMutationPreprodDryRunInput,
): RefundStateMutationPreprodDryRunDecision => {
  const codes = blockCodes(input);
  const decision = decisionFor(input);
  const commandCandidate = input.workflowDecision.commandCandidate;

  return {
    decision,
    preprodDryRunEnabled: false,
    productionExecutionAllowed: false,
    executable: false,
    dryRunRequestPrepared: decision === "preprod_dry_run_request_recorded",
    workflowDryRunOnly: true,
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
    idempotencyKey: idempotencyKey(input),
    dryRunRequest:
      decision === "preprod_dry_run_request_recorded" && commandCandidate
        ? {
            requestType: "refund_state_mutation_preprod_dry_run_disabled",
            workflowAdapterIdempotencyKey: input.workflowDecision.idempotencyKey,
            auditWriteIntentIdempotencyKey:
              commandCandidate.auditWriteIntentIdempotencyKey,
            runtimeAdapterIdempotencyKey:
              commandCandidate.runtimeAdapterIdempotencyKey,
            approvalCandidateIdempotencyKey:
              commandCandidate.approvalCandidateIdempotencyKey,
            targetState: commandCandidate.targetState,
            preprodDryRunEnabled: false,
            productionExecutionAllowed: false,
            workflowDryRunOnly: true,
            workflowExecutionAllowed: false,
            stateMutationAllowed: false,
            refundSuccessState: false,
          }
        : undefined,
    auditEvent: {
      action: actionFor(decision),
      metadata: {
        ...sanitizeMetadata(input.workflowDecision.auditEvent.metadata),
        ...sanitizeMetadata(input.dryRunContext.metadata),
        requestedAt: input.requestedAt,
        environment: input.dryRunContext.environment,
        mode: input.dryRunContext.mode,
        featureFlagEnabled: input.dryRunContext.featureFlagEnabled,
        sandboxProviderReady: input.dryRunContext.sandboxProviderReady,
        productionDbBlocked: input.dryRunContext.productionDbBlocked,
        productionProviderBlocked:
          input.dryRunContext.productionProviderBlocked,
        replayRunbookReady: input.dryRunContext.replayRunbookReady,
        workflowDecision: input.workflowDecision.decision,
        workflowAdapterIdempotencyKey: input.workflowDecision.idempotencyKey,
        blockCodes: codes,
      },
    },
  };
};
