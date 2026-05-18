import { RefundReviewQuerySurfaceConfigDecision } from "./refund-state-mutation-review-query-surface-config";
import { RefundReviewQuerySurfaceLocalResolverResult } from "./refund-state-mutation-review-query-surface-local-resolver";
import { RefundReviewQuerySurfaceRepositoryResolverResult } from "./refund-state-mutation-review-query-surface-repository-resolver";

type SafeResolvedSelectorResolution = {
  status: "resolved";
  resolvedBy: "explicit_source_key" | "default_scenario_fixture";
  manifestEntry: {
    fixtureSourceKey: string;
    fixtureId: string;
    scenarioType: string;
    localOnly: true;
    redacted: true;
    version: string;
    status: string;
    defaultScenario: boolean;
  };
};

type SafeResolvedAdapterResult = {
  status: "resolved";
  selectorResolution: SafeResolvedSelectorResolution;
  reviewCaseResult: Extract<
    Extract<
      RefundReviewQuerySurfaceLocalResolverResult,
      { status: "resolved" }
    >["result"],
    { status: "resolved" }
  >["reviewCaseResult"];
};

type ResolvedLocalAdapterResult = Extract<
  Extract<
    RefundReviewQuerySurfaceLocalResolverResult,
    { status: "resolved" }
  >["result"],
  { status: "resolved" }
>;

export type RefundReviewQuerySurfaceSafeResponse = {
  status: "disabled" | "blocked" | "resolved";
  surface: "refund_state_mutation_review_query_surface";
  mode?: "disabled" | "local_fixture" | "isolated_preprod_repository";
  code?: string;
  reason?: string;
  runtimeMutationBlocked: true;
  workflowExecutionAllowed: false;
  stateMutationAllowed: false;
  refundSuccessState: false;
  result?: SafeResolvedAdapterResult;
  evidenceCounts?: {
    approvalRecords: number;
    auditRecords: number;
    runtimeAttemptRecords: number;
    terminalConflictSnapshots: number;
  };
};

const toSafeResolvedAdapterResult = (
  result: ResolvedLocalAdapterResult,
): SafeResolvedAdapterResult => ({
  status: "resolved",
  selectorResolution: {
    status: "resolved",
    resolvedBy: result.selectorResolution.resolvedBy,
    manifestEntry: {
      fixtureSourceKey: result.selectorResolution.manifestEntry.fixtureSourceKey,
      fixtureId: result.selectorResolution.manifestEntry.fixtureId,
      scenarioType: result.selectorResolution.manifestEntry.scenarioType,
      localOnly: result.selectorResolution.manifestEntry.localOnly,
      redacted: result.selectorResolution.manifestEntry.redacted,
      version: result.selectorResolution.manifestEntry.version,
      status: result.selectorResolution.manifestEntry.status,
      defaultScenario: result.selectorResolution.manifestEntry.defaultScenario,
    },
  },
  reviewCaseResult: result.reviewCaseResult,
});

export const buildRefundReviewQuerySurfaceDisabledResponse = (
  decision: RefundReviewQuerySurfaceConfigDecision,
): RefundReviewQuerySurfaceSafeResponse => ({
  status: "disabled",
  surface: "refund_state_mutation_review_query_surface",
  mode: decision.mode,
  code: decision.enabled ? undefined : decision.code,
  reason: decision.enabled
    ? "Refund review query surface is enabled."
    : decision.reason,
  runtimeMutationBlocked: true,
  workflowExecutionAllowed: false,
  stateMutationAllowed: false,
  refundSuccessState: false,
});

export const buildRefundReviewQuerySurfaceResolverResponse = (
  mode: "local_fixture",
  resolution: RefundReviewQuerySurfaceLocalResolverResult,
): RefundReviewQuerySurfaceSafeResponse => {
  if (resolution.status === "blocked") {
    return {
      status: "blocked",
      surface: "refund_state_mutation_review_query_surface",
      mode,
      code: resolution.blockCode,
      reason: resolution.reason,
      runtimeMutationBlocked: true,
      workflowExecutionAllowed: false,
      stateMutationAllowed: false,
      refundSuccessState: false,
    };
  }

  if (resolution.result.status === "blocked") {
    return {
      status: "blocked",
      surface: "refund_state_mutation_review_query_surface",
      mode,
      code: resolution.result.blockCode,
      reason: resolution.result.reason,
      runtimeMutationBlocked: true,
      workflowExecutionAllowed: false,
      stateMutationAllowed: false,
      refundSuccessState: false,
    };
  }

  const adapterResult = resolution.result;

  if (adapterResult.reviewCaseResult.resultType !== "review_case") {
    return {
      status: "blocked",
      surface: "refund_state_mutation_review_query_surface",
      mode,
      code: adapterResult.reviewCaseResult.blockCode,
      reason: adapterResult.reviewCaseResult.operatorVisibleReason,
      runtimeMutationBlocked: true,
      workflowExecutionAllowed: false,
      stateMutationAllowed: false,
      refundSuccessState: false,
      result: toSafeResolvedAdapterResult(adapterResult),
    };
  }

  return {
    status: "resolved",
    surface: "refund_state_mutation_review_query_surface",
    mode,
    runtimeMutationBlocked: true,
    workflowExecutionAllowed: false,
    stateMutationAllowed: false,
    refundSuccessState: false,
    result: toSafeResolvedAdapterResult(adapterResult),
  };
};

export const buildRefundReviewQuerySurfaceRepositoryResolverResponse = (
  mode: "isolated_preprod_repository",
  resolution: RefundReviewQuerySurfaceRepositoryResolverResult,
): RefundReviewQuerySurfaceSafeResponse => {
  if (resolution.status === "blocked") {
    return {
      status: "blocked",
      surface: "refund_state_mutation_review_query_surface",
      mode,
      code: resolution.blockCode,
      reason: resolution.reason,
      runtimeMutationBlocked: true,
      workflowExecutionAllowed: false,
      stateMutationAllowed: false,
      refundSuccessState: false,
    };
  }

  if (resolution.reviewCaseResult.resultType !== "review_case") {
    return {
      status: "blocked",
      surface: "refund_state_mutation_review_query_surface",
      mode,
      code: resolution.reviewCaseResult.blockCode,
      reason: resolution.reviewCaseResult.operatorVisibleReason,
      runtimeMutationBlocked: true,
      workflowExecutionAllowed: false,
      stateMutationAllowed: false,
      refundSuccessState: false,
      evidenceCounts: resolution.evidenceCounts,
    };
  }

  return {
    status: "resolved",
    surface: "refund_state_mutation_review_query_surface",
    mode,
    runtimeMutationBlocked: true,
    workflowExecutionAllowed: false,
    stateMutationAllowed: false,
    refundSuccessState: false,
    evidenceCounts: resolution.evidenceCounts,
  };
};
