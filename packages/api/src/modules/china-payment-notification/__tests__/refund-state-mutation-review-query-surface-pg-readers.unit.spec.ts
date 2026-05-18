import {
  resolveRefundReviewQuerySurfacePgReaders,
  resolveRefundReviewQuerySurfacePgReadersFromScope,
} from "../refund-state-mutation-review-query-surface-pg-readers";
import { PG_CONNECTION_SCOPE_KEY } from "../pg-connection-scope-key";
import {
  buildRefundReviewQuerySurfaceRepositoryRegistration,
  REFUND_REVIEW_QUERY_SURFACE_REPOSITORY_REGISTRATION_KEY,
} from "../refund-review-query-surface-repository-registration";
import type {
  RefundReviewQuerySurfacePgConnection,
} from "../refund-state-mutation-review-query-surface-pg-repositories";
import { operatorReviewReadyReviewInput } from "../fixtures/review-query-surface/scenarios/operator-review-ready.fixture";

const createPg = () => {
  const input = operatorReviewReadyReviewInput();

  const tables: Record<string, Record<string, unknown>[]> = {
    china_refund_state_mutation_approval: input.approvalRecords.map((record) => ({
      id: record.id,
      approval_idempotency_key: record.approvalIdempotencyKey,
      platform_refund_id: record.platformRefundId,
      provider_name: record.providerName,
      provider_refund_reference: record.providerRefundReference,
      merchant_order_reference: record.merchantOrderReference,
      refund_request_reference: record.refundRequestReference,
      target_state: record.targetState,
      target_state_audit_label: record.targetStateAuditLabel,
      amount_minor: record.amountMinor,
      currency: record.currency,
      request_actor_id: record.requestActorId,
      request_actor_type: record.requestActorType,
      reviewer_actor_id: record.reviewerActorId,
      reviewer_role: record.reviewerRole,
      permission_evidence_id: record.permissionEvidenceId,
      ownership_evidence_id: record.ownershipEvidenceId,
      readiness_decision_key: record.readinessDecisionKey,
      shadow_command_key: record.shadowCommandKey,
      runtime_adapter_decision_key: record.runtimeAdapterDecisionKey,
      feature_flag_snapshot_key: record.featureFlagSnapshotKey,
      status: record.status,
      decision_reason_redacted: record.decisionReasonRedacted,
      created_at: record.createdAt,
      decided_at: record.decidedAt,
      expires_at: record.expiresAt,
    })),
    china_refund_state_mutation_audit: input.auditRecords.map((record) => ({
      id: record.id,
      audit_persistence_idempotency_key: record.auditPersistenceIdempotencyKey,
      approval_persistence_idempotency_key:
        record.approvalPersistenceIdempotencyKey,
      approval_candidate_idempotency_key:
        record.approvalCandidateIdempotencyKey,
      target_state: record.targetState,
      status: record.status,
      audit_action: record.auditAction,
      audit_reason_redacted: record.auditReasonRedacted,
      created_at: record.createdAt,
    })),
    china_refund_state_mutation_runtime_attempt: input.runtimeAttemptRecords.map(
      (record) => ({
        id: record.id,
        runtime_attempt_persistence_idempotency_key:
          record.runtimeAttemptPersistenceIdempotencyKey,
        workflow_idempotency_key: record.workflowIdempotencyKey,
        platform_refund_id: record.platformRefundId,
        provider_name: record.providerName,
        provider_refund_reference: record.providerRefundReference,
        merchant_order_reference: record.merchantOrderReference,
        refund_request_reference: record.refundRequestReference,
        target_state: record.targetState,
        target_state_audit_label: record.targetStateAuditLabel,
        attempt_status: record.attemptStatus,
        attempt_number: record.attemptNumber,
        provider_evidence_digest: record.providerEvidenceDigest,
        digest_version: record.digestVersion,
        approval_persistence_idempotency_key:
          record.approvalPersistenceIdempotencyKey,
        audit_persistence_idempotency_key: record.auditPersistenceIdempotencyKey,
        terminal_conflict_decision_key: record.terminalConflictDecisionKey,
        feature_flag_snapshot_key: record.featureFlagSnapshotKey,
        environment: record.environment,
        failure_code: record.failureCode,
        failure_reason_redacted: record.failureReasonRedacted,
        operator_visible_reason: record.operatorVisibleReason,
        created_at: record.createdAt,
        started_at: record.startedAt,
        finished_at: record.finishedAt,
        next_retry_at: record.nextRetryAt,
      }),
    ),
    china_refund_state_mutation_terminal_conflict:
      input.terminalConflictSnapshots.map((record) => ({
        id: record.id,
        terminal_conflict_persistence_idempotency_key:
          record.terminalConflictPersistenceIdempotencyKey,
        terminal_conflict_decision_key: record.terminalConflictDecisionKey,
        platform_refund_id: record.platformRefundId,
        current_refund_state: record.currentRefundState,
        incoming_target_state: record.incomingTargetState,
        conflict_status: record.conflictStatus,
        conflict_code: record.conflictCode,
        terminal_marker_key: record.terminalMarkerKey,
        terminal_marker_version: record.terminalMarkerVersion,
        provider_evidence_digest: record.providerEvidenceDigest,
        provider_evidence_digest_version: record.providerEvidenceDigestVersion,
        approval_persistence_idempotency_key:
          record.approvalPersistenceIdempotencyKey,
        audit_persistence_idempotency_key: record.auditPersistenceIdempotencyKey,
        workflow_idempotency_key: record.workflowIdempotencyKey,
        runtime_attempt_persistence_idempotency_key:
          record.runtimeAttemptPersistenceIdempotencyKey,
        feature_flag_snapshot_key: record.featureFlagSnapshotKey,
        state_owner_evidence_key: record.stateOwnerEvidenceKey,
        actor_reference: record.actorReference,
        reviewer_reference: record.reviewerReference,
        conflict_detected_at: record.conflictDetectedAt,
        created_at: record.createdAt,
      })),
  };

  return {
    schema: {
      hasTable: jest.fn().mockImplementation(async (tableName: string) =>
        Object.prototype.hasOwnProperty.call(tables, tableName),
      ),
    },
    table(tableName: string) {
      let rows = [...(tables[tableName] ?? [])];

      const builder = {
        where(column: string, value: unknown) {
          rows = rows.filter((row) => row[column] === value);
          return builder;
        },
        whereNull(column: string) {
          rows = rows.filter((row) => row[column] == null);
          return builder;
        },
        orderBy(column: string, direction: "asc" | "desc") {
          rows.sort((left, right) => {
            const a = String(left[column] ?? "");
            const b = String(right[column] ?? "");
            return direction === "desc" ? b.localeCompare(a) : a.localeCompare(b);
          });
          return builder;
        },
        async select() {
          return rows;
        },
      };

      return builder;
    },
  };
};

type TestRequestWithScope = {
  scope: Record<string, unknown> & {
    resolve?: jest.Mock;
  };
};

const createPgConnection = (
  pg: ReturnType<typeof createPg>,
): RefundReviewQuerySurfacePgConnection => {
  const callable = ((tableName: string) =>
    pg.table(tableName)) as RefundReviewQuerySurfacePgConnection;
  callable.schema = pg.schema;
  return callable;
};

describe("refund state mutation review query surface pg readers", () => {
  it("builds readers from pg when all required tables exist", async () => {
    const pg = createPg();
    const req = {
      scope: {
        resolve: jest.fn().mockImplementation((key: string) => {
          if (key === PG_CONNECTION_SCOPE_KEY) {
            return (tableName: string) => pg.table(tableName);
          }

          return undefined;
        }),
      },
    } as TestRequestWithScope;

    (
      req.scope.resolve as jest.Mock
    ).mockImplementation((key: string) => {
      if (key === PG_CONNECTION_SCOPE_KEY) {
        return createPgConnection(pg);
      }

      return undefined;
    });

    const readers = await resolveRefundReviewQuerySurfacePgReaders(req);

    expect(readers).toBeDefined();
    await expect(
      readers?.approvalRepository.getByPlatformRefundId("refund_platform_001"),
    ).resolves.toHaveLength(1);
    await expect(
      readers?.terminalConflictRepository.getByApprovalPersistenceIdempotencyKey(
        "approval_persistence_001",
      ),
    ).resolves.toHaveLength(1);
  });

  it("returns undefined when required tables are missing", async () => {
    const req = {
      scope: {
        resolve: jest.fn().mockImplementation((key: string) => {
          if (key === PG_CONNECTION_SCOPE_KEY) {
            const pg = ((_: string) => ({
              where: () => pg(""),
              whereNull: () => pg(""),
              orderBy: () => pg(""),
              select: async () => [],
            })) as RefundReviewQuerySurfacePgConnection;
            pg.schema = {
              hasTable: async () => false,
            };
            return pg;
          }

          return undefined;
        }),
      },
    } as TestRequestWithScope;

    await expect(resolveRefundReviewQuerySurfacePgReaders(req)).resolves.toBeUndefined();
  });

  it("returns undefined when pg table inspection fails", async () => {
    const req = {
      scope: {
        resolve: jest.fn().mockImplementation((key: string) => {
          if (key === PG_CONNECTION_SCOPE_KEY) {
            const pg = ((_: string) => ({
              where: () => pg(""),
              whereNull: () => pg(""),
              orderBy: () => pg(""),
              select: async () => [],
            })) as RefundReviewQuerySurfacePgConnection;
            pg.schema = {
              hasTable: jest
                .fn()
                .mockRejectedValue(new Error("inspection failed")),
            };
            return pg;
          }

          return undefined;
        }),
      },
    } as TestRequestWithScope;

    await expect(resolveRefundReviewQuerySurfacePgReaders(req)).resolves.toBeUndefined();
  });

  it("returns undefined when pg readers are resolved from empty scope", async () => {
    await expect(
      resolveRefundReviewQuerySurfacePgReadersFromScope(undefined),
    ).resolves.toBeUndefined();
  });

  it("falls back to legacy pgConnection scope key when present", async () => {
    const pg = createPg();
    const req = {
      scope: {
        resolve: jest.fn().mockImplementation((key: string) => {
          if (key === "pgConnection") {
            return createPgConnection(pg);
          }

          return undefined;
        }),
      },
    } as TestRequestWithScope;

    const readers = await resolveRefundReviewQuerySurfacePgReaders(req);

    expect(readers).toBeDefined();
    await expect(
      readers?.approvalRepository.getByPlatformRefundId("refund_platform_001"),
    ).resolves.toHaveLength(1);
  });

  it("resolves pg readers from canonical registration object without scope.resolve", async () => {
    const pg = createPg();
    const callable = createPgConnection(pg);

    const req = {
      scope: {
        [REFUND_REVIEW_QUERY_SURFACE_REPOSITORY_REGISTRATION_KEY]:
          buildRefundReviewQuerySurfaceRepositoryRegistration({
            pgConnection: callable,
          }),
        get resolve(): never {
          throw new Error("resolve getter should not be required");
        },
      },
    } as TestRequestWithScope;

    const readers = await resolveRefundReviewQuerySurfacePgReaders(req);

    expect(readers).toBeDefined();
    await expect(
      readers?.runtimeAttemptRepository.getByPlatformRefundId(
        "refund_platform_001",
      ),
    ).resolves.toHaveLength(1);
  });

  it("resolves pg readers directly from scope through canonical registration", async () => {
    const pg = createPg();
    const callable = createPgConnection(pg);

    const readers = await resolveRefundReviewQuerySurfacePgReadersFromScope({
      [REFUND_REVIEW_QUERY_SURFACE_REPOSITORY_REGISTRATION_KEY]:
        buildRefundReviewQuerySurfaceRepositoryRegistration({
          pgConnection: callable,
        }),
      get resolve(): never {
        throw new Error("resolve getter should not be required");
      },
    });

    expect(readers).toBeDefined();
    await expect(
      readers?.approvalRepository.getByPlatformRefundId("refund_platform_001"),
    ).resolves.toHaveLength(1);
  });
});
