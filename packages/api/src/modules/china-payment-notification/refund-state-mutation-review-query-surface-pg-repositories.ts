import {
  RefundStateMutationApprovalPersistenceRecord,
} from "./refund-state-mutation-approval-persistence-repository";
import {
  RefundStateMutationAuditPersistenceRecord,
} from "./refund-state-mutation-audit-persistence-repository";
import {
  RefundReviewQuerySurfaceRepositoryReaders,
} from "./refund-state-mutation-review-query-surface-repository-resolver";
import {
  RefundStateMutationRuntimeAttemptPersistenceRecord,
} from "./refund-state-mutation-runtime-attempt-persistence-repository";
import {
  RefundStateMutationTerminalConflictPersistenceSnapshotRecord,
} from "./refund-state-mutation-terminal-conflict-persistence-repository";

export type RefundReviewQuerySurfacePgQueryBuilder = {
  where: (
    column: string,
    value: unknown,
  ) => RefundReviewQuerySurfacePgQueryBuilder;
  whereNull: (column: string) => RefundReviewQuerySurfacePgQueryBuilder;
  orderBy: (
    column: string,
    direction: "asc" | "desc",
  ) => RefundReviewQuerySurfacePgQueryBuilder;
  select: (...columns: string[]) => Promise<Record<string, unknown>[]>;
};

export type RefundReviewQuerySurfacePgConnection = {
  schema?: {
    hasTable?: (tableName: string) => Promise<boolean>;
  };
  (tableName: string): RefundReviewQuerySurfacePgQueryBuilder;
};

const toIsoString = (value: unknown): string | undefined => {
  if (!value) {
    return undefined;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return String(value);
};

const toRecord = <T>(row: T | undefined): T | null => row ?? null;

const mapApprovalRecord = (
  row: Record<string, unknown>,
): RefundStateMutationApprovalPersistenceRecord => ({
  id: String(row.id),
  approvalIdempotencyKey: String(row.approval_idempotency_key),
  platformRefundId: String(row.platform_refund_id),
  providerName: row.provider_name as "mock_china_pay" | "alipay" | "wechat_pay",
  providerRefundReference: String(row.provider_refund_reference),
  merchantOrderReference: String(row.merchant_order_reference),
  refundRequestReference: String(row.refund_request_reference),
  targetState: String(row.target_state),
  targetStateAuditLabel: String(row.target_state_audit_label),
  amountMinor: Number(row.amount_minor),
  currency: "CNY",
  requestActorId: String(row.request_actor_id),
  requestActorType: row.request_actor_type as "admin" | "system_job",
  reviewerActorId: String(row.reviewer_actor_id),
  reviewerRole: row.reviewer_role as
    | "admin_refund_reviewer"
    | "admin_finance_reviewer",
  permissionEvidenceId: String(row.permission_evidence_id),
  ownershipEvidenceId: String(row.ownership_evidence_id),
  readinessDecisionKey: String(row.readiness_decision_key),
  shadowCommandKey: String(row.shadow_command_key),
  runtimeAdapterDecisionKey: String(row.runtime_adapter_decision_key),
  featureFlagSnapshotKey: String(row.feature_flag_snapshot_key),
  status: row.status as RefundStateMutationApprovalPersistenceRecord["status"],
  decisionReasonRedacted: String(row.decision_reason_redacted),
  createdAt: String(toIsoString(row.created_at)),
  decidedAt: toIsoString(row.decided_at),
  expiresAt: toIsoString(row.expires_at),
});

const mapAuditRecord = (
  row: Record<string, unknown>,
): RefundStateMutationAuditPersistenceRecord => ({
  id: String(row.id),
  auditPersistenceIdempotencyKey: String(row.audit_persistence_idempotency_key),
  approvalPersistenceIdempotencyKey: String(
    row.approval_persistence_idempotency_key,
  ),
  approvalCandidateIdempotencyKey:
    row.approval_candidate_idempotency_key == null
      ? undefined
      : String(row.approval_candidate_idempotency_key),
  targetState: row.target_state == null ? undefined : String(row.target_state),
  status: row.status as RefundStateMutationAuditPersistenceRecord["status"],
  auditAction: String(row.audit_action),
  auditReasonRedacted: String(row.audit_reason_redacted),
  createdAt: String(toIsoString(row.created_at)),
});

const mapRuntimeAttemptRecord = (
  row: Record<string, unknown>,
): RefundStateMutationRuntimeAttemptPersistenceRecord => ({
  id: String(row.id),
  runtimeAttemptPersistenceIdempotencyKey: String(
    row.runtime_attempt_persistence_idempotency_key,
  ),
  workflowIdempotencyKey: String(row.workflow_idempotency_key),
  platformRefundId: String(row.platform_refund_id),
  providerName: row.provider_name as "mock_china_pay" | "alipay" | "wechat_pay",
  providerRefundReference: String(row.provider_refund_reference),
  merchantOrderReference: String(row.merchant_order_reference),
  refundRequestReference: String(row.refund_request_reference),
  targetState: String(row.target_state),
  targetStateAuditLabel: String(row.target_state_audit_label),
  attemptStatus:
    row.attempt_status as RefundStateMutationRuntimeAttemptPersistenceRecord["attemptStatus"],
  attemptNumber: Number(row.attempt_number),
  providerEvidenceDigest: String(row.provider_evidence_digest),
  digestVersion: String(row.digest_version),
  approvalPersistenceIdempotencyKey: String(
    row.approval_persistence_idempotency_key,
  ),
  auditPersistenceIdempotencyKey: String(row.audit_persistence_idempotency_key),
  terminalConflictDecisionKey: String(row.terminal_conflict_decision_key),
  featureFlagSnapshotKey: String(row.feature_flag_snapshot_key),
  environment:
    row.environment as RefundStateMutationRuntimeAttemptPersistenceRecord["environment"],
  failureCode: row.failure_code == null ? undefined : String(row.failure_code),
  failureReasonRedacted:
    row.failure_reason_redacted == null
      ? undefined
      : String(row.failure_reason_redacted),
  operatorVisibleReason:
    row.operator_visible_reason == null
      ? undefined
      : String(row.operator_visible_reason),
  createdAt: String(toIsoString(row.created_at)),
  startedAt: toIsoString(row.started_at),
  finishedAt: toIsoString(row.finished_at),
  nextRetryAt: toIsoString(row.next_retry_at),
});

const mapTerminalConflictRecord = (
  row: Record<string, unknown>,
): RefundStateMutationTerminalConflictPersistenceSnapshotRecord => ({
  id: String(row.id),
  terminalConflictPersistenceIdempotencyKey: String(
    row.terminal_conflict_persistence_idempotency_key,
  ),
  terminalConflictDecisionKey: String(row.terminal_conflict_decision_key),
  platformRefundId: String(row.platform_refund_id),
  currentRefundState: String(row.current_refund_state),
  incomingTargetState: String(row.incoming_target_state),
  conflictStatus:
    row.conflict_status as RefundStateMutationTerminalConflictPersistenceSnapshotRecord["conflictStatus"],
  conflictCode:
    row.conflict_code as RefundStateMutationTerminalConflictPersistenceSnapshotRecord["conflictCode"],
  terminalMarkerKey:
    row.terminal_marker_key == null ? undefined : String(row.terminal_marker_key),
  terminalMarkerVersion:
    row.terminal_marker_version == null
      ? undefined
      : String(row.terminal_marker_version),
  providerEvidenceDigest: String(row.provider_evidence_digest),
  providerEvidenceDigestVersion:
    row.provider_evidence_digest_version == null
      ? undefined
      : String(row.provider_evidence_digest_version),
  approvalPersistenceIdempotencyKey:
    row.approval_persistence_idempotency_key == null
      ? undefined
      : String(row.approval_persistence_idempotency_key),
  auditPersistenceIdempotencyKey:
    row.audit_persistence_idempotency_key == null
      ? undefined
      : String(row.audit_persistence_idempotency_key),
  workflowIdempotencyKey:
    row.workflow_idempotency_key == null
      ? undefined
      : String(row.workflow_idempotency_key),
  runtimeAttemptPersistenceIdempotencyKey:
    row.runtime_attempt_persistence_idempotency_key == null
      ? undefined
      : String(row.runtime_attempt_persistence_idempotency_key),
  featureFlagSnapshotKey:
    row.feature_flag_snapshot_key == null
      ? undefined
      : String(row.feature_flag_snapshot_key),
  stateOwnerEvidenceKey:
    row.state_owner_evidence_key == null
      ? undefined
      : String(row.state_owner_evidence_key),
  actorReference:
    row.actor_reference == null ? undefined : String(row.actor_reference),
  reviewerReference:
    row.reviewer_reference == null ? undefined : String(row.reviewer_reference),
  conflictDetectedAt: String(toIsoString(row.conflict_detected_at)),
  createdAt: String(toIsoString(row.created_at)),
});

export const refundReviewQuerySurfacePgRequiredTables = [
  "china_refund_state_mutation_approval",
  "china_refund_state_mutation_audit",
  "china_refund_state_mutation_runtime_attempt",
  "china_refund_state_mutation_terminal_conflict",
] as const;

export const hasRefundReviewQuerySurfacePgTables = async (
  pg: RefundReviewQuerySurfacePgConnection,
): Promise<boolean> => {
  try {
    return (
      await Promise.all(
        refundReviewQuerySurfacePgRequiredTables.map((tableName) =>
          pg.schema?.hasTable?.(tableName),
        ),
      )
    ).every(Boolean);
  } catch {
    return false;
  }
};

export const createRefundReviewQuerySurfacePgRepositories = (
  pg: RefundReviewQuerySurfacePgConnection,
): RefundReviewQuerySurfaceRepositoryReaders => ({
  approvalRepository: {
    async getByApprovalIdempotencyKey(approvalIdempotencyKey: string) {
      const row = (
        await pg("china_refund_state_mutation_approval")
          .where("approval_idempotency_key", approvalIdempotencyKey)
          .orderBy("created_at", "desc")
          .select("*")
      )[0];

      return toRecord(row ? mapApprovalRecord(row) : undefined);
    },
    async getByPlatformRefundId(platformRefundId: string) {
      const rows = await pg("china_refund_state_mutation_approval")
        .where("platform_refund_id", platformRefundId)
        .orderBy("created_at", "desc")
        .select("*");

      return rows.map(mapApprovalRecord);
    },
    async getByProviderRefundReference(providerName, providerRefundReference) {
      const rows = await pg("china_refund_state_mutation_approval")
        .where("provider_name", providerName)
        .where("provider_refund_reference", providerRefundReference)
        .orderBy("created_at", "desc")
        .select("*");

      return rows.map(mapApprovalRecord);
    },
  },
  auditRepository: {
    async getByAuditPersistenceIdempotencyKey(auditPersistenceIdempotencyKey) {
      const row = (
        await pg("china_refund_state_mutation_audit")
          .where(
            "audit_persistence_idempotency_key",
            auditPersistenceIdempotencyKey,
          )
          .orderBy("created_at", "desc")
          .select("*")
      )[0];

      return toRecord(row ? mapAuditRecord(row) : undefined);
    },
    async getByApprovalPersistenceIdempotencyKey(
      approvalPersistenceIdempotencyKey,
    ) {
      const rows = await pg("china_refund_state_mutation_audit")
        .where(
          "approval_persistence_idempotency_key",
          approvalPersistenceIdempotencyKey,
        )
        .orderBy("created_at", "desc")
        .select("*");

      return rows.map(mapAuditRecord);
    },
  },
  runtimeAttemptRepository: {
    async getByRuntimeAttemptPersistenceIdempotencyKey(
      runtimeAttemptPersistenceIdempotencyKey,
    ) {
      const row = (
        await pg("china_refund_state_mutation_runtime_attempt")
          .where(
            "runtime_attempt_persistence_idempotency_key",
            runtimeAttemptPersistenceIdempotencyKey,
          )
          .orderBy("created_at", "desc")
          .select("*")
      )[0];

      return toRecord(row ? mapRuntimeAttemptRecord(row) : undefined);
    },
    async getByWorkflowIdempotencyKey(workflowIdempotencyKey) {
      const rows = await pg("china_refund_state_mutation_runtime_attempt")
        .where("workflow_idempotency_key", workflowIdempotencyKey)
        .orderBy("created_at", "desc")
        .select("*");

      return rows.map(mapRuntimeAttemptRecord);
    },
    async getByPlatformRefundId(platformRefundId) {
      const rows = await pg("china_refund_state_mutation_runtime_attempt")
        .where("platform_refund_id", platformRefundId)
        .orderBy("created_at", "desc")
        .select("*");

      return rows.map(mapRuntimeAttemptRecord);
    },
  },
  terminalConflictRepository: {
    async getByTerminalConflictPersistenceIdempotencyKey(
      terminalConflictPersistenceIdempotencyKey,
    ) {
      const row = (
        await pg("china_refund_state_mutation_terminal_conflict")
          .where(
            "terminal_conflict_persistence_idempotency_key",
            terminalConflictPersistenceIdempotencyKey,
          )
          .orderBy("created_at", "desc")
          .select("*")
      )[0];

      return toRecord(row ? mapTerminalConflictRecord(row) : undefined);
    },
    async getByPlatformRefundId(platformRefundId) {
      const rows = await pg("china_refund_state_mutation_terminal_conflict")
        .where("platform_refund_id", platformRefundId)
        .orderBy("created_at", "desc")
        .select("*");

      return rows.map(mapTerminalConflictRecord);
    },
    async getByTerminalMarkerKey(terminalMarkerKey) {
      const rows = await pg("china_refund_state_mutation_terminal_conflict")
        .where("terminal_marker_key", terminalMarkerKey)
        .orderBy("created_at", "desc")
        .select("*");

      return rows.map(mapTerminalConflictRecord);
    },
    async getByApprovalPersistenceIdempotencyKey(
      approvalPersistenceIdempotencyKey,
    ) {
      const rows = await pg("china_refund_state_mutation_terminal_conflict")
        .where(
          "approval_persistence_idempotency_key",
          approvalPersistenceIdempotencyKey,
        )
        .orderBy("created_at", "desc")
        .select("*");

      return rows.map(mapTerminalConflictRecord);
    },
  },
});

export const resolveRefundReviewQuerySurfacePgRepositories = async (
  pg: RefundReviewQuerySurfacePgConnection | undefined,
): Promise<RefundReviewQuerySurfaceRepositoryReaders | undefined> => {
  if (!pg || !(await hasRefundReviewQuerySurfacePgTables(pg))) {
    return undefined;
  }

  return createRefundReviewQuerySurfacePgRepositories(pg);
};
