import {
  evaluateRefundStateMutationProductionFeatureFlag,
  RefundStateMutationProductionFeatureFlagInput,
} from "..";

const input = (
  overrides: Partial<RefundStateMutationProductionFeatureFlagInput> = {},
): RefundStateMutationProductionFeatureFlagInput => ({
  requestedAt: "2026-05-12T13:35:00.000Z",
  environment: "staging",
  mode: "disabled",
  scope: {
    provider: "wechat_pay",
    marketId: "market_sanmen",
    merchantId: "merchant_001",
    allowlistedMerchantIds: ["merchant_001"],
  },
  ownership: {
    ownerTeam: "platform_finance",
    approverId: "admin_refund_approver_001",
    changeTicketId: "chg_refund_flag_001",
    rollbackOwnerId: "admin_refund_rollback_001",
    rollbackDeadline: "2026-05-12T14:35:00.000Z",
    auditEventId: "audit_flag_001",
  },
  gates: {
    globalKillSwitchOff: true,
    productionExplicitlyEnabled: false,
    scopedRolloutReady: true,
    rollbackRunbookReady: true,
    operatorNoticeReady: true,
    persistencePrerequisitesReady: true,
    workflowDryRunVerified: true,
  },
  metadata: {
    safeFlagNote: "kept",
    rawProviderPayload: "{raw-provider-payload-must-not-leak}",
    productionDbUrl: "postgres://prod-db-must-not-leak",
    key: "generic-key-must-not-leak",
    featureFlagExecutionAllowed: true,
    productionExecutionAllowed: true,
    workflowExecutionAllowed: true,
    stateMutationAllowed: true,
    runtimeMutationBlocked: false,
    refundSuccessState: true,
    settlementMutationAllowed: true,
    commissionMutationAllowed: true,
    payoutMutationAllowed: true,
    permissionMutationAllowed: true,
    fulfillmentMutationAllowed: true,
    logisticsMutationAllowed: true,
    executeWorkflow: "execute-workflow-must-not-leak",
    globalKillSwitch: "global-kill-switch-must-not-leak",
    productionEnabled: "production-enabled-must-not-leak",
  },
  ...overrides,
});

const expectSafe = (
  result: ReturnType<typeof evaluateRefundStateMutationProductionFeatureFlag>,
) => {
  expect(result).toMatchObject({
    featureFlagExecutionAllowed: false,
    productionExecutionAllowed: false,
    workflowExecutionAllowed: false,
    stateMutationAllowed: false,
    runtimeMutationBlocked: true,
    refundSuccessState: false,
    settlementMutationAllowed: false,
    commissionMutationAllowed: false,
    payoutMutationAllowed: false,
    permissionMutationAllowed: false,
    fulfillmentMutationAllowed: false,
    logisticsMutationAllowed: false,
  });

  const serialized = JSON.stringify(result);

  expect(serialized).not.toContain("{raw-provider-payload-must-not-leak}");
  expect(serialized).not.toContain("postgres://prod-db-must-not-leak");
  expect(serialized).not.toContain("generic-key-must-not-leak");
  expect(serialized).not.toContain("\"featureFlagExecutionAllowed\":true");
  expect(serialized).not.toContain("\"productionExecutionAllowed\":true");
  expect(serialized).not.toContain("\"workflowExecutionAllowed\":true");
  expect(serialized).not.toContain("\"stateMutationAllowed\":true");
  expect(serialized).not.toContain("\"refundSuccessState\":true");
  expect(serialized).not.toContain("execute-workflow-must-not-leak");
  expect(serialized).not.toContain("global-kill-switch-must-not-leak");
  expect(serialized).not.toContain("production-enabled-must-not-leak");
};

describe("evaluateRefundStateMutationProductionFeatureFlag", () => {
  it("keeps disabled mode non-executable", () => {
    const result = evaluateRefundStateMutationProductionFeatureFlag(input());

    expect(result).toMatchObject({
      decision: "production_feature_flag_disabled",
      blockCodes: ["production_feature_flag_contract_disabled"],
      auditEvent: {
        action: "refund_state_production_feature_flag_disabled",
      },
    });
    expectSafe(result);
  });

  it("allows only dry-run decision semantics without execution", () => {
    const result = evaluateRefundStateMutationProductionFeatureFlag(
      input({ mode: "dry_run" }),
    );

    expect(result).toMatchObject({
      decision: "production_feature_flag_dry_run",
      auditEvent: {
        action: "refund_state_production_feature_flag_dry_run",
      },
    });
    expectSafe(result);
  });

  it("allows only shadow decision semantics without execution", () => {
    const result = evaluateRefundStateMutationProductionFeatureFlag(
      input({ mode: "shadow_only" }),
    );

    expect(result).toMatchObject({
      decision: "production_feature_flag_shadow_only",
      auditEvent: {
        action: "refund_state_production_feature_flag_shadow_only",
      },
    });
    expectSafe(result);
  });

  it.each(["dry_run", "shadow_only"] as const)(
    "blocks production %s without explicit production enablement",
    (mode) => {
      const result = evaluateRefundStateMutationProductionFeatureFlag(
        input({
          environment: "production",
          mode,
          gates: {
            ...input().gates,
            productionExplicitlyEnabled: false,
          },
        }),
      );

      expect(result).toMatchObject({
        decision: "production_feature_flag_blocked",
        auditEvent: {
          action: "refund_state_production_feature_flag_blocked",
        },
      });
      expect(result.blockCodes).toEqual(
        expect.arrayContaining([
          "production_feature_flag_contract_disabled",
          "production_explicit_enable_missing",
        ]),
      );
      expectSafe(result);
    },
  );

  it("blocks execute mode even when other gates are ready", () => {
    const result = evaluateRefundStateMutationProductionFeatureFlag(
      input({
        environment: "production",
        mode: "execute",
        gates: {
          ...input().gates,
          productionExplicitlyEnabled: true,
        },
      }),
    );

    expect(result).toMatchObject({
      decision: "production_feature_flag_blocked",
    });
    expect(result.blockCodes).toEqual(
      expect.arrayContaining([
        "production_feature_flag_contract_disabled",
        "execute_mode_blocked_until_go",
      ]),
    );
    expectSafe(result);
  });

  it("blocks missing ownership, rollback, prerequisites, and allowlist", () => {
    const result = evaluateRefundStateMutationProductionFeatureFlag(
      input({
        scope: {
          ...input().scope,
          merchantId: "merchant_002",
        },
        ownership: {},
        gates: {
          ...input().gates,
          globalKillSwitchOff: false,
          scopedRolloutReady: false,
          rollbackRunbookReady: false,
          operatorNoticeReady: false,
          persistencePrerequisitesReady: false,
          workflowDryRunVerified: false,
        },
      }),
    );

    expect(result.decision).toBe("production_feature_flag_blocked");
    expect(result.blockCodes).toEqual(
      expect.arrayContaining([
        "global_kill_switch_not_off",
        "scoped_rollout_missing",
        "rollback_runbook_missing",
        "operator_notice_missing",
        "persistence_prerequisites_missing",
        "workflow_dry_run_missing",
        "owner_team_missing",
        "approver_missing",
        "change_ticket_missing",
        "rollback_owner_missing",
        "rollback_deadline_missing",
        "audit_event_missing",
        "merchant_not_allowlisted",
      ]),
    );
    expectSafe(result);
  });
});
