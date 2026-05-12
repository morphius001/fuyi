import {
  evaluateRefundStateMutationReadiness,
  mapRefundReadinessToStateMutationShadowCommand,
  RefundStateMutationReadinessInput,
} from "..";

const readinessInput = (
  overrides: Partial<RefundStateMutationReadinessInput> = {},
): RefundStateMutationReadinessInput => ({
  provider: "wechat_pay",
  source: "query_reconciliation",
  requestedAt: "2026-05-12T01:15:00.000Z",
  evidence: {
    verifierReady: true,
    payloadRedacted: true,
    inboxStable: true,
    handoffSafe: true,
    reconciliationComplete: true,
    manualReviewPolicyReady: true,
    manualReviewApproved: true,
    rollbackRunbookReady: true,
    sourceInboxId: "rinbox_001",
    queryFollowUpId: "rqf_001",
    reconciliationId: "rrec_001",
  },
  expectedRefund: {
    localRefundCommandKey: "refund_cmd_wechat_001",
    providerRefundId: "wx_refund_001",
    merchantOrderReference: "pay_order_001",
    paymentProviderSessionId: "payses_001",
    amountMinor: 128560,
    currency: "CNY",
    currentPlatformRefundState: "pending",
  },
  observedRefund: {
    providerRefundId: "wx_refund_001",
    merchantOrderReference: "pay_order_001",
    paymentProviderSessionId: "payses_001",
    amountMinor: 128560,
    currency: "CNY",
  },
  safetyChecks: {
    ownershipPassed: true,
    permissionPassed: true,
    financialSideEffectsIsolated: true,
    fulfillmentSideEffectsIsolated: true,
  },
  auditContext: {
    actorType: "admin",
    actorId: "admin_refund_reviewer_001",
    metadata: {
      safeNote: "kept",
      rawProviderPayload: "{raw}",
      signature: "signature_should_not_leak",
      secret: "secret_should_not_leak",
      providerRefundQuery: "must-not-leak",
      workflowExecution: "must-not-leak",
      refundStateMutation: "must-not-leak",
      settlementAdjustment: "must-not-leak",
      commissionAdjustment: "must-not-leak",
      payoutAdjustment: "must-not-leak",
      fulfillmentMutation: "must-not-leak",
      logisticsMutation: "must-not-leak",
    },
  },
  ...overrides,
});

const map = (
  readiness = evaluateRefundStateMutationReadiness(readinessInput()),
) =>
  mapRefundReadinessToStateMutationShadowCommand({
    readinessDecision: readiness,
    requestedAt: "2026-05-12T01:16:00.000Z",
    auditContext: {
      actorType: "admin",
      actorId: "admin_refund_reviewer_001",
      targetState: "succeeded_shadow_reviewed",
      metadata: {
        safeAuditNote: "kept",
        databaseUrl: "postgres://must-not-leak",
        executable: true,
        workflowExecutionAllowed: true,
        stateMutationAllowed: true,
        runtimeMutationBlocked: false,
        refundSuccessState: true,
        financialMutationAllowed: true,
        permissionMutationAllowed: true,
        fulfillmentMutationAllowed: true,
        logisticsMutationAllowed: true,
        providerQueryAllowed: true,
        networkRequestAllowed: true,
      },
    },
  });

const expectSafe = (
  result: ReturnType<typeof mapRefundReadinessToStateMutationShadowCommand>,
) => {
  expect(result).toMatchObject({
    executable: false,
    workflowExecutionAllowed: false,
    stateMutationAllowed: false,
    runtimeMutationBlocked: true,
    refundSuccessState: false,
  });

  const serialized = JSON.stringify(result);

  expect(serialized).not.toContain("signature_should_not_leak");
  expect(serialized).not.toContain("secret_should_not_leak");
  expect(serialized).not.toContain("postgres://must-not-leak");
  expect(serialized).not.toContain("\"executable\":true");
  expect(serialized).not.toContain("\"workflowExecutionAllowed\":true");
  expect(serialized).not.toContain("\"stateMutationAllowed\":true");
  expect(serialized).not.toContain("\"runtimeMutationBlocked\":false");
  expect(serialized).not.toContain("\"refundSuccessState\":true");
  expect(serialized).not.toContain("\"financialMutationAllowed\":true");
  expect(serialized).not.toContain("\"permissionMutationAllowed\":true");
  expect(serialized).not.toContain("\"fulfillmentMutationAllowed\":true");
  expect(serialized).not.toContain("\"logisticsMutationAllowed\":true");
  expect(serialized).not.toContain("\"providerQueryAllowed\":true");
  expect(serialized).not.toContain("\"networkRequestAllowed\":true");
  expect(serialized).not.toContain("rawProviderPayload");
  expect(serialized).not.toContain("providerRefundQuery");
  expect(serialized).not.toContain("workflowExecution\":\"must-not-leak");
  expect(serialized).not.toContain("refundStateMutation");
  expect(serialized).not.toContain("settlementAdjustment");
  expect(serialized).not.toContain("commissionAdjustment");
  expect(serialized).not.toContain("payoutAdjustment");
  expect(serialized).not.toContain("fulfillmentMutation\":\"must-not-leak");
  expect(serialized).not.toContain("logisticsMutation");
};

describe("mapRefundReadinessToStateMutationShadowCommand", () => {
  it("maps ready decisions to non-executable state shadow commands", () => {
    const result = map();

    expect(result).toMatchObject({
      decision: "state_shadow_command_recorded",
      command: {
        commandType: "refund_state_mutation_shadow",
        shadowOnly: true,
        targetState: "succeeded_shadow_reviewed",
        localRefundCommandKey: "refund_cmd_wechat_001",
        providerRefundId: "wx_refund_001",
        amountMinor: 128560,
        currency: "CNY",
        stateMutationAllowed: false,
        workflowExecutionAllowed: false,
        financialMutationAllowed: false,
        fulfillmentMutationAllowed: false,
      },
      auditEvent: {
        action: "refund_state_shadow_command_recorded",
      },
    });
    expectSafe(result);
  });

  it("maps manual review decisions to audit-only", () => {
    const result = map(
      evaluateRefundStateMutationReadiness(
        readinessInput({
          evidence: {
            ...readinessInput().evidence,
            manualReviewApproved: false,
          },
        }),
      ),
    );

    expect(result).toMatchObject({
      decision: "manual_review_audit_recorded",
      auditEvent: {
        action: "refund_state_shadow_manual_review_recorded",
      },
    });
    expect(result.command).toBeUndefined();
    expectSafe(result);
  });

  it("maps reconciliation decisions to audit-only", () => {
    const result = map(
      evaluateRefundStateMutationReadiness(
        readinessInput({
          observedRefund: {
            ...readinessInput().observedRefund,
            amountMinor: 128500,
          },
        }),
      ),
    );

    expect(result).toMatchObject({
      decision: "reconciliation_audit_recorded",
      auditEvent: {
        action: "refund_state_shadow_reconciliation_recorded",
      },
    });
    expect(result.command).toBeUndefined();
    expectSafe(result);
  });

  it("maps blocked readiness decisions without a command", () => {
    const result = map(
      evaluateRefundStateMutationReadiness(
        readinessInput({
          safetyChecks: {
            ...readinessInput().safetyChecks,
            stateMutationRequested: true,
          },
        }),
      ),
    );

    expect(result).toMatchObject({
      decision: "state_shadow_command_blocked",
      auditEvent: {
        action: "refund_state_shadow_command_blocked",
      },
    });
    expect(result.command).toBeUndefined();
    expectSafe(result);
  });

  it("blocks unsafe readiness outputs before recording shadow commands", () => {
    const readiness = {
      ...evaluateRefundStateMutationReadiness(readinessInput()),
      refundSuccessState: true,
    } as unknown as ReturnType<typeof evaluateRefundStateMutationReadiness>;

    const result = map(readiness);

    expect(result).toMatchObject({
      decision: "state_shadow_command_blocked",
      auditEvent: {
        action: "refund_state_shadow_command_blocked",
      },
    });
    expect(result.command).toBeUndefined();
    expectSafe(result);
  });
});
