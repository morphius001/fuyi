import {
  RefundReviewFixtureAdapterQuery,
  resolveRefundReviewCaseFromFixtureSelector,
} from "./refund-state-mutation-review-fixture-adapter";
import { RefundReviewFixtureSelectorInput } from "./refund-state-mutation-review-fixture-registry";

export type RefundReviewQuerySurfaceResolverMode = "disabled" | "local_fixture";

export type RefundReviewQuerySurfaceLocalResolverInput = {
  mode: RefundReviewQuerySurfaceResolverMode;
  environment: "development" | "test" | "staging" | "production";
  selector?: RefundReviewFixtureSelectorInput;
  query: RefundReviewFixtureAdapterQuery;
};

export type RefundReviewQuerySurfaceLocalResolverResult =
  | {
      status: "blocked";
      blockCode:
        | "resolver_runtime_mode_blocked"
        | "resolver_runtime_environment_blocked"
        | "resolver_runtime_source_gate_blocked";
      reason: string;
    }
  | {
      status: "resolved";
      result: ReturnType<typeof resolveRefundReviewCaseFromFixtureSelector>;
    };

export const resolveRefundReviewQuerySurfaceLocalResult = (
  input: RefundReviewQuerySurfaceLocalResolverInput,
): RefundReviewQuerySurfaceLocalResolverResult => {
  if (input.mode === "disabled") {
    return {
      status: "blocked",
      blockCode: "resolver_runtime_mode_blocked",
      reason: "Refund review query surface resolver mode is disabled.",
    };
  }

  if (input.environment === "production") {
    return {
      status: "blocked",
      blockCode: "resolver_runtime_environment_blocked",
      reason:
        "Refund review query surface local fixture mode is blocked in production.",
    };
  }

  if (!input.selector) {
    return {
      status: "blocked",
      blockCode: "resolver_runtime_source_gate_blocked",
      reason:
        "Refund review query surface local fixture mode requires an explicit selector.",
    };
  }

  return {
    status: "resolved",
    result: resolveRefundReviewCaseFromFixtureSelector(input.selector, input.query),
  };
};
