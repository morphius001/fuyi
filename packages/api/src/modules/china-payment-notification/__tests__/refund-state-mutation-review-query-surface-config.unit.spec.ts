import { parseRefundReviewQuerySurfaceConfig } from "../refund-state-mutation-review-query-surface-config";

describe("refund state mutation review query surface config", () => {
  it("defaults to disabled", () => {
    expect(parseRefundReviewQuerySurfaceConfig({})).toEqual({
      enabled: false,
      mode: "disabled",
      code: "REFUND_REVIEW_QUERY_SURFACE_DISABLED",
      reason: "Refund review query surface is disabled.",
      fixtureOnly: true,
      executable: false,
      workflowExecutionAllowed: false,
      stateMutationAllowed: false,
      runtimeMutationBlocked: true,
      refundSuccessState: false,
    });
  });

  it("blocks production-like environments", () => {
    expect(
      parseRefundReviewQuerySurfaceConfig({
        NODE_ENV: "production",
        CHINA_REFUND_REVIEW_QUERY_SURFACE_ENABLED: "true",
        CHINA_REFUND_REVIEW_QUERY_SURFACE_MODE: "local_fixture",
        CHINA_REFUND_REVIEW_QUERY_SURFACE_TARGET_ENV: "local",
      }),
    ).toEqual({
      enabled: false,
      mode: "local_fixture",
      code: "REFUND_REVIEW_QUERY_SURFACE_PRODUCTION_BLOCKED",
      reason:
        "Refund review query surface is blocked in production-like environments.",
      fixtureOnly: true,
      executable: false,
      workflowExecutionAllowed: false,
      stateMutationAllowed: false,
      runtimeMutationBlocked: true,
      refundSuccessState: false,
    });
  });

  it("enables local fixture mode only with explicit local target env", () => {
    expect(
      parseRefundReviewQuerySurfaceConfig({
        CHINA_REFUND_REVIEW_QUERY_SURFACE_ENABLED: "true",
        CHINA_REFUND_REVIEW_QUERY_SURFACE_MODE: "local_fixture",
        CHINA_REFUND_REVIEW_QUERY_SURFACE_TARGET_ENV: "local",
      }),
    ).toEqual({
      enabled: true,
      mode: "local_fixture",
      targetEnv: "local",
      fixtureOnly: true,
      executable: false,
      workflowExecutionAllowed: false,
      stateMutationAllowed: false,
      runtimeMutationBlocked: true,
      refundSuccessState: false,
    });
  });

  it("rejects unsupported modes instead of trusting raw env strings", () => {
    expect(
      parseRefundReviewQuerySurfaceConfig({
        CHINA_REFUND_REVIEW_QUERY_SURFACE_ENABLED: "true",
        CHINA_REFUND_REVIEW_QUERY_SURFACE_MODE: "repository_runtime",
        CHINA_REFUND_REVIEW_QUERY_SURFACE_TARGET_ENV: "local",
      }),
    ).toEqual({
      enabled: false,
      mode: "disabled",
      code: "REFUND_REVIEW_QUERY_SURFACE_MODE_UNSUPPORTED",
      reason: "Refund review query surface mode is unsupported.",
      fixtureOnly: true,
      executable: false,
      workflowExecutionAllowed: false,
      stateMutationAllowed: false,
      runtimeMutationBlocked: true,
      refundSuccessState: false,
    });
  });

  it("treats whitespace-only env values as unset", () => {
    expect(
      parseRefundReviewQuerySurfaceConfig({
        CHINA_REFUND_REVIEW_QUERY_SURFACE_ENABLED: "   ",
        CHINA_REFUND_REVIEW_QUERY_SURFACE_MODE: "   ",
        CHINA_REFUND_REVIEW_QUERY_SURFACE_TARGET_ENV: "   ",
      }),
    ).toEqual({
      enabled: false,
      mode: "disabled",
      code: "REFUND_REVIEW_QUERY_SURFACE_DISABLED",
      reason: "Refund review query surface is disabled.",
      fixtureOnly: true,
      executable: false,
      workflowExecutionAllowed: false,
      stateMutationAllowed: false,
      runtimeMutationBlocked: true,
      refundSuccessState: false,
    });
  });

  it("accepts trimmed local fixture env values", () => {
    expect(
      parseRefundReviewQuerySurfaceConfig({
        CHINA_REFUND_REVIEW_QUERY_SURFACE_ENABLED: "true",
        CHINA_REFUND_REVIEW_QUERY_SURFACE_MODE: " local_fixture ",
        CHINA_REFUND_REVIEW_QUERY_SURFACE_TARGET_ENV: " local ",
      }),
    ).toEqual({
      enabled: true,
      mode: "local_fixture",
      targetEnv: "local",
      fixtureOnly: true,
      executable: false,
      workflowExecutionAllowed: false,
      stateMutationAllowed: false,
      runtimeMutationBlocked: true,
      refundSuccessState: false,
    });
  });

  it("enables isolated preprod repository mode only with explicit isolated target env", () => {
    expect(
      parseRefundReviewQuerySurfaceConfig({
        APP_ENV: "staging",
        CHINA_REFUND_REVIEW_QUERY_SURFACE_ENABLED: "true",
        CHINA_REFUND_REVIEW_QUERY_SURFACE_MODE:
          " isolated_preprod_repository ",
        CHINA_REFUND_REVIEW_QUERY_SURFACE_TARGET_ENV: " isolated_preprod ",
      }),
    ).toEqual({
      enabled: true,
      mode: "isolated_preprod_repository",
      targetEnv: "isolated_preprod",
      fixtureOnly: false,
      executable: false,
      workflowExecutionAllowed: false,
      stateMutationAllowed: false,
      runtimeMutationBlocked: true,
      refundSuccessState: false,
    });
  });
});
