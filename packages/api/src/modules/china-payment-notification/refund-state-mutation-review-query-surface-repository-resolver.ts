import {
  RefundStateMutationApprovalPersistenceRecord,
  RefundStateMutationApprovalPersistenceRepositoryContract,
} from "./refund-state-mutation-approval-persistence-repository";
import {
  RefundStateMutationAuditPersistenceRecord,
  RefundStateMutationAuditPersistenceRepositoryContract,
} from "./refund-state-mutation-audit-persistence-repository";
import {
  createRefundStateMutationIsolatedPreprodQuerySurface,
  RefundStateMutationIsolatedPreprodQuerySurfaceInput,
  RefundStateMutationReviewCaseResult,
} from "./refund-state-mutation-isolated-preprod-query-surface";
import {
  RefundReviewFixtureAdapterQuery,
} from "./refund-state-mutation-review-fixture-adapter";
import {
  RefundStateMutationRuntimeAttemptPersistenceRecord,
  RefundStateMutationRuntimeAttemptPersistenceRepositoryContract,
} from "./refund-state-mutation-runtime-attempt-persistence-repository";
import {
  RefundStateMutationTerminalConflictPersistenceRepositoryContract,
  RefundStateMutationTerminalConflictPersistenceSnapshotRecord,
} from "./refund-state-mutation-terminal-conflict-persistence-repository";

type ApprovalRepositoryReader = Pick<
  RefundStateMutationApprovalPersistenceRepositoryContract,
  | "getByApprovalIdempotencyKey"
  | "getByPlatformRefundId"
  | "getByProviderRefundReference"
>;

type AuditRepositoryReader = Pick<
  RefundStateMutationAuditPersistenceRepositoryContract,
  | "getByAuditPersistenceIdempotencyKey"
  | "getByApprovalPersistenceIdempotencyKey"
>;

type RuntimeAttemptRepositoryReader = Pick<
  RefundStateMutationRuntimeAttemptPersistenceRepositoryContract,
  | "getByRuntimeAttemptPersistenceIdempotencyKey"
  | "getByWorkflowIdempotencyKey"
  | "getByPlatformRefundId"
>;

type TerminalConflictRepositoryReader = Pick<
  RefundStateMutationTerminalConflictPersistenceRepositoryContract,
  | "getByTerminalConflictPersistenceIdempotencyKey"
  | "getByPlatformRefundId"
  | "getByTerminalMarkerKey"
  | "getByApprovalPersistenceIdempotencyKey"
>;

export type RefundReviewQuerySurfaceRepositoryReaders = {
  approvalRepository: ApprovalRepositoryReader;
  auditRepository: AuditRepositoryReader;
  runtimeAttemptRepository: RuntimeAttemptRepositoryReader;
  terminalConflictRepository: TerminalConflictRepositoryReader;
};

export type RefundReviewQuerySurfaceRepositoryResolverInput = {
  mode: "isolated_preprod_repository";
  environment:
    RefundStateMutationIsolatedPreprodQuerySurfaceInput["environment"];
  query: RefundReviewFixtureAdapterQuery;
  repositories: RefundReviewQuerySurfaceRepositoryReaders;
};

export type RefundReviewQuerySurfaceRepositoryResolverResult =
  | {
      status: "blocked";
      blockCode:
        | "resolver_repository_mode_blocked"
        | "resolver_repository_environment_blocked"
        | "resolver_repository_query_failed";
      reason: string;
    }
  | {
      status: "resolved";
      reviewInput: RefundStateMutationIsolatedPreprodQuerySurfaceInput;
      reviewCaseResult: RefundStateMutationReviewCaseResult;
      evidenceCounts: {
        approvalRecords: number;
        auditRecords: number;
        runtimeAttemptRecords: number;
        terminalConflictSnapshots: number;
      };
    };

const dedupeBy = <T>(
  records: T[],
  key: (record: T) => string | undefined,
): T[] => {
  const entries = new Map<string, T>();

  for (const record of records) {
    const resolvedKey = key(record);

    if (!resolvedKey || entries.has(resolvedKey)) {
      continue;
    }

    entries.set(resolvedKey, record);
  }

  return [...entries.values()];
};

const collectUnique = (values: Array<string | undefined>): string[] =>
  [...new Set(values.filter((value): value is string => Boolean(value)))];

const querySurfaceResultFromInput = (
  input: RefundStateMutationIsolatedPreprodQuerySurfaceInput,
  query: RefundReviewFixtureAdapterQuery,
): RefundStateMutationReviewCaseResult => {
  const surface = createRefundStateMutationIsolatedPreprodQuerySurface(input);

  switch (query.kind) {
    case "platform_refund_id":
      return surface.reviewCaseByPlatformRefundId(query.platformRefundId);
    case "approval_persistence_idempotency_key":
      return surface.reviewCaseByApprovalPersistenceIdempotencyKey(
        query.approvalPersistenceIdempotencyKey,
      );
    case "runtime_attempt_persistence_idempotency_key":
      return surface.reviewCaseByRuntimeAttemptPersistenceIdempotencyKey(
        query.runtimeAttemptPersistenceIdempotencyKey,
      );
    case "terminal_conflict_persistence_idempotency_key":
      return surface.reviewCaseByTerminalConflictPersistenceIdempotencyKey(
        query.terminalConflictPersistenceIdempotencyKey,
      );
    case "provider_refund_reference":
      return surface.reviewCaseByProviderRefundReference(
        query.providerName,
        query.providerRefundReference,
      );
  }
};

const buildRepositoryReviewInput = async (
  input: RefundReviewQuerySurfaceRepositoryResolverInput,
): Promise<RefundStateMutationIsolatedPreprodQuerySurfaceInput> => {
  const {
    approvalRepository,
    auditRepository,
    runtimeAttemptRepository,
    terminalConflictRepository,
  } = input.repositories;

  let approvalRecords: RefundStateMutationApprovalPersistenceRecord[] = [];
  let auditRecords: RefundStateMutationAuditPersistenceRecord[] = [];
  let runtimeAttemptRecords: RefundStateMutationRuntimeAttemptPersistenceRecord[] =
    [];
  let terminalConflictSnapshots: RefundStateMutationTerminalConflictPersistenceSnapshotRecord[] =
    [];

  switch (input.query.kind) {
    case "platform_refund_id": {
      const platformRefundId = input.query.platformRefundId;
      [approvalRecords, runtimeAttemptRecords, terminalConflictSnapshots] =
        await Promise.all([
          approvalRepository.getByPlatformRefundId(platformRefundId),
          runtimeAttemptRepository.getByPlatformRefundId(platformRefundId),
          terminalConflictRepository.getByPlatformRefundId(platformRefundId),
        ]);
      break;
    }
    case "approval_persistence_idempotency_key": {
      const approvalRecord =
        await approvalRepository.getByApprovalIdempotencyKey(
          input.query.approvalPersistenceIdempotencyKey,
        );

      approvalRecords = approvalRecord ? [approvalRecord] : [];
      terminalConflictSnapshots =
        await terminalConflictRepository.getByApprovalPersistenceIdempotencyKey(
          input.query.approvalPersistenceIdempotencyKey,
        );

      if (approvalRecord) {
        runtimeAttemptRecords = await runtimeAttemptRepository.getByPlatformRefundId(
          approvalRecord.platformRefundId,
        );
      }

      break;
    }
    case "runtime_attempt_persistence_idempotency_key": {
      const runtimeAttempt =
        await runtimeAttemptRepository.getByRuntimeAttemptPersistenceIdempotencyKey(
          input.query.runtimeAttemptPersistenceIdempotencyKey,
        );

      runtimeAttemptRecords = runtimeAttempt ? [runtimeAttempt] : [];

      if (runtimeAttempt) {
        [approvalRecords, terminalConflictSnapshots] = await Promise.all([
          approvalRepository.getByPlatformRefundId(runtimeAttempt.platformRefundId),
          terminalConflictRepository.getByPlatformRefundId(
            runtimeAttempt.platformRefundId,
          ),
        ]);
      }

      break;
    }
    case "terminal_conflict_persistence_idempotency_key": {
      const terminalConflict =
        await terminalConflictRepository.getByTerminalConflictPersistenceIdempotencyKey(
          input.query.terminalConflictPersistenceIdempotencyKey,
        );

      terminalConflictSnapshots = terminalConflict ? [terminalConflict] : [];

      if (terminalConflict) {
        [approvalRecords, runtimeAttemptRecords] = await Promise.all([
          terminalConflict.approvalPersistenceIdempotencyKey
            ? approvalRepository.getByApprovalIdempotencyKey(
                terminalConflict.approvalPersistenceIdempotencyKey,
              ).then((record) => (record ? [record] : []))
            : approvalRepository.getByPlatformRefundId(
                terminalConflict.platformRefundId,
              ),
          terminalConflict.runtimeAttemptPersistenceIdempotencyKey
            ? runtimeAttemptRepository.getByRuntimeAttemptPersistenceIdempotencyKey(
                terminalConflict.runtimeAttemptPersistenceIdempotencyKey,
              ).then((record) => (record ? [record] : []))
            : runtimeAttemptRepository.getByPlatformRefundId(
                terminalConflict.platformRefundId,
              ),
        ]);
      }

      break;
    }
    case "provider_refund_reference": {
      approvalRecords = await approvalRepository.getByProviderRefundReference(
        input.query.providerName,
        input.query.providerRefundReference,
      );

      const platformRefundIds = collectUnique(
        approvalRecords.map((record) => record.platformRefundId),
      );

      const [runtimeLists, terminalLists] = await Promise.all([
        Promise.all(
          platformRefundIds.map((platformRefundId) =>
            runtimeAttemptRepository.getByPlatformRefundId(platformRefundId),
          ),
        ),
        Promise.all(
          platformRefundIds.map((platformRefundId) =>
            terminalConflictRepository.getByPlatformRefundId(platformRefundId),
          ),
        ),
      ]);

      runtimeAttemptRecords = runtimeLists.flat();
      terminalConflictSnapshots = terminalLists.flat();
      break;
    }
  }

  const approvalKeys = collectUnique([
    ...approvalRecords.map((record) => record.approvalIdempotencyKey),
    ...terminalConflictSnapshots.map(
      (record) => record.approvalPersistenceIdempotencyKey,
    ),
    ...runtimeAttemptRecords.map(
      (record) => record.approvalPersistenceIdempotencyKey,
    ),
  ]);

  const auditKeys = collectUnique(
    terminalConflictSnapshots.map(
      (record) => record.auditPersistenceIdempotencyKey,
    ),
  );

  const workflowKeys = collectUnique(
    terminalConflictSnapshots.map((record) => record.workflowIdempotencyKey),
  );

  const terminalMarkerKeys = collectUnique(
    terminalConflictSnapshots.map((record) => record.terminalMarkerKey),
  );

  const [approvalExactMatches, auditByApprovalLists, auditExactMatches, runtimeByWorkflowLists, terminalByApprovalLists, terminalByMarkerLists] =
    await Promise.all([
      Promise.all(
        approvalKeys.map((approvalIdempotencyKey) =>
          approvalRepository.getByApprovalIdempotencyKey(approvalIdempotencyKey),
        ),
      ),
      Promise.all(
        approvalKeys.map((approvalIdempotencyKey) =>
          auditRepository.getByApprovalPersistenceIdempotencyKey(
            approvalIdempotencyKey,
          ),
        ),
      ),
      Promise.all(
        auditKeys.map((auditPersistenceIdempotencyKey) =>
          auditRepository.getByAuditPersistenceIdempotencyKey(
            auditPersistenceIdempotencyKey,
          ),
        ),
      ),
      Promise.all(
        workflowKeys.map((workflowIdempotencyKey) =>
          runtimeAttemptRepository.getByWorkflowIdempotencyKey(
            workflowIdempotencyKey,
          ),
        ),
      ),
      Promise.all(
        approvalKeys.map((approvalIdempotencyKey) =>
          terminalConflictRepository.getByApprovalPersistenceIdempotencyKey(
            approvalIdempotencyKey,
          ),
        ),
      ),
      Promise.all(
        terminalMarkerKeys.map((terminalMarkerKey) =>
          terminalConflictRepository.getByTerminalMarkerKey(terminalMarkerKey),
        ),
      ),
    ]);

  approvalRecords = dedupeBy(
    [
      ...approvalRecords,
      ...approvalExactMatches.filter(
        (
          record,
        ): record is RefundStateMutationApprovalPersistenceRecord => Boolean(record),
      ),
    ],
    (record) => record.approvalIdempotencyKey,
  );

  auditRecords = dedupeBy(
    [
      ...auditRecords,
      ...auditByApprovalLists.flat(),
      ...auditExactMatches.filter(
        (
          record,
        ): record is RefundStateMutationAuditPersistenceRecord => Boolean(record),
      ),
    ],
    (record) => record.auditPersistenceIdempotencyKey,
  );

  runtimeAttemptRecords = dedupeBy(
    [...runtimeAttemptRecords, ...runtimeByWorkflowLists.flat()],
    (record) => record.runtimeAttemptPersistenceIdempotencyKey,
  );

  terminalConflictSnapshots = dedupeBy(
    [
      ...terminalConflictSnapshots,
      ...terminalByApprovalLists.flat(),
      ...terminalByMarkerLists.flat(),
    ],
    (record) => record.terminalConflictPersistenceIdempotencyKey,
  );

  return {
    environment: input.environment,
    approvalRecords,
    auditRecords,
    runtimeAttemptRecords,
    terminalConflictSnapshots,
  };
};

export const resolveRefundReviewQuerySurfaceRepositoryResult = async (
  input: RefundReviewQuerySurfaceRepositoryResolverInput,
): Promise<RefundReviewQuerySurfaceRepositoryResolverResult> => {
  if (input.mode !== "isolated_preprod_repository") {
    return {
      status: "blocked",
      blockCode: "resolver_repository_mode_blocked",
      reason:
        "Refund review query surface repository resolver requires isolated_preprod_repository mode.",
    };
  }

  if (input.environment.environment === "production") {
    return {
      status: "blocked",
      blockCode: "resolver_repository_environment_blocked",
      reason:
        "Refund review query surface repository resolver is blocked in production.",
    };
  }

  let reviewInput: RefundStateMutationIsolatedPreprodQuerySurfaceInput;

  try {
    reviewInput = await buildRepositoryReviewInput(input);
  } catch {
    return {
      status: "blocked",
      blockCode: "resolver_repository_query_failed",
      reason: "Refund review query surface repository query failed.",
    };
  }

  const reviewCaseResult = querySurfaceResultFromInput(reviewInput, input.query);

  return {
    status: "resolved",
    reviewInput,
    reviewCaseResult,
    evidenceCounts: {
      approvalRecords: reviewInput.approvalRecords.length,
      auditRecords: reviewInput.auditRecords.length,
      runtimeAttemptRecords: reviewInput.runtimeAttemptRecords.length,
      terminalConflictSnapshots: reviewInput.terminalConflictSnapshots.length,
    },
  };
};
