import { resolveRefundReviewQuerySurfaceRequest } from "../refund-state-mutation-review-query-surface-composition";
import {
  operatorReviewReadyFixtureScenarioType,
  operatorReviewReadyFixtureSourceKey,
} from "../fixtures/review-query-surface/scenarios/operator-review-ready.fixture";

describe("refund state mutation review query surface composition", () => {
  it("returns a disabled response when runtime config is off", async () => {
    const result = await resolveRefundReviewQuerySurfaceRequest({
      env: {},
      environment: "development",
      query: {
        kind: "platform_refund_id",
        platformRefundId: "refund_platform_001",
      },
    });

    expect(result.response).toEqual({
      status: "disabled",
      surface: "refund_state_mutation_review_query_surface",
      mode: "disabled",
      code: "REFUND_REVIEW_QUERY_SURFACE_DISABLED",
      reason: "Refund review query surface is disabled.",
      runtimeMutationBlocked: true,
      workflowExecutionAllowed: false,
      stateMutationAllowed: false,
      refundSuccessState: false,
    });
  });

  it("returns a resolved local fixture response when config and selector both pass", async () => {
    const result = await resolveRefundReviewQuerySurfaceRequest({
      env: {
        CHINA_REFUND_REVIEW_QUERY_SURFACE_ENABLED: "true",
        CHINA_REFUND_REVIEW_QUERY_SURFACE_MODE: "local_fixture",
        CHINA_REFUND_REVIEW_QUERY_SURFACE_TARGET_ENV: "local",
      },
      environment: "development",
      selector: {
        selectorMode: "scenario_default",
        localOnly: true,
        scenarioType: operatorReviewReadyFixtureScenarioType,
      },
      query: {
        kind: "provider_refund_reference",
        providerName: "wechat_pay",
        providerRefundReference: "wx_refund_001",
      },
    });

    expect(result.response).toMatchObject({
      status: "resolved",
      surface: "refund_state_mutation_review_query_surface",
      mode: "local_fixture",
      runtimeMutationBlocked: true,
      result: {
        status: "resolved",
        selectorResolution: {
          status: "resolved",
          manifestEntry: {
            fixtureSourceKey: operatorReviewReadyFixtureSourceKey,
            scenarioType: operatorReviewReadyFixtureScenarioType,
          },
        },
        reviewCaseResult: {
          resultType: "review_case",
          providerRefundReference: "wx_refund_001",
        },
      },
    });
    expect(
      (result.response.result as Record<string, unknown>)?.selectorResolution,
    ).not.toHaveProperty("bundle");
  });

  it("returns a blocked response when config is enabled but selector is invalid", async () => {
    const result = await resolveRefundReviewQuerySurfaceRequest({
      env: {
        CHINA_REFUND_REVIEW_QUERY_SURFACE_ENABLED: "true",
        CHINA_REFUND_REVIEW_QUERY_SURFACE_MODE: "local_fixture",
        CHINA_REFUND_REVIEW_QUERY_SURFACE_TARGET_ENV: "local",
      },
      environment: "development",
      selector: {
        selectorMode: "explicit_source_key",
        localOnly: true,
        fixtureSourceKey: `${operatorReviewReadyFixtureSourceKey}_missing`,
      },
      query: {
        kind: "platform_refund_id",
        platformRefundId: "refund_platform_001",
      },
    });

    expect(result.response).toEqual({
      status: "blocked",
      surface: "refund_state_mutation_review_query_surface",
      mode: "local_fixture",
      code: "fixture_selector_invalid",
      reason:
        "Unknown refund review fixture source key 'operator_review_ready_fixture_001_missing'.",
      runtimeMutationBlocked: true,
      workflowExecutionAllowed: false,
      stateMutationAllowed: false,
      refundSuccessState: false,
    });
  });

  it("preserves a safe blocked review case payload when the fixture query misses", async () => {
    const result = await resolveRefundReviewQuerySurfaceRequest({
      env: {
        CHINA_REFUND_REVIEW_QUERY_SURFACE_ENABLED: "true",
        CHINA_REFUND_REVIEW_QUERY_SURFACE_MODE: "local_fixture",
        CHINA_REFUND_REVIEW_QUERY_SURFACE_TARGET_ENV: "local",
      },
      environment: "development",
      selector: {
        selectorMode: "explicit_source_key",
        localOnly: true,
        fixtureSourceKey: operatorReviewReadyFixtureSourceKey,
      },
      query: {
        kind: "platform_refund_id",
        platformRefundId: "refund_platform_missing",
      },
    });

    expect(result.response).toMatchObject({
      status: "blocked",
      surface: "refund_state_mutation_review_query_surface",
      mode: "local_fixture",
      code: "review_case_not_found",
      reason: "No terminal conflict snapshot was found for the requested review case.",
      runtimeMutationBlocked: true,
      workflowExecutionAllowed: false,
      stateMutationAllowed: false,
      refundSuccessState: false,
      result: {
        status: "resolved",
        selectorResolution: {
          status: "resolved",
          manifestEntry: {
            fixtureSourceKey: operatorReviewReadyFixtureSourceKey,
          },
        },
        reviewCaseResult: {
          resultType: "blocked",
          blockCode: "review_case_not_found",
          currentReviewStatusLabel: "blocked",
          queryKey: {
            kind: "platform_refund_id",
            value: "refund_platform_missing",
          },
        },
      },
    });
    expect(
      (result.response.result as Record<string, unknown>)?.selectorResolution,
    ).not.toHaveProperty("bundle");
  });

  it("returns a blocked response when repository mode is enabled without injected readers", async () => {
    const result = await resolveRefundReviewQuerySurfaceRequest({
      env: {
        APP_ENV: "staging",
        CHINA_REFUND_REVIEW_QUERY_SURFACE_ENABLED: "true",
        CHINA_REFUND_REVIEW_QUERY_SURFACE_MODE:
          "isolated_preprod_repository",
        CHINA_REFUND_REVIEW_QUERY_SURFACE_TARGET_ENV: "isolated_preprod",
      },
      environment: "staging",
      query: {
        kind: "platform_refund_id",
        platformRefundId: "refund_platform_001",
      },
    });

    expect(result.response).toEqual({
      status: "blocked",
      surface: "refund_state_mutation_review_query_surface",
      mode: "isolated_preprod_repository",
      code: "resolver_repository_mode_blocked",
      reason:
        "Refund review query surface repository readers are not available.",
      runtimeMutationBlocked: true,
      workflowExecutionAllowed: false,
      stateMutationAllowed: false,
      refundSuccessState: false,
    });
  });

  it("returns a safe blocked response when repository reader queries fail", async () => {
    const result = await resolveRefundReviewQuerySurfaceRequest({
      env: {
        APP_ENV: "staging",
        CHINA_REFUND_REVIEW_QUERY_SURFACE_ENABLED: "true",
        CHINA_REFUND_REVIEW_QUERY_SURFACE_MODE:
          "isolated_preprod_repository",
        CHINA_REFUND_REVIEW_QUERY_SURFACE_TARGET_ENV: "isolated_preprod",
      },
      environment: "staging",
      query: {
        kind: "platform_refund_id",
        platformRefundId: "refund_platform_001",
      },
      repositories: {
        approvalRepository: {
          getByApprovalIdempotencyKey: async () => null,
          getByPlatformRefundId: jest
            .fn()
            .mockRejectedValue(new Error("db unavailable")),
          getByProviderRefundReference: async () => [],
        },
        auditRepository: {
          getByAuditPersistenceIdempotencyKey: async () => null,
          getByApprovalPersistenceIdempotencyKey: async () => [],
        },
        runtimeAttemptRepository: {
          getByRuntimeAttemptPersistenceIdempotencyKey: async () => null,
          getByWorkflowIdempotencyKey: async () => [],
          getByPlatformRefundId: async () => [],
        },
        terminalConflictRepository: {
          getByTerminalConflictPersistenceIdempotencyKey: async () => null,
          getByPlatformRefundId: async () => [],
          getByTerminalMarkerKey: async () => [],
          getByApprovalPersistenceIdempotencyKey: async () => [],
        },
      },
    });

    expect(result.response).toEqual({
      status: "blocked",
      surface: "refund_state_mutation_review_query_surface",
      mode: "isolated_preprod_repository",
      code: "resolver_repository_query_failed",
      reason: "Refund review query surface repository query failed.",
      runtimeMutationBlocked: true,
      workflowExecutionAllowed: false,
      stateMutationAllowed: false,
      refundSuccessState: false,
    });
  });
});
