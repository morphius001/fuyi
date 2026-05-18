import {
  createRefundStateMutationIsolatedPreprodQuerySurface,
} from "..";
import { operatorReviewReadyReviewInput } from "../fixtures/review-query-surface/scenarios/operator-review-ready.fixture";

const createInput = () => operatorReviewReadyReviewInput();

describe("createRefundStateMutationIsolatedPreprodQuerySurface", () => {
  it("builds a redacted operator review case from platform refund id", () => {
    const surface = createRefundStateMutationIsolatedPreprodQuerySurface(
      createInput(),
    );

    const result = surface.reviewCaseByPlatformRefundId("refund_platform_001");

    expect(result).toMatchObject({
      resultType: "review_case",
      currentReviewStatusLabel: "operator_review_ready",
      platformRefundId: "refund_platform_001",
      providerName: "wechat_pay",
      providerRefundReference: "wx_refund_001",
      featureFlagSnapshotKey: "feature_flag_001",
      duplicateOutcome: false,
      replayOutcome: false,
      manualReviewRequired: false,
      crossReferences: {
        approvalPersistenceIdempotencyKey: "approval_persistence_001",
        auditPersistenceIdempotencyKey: "audit_persistence_001",
        runtimeAttemptPersistenceIdempotencyKey: "runtime_attempt_001",
        terminalConflictPersistenceIdempotencyKey: "terminal_conflict_001",
        workflowIdempotencyKey: "workflow_001",
        terminalMarkerKey: "terminal_marker_001",
      },
    });

    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain("must-not-leak");
  });

  it("returns the same review case across all supported query entrypoints", () => {
    const surface = createRefundStateMutationIsolatedPreprodQuerySurface(
      createInput(),
    );

    const byPlatform = surface.reviewCaseByPlatformRefundId("refund_platform_001");
    const byApproval =
      surface.reviewCaseByApprovalPersistenceIdempotencyKey(
        "approval_persistence_001",
      );
    const byRuntime =
      surface.reviewCaseByRuntimeAttemptPersistenceIdempotencyKey(
        "runtime_attempt_001",
      );
    const byTerminal =
      surface.reviewCaseByTerminalConflictPersistenceIdempotencyKey(
        "terminal_conflict_001",
      );
    const byProvider = surface.reviewCaseByProviderRefundReference(
      "wechat_pay",
      "wx_refund_001",
    );

    expect(byApproval).toMatchObject({
      resultType: "review_case",
      crossReferences: byPlatform.resultType === "review_case"
        ? byPlatform.crossReferences
        : {},
    });
    expect(byRuntime).toMatchObject({
      resultType: "review_case",
      crossReferences: byPlatform.resultType === "review_case"
        ? byPlatform.crossReferences
        : {},
    });
    expect(byTerminal).toMatchObject({
      resultType: "review_case",
      crossReferences: byPlatform.resultType === "review_case"
        ? byPlatform.crossReferences
        : {},
    });
    expect(byProvider).toMatchObject({
      resultType: "review_case",
      crossReferences: byPlatform.resultType === "review_case"
        ? byPlatform.crossReferences
        : {},
    });
  });

  it("fails closed when required cross references are missing", () => {
    const input = createInput();
    input.terminalConflictSnapshots = [
      {
        ...input.terminalConflictSnapshots[0],
        runtimeAttemptPersistenceIdempotencyKey: undefined,
        terminalMarkerKey: undefined,
      },
    ];

    const surface = createRefundStateMutationIsolatedPreprodQuerySurface(input);
    const result = surface.reviewCaseByPlatformRefundId("refund_platform_001");

    expect(result).toMatchObject({
      resultType: "incomplete",
      blockCode: "missing_cross_reference",
      missingEvidence: expect.arrayContaining([
        "runtime_attempt_persistence_idempotency_key",
        "terminal_marker_key",
        "runtime_attempt_record",
      ]),
    });
  });

  it("blocks cross reference mismatches instead of composing an unsafe case", () => {
    const input = createInput();
    input.runtimeAttemptRecords = [
      {
        ...input.runtimeAttemptRecords[0],
        providerRefundReference: "wx_refund_other",
      },
    ];

    const surface = createRefundStateMutationIsolatedPreprodQuerySurface(input);
    const result = surface.reviewCaseByPlatformRefundId("refund_platform_001");

    expect(result).toMatchObject({
      resultType: "incomplete",
      blockCode: "cross_reference_mismatch",
      missingEvidence: expect.arrayContaining(["provider_refund_reference"]),
    });
  });

  it("maps retryable failed runtime attempts to a stable review status label", () => {
    const input = createInput();
    input.runtimeAttemptRecords = [
      {
        ...input.runtimeAttemptRecords[0],
        attemptStatus: "retryable_failed",
        failureCode: "provider_timeout",
        failureReasonRedacted: "Provider callback evidence needs replay.",
        operatorVisibleReason: "Provider timeout captured for isolated preprod replay.",
      },
    ];

    const surface = createRefundStateMutationIsolatedPreprodQuerySurface(input);
    const result = surface.reviewCaseByPlatformRefundId("refund_platform_001");

    expect(result).toMatchObject({
      resultType: "review_case",
      currentReviewStatusLabel: "retryable_failure_recorded",
      blockCode: "provider_timeout",
      operatorVisibleReason:
        "Provider timeout captured for isolated preprod replay.",
    });
  });

  it("blocks queries when isolated preprod proof is missing", () => {
    const input = createInput();
    input.environment = {
      environment: "staging",
      isolatedPreprodVerified: false,
    };

    const surface = createRefundStateMutationIsolatedPreprodQuerySurface(input);
    const result = surface.reviewCaseByPlatformRefundId("refund_platform_001");

    expect(result).toMatchObject({
      resultType: "blocked",
      blockCode: "isolated_preprod_environment_unverified",
    });
  });
});
