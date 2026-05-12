import {
  evaluateRefundStateOwnerHandoffContract,
  mapRefundHandoffToWorkflowShadowCommand,
  RefundStateOwnerHandoffInput,
} from "..";
import { ChinaPaymentNotificationEnvelope } from "../types";

const envelope = (
  overrides: Partial<ChinaPaymentNotificationEnvelope> = {},
): ChinaPaymentNotificationEnvelope => ({
  provider: "wechat_pay",
  eventId: "evt_refund_provider_001",
  eventType: "refund.succeeded",
  providerTransactionId: "wx_txn_001",
  providerRefundId: "wx_refund_001",
  merchantOrderRef: "pay_order_001",
  paymentSessionId: "payses_001",
  amount: {
    value: 128560,
    currency: "CNY",
  },
  occurredAt: "2026-05-12T00:00:00.000Z",
  receivedAt: "2026-05-12T00:00:05.000Z",
  idempotencyKey: "refund_notify:wechat_pay:evt_refund_provider_001",
  signature: {
    status: "verified",
    algorithm: "WECHAT_PAY_RSA",
    keyId: "fixture-platform-serial",
    verifiedAt: "2026-05-12T00:00:05.000Z",
  },
  rawPayloadDigest: "sha256:provider-refund-digest",
  riskFlags: [],
  ...overrides,
});

const handoffInput = (
  overrides: Partial<RefundStateOwnerHandoffInput> = {},
): RefundStateOwnerHandoffInput => ({
  inboxRecordId: "rinbox_001",
  inboxProcessingStatus: "runtime_mutation_blocked",
  provider: "wechat_pay",
  envelope: envelope(),
  expectedRefundSnapshot: {
    localRefundCommandKey: "refund_cmd_wechat_001",
    requestedAmountMinor: 128560,
    currency: "CNY",
    providerRefundId: "wx_refund_001",
    paymentSessionId: "payses_001",
    currentPlatformRefundState: "pending",
  },
  ownershipCheck: {
    sellerId: "seller_001",
    marketId: "market_001",
    passed: true,
  },
  permissionCheck: {
    actorType: "system_job",
    actorId: "refund-state-handoff",
    passed: true,
  },
  ...overrides,
});

const map = (handoff = evaluateRefundStateOwnerHandoffContract(handoffInput())) =>
  mapRefundHandoffToWorkflowShadowCommand({
    handoffDecision: handoff,
    requestedAt: "2026-05-12T00:01:00.000Z",
    source: "provider_inbox",
    auditContext: {
      inboxRecordId: "rinbox_001",
      provider: "wechat_pay",
      providerEventId: "evt_refund_provider_001",
      providerRefundId: "wx_refund_001",
      localRefundCommandKey: "refund_cmd_wechat_001",
      actorType: "system_job",
      actorId: "refund-state-handoff",
      amountMinor: 128560,
      currency: "CNY",
      metadata: {
        safeNote: "kept",
        rawProviderPayload: "{raw}",
        signature: "signature_should_not_leak",
        secret: "secret_should_not_leak",
        providerRefundRequest: "must-not-leak",
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
  });

const expectSafe = (result: ReturnType<typeof mapRefundHandoffToWorkflowShadowCommand>) => {
  expect(result).toMatchObject({
    executable: false,
    workflowExecutionAllowed: false,
    runtimeMutationBlocked: true,
    refundSuccessState: false,
  });
  const serialized = JSON.stringify(result);

  expect(serialized).not.toContain("signature_should_not_leak");
  expect(serialized).not.toContain("secret_should_not_leak");
  expect(serialized).not.toContain("rawProviderPayload");
  expect(serialized).not.toContain("providerRefundRequest");
  expect(serialized).not.toContain("providerRefundQuery");
  expect(serialized).not.toContain("workflowExecution\":\"must-not-leak");
  expect(serialized).not.toContain("refundStateMutation");
  expect(serialized).not.toContain("settlementAdjustment");
  expect(serialized).not.toContain("commissionAdjustment");
  expect(serialized).not.toContain("payoutAdjustment");
  expect(serialized).not.toContain("fulfillmentMutation");
  expect(serialized).not.toContain("logisticsMutation");
};

describe("mapRefundHandoffToWorkflowShadowCommand", () => {
  it("maps prepared handoff decisions to non-executable workflow shadow commands", () => {
    const result = map();

    expect(result).toMatchObject({
      decision: "shadow_command_recorded",
      idempotencyKey:
        "refund_workflow_shadow:refund_notify:wechat_pay:evt_refund_provider_001:shadow_command_prepared:provider_inbox:wx_refund_001",
      command: {
        commandType: "refund_workflow_shadow",
        workflowName: "refund_payment",
        shadowOnly: true,
        provider: "wechat_pay",
        inboxRecordId: "rinbox_001",
        providerRefundId: "wx_refund_001",
        localRefundCommandKey: "refund_cmd_wechat_001",
        amountMinor: 128560,
        currency: "CNY",
      },
      auditEvent: {
        action: "refund_workflow_shadow_command_prepared",
      },
    });
    expectSafe(result);
  });

  it("maps manual review decisions to audit-only without a command", () => {
    const result = map(
      evaluateRefundStateOwnerHandoffContract(
        handoffInput({
          inboxProcessingStatus: "digest_conflict_manual_review",
        }),
      ),
    );

    expect(result).toMatchObject({
      decision: "manual_review_audit_recorded",
      auditEvent: {
        action: "refund_manual_review_required",
      },
    });
    expect(result.command).toBeUndefined();
    expectSafe(result);
  });

  it("maps query-required decisions without calling query APIs", () => {
    const result = map(
      evaluateRefundStateOwnerHandoffContract(
        handoffInput({
          envelope: envelope({ providerRefundId: undefined }),
        }),
      ),
    );

    expect(result).toMatchObject({
      decision: "query_follow_up_required",
      auditEvent: {
        action: "refund_query_follow_up_required",
      },
    });
    expect(result.command).toBeUndefined();
    expectSafe(result);
  });

  it("maps terminal state conflicts to reconciliation without financial mutation", () => {
    const result = map(
      evaluateRefundStateOwnerHandoffContract(
        handoffInput({
          expectedRefundSnapshot: {
            ...handoffInput().expectedRefundSnapshot,
            currentPlatformRefundState: "succeeded",
          },
        }),
      ),
    );

    expect(result).toMatchObject({
      decision: "reconciliation_required",
      auditEvent: {
        action: "refund_reconciliation_required",
      },
    });
    expect(result.command).toBeUndefined();
    expectSafe(result);
  });

  it("maps blocked handoff decisions without a command", () => {
    const result = map(
      evaluateRefundStateOwnerHandoffContract(
        handoffInput({
          permissionCheck: {
            actorType: "vendor",
            actorId: "seller_user_001",
            passed: false,
          },
        }),
      ),
    );

    expect(result).toMatchObject({
      decision: "blocked",
      auditEvent: {
        action: "refund_workflow_shadow_blocked",
      },
    });
    expect(result.command).toBeUndefined();
    expectSafe(result);
  });
});
