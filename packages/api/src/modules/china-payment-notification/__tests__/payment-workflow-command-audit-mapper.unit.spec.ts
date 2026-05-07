import {
  mapWorkflowCommandDecisionToAuditEvent,
  PaymentWorkflowCommandDecision,
} from "..";

const baseDecision = {
  idempotencyKey: "payment_notify:mock_china_pay:evt_mock_001",
  inboxId: "payment_notification_inbox_001",
  auditMetadata: {
    provider: "mock_china_pay",
  },
};

describe("mapWorkflowCommandDecisionToAuditEvent", () => {
  it("maps executable capture commands to command_prepared audit events", () => {
    const decision: PaymentWorkflowCommandDecision = {
      executable: true,
      command: {
        type: "capture_payment",
        paymentSessionId: "payses_mock_001",
        orderId: "order_mock_001",
        amount: {
          value: 128560,
          currency: "CNY",
        },
        ...baseDecision,
      },
    };
    const auditEvent = mapWorkflowCommandDecisionToAuditEvent(decision);

    expect(auditEvent).toMatchObject({
      action: "command_prepared",
      actorType: "system",
      metadata: {
        commandType: "capture_payment",
        idempotencyKey: baseDecision.idempotencyKey,
        inboxId: baseDecision.inboxId,
        paymentSessionId: "payses_mock_001",
        orderId: "order_mock_001",
      },
    });
    expect(auditEvent).not.toHaveProperty("workflowResult");
    expect(auditEvent).not.toHaveProperty("paymentStateMutation");
  });

  it("maps no-op commands to command_skipped audit events", () => {
    const decision: PaymentWorkflowCommandDecision = {
      executable: true,
      command: {
        type: "no_op",
        reason: "Already processed.",
        ...baseDecision,
      },
    };
    const auditEvent = mapWorkflowCommandDecisionToAuditEvent(decision);

    expect(auditEvent).toMatchObject({
      action: "command_skipped",
      metadata: {
        commandType: "no_op",
        reason: "Already processed.",
      },
    });
  });

  it("maps close payment commands to command_prepared audit events", () => {
    const decision: PaymentWorkflowCommandDecision = {
      executable: true,
      command: {
        type: "close_payment",
        paymentSessionId: "payses_mock_001",
        orderId: "order_mock_001",
        ...baseDecision,
      },
    };
    const auditEvent = mapWorkflowCommandDecisionToAuditEvent(decision);

    expect(auditEvent).toMatchObject({
      action: "command_prepared",
      metadata: {
        commandType: "close_payment",
        paymentSessionId: "payses_mock_001",
        orderId: "order_mock_001",
      },
    });
  });

  it("maps mark failed commands to command_prepared audit events", () => {
    const decision: PaymentWorkflowCommandDecision = {
      executable: true,
      command: {
        type: "mark_failed",
        paymentSessionId: "payses_mock_001",
        orderId: "order_mock_001",
        errorCode: "PAYMENT_NOTIFICATION_MARK_FAILED",
        ...baseDecision,
      },
    };
    const auditEvent = mapWorkflowCommandDecisionToAuditEvent(decision);

    expect(auditEvent).toMatchObject({
      action: "command_prepared",
      metadata: {
        commandType: "mark_failed",
        paymentSessionId: "payses_mock_001",
        orderId: "order_mock_001",
      },
    });
    expect(auditEvent.metadata).not.toHaveProperty("rawPayload");
    expect(auditEvent.metadata).not.toHaveProperty("signature");
    expect(auditEvent.metadata).not.toHaveProperty("secret");
  });

  it("maps blocked decisions to command_blocked audit events", () => {
    const decision: PaymentWorkflowCommandDecision = {
      executable: false,
      reason: "Provider mismatch.",
      blockType: "provider_mismatch",
      retryable: false,
      ...baseDecision,
    };
    const auditEvent = mapWorkflowCommandDecisionToAuditEvent(decision);

    expect(auditEvent).toMatchObject({
      action: "command_blocked",
      metadata: {
        blockType: "provider_mismatch",
        retryable: false,
        reason: "Provider mismatch.",
      },
    });
  });

  it("maps manual review blocks to manual_review_required audit events", () => {
    const decision: PaymentWorkflowCommandDecision = {
      executable: false,
      reason: "Manual review requested by guard.",
      blockType: "manual_review",
      retryable: false,
      ...baseDecision,
    };
    const auditEvent = mapWorkflowCommandDecisionToAuditEvent(decision);

    expect(auditEvent).toMatchObject({
      action: "manual_review_required",
      metadata: {
        blockType: "manual_review",
        retryable: false,
      },
    });
  });
});
