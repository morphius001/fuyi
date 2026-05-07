import {
  PaymentNotificationStateGuardInput,
  PaymentNotificationStateGuardResult,
  PaymentWorkflowCommandDecision,
} from "./types";

export const mapGuardResultToWorkflowCommand = (
  guardResult: PaymentNotificationStateGuardResult,
  input: PaymentNotificationStateGuardInput,
): PaymentWorkflowCommandDecision => {
  const base = {
    idempotencyKey: input.envelope.idempotencyKey,
    inboxId: input.inboxRecord.id,
  };

  if (!guardResult.allowed) {
    return {
      executable: false,
      reason: guardResult.reason,
      blockType: guardResult.blockType,
      retryable: guardResult.retryable,
      ...base,
      auditMetadata: guardResult.auditMetadata,
    };
  }

  if (guardResult.commandType === "no_op") {
    return {
      executable: true,
      command: {
        type: "no_op",
        reason: guardResult.reason,
        ...base,
        auditMetadata: guardResult.auditMetadata,
      },
    };
  }

  if (!input.paymentSession || !input.order) {
    return {
      executable: false,
      reason: "Cannot create workflow command without payment session and order snapshots.",
      blockType: "unknown_reference",
      retryable: true,
      ...base,
      auditMetadata: {
        commandType: guardResult.commandType,
      },
    };
  }

  if (guardResult.commandType === "capture_payment") {
    return {
      executable: true,
      command: {
        type: "capture_payment",
        paymentSessionId: input.paymentSession.id,
        orderId: input.order.id,
        amount: input.envelope.amount,
        ...base,
        auditMetadata: guardResult.auditMetadata,
      },
    };
  }

  if (guardResult.commandType === "close_payment") {
    return {
      executable: true,
      command: {
        type: "close_payment",
        paymentSessionId: input.paymentSession.id,
        orderId: input.order.id,
        ...base,
        auditMetadata: guardResult.auditMetadata,
      },
    };
  }

  return {
    executable: true,
    command: {
      type: "mark_failed",
      paymentSessionId: input.paymentSession.id,
      orderId: input.order.id,
      errorCode: "PAYMENT_NOTIFICATION_MARK_FAILED",
      ...base,
      auditMetadata: guardResult.auditMetadata,
    },
  };
};
