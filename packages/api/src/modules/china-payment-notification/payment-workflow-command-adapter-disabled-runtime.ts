import {
  PaymentWorkflowCommand,
  PaymentWorkflowCommandAuditEvent,
  PaymentWorkflowCommandDecision,
} from "./types";

export type PaymentWorkflowCommandAdapterDisabledRuntimeDecisionType =
  | "workflow_command_disabled_recorded"
  | "workflow_command_skipped_recorded"
  | "workflow_command_input_rejected";

export type PaymentWorkflowCommandAdapterMode =
  | "disabled"
  | "dry_run"
  | "registered";

export type PaymentWorkflowCommandAdapterDisabledRuntimeInput = {
  commandDecision: PaymentWorkflowCommandDecision;
  requestedAt: string;
  runtimeContext: {
    environment: "development" | "test" | "staging" | "production";
    adapterMode: PaymentWorkflowCommandAdapterMode;
    featureFlagEnabled: boolean;
    adapterRegistered: boolean;
    rollbackRunbookReady: boolean;
    metadata?: Record<string, unknown>;
  };
};

export type PaymentWorkflowCommandAdapterDisabledRuntimeDecision = {
  decision: PaymentWorkflowCommandAdapterDisabledRuntimeDecisionType;
  adapterEnabled: false;
  environmentAllowed: false;
  executable: false;
  workflowCommandPrepared: boolean;
  workflowDryRunOnly: true;
  workflowExecutionAllowed: false;
  stateMutationAllowed: false;
  paymentStateMutationAllowed: false;
  orderStateMutationAllowed: false;
  blockCodes: string[];
  idempotencyKey: string;
  commandCandidate?: {
    commandType: "payment_workflow_command_adapter_disabled";
    originalCommandType: Exclude<PaymentWorkflowCommand["type"], "no_op">;
    paymentSessionId: string;
    orderId: string;
    inboxId: string;
    idempotencyKey: string;
    workflowCommandPrepared: true;
    workflowDryRunOnly: true;
    workflowExecutionAllowed: false;
    stateMutationAllowed: false;
    paymentStateMutationAllowed: false;
    orderStateMutationAllowed: false;
  };
  auditEvent: PaymentWorkflowCommandAuditEvent;
};

const deniedMetadataKeys = new Set(
  [
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
    "providerRequest",
    "providerQuery",
    "providerRefundRequest",
    "providerRefundQuery",
    "enabled",
    "adapterEnabled",
    "environmentAllowed",
    "executable",
    "workflowCommandPrepared",
    "workflowDryRunOnly",
    "workflowExecutionAllowed",
    "stateMutationAllowed",
    "paymentStateMutationAllowed",
    "orderStateMutationAllowed",
    "paymentStateCommand",
    "orderStateCommand",
    "workflowExecution",
    "executeWorkflow",
    "workflowCommand",
    "fullPhone",
    "fullAddress",
    "identityNumber",
    "bankCardNumber",
  ].map((key) => key.toLowerCase().replace(/[^a-z0-9]/g, "")),
);

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

const blockCodesFor = (
  input: PaymentWorkflowCommandAdapterDisabledRuntimeInput,
): string[] => {
  const codes = ["workflow_command_adapter_disabled"];

  if (!input.commandDecision.executable) {
    codes.push("command_decision_not_executable");
  } else if (input.commandDecision.command.type === "no_op") {
    codes.push("no_workflow_command_required");
  }

  if (input.runtimeContext.environment === "production") {
    codes.push("production_ignored_until_go");
  }

  if (input.runtimeContext.adapterMode !== "disabled") {
    codes.push("adapter_mode_ignored_until_go");
  }

  if (input.runtimeContext.featureFlagEnabled) {
    codes.push("feature_flag_ignored_until_go");
  }

  if (input.runtimeContext.adapterRegistered) {
    codes.push("adapter_registration_ignored_until_go");
  }

  if (!input.runtimeContext.rollbackRunbookReady) {
    codes.push("rollback_runbook_missing");
  }

  return codes;
};

const idempotencyKeyFor = (
  input: PaymentWorkflowCommandAdapterDisabledRuntimeInput,
): string =>
  [
    "payment_workflow_command_adapter",
    input.commandDecision.executable
      ? input.commandDecision.command.idempotencyKey
      : input.commandDecision.idempotencyKey,
    input.runtimeContext.environment,
    input.runtimeContext.adapterMode,
  ]
    .join(":")
    .replace(/[^a-zA-Z0-9:_-]+/g, "_");

const decisionTypeFor = (
  input: PaymentWorkflowCommandAdapterDisabledRuntimeInput,
): PaymentWorkflowCommandAdapterDisabledRuntimeDecisionType => {
  if (!input.commandDecision.executable) {
    return "workflow_command_input_rejected";
  }

  if (input.commandDecision.command.type === "no_op") {
    return "workflow_command_skipped_recorded";
  }

  return "workflow_command_disabled_recorded";
};

const commandCandidateFor = (
  decision: PaymentWorkflowCommandDecision,
): PaymentWorkflowCommandAdapterDisabledRuntimeDecision["commandCandidate"] => {
  if (!decision.executable || decision.command.type === "no_op") {
    return undefined;
  }

  return {
    commandType: "payment_workflow_command_adapter_disabled",
    originalCommandType: decision.command.type,
    paymentSessionId: decision.command.paymentSessionId,
    orderId: decision.command.orderId,
    inboxId: decision.command.inboxId,
    idempotencyKey: decision.command.idempotencyKey,
    workflowCommandPrepared: true,
    workflowDryRunOnly: true,
    workflowExecutionAllowed: false,
    stateMutationAllowed: false,
    paymentStateMutationAllowed: false,
    orderStateMutationAllowed: false,
  };
};

const auditEventFor = (
  input: PaymentWorkflowCommandAdapterDisabledRuntimeInput,
  decisionType: PaymentWorkflowCommandAdapterDisabledRuntimeDecisionType,
  blockCodes: string[],
  idempotencyKey: string,
): PaymentWorkflowCommandAuditEvent => {
  const baseMetadata = sanitizeMetadata({
    ...input.runtimeContext.metadata,
    runtimeEnvironment: input.runtimeContext.environment,
    adapterMode: input.runtimeContext.adapterMode,
    blockCodes,
    adapterDecision: decisionType,
    adapterIdempotencyKey: idempotencyKey,
  });

  if (!input.commandDecision.executable) {
    return {
      action: "command_blocked",
      actorType: "system",
      message:
        "Payment workflow command adapter kept runtime disabled because the incoming command decision was not executable.",
      metadata: {
        blockType: input.commandDecision.blockType,
        retryable: input.commandDecision.retryable,
        idempotencyKey: input.commandDecision.idempotencyKey,
        inboxId: input.commandDecision.inboxId,
        reason: input.commandDecision.reason,
        ...input.commandDecision.auditMetadata,
        ...baseMetadata,
      },
    };
  }

  if (input.commandDecision.command.type === "no_op") {
    return {
      action: "command_skipped",
      actorType: "system",
      message:
        "Payment workflow command adapter recorded a no-op decision while runtime stayed disabled.",
      metadata: {
        commandType: input.commandDecision.command.type,
        idempotencyKey: input.commandDecision.command.idempotencyKey,
        inboxId: input.commandDecision.command.inboxId,
        reason: input.commandDecision.command.reason,
        ...input.commandDecision.command.auditMetadata,
        ...baseMetadata,
      },
    };
  }

  return {
    action: "command_prepared",
    actorType: "system",
    message:
      "Payment workflow command prepared as a disabled runtime candidate and not executed.",
    metadata: {
      commandType: input.commandDecision.command.type,
      idempotencyKey: input.commandDecision.command.idempotencyKey,
      inboxId: input.commandDecision.command.inboxId,
      paymentSessionId: input.commandDecision.command.paymentSessionId,
      orderId: input.commandDecision.command.orderId,
      ...input.commandDecision.command.auditMetadata,
      ...baseMetadata,
    },
  };
};

export const mapWorkflowCommandToDisabledRuntimeDecision = (
  input: PaymentWorkflowCommandAdapterDisabledRuntimeInput,
): PaymentWorkflowCommandAdapterDisabledRuntimeDecision => {
  const blockCodes = blockCodesFor(input);
  const decision = decisionTypeFor(input);
  const idempotencyKey = idempotencyKeyFor(input);

  return {
    decision,
    adapterEnabled: false,
    environmentAllowed: false,
    executable: false,
    workflowCommandPrepared:
      input.commandDecision.executable &&
      input.commandDecision.command.type !== "no_op",
    workflowDryRunOnly: true,
    workflowExecutionAllowed: false,
    stateMutationAllowed: false,
    paymentStateMutationAllowed: false,
    orderStateMutationAllowed: false,
    blockCodes,
    idempotencyKey,
    commandCandidate: commandCandidateFor(input.commandDecision),
    auditEvent: auditEventFor(input, decision, blockCodes, idempotencyKey),
  };
};
