export type RefundReviewQuerySurfaceMode =
  | "disabled"
  | "local_fixture"
  | "isolated_preprod_repository";

export type RefundReviewQuerySurfaceDisabledCode =
  | "REFUND_REVIEW_QUERY_SURFACE_DISABLED"
  | "REFUND_REVIEW_QUERY_SURFACE_PRODUCTION_BLOCKED"
  | "REFUND_REVIEW_QUERY_SURFACE_MODE_UNSUPPORTED"
  | "REFUND_REVIEW_QUERY_SURFACE_ENV_UNSUPPORTED";

export type RefundReviewQuerySurfaceConfigDecision =
  | {
      enabled: true;
      mode: "local_fixture";
      targetEnv: "local";
      fixtureOnly: true;
      executable: false;
      workflowExecutionAllowed: false;
      stateMutationAllowed: false;
      runtimeMutationBlocked: true;
      refundSuccessState: false;
    }
  | {
      enabled: true;
      mode: "isolated_preprod_repository";
      targetEnv: "isolated_preprod";
      fixtureOnly: false;
      executable: false;
      workflowExecutionAllowed: false;
      stateMutationAllowed: false;
      runtimeMutationBlocked: true;
      refundSuccessState: false;
    }
  | {
      enabled: false;
      mode: RefundReviewQuerySurfaceMode;
      code: RefundReviewQuerySurfaceDisabledCode;
      reason: string;
      fixtureOnly: boolean;
      executable: false;
      workflowExecutionAllowed: false;
      stateMutationAllowed: false;
      runtimeMutationBlocked: true;
      refundSuccessState: false;
    };

const hardBlockedEnvironments = new Set(["production", "prod"]);
const isolatedPreprodEnvironments = new Set(["preprod", "staging"]);

const supportedModes = new Set<RefundReviewQuerySurfaceMode>([
  "disabled",
  "local_fixture",
  "isolated_preprod_repository",
]);

const value = (
  env: Record<string, string | undefined>,
  key: string,
): string | undefined => {
  const candidate = env[key]?.trim();

  return candidate === "" ? undefined : candidate;
};

const isTrue = (
  env: Record<string, string | undefined>,
  key: string,
): boolean => value(env, key) === "true";

const disabled = (
  mode: RefundReviewQuerySurfaceMode,
  code: RefundReviewQuerySurfaceDisabledCode,
  reason: string,
  fixtureOnly = mode !== "isolated_preprod_repository",
): RefundReviewQuerySurfaceConfigDecision => ({
  enabled: false,
  mode,
  code,
  reason,
  fixtureOnly,
  executable: false,
  workflowExecutionAllowed: false,
  stateMutationAllowed: false,
  runtimeMutationBlocked: true,
  refundSuccessState: false,
});

export const parseRefundReviewQuerySurfaceConfig = (
  env: Record<string, string | undefined>,
): RefundReviewQuerySurfaceConfigDecision => {
  const nodeEnv = value(env, "NODE_ENV")?.toLowerCase();
  const appEnv = value(env, "APP_ENV")?.toLowerCase();
  const rawMode = value(env, "CHINA_REFUND_REVIEW_QUERY_SURFACE_MODE");
  const mode = supportedModes.has((rawMode ?? "disabled") as RefundReviewQuerySurfaceMode)
    ? ((rawMode ?? "disabled") as RefundReviewQuerySurfaceMode)
    : "disabled";

  if (
    hardBlockedEnvironments.has(nodeEnv ?? "") ||
    hardBlockedEnvironments.has(appEnv ?? "")
  ) {
    return disabled(
      mode,
      "REFUND_REVIEW_QUERY_SURFACE_PRODUCTION_BLOCKED",
      "Refund review query surface is blocked in production-like environments.",
    );
  }

  if (
    !isTrue(env, "CHINA_REFUND_REVIEW_QUERY_SURFACE_ENABLED") ||
    mode === "disabled"
  ) {
    if (rawMode && !supportedModes.has(rawMode as RefundReviewQuerySurfaceMode)) {
      return disabled(
        "disabled",
        "REFUND_REVIEW_QUERY_SURFACE_MODE_UNSUPPORTED",
        "Refund review query surface mode is unsupported.",
      );
    }

    return disabled(
      mode,
      "REFUND_REVIEW_QUERY_SURFACE_DISABLED",
      "Refund review query surface is disabled.",
    );
  }

  if (mode !== "local_fixture") {
    if (mode !== "isolated_preprod_repository") {
      return disabled(
        mode,
        "REFUND_REVIEW_QUERY_SURFACE_MODE_UNSUPPORTED",
        "Refund review query surface mode is unsupported.",
      );
    }
  }

  const targetEnv = value(env, "CHINA_REFUND_REVIEW_QUERY_SURFACE_TARGET_ENV");

  if (mode === "local_fixture") {
    if (
      isolatedPreprodEnvironments.has(nodeEnv ?? "") ||
      isolatedPreprodEnvironments.has(appEnv ?? "")
    ) {
      return disabled(
        mode,
        "REFUND_REVIEW_QUERY_SURFACE_ENV_UNSUPPORTED",
        "Refund review query surface local fixture mode is blocked outside local development environments.",
      );
    }

    if (targetEnv !== "local") {
      return disabled(
        mode,
        "REFUND_REVIEW_QUERY_SURFACE_ENV_UNSUPPORTED",
        "Refund review query surface local fixture mode is limited to local target env.",
      );
    }

    return {
      enabled: true,
      mode: "local_fixture",
      targetEnv: "local",
      fixtureOnly: true,
      executable: false,
      workflowExecutionAllowed: false,
      stateMutationAllowed: false,
      runtimeMutationBlocked: true,
      refundSuccessState: false,
    };
  }

  if (
    !isolatedPreprodEnvironments.has(nodeEnv ?? "") &&
    !isolatedPreprodEnvironments.has(appEnv ?? "")
  ) {
    return disabled(
      mode,
      "REFUND_REVIEW_QUERY_SURFACE_ENV_UNSUPPORTED",
      "Refund review query surface repository mode is limited to isolated preprod runtime environments.",
      false,
    );
  }

  if (targetEnv !== "isolated_preprod") {
    return disabled(
      mode,
      "REFUND_REVIEW_QUERY_SURFACE_ENV_UNSUPPORTED",
      "Refund review query surface repository mode is limited to isolated_preprod target env.",
      false,
    );
  }

  return {
    enabled: true,
    mode: "isolated_preprod_repository",
    targetEnv: "isolated_preprod",
    fixtureOnly: false,
    executable: false,
    workflowExecutionAllowed: false,
    stateMutationAllowed: false,
    runtimeMutationBlocked: true,
    refundSuccessState: false,
  };
};
