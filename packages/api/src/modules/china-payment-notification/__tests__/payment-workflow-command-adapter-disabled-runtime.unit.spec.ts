import {
  mapWorkflowCommandToDisabledRuntimeDecision,
  PaymentWorkflowCommandDecision,
} from "..";

const baseRuntimeContext = {
  environment: "staging" as const,
  adapterMode: "disabled" as const,
  featureFlagEnabled: false,
  adapterRegistered: false,
  rollbackRunbookReady: true,
  metadata: {
    safeNote: "kept",
    databaseUrl: "postgres://must-not-leak",
    executeWorkflow: "must-not-leak",
    workflowExecutionAllowed: true,
  },
};

const baseCommand = {
  idempotencyKey: "payment_notify:mock_china_pay:evt_mock_001",
  inboxId: "payment_notification_inbox_001",
  auditMetadata: {
    provider: "mock_china_pay",
  },
};

describe("mapWorkflowCommandToDisabledRuntimeDecision", () => {
  it("records executable workflow commands as disabled command candidates", () => {
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
        ...baseCommand,
      },
    };

    const result = mapWorkflowCommandToDisabledRuntimeDecision({
      commandDecision: decision,
      requestedAt: "2026-05-14T01:40:00.000Z",
      runtimeContext: baseRuntimeContext,
    });

    expect(result).toMatchObject({
      decision: "workflow_command_disabled_recorded",
      adapterEnabled: false,
      environmentAllowed: false,
      executable: false,
      workflowCommandPrepared: true,
      workflowDryRunOnly: true,
      workflowExecutionAllowed: false,
      stateMutationAllowed: false,
      paymentStateMutationAllowed: false,
      orderStateMutationAllowed: false,
      blockCodes: ["workflow_command_adapter_disabled"],
      commandCandidate: {
        commandType: "payment_workflow_command_adapter_disabled",
        originalCommandType: "capture_payment",
        paymentSessionId: "payses_mock_001",
        orderId: "order_mock_001",
      },
      auditEvent: {
        action: "command_prepared",
        metadata: {
          commandType: "capture_payment",
          paymentSessionId: "payses_mock_001",
          orderId: "order_mock_001",
          safeNote: "kept",
        },
      },
    });

    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain("postgres://must-not-leak");
    expect(serialized).not.toContain("must-not-leak");
    expect(serialized).not.toContain("\"workflowExecutionAllowed\":true");
  });

  it("records no-op decisions as skipped while runtime stays disabled", () => {
    const decision: PaymentWorkflowCommandDecision = {
      executable: true,
      command: {
        type: "no_op",
        reason: "Already processed.",
        ...baseCommand,
      },
    };

    const result = mapWorkflowCommandToDisabledRuntimeDecision({
      commandDecision: decision,
      requestedAt: "2026-05-14T01:41:00.000Z",
      runtimeContext: baseRuntimeContext,
    });

    expect(result).toMatchObject({
      decision: "workflow_command_skipped_recorded",
      workflowCommandPrepared: false,
      auditEvent: {
        action: "command_skipped",
        metadata: {
          commandType: "no_op",
          reason: "Already processed.",
        },
      },
    });
    expect(result.commandCandidate).toBeUndefined();
    expect(result.blockCodes).toContain("no_workflow_command_required");
  });

  it("keeps non-executable decisions blocked in disabled runtime", () => {
    const decision: PaymentWorkflowCommandDecision = {
      executable: false,
      reason: "Provider mismatch.",
      blockType: "provider_mismatch",
      retryable: false,
      ...baseCommand,
    };

    const result = mapWorkflowCommandToDisabledRuntimeDecision({
      commandDecision: decision,
      requestedAt: "2026-05-14T01:42:00.000Z",
      runtimeContext: baseRuntimeContext,
    });

    expect(result).toMatchObject({
      decision: "workflow_command_input_rejected",
      workflowCommandPrepared: false,
      auditEvent: {
        action: "command_blocked",
        metadata: {
          blockType: "provider_mismatch",
          retryable: false,
          reason: "Provider mismatch.",
        },
      },
    });
    expect(result.commandCandidate).toBeUndefined();
    expect(result.blockCodes).toContain("command_decision_not_executable");
  });

  it("ignores mode, flags, and registration until a future go decision", () => {
    const decision: PaymentWorkflowCommandDecision = {
      executable: true,
      command: {
        type: "mark_failed",
        paymentSessionId: "payses_mock_001",
        orderId: "order_mock_001",
        errorCode: "PAYMENT_NOTIFICATION_MARK_FAILED",
        ...baseCommand,
      },
    };

    const result = mapWorkflowCommandToDisabledRuntimeDecision({
      commandDecision: decision,
      requestedAt: "2026-05-14T01:43:00.000Z",
      runtimeContext: {
        ...baseRuntimeContext,
        environment: "production",
        adapterMode: "registered",
        featureFlagEnabled: true,
        adapterRegistered: true,
        rollbackRunbookReady: false,
      },
    });

    expect(result.blockCodes).toEqual(
      expect.arrayContaining([
        "workflow_command_adapter_disabled",
        "production_ignored_until_go",
        "adapter_mode_ignored_until_go",
        "feature_flag_ignored_until_go",
        "adapter_registration_ignored_until_go",
        "rollback_runbook_missing",
      ]),
    );
  });
});
