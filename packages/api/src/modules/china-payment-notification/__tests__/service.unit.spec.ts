import ChinaPaymentNotificationModuleService from "../service";
import { PG_CONNECTION_SCOPE_KEY } from "../pg-connection-scope-key";
import { REFUND_REVIEW_QUERY_SURFACE_REPOSITORY_READERS_SCOPE_KEY } from "../refund-review-query-surface-repository-readers-scope-key";
import {
  buildRefundReviewQuerySurfaceRepositoryRegistration,
  REFUND_REVIEW_QUERY_SURFACE_REPOSITORY_REGISTRATION_KEY,
} from "../refund-review-query-surface-repository-registration";
import {
  REFUND_STATE_MUTATION_APPROVAL_PERSISTENCE_REPOSITORY_KEY,
  REFUND_STATE_MUTATION_AUDIT_PERSISTENCE_REPOSITORY_KEY,
  REFUND_STATE_MUTATION_RUNTIME_ATTEMPT_PERSISTENCE_REPOSITORY_KEY,
  REFUND_STATE_MUTATION_TERMINAL_CONFLICT_PERSISTENCE_REPOSITORY_KEY,
} from "../refund-review-query-surface-repository-registration-keys";
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

const createRepositoryReaders = () => {
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

describe("china payment notification module service", () => {
  it("resolves legacy readers provider on the module service container", async () => {
    const readers = createRepositoryReaders();
    const service = new ChinaPaymentNotificationModuleService({
      [REFUND_REVIEW_QUERY_SURFACE_REPOSITORY_READERS_SCOPE_KEY]: readers,
      get resolve(): never {
        throw new Error("resolve getter should not be required");
      },
    });

    await expect(
      service.getRefundReviewQuerySurfaceRepositoryReaders({
        resolve: jest.fn().mockImplementation(() => undefined),
      }),
    ).resolves.toBe(readers);
  });

  it("prefers canonical registration readers on the module service container", async () => {
    const registrationReaders = createRepositoryReaders();
    const legacyReaders = createRepositoryReaders();

    const service = new ChinaPaymentNotificationModuleService({
      [REFUND_REVIEW_QUERY_SURFACE_REPOSITORY_REGISTRATION_KEY]:
        buildRefundReviewQuerySurfaceRepositoryRegistration({
          readers: registrationReaders,
        }),
      [REFUND_REVIEW_QUERY_SURFACE_REPOSITORY_READERS_SCOPE_KEY]: legacyReaders,
      get resolve(): never {
        throw new Error("resolve getter should not be required");
      },
    });

    const resolvedReaders =
      await service.getRefundReviewQuerySurfaceRepositoryReaders(undefined);

    expect(resolvedReaders?.approvalRepository).toBe(
      registrationReaders.approvalRepository,
    );
    expect(resolvedReaders?.terminalConflictRepository).toBe(
      registrationReaders.terminalConflictRepository,
    );
  });

  it("exposes the normalized canonical registration for operator query surface wiring", () => {
    const registrationReaders = createRepositoryReaders();
    const scopeReaders = createRepositoryReaders();

    const registration =
      new ChinaPaymentNotificationModuleService({
        [REFUND_REVIEW_QUERY_SURFACE_REPOSITORY_REGISTRATION_KEY]:
          buildRefundReviewQuerySurfaceRepositoryRegistration({
            readers: registrationReaders,
          }),
        get resolve(): never {
          throw new Error("resolve getter should not be required");
        },
      }).getRefundReviewQuerySurfaceRepositoryRegistration({
        [REFUND_REVIEW_QUERY_SURFACE_REPOSITORY_READERS_SCOPE_KEY]:
          scopeReaders,
        get resolve(): never {
          throw new Error("resolve getter should not be required");
        },
      });

    expect(registration?.readers).toBe(registrationReaders);
  });

  it("builds refund review query surface repository readers from scope", async () => {
    const service = new ChinaPaymentNotificationModuleService();
    const pg = createPg();
    const scope = {
      resolve: jest.fn().mockImplementation((key: string) => {
        if (key === PG_CONNECTION_SCOPE_KEY) {
          const callable = ((tableName: string) => pg.table(tableName)) as unknown as Record<string, unknown>;
          callable.schema = pg.schema;
          return callable;
        }

        return undefined;
      }),
    };

    const readers =
      await service.getRefundReviewQuerySurfaceRepositoryReaders(scope);

    expect(readers).toBeDefined();
    await expect(
      readers?.runtimeAttemptRepository.getByPlatformRefundId(
        "refund_platform_001",
      ),
    ).resolves.toHaveLength(1);
  });

  it("builds refund review query surface repository readers from legacy module container pg fallback", async () => {
    const pg = createPg();
    const service = new ChinaPaymentNotificationModuleService({
      [PG_CONNECTION_SCOPE_KEY]: (() => {
        const callable = ((tableName: string) => pg.table(tableName)) as unknown as Record<string, unknown>;
        callable.schema = pg.schema;
        return callable;
      })(),
      get resolve(): never {
        throw new Error("resolve getter should not be required");
      },
    });

    const readers =
      await service.getRefundReviewQuerySurfaceRepositoryReaders(undefined);

    expect(readers).toBeDefined();
    await expect(
      readers?.approvalRepository.getByPlatformRefundId("refund_platform_001"),
    ).resolves.toHaveLength(1);
  });

  it("builds refund review query surface repository readers from legacy module container repo properties fallback", async () => {
    const readers = createRepositoryReaders();
    const service = new ChinaPaymentNotificationModuleService({
      [REFUND_STATE_MUTATION_APPROVAL_PERSISTENCE_REPOSITORY_KEY]:
        readers.approvalRepository,
      [REFUND_STATE_MUTATION_AUDIT_PERSISTENCE_REPOSITORY_KEY]:
        readers.auditRepository,
      [REFUND_STATE_MUTATION_RUNTIME_ATTEMPT_PERSISTENCE_REPOSITORY_KEY]:
        readers.runtimeAttemptRepository,
      [REFUND_STATE_MUTATION_TERMINAL_CONFLICT_PERSISTENCE_REPOSITORY_KEY]:
        readers.terminalConflictRepository,
      get resolve(): never {
        throw new Error("resolve getter should not be required");
      },
    });

    const resolvedReaders =
      await service.getRefundReviewQuerySurfaceRepositoryReaders(undefined);

    expect(resolvedReaders).toBeDefined();
    await expect(
      resolvedReaders?.terminalConflictRepository.getByPlatformRefundId(
        "refund_platform_001",
      ),
    ).resolves.toHaveLength(1);
  });

  it("prefers canonical registration repo properties over legacy module container repo properties", async () => {
    const registrationReaders = createRepositoryReaders();
    const legacyReaders = createRepositoryReaders();

    const resolvedReaders =
      await new ChinaPaymentNotificationModuleService({
        [REFUND_REVIEW_QUERY_SURFACE_REPOSITORY_REGISTRATION_KEY]:
          buildRefundReviewQuerySurfaceRepositoryRegistration({
            repositories: {
              approvalRepository: registrationReaders.approvalRepository,
              auditRepository: registrationReaders.auditRepository,
              runtimeAttemptRepository:
                registrationReaders.runtimeAttemptRepository,
              terminalConflictRepository:
                registrationReaders.terminalConflictRepository,
            },
          }),
        [REFUND_STATE_MUTATION_APPROVAL_PERSISTENCE_REPOSITORY_KEY]:
          legacyReaders.approvalRepository,
        [REFUND_STATE_MUTATION_AUDIT_PERSISTENCE_REPOSITORY_KEY]:
          legacyReaders.auditRepository,
        [REFUND_STATE_MUTATION_RUNTIME_ATTEMPT_PERSISTENCE_REPOSITORY_KEY]:
          legacyReaders.runtimeAttemptRepository,
        [REFUND_STATE_MUTATION_TERMINAL_CONFLICT_PERSISTENCE_REPOSITORY_KEY]:
          legacyReaders.terminalConflictRepository,
        get resolve(): never {
          throw new Error("resolve getter should not be required");
        },
      }).getRefundReviewQuerySurfaceRepositoryReaders(undefined);

    expect(resolvedReaders?.approvalRepository).toBe(
      registrationReaders.approvalRepository,
    );
    expect(resolvedReaders?.auditRepository).toBe(
      registrationReaders.auditRepository,
    );
  });

  it("prefers canonical module container repo properties over request scope readers", async () => {
    const moduleReaders = createRepositoryReaders();
    const scopeReaders = createRepositoryReaders();
    const service = new ChinaPaymentNotificationModuleService({
      [REFUND_REVIEW_QUERY_SURFACE_REPOSITORY_REGISTRATION_KEY]:
        buildRefundReviewQuerySurfaceRepositoryRegistration({
          repositories: {
            approvalRepository: moduleReaders.approvalRepository,
            auditRepository: moduleReaders.auditRepository,
            runtimeAttemptRepository: moduleReaders.runtimeAttemptRepository,
            terminalConflictRepository:
              moduleReaders.terminalConflictRepository,
          },
        }),
      get resolve(): never {
        throw new Error("resolve getter should not be required");
      },
    });

    const resolvedReaders =
      await service.getRefundReviewQuerySurfaceRepositoryReaders({
        [REFUND_REVIEW_QUERY_SURFACE_REPOSITORY_READERS_SCOPE_KEY]: scopeReaders,
        get resolve(): never {
          throw new Error("resolve getter should not be required");
        },
      });

    expect(resolvedReaders?.approvalRepository).toBe(
      moduleReaders.approvalRepository,
    );
    expect(resolvedReaders?.runtimeAttemptRepository).toBe(
      moduleReaders.runtimeAttemptRepository,
    );
  });

  it("prefers canonical registration readers on scope over legacy scope readers provider", async () => {
    const registrationReaders = createRepositoryReaders();
    const legacyScopeReaders = createRepositoryReaders();

    const resolvedReaders =
      await new ChinaPaymentNotificationModuleService().getRefundReviewQuerySurfaceRepositoryReaders({
        [REFUND_REVIEW_QUERY_SURFACE_REPOSITORY_REGISTRATION_KEY]:
          buildRefundReviewQuerySurfaceRepositoryRegistration({
            readers: registrationReaders,
          }),
        [REFUND_REVIEW_QUERY_SURFACE_REPOSITORY_READERS_SCOPE_KEY]:
          legacyScopeReaders,
        get resolve(): never {
          throw new Error("resolve getter should not be required");
        },
      });

    expect(resolvedReaders?.approvalRepository).toBe(
      registrationReaders.approvalRepository,
    );
    expect(resolvedReaders?.terminalConflictRepository).toBe(
      registrationReaders.terminalConflictRepository,
    );
  });

  it("prefers canonical module container readers over legacy module container repo properties", async () => {
    const providerReaders = createRepositoryReaders();
    const repoReaders = createRepositoryReaders();

    const resolvedReaders =
      await new ChinaPaymentNotificationModuleService({
        [REFUND_REVIEW_QUERY_SURFACE_REPOSITORY_REGISTRATION_KEY]:
          buildRefundReviewQuerySurfaceRepositoryRegistration({
            readers: providerReaders,
          }),
        [REFUND_STATE_MUTATION_APPROVAL_PERSISTENCE_REPOSITORY_KEY]:
          repoReaders.approvalRepository,
        [REFUND_STATE_MUTATION_AUDIT_PERSISTENCE_REPOSITORY_KEY]:
          repoReaders.auditRepository,
        [REFUND_STATE_MUTATION_RUNTIME_ATTEMPT_PERSISTENCE_REPOSITORY_KEY]:
          repoReaders.runtimeAttemptRepository,
        [REFUND_STATE_MUTATION_TERMINAL_CONFLICT_PERSISTENCE_REPOSITORY_KEY]:
          repoReaders.terminalConflictRepository,
        get resolve(): never {
          throw new Error("resolve getter should not be required");
        },
      }).getRefundReviewQuerySurfaceRepositoryReaders(undefined);

    expect(resolvedReaders?.approvalRepository).toBe(
      providerReaders.approvalRepository,
    );
    expect(resolvedReaders?.terminalConflictRepository).toBe(
      providerReaders.terminalConflictRepository,
    );
  });

  it("prefers legacy module container repo properties over legacy module container pg fallback", async () => {
    const repoReaders = createRepositoryReaders();
    const modulePg = createPg();
    const modulePgCallable = ((tableName: string) =>
      modulePg.table(tableName)) as unknown as Record<string, unknown>;
    modulePgCallable.schema = modulePg.schema;

    const resolvedReaders =
      await new ChinaPaymentNotificationModuleService({
        [REFUND_STATE_MUTATION_APPROVAL_PERSISTENCE_REPOSITORY_KEY]:
          repoReaders.approvalRepository,
        [REFUND_STATE_MUTATION_AUDIT_PERSISTENCE_REPOSITORY_KEY]:
          repoReaders.auditRepository,
        [REFUND_STATE_MUTATION_RUNTIME_ATTEMPT_PERSISTENCE_REPOSITORY_KEY]:
          repoReaders.runtimeAttemptRepository,
        [REFUND_STATE_MUTATION_TERMINAL_CONFLICT_PERSISTENCE_REPOSITORY_KEY]:
          repoReaders.terminalConflictRepository,
        [PG_CONNECTION_SCOPE_KEY]: modulePgCallable,
        get resolve(): never {
          throw new Error("resolve getter should not be required");
        },
      }).getRefundReviewQuerySurfaceRepositoryReaders(undefined);

    expect(resolvedReaders?.approvalRepository).toBe(
      repoReaders.approvalRepository,
    );
    expect(resolvedReaders?.auditRepository).toBe(repoReaders.auditRepository);
  });

  it("prefers legacy module container pg fallback over request scope pg fallback", async () => {
    const modulePg = createPg();
    const scopePg = createPg();

    const moduleCallable = ((tableName: string) =>
      modulePg.table(tableName)) as unknown as Record<string, unknown>;
    moduleCallable.schema = modulePg.schema;

    const scopeCallable = ((tableName: string) =>
      scopePg.table(tableName)) as unknown as Record<string, unknown>;
    scopeCallable.schema = scopePg.schema;

    const service = new ChinaPaymentNotificationModuleService({
      [PG_CONNECTION_SCOPE_KEY]: moduleCallable,
      get resolve(): never {
        throw new Error("resolve getter should not be required");
      },
    });

    const resolvedReaders =
      await service.getRefundReviewQuerySurfaceRepositoryReaders({
        [PG_CONNECTION_SCOPE_KEY]: scopeCallable,
        get resolve(): never {
          throw new Error("resolve getter should not be required");
        },
      });

    expect(resolvedReaders).toBeDefined();
    await expect(
      resolvedReaders?.approvalRepository.getByPlatformRefundId(
        "refund_platform_001",
      ),
    ).resolves.toHaveLength(1);
  });

  it("prefers canonical registration pg fallback over legacy module container pg fallback", async () => {
    const registrationPg = createPg();
    const legacyPg = createPg();

    const registrationCallable = ((tableName: string) =>
      registrationPg.table(tableName)) as unknown as Record<string, unknown>;
    registrationCallable.schema = registrationPg.schema;

    const legacyCallable = ((tableName: string) =>
      legacyPg.table(tableName)) as unknown as Record<string, unknown>;
    legacyCallable.schema = legacyPg.schema;

    const resolvedReaders =
      await new ChinaPaymentNotificationModuleService({
        [REFUND_REVIEW_QUERY_SURFACE_REPOSITORY_REGISTRATION_KEY]:
          buildRefundReviewQuerySurfaceRepositoryRegistration({
            pgConnection: registrationCallable,
          }),
        [PG_CONNECTION_SCOPE_KEY]: legacyCallable,
        get resolve(): never {
          throw new Error("resolve getter should not be required");
        },
      }).getRefundReviewQuerySurfaceRepositoryReaders(undefined);

    expect(resolvedReaders).toBeDefined();
    await expect(
      resolvedReaders?.runtimeAttemptRepository.getByPlatformRefundId(
        "refund_platform_001",
      ),
    ).resolves.toHaveLength(1);
  });

  it("returns undefined when pg scope is unavailable", async () => {
    const service = new ChinaPaymentNotificationModuleService();

    await expect(
      service.getRefundReviewQuerySurfaceRepositoryReaders({
        resolve: jest.fn().mockImplementation(() => undefined),
      }),
    ).resolves.toBeUndefined();
  });
});
