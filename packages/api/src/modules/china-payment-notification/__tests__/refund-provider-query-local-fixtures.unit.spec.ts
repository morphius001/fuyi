import {
  planRefundProviderQueryReconciliation,
  refundProviderQueryLocalFixtures,
} from "..";

describe("refund provider query local fixtures", () => {
  it("contains redacted fake-only provider query snapshots", () => {
    expect(refundProviderQueryLocalFixtures).toHaveLength(3);

    for (const fixture of refundProviderQueryLocalFixtures) {
      expect(fixture.fixtureOnly).toBe(true);
      expect(fixture.executable).toBe(false);
      expect(fixture.networkRequestAllowed).toBe(false);
      expect(fixture.providerQueryAllowed).toBe(false);
      expect(fixture.runtimeMutationBlocked).toBe(true);
      expect(fixture.refundSuccessState).toBe(false);
      expect(fixture.snapshot.redactionApplied).toBe(true);
      expect(fixture.snapshot.providerQueryAllowed).toBe(false);
      expect(fixture.snapshot.runtimeMutationBlocked).toBe(true);
      expect(fixture.snapshot.refundSuccessState).toBe(false);
      expect(fixture.snapshot.rawPayloadDigest).toMatch(/^sha256:/);
    }
  });

  it("feeds reconciliation without allowing refund success mutation", () => {
    for (const fixture of refundProviderQueryLocalFixtures) {
      const result = planRefundProviderQueryReconciliation({
        snapshot: fixture.snapshot,
        expectedRefund: fixture.expectedRefund,
        safetyChecks: {
          ownershipPassed: true,
          permissionPassed: true,
        },
        auditContext: {
          actorType: "system_job",
          actorId: "fixture-reconciliation",
        },
      });

      expect(result.decision).toBe(fixture.expectedReconciliationDecision);
      expect(result).toMatchObject({
        executable: false,
        workflowExecutionAllowed: false,
        runtimeMutationBlocked: true,
        refundSuccessState: false,
      });
      expect(result.manualReviewHandoff).toMatchObject({
        stateMutationAllowed: false,
        financialMutationAllowed: false,
        fulfillmentMutationAllowed: false,
      });
    }
  });

  it("does not expose secrets, raw payloads, SDK hooks, or provider query calls", () => {
    const serialized = JSON.stringify(refundProviderQueryLocalFixtures);

    expect(serialized).not.toContain("BEGIN PRIVATE KEY");
    expect(serialized).not.toContain("BEGIN CERTIFICATE");
    expect(serialized).not.toContain("APIv3");
    expect(serialized).not.toContain("app_secret");
    expect(serialized).not.toContain("rawProviderPayload");
    expect(serialized).not.toContain("signature");
    expect(serialized).not.toContain("wechat_refund_query");
    expect(serialized).not.toContain("alipay_trade_fastpay_refund_query");
    expect(serialized).not.toContain("providerRefundQuery");
    expect(serialized).not.toContain("executeWorkflow");
    expect(serialized).not.toContain("refundStateMutation");
    expect(serialized).not.toContain("settlementAdjustment");
    expect(serialized).not.toContain("commissionAdjustment");
    expect(serialized).not.toContain("payoutAdjustment");
    expect(serialized).not.toContain("fulfillmentMutation");
    expect(serialized).not.toContain("logisticsMutation");
  });
});
