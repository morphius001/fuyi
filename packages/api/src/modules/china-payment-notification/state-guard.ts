import {
  PaymentNotificationStateGuardInput,
  PaymentNotificationStateGuardResult,
} from "./types";

const isTerminalOrderStatus = (status: string): boolean =>
  ["canceled", "refund_pending", "refunded"].includes(status);

export const guardPaymentNotificationState = ({
  envelope,
  inboxRecord,
  paymentSession,
  order,
}: PaymentNotificationStateGuardInput): PaymentNotificationStateGuardResult => {
  if (envelope.signature.status !== "verified") {
    return {
      allowed: false,
      blockType: "invalid_signature",
      retryable: false,
      reason: "Payment notification signature is not verified.",
      auditMetadata: {
        signatureStatus: envelope.signature.status,
        eventId: envelope.eventId,
      },
    };
  }

  if (inboxRecord.processingStatus === "processed") {
    return {
      allowed: true,
      commandType: "no_op",
      reason: "Payment notification was already processed.",
      auditMetadata: {
        idempotencyKey: envelope.idempotencyKey,
      },
    };
  }

  if (!paymentSession || !order) {
    return {
      allowed: false,
      blockType: "unknown_reference",
      retryable: true,
      reason: "Payment session or order snapshot is missing.",
      auditMetadata: {
        merchantOrderRef: envelope.merchantOrderRef,
        paymentSessionId: envelope.paymentSessionId,
      },
    };
  }

  if (paymentSession.provider !== envelope.provider) {
    return {
      allowed: false,
      blockType: "provider_mismatch",
      retryable: false,
      reason: "Payment provider does not match payment session.",
      auditMetadata: {
        envelopeProvider: envelope.provider,
        paymentSessionProvider: paymentSession.provider,
      },
    };
  }

  if (paymentSession.amount.currency !== envelope.amount.currency) {
    return {
      allowed: false,
      blockType: "currency_mismatch",
      retryable: false,
      reason: "Payment notification currency does not match payment session.",
      auditMetadata: {
        envelopeCurrency: envelope.amount.currency,
        paymentSessionCurrency: paymentSession.amount.currency,
      },
    };
  }

  if (paymentSession.amount.value !== envelope.amount.value) {
    return {
      allowed: false,
      blockType: "amount_mismatch",
      retryable: false,
      reason: "Payment notification amount does not match payment session.",
      auditMetadata: {
        envelopeAmount: envelope.amount.value,
        paymentSessionAmount: paymentSession.amount.value,
      },
    };
  }

  if (isTerminalOrderStatus(order.status)) {
    return {
      allowed: false,
      blockType: "state_conflict",
      retryable: false,
      reason: "Order is in a terminal or conflicting state.",
      auditMetadata: {
        orderId: order.id,
        orderStatus: order.status,
      },
    };
  }

  if (envelope.eventType === "payment.succeeded") {
    if (!["pending", "authorized"].includes(paymentSession.status)) {
      return {
        allowed: false,
        blockType: "out_of_order",
        retryable: false,
        reason: "Payment session cannot be captured from its current state.",
        auditMetadata: {
          paymentSessionStatus: paymentSession.status,
        },
      };
    }

    return {
      allowed: true,
      commandType: "capture_payment",
      reason: "Payment notification may capture payment.",
      auditMetadata: {
        paymentSessionId: paymentSession.id,
        orderId: order.id,
      },
    };
  }

  if (envelope.eventType === "payment.closed") {
    return {
      allowed: true,
      commandType: "close_payment",
      reason: "Payment notification may close payment.",
      auditMetadata: {
        paymentSessionId: paymentSession.id,
        orderId: order.id,
      },
    };
  }

  if (envelope.eventType === "payment.failed") {
    return {
      allowed: true,
      commandType: "mark_failed",
      reason: "Payment notification may mark payment failed.",
      auditMetadata: {
        paymentSessionId: paymentSession.id,
        orderId: order.id,
      },
    };
  }

  return {
    allowed: false,
    blockType: "manual_review",
    retryable: false,
    reason: "Payment notification event type requires manual review.",
    auditMetadata: {
      eventType: envelope.eventType,
    },
  };
};
