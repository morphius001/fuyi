import {
  createRefundStateMutationIsolatedPreprodQuerySurface,
  RefundStateMutationReviewCaseResult,
} from "./refund-state-mutation-isolated-preprod-query-surface";
import {
  RefundReviewFixtureSelectorInput,
  RefundReviewFixtureSelectorResolution,
  resolveRefundReviewFixtureSelector,
} from "./refund-state-mutation-review-fixture-registry";

export type RefundReviewFixtureAdapterQuery =
  | {
      kind: "platform_refund_id";
      platformRefundId: string;
    }
  | {
      kind: "approval_persistence_idempotency_key";
      approvalPersistenceIdempotencyKey: string;
    }
  | {
      kind: "runtime_attempt_persistence_idempotency_key";
      runtimeAttemptPersistenceIdempotencyKey: string;
    }
  | {
      kind: "terminal_conflict_persistence_idempotency_key";
      terminalConflictPersistenceIdempotencyKey: string;
    }
  | {
      kind: "provider_refund_reference";
      providerName: "wechat_pay" | "alipay" | "mock_china_pay";
      providerRefundReference: string;
    };

export type RefundReviewFixtureAdapterBlockedResult = {
  status: "blocked";
  blockCode: string;
  reason: string;
  selectorResolution?: Extract<
    RefundReviewFixtureSelectorResolution,
    { status: "resolved" }
  >;
};

export type RefundReviewFixtureAdapterResolvedResult = {
  status: "resolved";
  selectorResolution: Extract<
    RefundReviewFixtureSelectorResolution,
    { status: "resolved" }
  >;
  reviewCaseResult: RefundStateMutationReviewCaseResult;
};

export type RefundReviewFixtureAdapterResult =
  | RefundReviewFixtureAdapterBlockedResult
  | RefundReviewFixtureAdapterResolvedResult;

const blocked = (
  blockCode: string,
  reason: string,
  selectorResolution?: Extract<
    RefundReviewFixtureSelectorResolution,
    { status: "resolved" }
  >,
): RefundReviewFixtureAdapterBlockedResult => ({
  status: "blocked",
  blockCode,
  reason,
  selectorResolution,
});

export const resolveRefundReviewCaseFromFixtureSelector = (
  selector: RefundReviewFixtureSelectorInput,
  query: RefundReviewFixtureAdapterQuery,
): RefundReviewFixtureAdapterResult => {
  const selectorResolution = resolveRefundReviewFixtureSelector(selector);

  if (selectorResolution.status === "blocked") {
    return blocked(
      selectorResolution.blockCode,
      selectorResolution.reason,
    );
  }

  const querySurface = createRefundStateMutationIsolatedPreprodQuerySurface(
    selectorResolution.bundle.reviewInput,
  );

  const reviewCaseResult = (() => {
    switch (query.kind) {
      case "platform_refund_id":
        return querySurface.reviewCaseByPlatformRefundId(query.platformRefundId);
      case "approval_persistence_idempotency_key":
        return querySurface.reviewCaseByApprovalPersistenceIdempotencyKey(
          query.approvalPersistenceIdempotencyKey,
        );
      case "runtime_attempt_persistence_idempotency_key":
        return querySurface.reviewCaseByRuntimeAttemptPersistenceIdempotencyKey(
          query.runtimeAttemptPersistenceIdempotencyKey,
        );
      case "terminal_conflict_persistence_idempotency_key":
        return querySurface.reviewCaseByTerminalConflictPersistenceIdempotencyKey(
          query.terminalConflictPersistenceIdempotencyKey,
        );
      case "provider_refund_reference":
        return querySurface.reviewCaseByProviderRefundReference(
          query.providerName,
          query.providerRefundReference,
        );
    }
  })();

  return {
    status: "resolved",
    selectorResolution,
    reviewCaseResult,
  };
};
