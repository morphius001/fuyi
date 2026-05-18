import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

import { CHINA_PAYMENT_NOTIFICATION_MODULE } from "../../../../../modules/china-payment-notification/module-key";
import ChinaPaymentNotificationModuleService from "../../../../../modules/china-payment-notification/service";
import { PG_CONNECTION_SCOPE_KEY } from "../../../../../modules/china-payment-notification/pg-connection-scope-key";
import { REFUND_REVIEW_QUERY_SURFACE_REPOSITORY_READERS_SCOPE_KEY } from "../../../../../modules/china-payment-notification/refund-review-query-surface-repository-readers-scope-key";
import {
  buildRefundReviewQuerySurfaceRepositoryRegistration,
  REFUND_REVIEW_QUERY_SURFACE_REPOSITORY_REGISTRATION_KEY,
} from "../../../../../modules/china-payment-notification/refund-review-query-surface-repository-registration";
import {
  REFUND_STATE_MUTATION_APPROVAL_PERSISTENCE_REPOSITORY_KEY,
  REFUND_STATE_MUTATION_AUDIT_PERSISTENCE_REPOSITORY_KEY,
  REFUND_STATE_MUTATION_RUNTIME_ATTEMPT_PERSISTENCE_REPOSITORY_KEY,
  REFUND_STATE_MUTATION_TERMINAL_CONFLICT_PERSISTENCE_REPOSITORY_KEY,
} from "../../../../../modules/china-payment-notification/refund-review-query-surface-repository-registration-keys";
import { operatorReviewReadyReviewInput } from "../../../../../modules/china-payment-notification/fixtures/review-query-surface/scenarios/operator-review-ready.fixture";
import { GET } from "../route";

const oldEnv = process.env;

const makeResponse = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };

  return res as unknown as MedusaResponse & {
    status: jest.Mock;
    json: jest.Mock;
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

const createPgConnection = () => {
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

  const callable = ((tableName: string) => {
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
  }) as unknown as Record<string, unknown>;

  callable.schema = {
    hasTable: jest.fn().mockResolvedValue(true),
  };

  return callable;
};

describe("admin china refund review query surface route", () => {
  beforeEach(() => {
    process.env = { ...oldEnv };
  });

  afterAll(() => {
    process.env = oldEnv;
  });

  it("returns disabled by default", async () => {
    const req = {
      query: {},
      text: jest.fn(),
    } as unknown as MedusaRequest;
    const res = makeResponse();

    await GET(req, res);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith({
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
    expect((req as unknown as { text: jest.Mock }).text).not.toHaveBeenCalled();
  });

  it("returns a resolved local fixture review case when env and query both pass", async () => {
    process.env.CHINA_REFUND_REVIEW_QUERY_SURFACE_ENABLED = "true";
    process.env.CHINA_REFUND_REVIEW_QUERY_SURFACE_MODE = "local_fixture";
    process.env.CHINA_REFUND_REVIEW_QUERY_SURFACE_TARGET_ENV = "local";

    const req = {
      query: {
        selector_mode: "scenario_default",
        scenario_type: "operator_review_ready",
        query_kind: "platform_refund_id",
        platform_refund_id: "refund_platform_001",
      },
      text: jest.fn(),
    } as unknown as MedusaRequest;
    const res = makeResponse();

    await GET(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "resolved",
        surface: "refund_state_mutation_review_query_surface",
        mode: "local_fixture",
      }),
    );
    expect(res.json.mock.calls[0]?.[0]?.result?.selectorResolution).not.toHaveProperty(
      "bundle",
    );
    expect((req as unknown as { text: jest.Mock }).text).not.toHaveBeenCalled();
  });

  it("accepts trimmed local fixture env values", async () => {
    process.env.CHINA_REFUND_REVIEW_QUERY_SURFACE_ENABLED = "true";
    process.env.CHINA_REFUND_REVIEW_QUERY_SURFACE_MODE = " local_fixture ";
    process.env.CHINA_REFUND_REVIEW_QUERY_SURFACE_TARGET_ENV = " local ";
    process.env.APP_ENV = " test ";

    const req = {
      query: {
        selector_mode: "scenario_default",
        scenario_type: "operator_review_ready",
        query_kind: "platform_refund_id",
        platform_refund_id: "refund_platform_001",
      },
      text: jest.fn(),
    } as unknown as MedusaRequest;
    const res = makeResponse();

    await GET(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "resolved",
        mode: "local_fixture",
      }),
    );
  });

  it("fails closed on production-like app env values even when they include whitespace", async () => {
    process.env.CHINA_REFUND_REVIEW_QUERY_SURFACE_ENABLED = "true";
    process.env.CHINA_REFUND_REVIEW_QUERY_SURFACE_MODE = "local_fixture";
    process.env.CHINA_REFUND_REVIEW_QUERY_SURFACE_TARGET_ENV = "local";
    process.env.APP_ENV = " production ";

    const req = {
      query: {
        selector_mode: "scenario_default",
        scenario_type: "operator_review_ready",
        query_kind: "platform_refund_id",
        platform_refund_id: "refund_platform_001",
      },
      text: jest.fn(),
    } as unknown as MedusaRequest;
    const res = makeResponse();

    await GET(req, res);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "disabled",
        code: "REFUND_REVIEW_QUERY_SURFACE_PRODUCTION_BLOCKED",
      }),
    );
    expect((req as unknown as { text: jest.Mock }).text).not.toHaveBeenCalled();
  });

  it("fails closed on invalid query parameters", async () => {
    process.env.CHINA_REFUND_REVIEW_QUERY_SURFACE_ENABLED = "true";
    process.env.CHINA_REFUND_REVIEW_QUERY_SURFACE_MODE = "local_fixture";
    process.env.CHINA_REFUND_REVIEW_QUERY_SURFACE_TARGET_ENV = "local";

    const req = {
      query: {
        selector_mode: "explicit_source_key",
        query_kind: "platform_refund_id",
      },
    } as unknown as MedusaRequest;
    const res = makeResponse();

    await GET(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: "blocked",
      surface: "refund_state_mutation_review_query_surface",
      mode: "local_fixture",
      code: "REQUEST_SELECTOR_INVALID",
      reason:
        "Refund review query surface explicit selector requires fixture_source_key.",
      runtimeMutationBlocked: true,
      workflowExecutionAllowed: false,
      stateMutationAllowed: false,
      refundSuccessState: false,
    });
  });

  it("fails closed when fixture selector points to an unknown local fixture", async () => {
    process.env.CHINA_REFUND_REVIEW_QUERY_SURFACE_ENABLED = "true";
    process.env.CHINA_REFUND_REVIEW_QUERY_SURFACE_MODE = "local_fixture";
    process.env.CHINA_REFUND_REVIEW_QUERY_SURFACE_TARGET_ENV = "local";

    const req = {
      query: {
        selector_mode: "explicit_source_key",
        fixture_source_key: "operator_review_ready_fixture_missing",
        query_kind: "platform_refund_id",
        platform_refund_id: "refund_platform_001",
      },
    } as unknown as MedusaRequest;
    const res = makeResponse();

    await GET(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: "blocked",
      surface: "refund_state_mutation_review_query_surface",
      mode: "local_fixture",
      code: "fixture_selector_invalid",
      reason:
        "Unknown refund review fixture source key 'operator_review_ready_fixture_missing'.",
      runtimeMutationBlocked: true,
      workflowExecutionAllowed: false,
      stateMutationAllowed: false,
      refundSuccessState: false,
    });
  });

  it("returns a blocked response with safe review payload details when no review case matches", async () => {
    process.env.CHINA_REFUND_REVIEW_QUERY_SURFACE_ENABLED = "true";
    process.env.CHINA_REFUND_REVIEW_QUERY_SURFACE_MODE = "local_fixture";
    process.env.CHINA_REFUND_REVIEW_QUERY_SURFACE_TARGET_ENV = "local";

    const req = {
      query: {
        selector_mode: "explicit_source_key",
        fixture_source_key: "operator_review_ready_fixture_001",
        query_kind: "platform_refund_id",
        platform_refund_id: "refund_platform_missing",
      },
    } as unknown as MedusaRequest;
    const res = makeResponse();

    await GET(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json.mock.calls[0]?.[0]).toMatchObject({
        status: "blocked",
        surface: "refund_state_mutation_review_query_surface",
        mode: "local_fixture",
        code: "review_case_not_found",
        reason: "No terminal conflict snapshot was found for the requested review case.",
        result: {
          status: "resolved",
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
    expect(res.json.mock.calls[0]?.[0]?.result?.selectorResolution).not.toHaveProperty(
      "bundle",
    );
  });

  it("resolves repository mode when injected repository readers are available", async () => {
    process.env.CHINA_REFUND_REVIEW_QUERY_SURFACE_ENABLED = "true";
    process.env.CHINA_REFUND_REVIEW_QUERY_SURFACE_MODE =
      "isolated_preprod_repository";
    process.env.CHINA_REFUND_REVIEW_QUERY_SURFACE_TARGET_ENV =
      "isolated_preprod";
    process.env.APP_ENV = "staging";

    const req = {
      query: {
        query_kind: "platform_refund_id",
        platform_refund_id: "refund_platform_001",
      },
      scope: {
        resolve: jest.fn().mockImplementation((key: string) => {
          if (key === CHINA_PAYMENT_NOTIFICATION_MODULE) {
            return new ChinaPaymentNotificationModuleService();
          }

          if (
            key === REFUND_REVIEW_QUERY_SURFACE_REPOSITORY_READERS_SCOPE_KEY
          ) {
            return createRepositoryReaders();
          }

          return undefined;
        }),
      },
      text: jest.fn(),
    } as unknown as MedusaRequest;
    const res = makeResponse();

    await GET(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "resolved",
        mode: "isolated_preprod_repository",
        evidenceCounts: {
          approvalRecords: 1,
          auditRecords: 1,
          runtimeAttemptRecords: 1,
          terminalConflictSnapshots: 1,
        },
      }),
    );
  });

  it("resolves repository mode through readers registered on the module service container", async () => {
    process.env.CHINA_REFUND_REVIEW_QUERY_SURFACE_ENABLED = "true";
    process.env.CHINA_REFUND_REVIEW_QUERY_SURFACE_MODE =
      "isolated_preprod_repository";
    process.env.CHINA_REFUND_REVIEW_QUERY_SURFACE_TARGET_ENV =
      "isolated_preprod";
    process.env.APP_ENV = "staging";

    const req = {
      query: {
        query_kind: "platform_refund_id",
        platform_refund_id: "refund_platform_001",
      },
      scope: {
        resolve: jest.fn().mockImplementation((key: string) => {
          if (key === CHINA_PAYMENT_NOTIFICATION_MODULE) {
            return new ChinaPaymentNotificationModuleService({
              [REFUND_REVIEW_QUERY_SURFACE_REPOSITORY_READERS_SCOPE_KEY]:
                createRepositoryReaders(),
              get resolve(): never {
                throw new Error("resolve getter should not be required");
              },
            });
          }

          return undefined;
        }),
      },
      text: jest.fn(),
    } as unknown as MedusaRequest;
    const res = makeResponse();

    await GET(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "resolved",
        mode: "isolated_preprod_repository",
        evidenceCounts: {
          approvalRecords: 1,
          auditRecords: 1,
          runtimeAttemptRecords: 1,
          terminalConflictSnapshots: 1,
        },
      }),
    );
  });

  it("resolves repository mode through canonical registration on the module service container", async () => {
    process.env.CHINA_REFUND_REVIEW_QUERY_SURFACE_ENABLED = "true";
    process.env.CHINA_REFUND_REVIEW_QUERY_SURFACE_MODE =
      "isolated_preprod_repository";
    process.env.CHINA_REFUND_REVIEW_QUERY_SURFACE_TARGET_ENV =
      "isolated_preprod";
    process.env.APP_ENV = "staging";

    const req = {
      query: {
        query_kind: "platform_refund_id",
        platform_refund_id: "refund_platform_001",
      },
      scope: {
        resolve: jest.fn().mockImplementation((key: string) => {
          if (key === CHINA_PAYMENT_NOTIFICATION_MODULE) {
            return new ChinaPaymentNotificationModuleService({
              [REFUND_REVIEW_QUERY_SURFACE_REPOSITORY_REGISTRATION_KEY]:
                buildRefundReviewQuerySurfaceRepositoryRegistration({
                  readers: createRepositoryReaders(),
                }),
              get resolve(): never {
                throw new Error("resolve getter should not be required");
              },
            });
          }

          return undefined;
        }),
      },
      text: jest.fn(),
    } as unknown as MedusaRequest;
    const res = makeResponse();

    await GET(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "resolved",
        mode: "isolated_preprod_repository",
        evidenceCounts: {
          approvalRecords: 1,
          auditRecords: 1,
          runtimeAttemptRecords: 1,
          terminalConflictSnapshots: 1,
        },
      }),
    );
  });

  it("resolves repository mode through canonical registration repo properties on the module service container", async () => {
    process.env.CHINA_REFUND_REVIEW_QUERY_SURFACE_ENABLED = "true";
    process.env.CHINA_REFUND_REVIEW_QUERY_SURFACE_MODE =
      "isolated_preprod_repository";
    process.env.CHINA_REFUND_REVIEW_QUERY_SURFACE_TARGET_ENV =
      "isolated_preprod";
    process.env.APP_ENV = "staging";

    const readers = createRepositoryReaders();
    const req = {
      query: {
        query_kind: "platform_refund_id",
        platform_refund_id: "refund_platform_001",
      },
      scope: {
        resolve: jest.fn().mockImplementation((key: string) => {
          if (key === CHINA_PAYMENT_NOTIFICATION_MODULE) {
            return new ChinaPaymentNotificationModuleService({
              [REFUND_REVIEW_QUERY_SURFACE_REPOSITORY_REGISTRATION_KEY]:
                buildRefundReviewQuerySurfaceRepositoryRegistration({
                  repositories: {
                    approvalRepository: readers.approvalRepository,
                    auditRepository: readers.auditRepository,
                    runtimeAttemptRepository:
                      readers.runtimeAttemptRepository,
                    terminalConflictRepository:
                      readers.terminalConflictRepository,
                  },
                }),
              get resolve(): never {
                throw new Error("resolve getter should not be required");
              },
            });
          }

          return undefined;
        }),
      },
      text: jest.fn(),
    } as unknown as MedusaRequest;
    const res = makeResponse();

    await GET(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "resolved",
        mode: "isolated_preprod_repository",
        evidenceCounts: {
          approvalRecords: 1,
          auditRecords: 1,
          runtimeAttemptRecords: 1,
          terminalConflictSnapshots: 1,
        },
      }),
    );
  });

  it("resolves repository mode through legacy module-service container repo properties fallback", async () => {
    process.env.CHINA_REFUND_REVIEW_QUERY_SURFACE_ENABLED = "true";
    process.env.CHINA_REFUND_REVIEW_QUERY_SURFACE_MODE =
      "isolated_preprod_repository";
    process.env.CHINA_REFUND_REVIEW_QUERY_SURFACE_TARGET_ENV =
      "isolated_preprod";
    process.env.APP_ENV = "staging";

    const readers = createRepositoryReaders();
    const req = {
      query: {
        query_kind: "platform_refund_id",
        platform_refund_id: "refund_platform_001",
      },
      scope: {
        resolve: jest.fn().mockImplementation((key: string) => {
          if (key === CHINA_PAYMENT_NOTIFICATION_MODULE) {
            return new ChinaPaymentNotificationModuleService({
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
          }

          return undefined;
        }),
      },
      text: jest.fn(),
    } as unknown as MedusaRequest;
    const res = makeResponse();

    await GET(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "resolved",
        mode: "isolated_preprod_repository",
        evidenceCounts: {
          approvalRecords: 1,
          auditRecords: 1,
          runtimeAttemptRecords: 1,
          terminalConflictSnapshots: 1,
        },
      }),
    );
  });

  it("falls back to pg-backed repository readers when no direct readers provider is registered", async () => {
    process.env.CHINA_REFUND_REVIEW_QUERY_SURFACE_ENABLED = "true";
    process.env.CHINA_REFUND_REVIEW_QUERY_SURFACE_MODE =
      "isolated_preprod_repository";
    process.env.CHINA_REFUND_REVIEW_QUERY_SURFACE_TARGET_ENV =
      "isolated_preprod";
    process.env.APP_ENV = "staging";

    const req = {
      query: {
        query_kind: "platform_refund_id",
        platform_refund_id: "refund_platform_001",
      },
      scope: {
        resolve: jest.fn().mockImplementation((key: string) => {
          if (key === CHINA_PAYMENT_NOTIFICATION_MODULE) {
            return new ChinaPaymentNotificationModuleService();
          }

          if (key === PG_CONNECTION_SCOPE_KEY) {
            return createPgConnection();
          }

          return undefined;
        }),
      },
      text: jest.fn(),
    } as unknown as MedusaRequest;
    const res = makeResponse();

    await GET(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "resolved",
        mode: "isolated_preprod_repository",
        evidenceCounts: {
          approvalRecords: 1,
          auditRecords: 1,
          runtimeAttemptRecords: 1,
          terminalConflictSnapshots: 1,
        },
      }),
    );
  });

  it("resolves repository mode through module-service container pg fallback", async () => {
    process.env.CHINA_REFUND_REVIEW_QUERY_SURFACE_ENABLED = "true";
    process.env.CHINA_REFUND_REVIEW_QUERY_SURFACE_MODE =
      "isolated_preprod_repository";
    process.env.CHINA_REFUND_REVIEW_QUERY_SURFACE_TARGET_ENV =
      "isolated_preprod";
    process.env.APP_ENV = "staging";

    const req = {
      query: {
        query_kind: "platform_refund_id",
        platform_refund_id: "refund_platform_001",
      },
      scope: {
        resolve: jest.fn().mockImplementation((key: string) => {
          if (key === CHINA_PAYMENT_NOTIFICATION_MODULE) {
            return new ChinaPaymentNotificationModuleService({
              [PG_CONNECTION_SCOPE_KEY]: createPgConnection(),
              get resolve(): never {
                throw new Error("resolve getter should not be required");
              },
            });
          }

          return undefined;
        }),
      },
      text: jest.fn(),
    } as unknown as MedusaRequest;
    const res = makeResponse();

    await GET(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "resolved",
        mode: "isolated_preprod_repository",
        evidenceCounts: {
          approvalRecords: 1,
          auditRecords: 1,
          runtimeAttemptRecords: 1,
          terminalConflictSnapshots: 1,
        },
      }),
    );
  });

  it("resolves repository mode through canonical registration pg fallback on the module service container", async () => {
    process.env.CHINA_REFUND_REVIEW_QUERY_SURFACE_ENABLED = "true";
    process.env.CHINA_REFUND_REVIEW_QUERY_SURFACE_MODE =
      "isolated_preprod_repository";
    process.env.CHINA_REFUND_REVIEW_QUERY_SURFACE_TARGET_ENV =
      "isolated_preprod";
    process.env.APP_ENV = "staging";

    const req = {
      query: {
        query_kind: "platform_refund_id",
        platform_refund_id: "refund_platform_001",
      },
      scope: {
        resolve: jest.fn().mockImplementation((key: string) => {
          if (key === CHINA_PAYMENT_NOTIFICATION_MODULE) {
            return new ChinaPaymentNotificationModuleService({
              [REFUND_REVIEW_QUERY_SURFACE_REPOSITORY_REGISTRATION_KEY]:
                buildRefundReviewQuerySurfaceRepositoryRegistration({
                  pgConnection: createPgConnection(),
                }),
              get resolve(): never {
                throw new Error("resolve getter should not be required");
              },
            });
          }

          return undefined;
        }),
      },
      text: jest.fn(),
    } as unknown as MedusaRequest;
    const res = makeResponse();

    await GET(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "resolved",
        mode: "isolated_preprod_repository",
        evidenceCounts: {
          approvalRecords: 1,
          auditRecords: 1,
          runtimeAttemptRecords: 1,
          terminalConflictSnapshots: 1,
        },
      }),
    );
  });

  it("fails closed in repository mode when a repository reader query fails", async () => {
    process.env.CHINA_REFUND_REVIEW_QUERY_SURFACE_ENABLED = "true";
    process.env.CHINA_REFUND_REVIEW_QUERY_SURFACE_MODE =
      "isolated_preprod_repository";
    process.env.CHINA_REFUND_REVIEW_QUERY_SURFACE_TARGET_ENV =
      "isolated_preprod";
    process.env.APP_ENV = "staging";

    const readers = createRepositoryReaders();
    readers.approvalRepository.getByPlatformRefundId = jest
      .fn()
      .mockRejectedValue(new Error("db unavailable"));

    const req = {
      query: {
        query_kind: "platform_refund_id",
        platform_refund_id: "refund_platform_001",
      },
      scope: {
        resolve: jest.fn().mockImplementation((key: string) => {
          if (key === CHINA_PAYMENT_NOTIFICATION_MODULE) {
            return new ChinaPaymentNotificationModuleService({
              [REFUND_REVIEW_QUERY_SURFACE_REPOSITORY_REGISTRATION_KEY]:
                buildRefundReviewQuerySurfaceRepositoryRegistration({
                  readers,
                }),
            });
          }

          return undefined;
        }),
      },
      text: jest.fn(),
    } as unknown as MedusaRequest;
    const res = makeResponse();

    await GET(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
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

  it("fails closed in repository mode when the module service is unavailable", async () => {
    process.env.CHINA_REFUND_REVIEW_QUERY_SURFACE_ENABLED = "true";
    process.env.CHINA_REFUND_REVIEW_QUERY_SURFACE_MODE =
      "isolated_preprod_repository";
    process.env.CHINA_REFUND_REVIEW_QUERY_SURFACE_TARGET_ENV =
      "isolated_preprod";
    process.env.APP_ENV = "staging";

    const req = {
      query: {
        query_kind: "platform_refund_id",
        platform_refund_id: "refund_platform_001",
      },
      scope: {
        resolve: jest.fn().mockImplementation(() => undefined),
      },
      text: jest.fn(),
    } as unknown as MedusaRequest;
    const res = makeResponse();

    await GET(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "blocked",
        mode: "isolated_preprod_repository",
        code: "resolver_repository_mode_blocked",
      }),
    );
  });

  it("resolves repository mode through the registered module service", async () => {
    process.env.CHINA_REFUND_REVIEW_QUERY_SURFACE_ENABLED = "true";
    process.env.CHINA_REFUND_REVIEW_QUERY_SURFACE_MODE =
      "isolated_preprod_repository";
    process.env.CHINA_REFUND_REVIEW_QUERY_SURFACE_TARGET_ENV =
      "isolated_preprod";
    process.env.APP_ENV = "staging";

    const req = {
      query: {
        query_kind: "platform_refund_id",
        platform_refund_id: "refund_platform_001",
      },
      scope: {
        resolve: jest.fn().mockImplementation((key: string) => {
          if (key === CHINA_PAYMENT_NOTIFICATION_MODULE) {
            return new ChinaPaymentNotificationModuleService();
          }

          if (key === PG_CONNECTION_SCOPE_KEY) {
            return createPgConnection();
          }

          return undefined;
        }),
      },
      text: jest.fn(),
    } as unknown as MedusaRequest;
    const res = makeResponse();

    await GET(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "resolved",
        mode: "isolated_preprod_repository",
        evidenceCounts: {
          approvalRecords: 1,
          auditRecords: 1,
          runtimeAttemptRecords: 1,
          terminalConflictSnapshots: 1,
        },
      }),
    );
  });

  it("prefers canonical module-service repo properties over request-scope readers", async () => {
    process.env.CHINA_REFUND_REVIEW_QUERY_SURFACE_ENABLED = "true";
    process.env.CHINA_REFUND_REVIEW_QUERY_SURFACE_MODE =
      "isolated_preprod_repository";
    process.env.CHINA_REFUND_REVIEW_QUERY_SURFACE_TARGET_ENV =
      "isolated_preprod";
    process.env.APP_ENV = "staging";

    const moduleReaders = createRepositoryReaders();
    const scopeReaders = createRepositoryReaders();

    const req = {
      query: {
        query_kind: "platform_refund_id",
        platform_refund_id: "refund_platform_001",
      },
      scope: {
        resolve: jest.fn().mockImplementation((key: string) => {
          if (key === CHINA_PAYMENT_NOTIFICATION_MODULE) {
            return new ChinaPaymentNotificationModuleService({
              [REFUND_REVIEW_QUERY_SURFACE_REPOSITORY_REGISTRATION_KEY]:
                buildRefundReviewQuerySurfaceRepositoryRegistration({
                  repositories: {
                    approvalRepository: moduleReaders.approvalRepository,
                    auditRepository: moduleReaders.auditRepository,
                    runtimeAttemptRepository:
                      moduleReaders.runtimeAttemptRepository,
                    terminalConflictRepository:
                      moduleReaders.terminalConflictRepository,
                  },
                }),
              get resolve(): never {
                throw new Error("resolve getter should not be required");
              },
            });
          }

          if (
            key === REFUND_REVIEW_QUERY_SURFACE_REPOSITORY_READERS_SCOPE_KEY
          ) {
            return scopeReaders;
          }

          return undefined;
        }),
      },
      text: jest.fn(),
    } as unknown as MedusaRequest;
    const res = makeResponse();

    await GET(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "resolved",
        mode: "isolated_preprod_repository",
      }),
    );
  });

  it("prefers canonical registration readers over legacy module-service repo properties", async () => {
    process.env.CHINA_REFUND_REVIEW_QUERY_SURFACE_ENABLED = "true";
    process.env.CHINA_REFUND_REVIEW_QUERY_SURFACE_MODE =
      "isolated_preprod_repository";
    process.env.CHINA_REFUND_REVIEW_QUERY_SURFACE_TARGET_ENV =
      "isolated_preprod";
    process.env.APP_ENV = "staging";

    const providerReaders = createRepositoryReaders();
    const repoReaders = createRepositoryReaders();

    const req = {
      query: {
        query_kind: "platform_refund_id",
        platform_refund_id: "refund_platform_001",
      },
      scope: {
        [CHINA_PAYMENT_NOTIFICATION_MODULE]:
          new ChinaPaymentNotificationModuleService({
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
          }),
        get resolve(): never {
          throw new Error("resolve getter should not be required");
        },
      },
      text: jest.fn(),
    } as unknown as MedusaRequest;
    const res = makeResponse();

    await GET(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "resolved",
        mode: "isolated_preprod_repository",
      }),
    );
  });

  it("resolves repository mode when module service is exposed as a direct scope property", async () => {
    process.env.CHINA_REFUND_REVIEW_QUERY_SURFACE_ENABLED = "true";
    process.env.CHINA_REFUND_REVIEW_QUERY_SURFACE_MODE =
      "isolated_preprod_repository";
    process.env.CHINA_REFUND_REVIEW_QUERY_SURFACE_TARGET_ENV =
      "isolated_preprod";
    process.env.APP_ENV = "staging";

    const readers = createRepositoryReaders();
    const req = {
      query: {
        query_kind: "platform_refund_id",
        platform_refund_id: "refund_platform_001",
      },
      scope: {
        [CHINA_PAYMENT_NOTIFICATION_MODULE]:
          new ChinaPaymentNotificationModuleService({
            [REFUND_REVIEW_QUERY_SURFACE_REPOSITORY_REGISTRATION_KEY]:
              buildRefundReviewQuerySurfaceRepositoryRegistration({
                repositories: {
                  approvalRepository: readers.approvalRepository,
                  auditRepository: readers.auditRepository,
                  runtimeAttemptRepository: readers.runtimeAttemptRepository,
                  terminalConflictRepository:
                    readers.terminalConflictRepository,
                },
              }),
          }),
        get resolve(): never {
          throw new Error("resolve getter should not be required");
        },
      },
      text: jest.fn(),
    } as unknown as MedusaRequest;
    const res = makeResponse();

    await GET(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "resolved",
        mode: "isolated_preprod_repository",
      }),
    );
  });
});
