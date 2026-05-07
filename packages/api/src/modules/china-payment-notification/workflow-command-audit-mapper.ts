import {
  PaymentWorkflowCommandAuditEvent,
  PaymentWorkflowCommandDecision,
} from "./types";

export const mapWorkflowCommandDecisionToAuditEvent = (
  decision: PaymentWorkflowCommandDecision,
): PaymentWorkflowCommandAuditEvent => {
  if (!decision.executable) {
    if (decision.blockType === "manual_review") {
      return {
        action: "manual_review_required",
        actorType: "system",
        message: "Payment notification requires manual review before workflow execution.",
        metadata: {
          blockType: decision.blockType,
          retryable: decision.retryable,
          idempotencyKey: decision.idempotencyKey,
          inboxId: decision.inboxId,
          reason: decision.reason,
          ...decision.auditMetadata,
        },
      };
    }

    return {
      action: "command_blocked",
      actorType: "system",
      message: "Payment workflow command blocked before execution.",
      metadata: {
        blockType: decision.blockType,
        retryable: decision.retryable,
        idempotencyKey: decision.idempotencyKey,
        inboxId: decision.inboxId,
        reason: decision.reason,
        ...decision.auditMetadata,
      },
    };
  }

  if (decision.command.type === "no_op") {
    return {
      action: "command_skipped",
      actorType: "system",
      message: "Payment workflow command skipped.",
      metadata: {
        commandType: decision.command.type,
        idempotencyKey: decision.command.idempotencyKey,
        inboxId: decision.command.inboxId,
        reason: decision.command.reason,
        ...decision.command.auditMetadata,
      },
    };
  }

  return {
    action: "command_prepared",
    actorType: "system",
    message: "Payment workflow command prepared but not executed.",
    metadata: {
      commandType: decision.command.type,
      idempotencyKey: decision.command.idempotencyKey,
      inboxId: decision.command.inboxId,
      paymentSessionId: decision.command.paymentSessionId,
      orderId: decision.command.orderId,
      ...decision.command.auditMetadata,
    },
  };
};
