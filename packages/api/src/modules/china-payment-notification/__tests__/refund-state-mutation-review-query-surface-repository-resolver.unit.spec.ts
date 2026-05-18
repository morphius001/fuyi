import {
  resolveRefundReviewQuerySurfaceRepositoryResult,
} from "..";
import { operatorReviewReadyReviewInput } from "../fixtures/review-query-surface/scenarios/operator-review-ready.fixture";

const createRepositories = () => {
  const input = operatorReviewReadyReviewInput();

  return {
    approvalRepository: {
      async getByApprovalIdempotencyKey(approvalIdempotencyKey: string) {
        return (
          input.approvalRecords.find(
            (record) => record.approvalIdempotencyKey === approvalIdempotencyKey,
          ) ?? null
        );
      },
      async getByPlatformRefundId(platformRefundId: string) {
        return input.approvalRecords.filter(
          (record) => record.platformRefundId === platformRefundId,
        );
      },
      async getByProviderRefundReference(
        providerName: "mock_china_pay" | "alipay" | "wechat_pay",
        providerRefundReference: string,
      ) {
        return input.approvalRecords.filter(
          (record) =>
            record.providerName === providerName &&
            record.providerRefundReference === providerRefundReference,
        );
      },
    },
    auditRepository: {
      async getByAuditPersistenceIdempotencyKey(
        auditPersistenceIdempotencyKey: string,
      ) {
        return (
          input.auditRecords.find(
            (record) =>
              record.auditPersistenceIdempotencyKey ===
              auditPersistenceIdempotencyKey,
          ) ?? null
        );
      },
      async getByApprovalPersistenceIdempotencyKey(
        approvalPersistenceIdempotencyKey: string,
      ) {
        return input.auditRecords.filter(
          (record) =>
            record.approvalPersistenceIdempotencyKey ===
            approvalPersistenceIdempotencyKey,
        );
      },
    },
    runtimeAttemptRepository: {
      async getByRuntimeAttemptPersistenceIdempotencyKey(
        runtimeAttemptPersistenceIdempotencyKey: string,
      ) {
        return (
          input.runtimeAttemptRecords.find(
            (record) =>
              record.runtimeAttemptPersistenceIdempotencyKey ===
              runtimeAttemptPersistenceIdempotencyKey,
          ) ?? null
        );
      },
      async getByWorkflowIdempotencyKey(workflowIdempotencyKey: string) {
        return input.runtimeAttemptRecords.filter(
          (record) => record.workflowIdempotencyKey === workflowIdempotencyKey,
        );
      },
      async getByPlatformRefundId(platformRefundId: string) {
        return input.runtimeAttemptRecords.filter(
          (record) => record.platformRefundId === platformRefundId,
        );
      },
    },
    terminalConflictRepository: {
      async getByTerminalConflictPersistenceIdempotencyKey(
        terminalConflictPersistenceIdempotencyKey: string,
      ) {
        return (
          input.terminalConflictSnapshots.find(
            (record) =>
              record.terminalConflictPersistenceIdempotencyKey ===
              terminalConflictPersistenceIdempotencyKey,
          ) ?? null
        );
      },
      async getByPlatformRefundId(platformRefundId: string) {
        return input.terminalConflictSnapshots.filter(
          (record) => record.platformRefundId === platformRefundId,
        );
      },
      async getByTerminalMarkerKey(terminalMarkerKey: string) {
        return input.terminalConflictSnapshots.filter(
          (record) => record.terminalMarkerKey === terminalMarkerKey,
        );
      },
      async getByApprovalPersistenceIdempotencyKey(
        approvalPersistenceIdempotencyKey: string,
      ) {
        return input.terminalConflictSnapshots.filter(
          (record) =>
            record.approvalPersistenceIdempotencyKey ===
            approvalPersistenceIdempotencyKey,
        );
      },
    },
  };
};

describe("refund state mutation review query surface repository resolver", () => {
  it("resolves a repository-backed review case from platform refund id", async () => {
    const result = await resolveRefundReviewQuerySurfaceRepositoryResult({
      mode: "isolated_preprod_repository",
      environment: {
        environment: "staging",
        isolatedPreprodVerified: true,
        evidenceKey: "isolated_preprod_evidence_001",
      },
      query: {
        kind: "platform_refund_id",
        platformRefundId: "refund_platform_001",
      },
      repositories: createRepositories(),
    });

    expect(result).toMatchObject({
      status: "resolved",
      evidenceCounts: {
        approvalRecords: 1,
        auditRecords: 1,
        runtimeAttemptRecords: 1,
        terminalConflictSnapshots: 1,
      },
      reviewCaseResult: {
        resultType: "review_case",
        currentReviewStatusLabel: "operator_review_ready",
        platformRefundId: "refund_platform_001",
      },
    });
  });

  it("resolves provider refund reference queries through approval-backed repository reads", async () => {
    const result = await resolveRefundReviewQuerySurfaceRepositoryResult({
      mode: "isolated_preprod_repository",
      environment: {
        environment: "staging",
        isolatedPreprodVerified: true,
        evidenceKey: "isolated_preprod_evidence_001",
      },
      query: {
        kind: "provider_refund_reference",
        providerName: "wechat_pay",
        providerRefundReference: "wx_refund_001",
      },
      repositories: createRepositories(),
    });

    expect(result).toMatchObject({
      status: "resolved",
      reviewCaseResult: {
        resultType: "review_case",
        providerRefundReference: "wx_refund_001",
        crossReferences: {
          approvalPersistenceIdempotencyKey: "approval_persistence_001",
        },
      },
    });
  });

  it("fails closed in production even when repositories are available", async () => {
    const result = await resolveRefundReviewQuerySurfaceRepositoryResult({
      mode: "isolated_preprod_repository",
      environment: {
        environment: "production",
        isolatedPreprodVerified: true,
        evidenceKey: "isolated_preprod_evidence_001",
      },
      query: {
        kind: "platform_refund_id",
        platformRefundId: "refund_platform_001",
      },
      repositories: createRepositories(),
    });

    expect(result).toEqual({
      status: "blocked",
      blockCode: "resolver_repository_environment_blocked",
      reason:
        "Refund review query surface repository resolver is blocked in production.",
    });
  });

  it("fails closed when a repository reader query rejects", async () => {
    const repositories = createRepositories();
    repositories.approvalRepository.getByPlatformRefundId = jest
      .fn()
      .mockRejectedValue(new Error("db unavailable"));

    const result = await resolveRefundReviewQuerySurfaceRepositoryResult({
      mode: "isolated_preprod_repository",
      environment: {
        environment: "staging",
        isolatedPreprodVerified: true,
        evidenceKey: "isolated_preprod_evidence_001",
      },
      query: {
        kind: "platform_refund_id",
        platformRefundId: "refund_platform_001",
      },
      repositories,
    });

    expect(result).toEqual({
      status: "blocked",
      blockCode: "resolver_repository_query_failed",
      reason: "Refund review query surface repository query failed.",
    });
  });

  it("preserves incomplete review output when repository evidence is missing", async () => {
    const repositories = createRepositories();
    repositories.auditRepository.getByAuditPersistenceIdempotencyKey = async () =>
      null;
    repositories.auditRepository.getByApprovalPersistenceIdempotencyKey =
      async () => [];

    const result = await resolveRefundReviewQuerySurfaceRepositoryResult({
      mode: "isolated_preprod_repository",
      environment: {
        environment: "staging",
        isolatedPreprodVerified: true,
        evidenceKey: "isolated_preprod_evidence_001",
      },
      query: {
        kind: "terminal_conflict_persistence_idempotency_key",
        terminalConflictPersistenceIdempotencyKey: "terminal_conflict_001",
      },
      repositories,
    });

    expect(result).toMatchObject({
      status: "resolved",
      reviewCaseResult: {
        resultType: "incomplete",
        blockCode: "missing_cross_reference",
        missingEvidence: expect.arrayContaining(["audit_record"]),
      },
    });
  });
});
