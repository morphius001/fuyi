import {
  planRefundProviderQueryFollowUp,
  RefundProviderQueryFollowUpInput,
} from "..";

const input = (
  overrides: Partial<RefundProviderQueryFollowUpInput> = {},
): RefundProviderQueryFollowUpInput => ({
  provider: "wechat_pay",
  trigger: "missing_provider_refund_id",
  requestedAt: "2026-05-12T00:20:00.000Z",
  requestedBy: "system_job",
  queryKey: {
    outRefundNo: "refund_cmd_wechat_001",
  },
  expectedRefund: {
    localRefundCommandKey: "refund_cmd_wechat_001",
    amountMinor: 128560,
    currency: "CNY",
    merchantOrderReference: "pay_order_001",
    paymentProviderSessionId: "payses_001",
    currentPlatformRefundState: "pending",
  },
  safetyChecks: {
    signatureVerified: true,
    amountMatches: true,
    currencyMatches: true,
    ownershipPassed: true,
    permissionPassed: true,
  },
  auditContext: {
    sourceInboxId: "rinbox_001",
    sourceAuditEventId: "raud_001",
    providerEventId: "evt_refund_provider_001",
    actorId: "refund-query-shadow",
    merchantRef: "seller_001",
    metadata: {
      safeNote: "kept",
      rawProviderPayload: "{raw}",
      signature: "signature_should_not_leak",
      secret: "secret_should_not_leak",
      privateKey: "private_key_should_not_leak",
      apiV3Key: "api_v3_key_should_not_leak",
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
  ...overrides,
});

const expectSafe = (
  result: ReturnType<typeof planRefundProviderQueryFollowUp>,
) => {
  expect(result).toMatchObject({
    executable: false,
    providerQueryAllowed: false,
    runtimeMutationBlocked: true,
    refundSuccessState: false,
  });

  const serialized = JSON.stringify(result);

  expect(serialized).not.toContain("signature_should_not_leak");
  expect(serialized).not.toContain("secret_should_not_leak");
  expect(serialized).not.toContain("private_key_should_not_leak");
  expect(serialized).not.toContain("api_v3_key_should_not_leak");
  expect(serialized).not.toContain("rawProviderPayload");
  expect(serialized).not.toContain("providerRefundRequest");
  expect(serialized).not.toContain("providerRefundQuery");
  expect(serialized).not.toContain("workflowExecution");
  expect(serialized).not.toContain("refundStateMutation");
  expect(serialized).not.toContain("settlementAdjustment");
  expect(serialized).not.toContain("commissionAdjustment");
  expect(serialized).not.toContain("payoutAdjustment");
  expect(serialized).not.toContain("fulfillmentMutation");
  expect(serialized).not.toContain("logisticsMutation");
};

describe("planRefundProviderQueryFollowUp", () => {
  it("plans a WeChat Pay shadow query command without allowing provider query runtime", () => {
    const result = planRefundProviderQueryFollowUp(input());

    expect(result).toMatchObject({
      decision: "query_follow_up_planned",
      idempotencyKey:
        "provider_refund_query_follow_up:wechat_pay:missing_provider_refund_id:refund_cmd_wechat_001:refund_cmd_wechat_001",
      queryCommand: {
        commandType: "provider_refund_query_shadow",
        shadowOnly: true,
        provider: "wechat_pay",
        queryBy: "outRefundNo",
        queryKeyRef: "refund_cmd_wechat_001",
        localRefundCommandKey: "refund_cmd_wechat_001",
        credentialProfileRef: "redacted",
        providerQueryAllowed: false,
      },
      auditEvent: {
        action: "provider_refund_query_follow_up_planned",
      },
    });
    expectSafe(result);
  });

  it("plans an Alipay shadow query from outRequestNo without treating it as refund success", () => {
    const result = planRefundProviderQueryFollowUp(
      input({
        provider: "alipay",
        trigger: "query_required_notification",
        queryKey: {
          outRequestNo: "refund_cmd_alipay_001",
          tradeNo: "ali_trade_001",
        },
        expectedRefund: {
          ...input().expectedRefund,
          localRefundCommandKey: "refund_cmd_alipay_001",
        },
      }),
    );

    expect(result).toMatchObject({
      decision: "query_follow_up_planned",
      refundSuccessState: false,
      queryCommand: {
        provider: "alipay",
        queryBy: "outRequestNo",
        queryKeyRef: "refund_cmd_alipay_001",
        providerQueryAllowed: false,
      },
    });
    expectSafe(result);
  });

  it("blocks unverified notification context before planning a query", () => {
    const result = planRefundProviderQueryFollowUp(
      input({
        safetyChecks: {
          ...input().safetyChecks,
          signatureVerified: false,
        },
      }),
    );

    expect(result).toMatchObject({
      decision: "blocked",
      blockCodes: ["SIGNATURE_NOT_VERIFIED"],
    });
    expect(result.queryCommand).toBeUndefined();
    expectSafe(result);
  });

  it("requires manual review when the local platform state is terminal", () => {
    const result = planRefundProviderQueryFollowUp(
      input({
        expectedRefund: {
          ...input().expectedRefund,
          currentPlatformRefundState: "succeeded",
        },
      }),
    );

    expect(result).toMatchObject({
      decision: "manual_review_required",
      blockCodes: ["TERMINAL_STATE_CONFLICT"],
      auditEvent: {
        action: "provider_refund_query_follow_up_manual_review",
      },
    });
    expect(result.queryCommand).toBeUndefined();
    expectSafe(result);
  });

  it("blocks runtime mutation requests and does not emit workflow or finance commands", () => {
    const result = planRefundProviderQueryFollowUp(
      input({
        safetyChecks: {
          ...input().safetyChecks,
          runtimeMutationRequested: true,
        },
      }),
    );

    expect(result).toMatchObject({
      decision: "blocked",
      blockCodes: ["RUNTIME_MUTATION_REQUESTED"],
      providerQueryAllowed: false,
      refundSuccessState: false,
    });
    expect(result.queryCommand).toBeUndefined();
    expectSafe(result);
  });

  it("does not plan a provider query when provider-specific query keys are missing", () => {
    const result = planRefundProviderQueryFollowUp(
      input({
        queryKey: {},
      }),
    );

    expect(result).toMatchObject({
      decision: "manual_review_required",
      blockCodes: ["QUERY_KEY_MISSING"],
    });
    expect(result.queryCommand).toBeUndefined();
    expectSafe(result);
  });
});
