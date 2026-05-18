import { ContainerLike, resolveContainerKey, resolveFirstContainerKey } from "./container-access";
import { PG_CONNECTION_SCOPE_KEY } from "./pg-connection-scope-key";
import { REFUND_REVIEW_QUERY_SURFACE_REPOSITORY_READERS_SCOPE_KEY } from "./refund-review-query-surface-repository-readers-scope-key";
import {
  REFUND_STATE_MUTATION_APPROVAL_PERSISTENCE_REPOSITORY_KEY,
  REFUND_STATE_MUTATION_AUDIT_PERSISTENCE_REPOSITORY_KEY,
  REFUND_STATE_MUTATION_RUNTIME_ATTEMPT_PERSISTENCE_REPOSITORY_KEY,
  REFUND_STATE_MUTATION_TERMINAL_CONFLICT_PERSISTENCE_REPOSITORY_KEY,
} from "./refund-review-query-surface-repository-registration-keys";
import { RefundReviewQuerySurfaceRepositoryReaders } from "./refund-state-mutation-review-query-surface-repository-resolver";
import {
  RefundReviewQuerySurfacePgConnection,
  resolveRefundReviewQuerySurfacePgRepositories,
} from "./refund-state-mutation-review-query-surface-pg-repositories";

export const REFUND_REVIEW_QUERY_SURFACE_REPOSITORY_REGISTRATION_KEY =
  "refundReviewQuerySurfaceRepositoryRegistration";

export type RefundReviewQuerySurfaceRepositoryRegistration = {
  readers?: RefundReviewQuerySurfaceRepositoryReaders;
  approvalRepository?: RefundReviewQuerySurfaceRepositoryReaders["approvalRepository"];
  auditRepository?: RefundReviewQuerySurfaceRepositoryReaders["auditRepository"];
  runtimeAttemptRepository?: RefundReviewQuerySurfaceRepositoryReaders["runtimeAttemptRepository"];
  terminalConflictRepository?: RefundReviewQuerySurfaceRepositoryReaders["terminalConflictRepository"];
  pgConnection?: unknown;
};

export type RefundReviewQuerySurfaceRepositoryRegistrationInput = {
  readers?: RefundReviewQuerySurfaceRepositoryReaders;
  repositories?: Partial<
    Pick<
      RefundReviewQuerySurfaceRepositoryRegistration,
      | "approvalRepository"
      | "auditRepository"
      | "runtimeAttemptRepository"
      | "terminalConflictRepository"
    >
  >;
  pgConnection?: unknown;
};

export const buildRefundReviewQuerySurfaceRepositoryRegistration = (
  input: RefundReviewQuerySurfaceRepositoryRegistrationInput,
): RefundReviewQuerySurfaceRepositoryRegistration => ({
  readers: input.readers,
  approvalRepository: input.repositories?.approvalRepository,
  auditRepository: input.repositories?.auditRepository,
  runtimeAttemptRepository: input.repositories?.runtimeAttemptRepository,
  terminalConflictRepository: input.repositories?.terminalConflictRepository,
  pgConnection: input.pgConnection,
});

export const resolveRefundReviewQuerySurfaceRepositoryRegistration = (
  container: ContainerLike | undefined,
): RefundReviewQuerySurfaceRepositoryRegistration | undefined => {
  const candidate = resolveContainerKey(
    container,
    REFUND_REVIEW_QUERY_SURFACE_REPOSITORY_REGISTRATION_KEY,
  );

  if (!candidate || typeof candidate !== "object") {
    return undefined;
  }

  return candidate as RefundReviewQuerySurfaceRepositoryRegistration;
};

const hasMethods = (
  value: unknown,
  methodNames: readonly string[],
): value is Record<string, unknown> =>
  Boolean(
    value &&
      typeof value === "object" &&
      methodNames.every(
        (methodName) =>
          typeof (value as Record<string, unknown>)[methodName] === "function",
      ),
  );

const isApprovalRepositoryReader = (
  value: unknown,
): value is RefundReviewQuerySurfaceRepositoryReaders["approvalRepository"] =>
  hasMethods(value, [
    "getByApprovalIdempotencyKey",
    "getByPlatformRefundId",
    "getByProviderRefundReference",
  ]);

const isAuditRepositoryReader = (
  value: unknown,
): value is RefundReviewQuerySurfaceRepositoryReaders["auditRepository"] =>
  hasMethods(value, [
    "getByAuditPersistenceIdempotencyKey",
    "getByApprovalPersistenceIdempotencyKey",
  ]);

const isRuntimeAttemptRepositoryReader = (
  value: unknown,
): value is RefundReviewQuerySurfaceRepositoryReaders["runtimeAttemptRepository"] =>
  hasMethods(value, [
    "getByRuntimeAttemptPersistenceIdempotencyKey",
    "getByWorkflowIdempotencyKey",
    "getByPlatformRefundId",
  ]);

const isTerminalConflictRepositoryReader = (
  value: unknown,
): value is RefundReviewQuerySurfaceRepositoryReaders["terminalConflictRepository"] =>
  hasMethods(value, [
    "getByTerminalConflictPersistenceIdempotencyKey",
    "getByPlatformRefundId",
    "getByTerminalMarkerKey",
    "getByApprovalPersistenceIdempotencyKey",
  ]);

const isReaderObject = (
  value: unknown,
): value is RefundReviewQuerySurfaceRepositoryReaders =>
  Boolean(
    value &&
      typeof value === "object" &&
      isApprovalRepositoryReader(
        (value as Record<string, unknown>).approvalRepository,
      ) &&
      isAuditRepositoryReader(
        (value as Record<string, unknown>).auditRepository,
      ) &&
      isRuntimeAttemptRepositoryReader(
        (value as Record<string, unknown>).runtimeAttemptRepository,
      ) &&
      isTerminalConflictRepositoryReader(
        (value as Record<string, unknown>).terminalConflictRepository,
      ),
  );

const isPgConnection = (
  value: unknown,
): value is RefundReviewQuerySurfacePgConnection => typeof value === "function";

export const resolveNormalizedRefundReviewQuerySurfaceRepositoryRegistration = (
  container: ContainerLike | undefined,
): RefundReviewQuerySurfaceRepositoryRegistration | undefined => {
  const registration =
    resolveRefundReviewQuerySurfaceRepositoryRegistration(container);

  const readers =
    (isReaderObject(registration?.readers) && registration.readers) ||
    (() => {
      const direct = resolveContainerKey(
        container,
        REFUND_REVIEW_QUERY_SURFACE_REPOSITORY_READERS_SCOPE_KEY,
      );

      return isReaderObject(direct) ? direct : undefined;
    })();

  const legacyApprovalRepository = resolveContainerKey(
    container,
    REFUND_STATE_MUTATION_APPROVAL_PERSISTENCE_REPOSITORY_KEY,
  );
  const approvalRepository = isApprovalRepositoryReader(
    registration?.approvalRepository,
  )
    ? registration.approvalRepository
    : isApprovalRepositoryReader(legacyApprovalRepository)
    ? legacyApprovalRepository
    : undefined;
  const legacyAuditRepository = resolveContainerKey(
    container,
    REFUND_STATE_MUTATION_AUDIT_PERSISTENCE_REPOSITORY_KEY,
  );
  const auditRepository = isAuditRepositoryReader(registration?.auditRepository)
    ? registration.auditRepository
    : isAuditRepositoryReader(legacyAuditRepository)
    ? legacyAuditRepository
    : undefined;
  const legacyRuntimeAttemptRepository = resolveContainerKey(
    container,
    REFUND_STATE_MUTATION_RUNTIME_ATTEMPT_PERSISTENCE_REPOSITORY_KEY,
  );
  const runtimeAttemptRepository = isRuntimeAttemptRepositoryReader(
    registration?.runtimeAttemptRepository,
  )
    ? registration.runtimeAttemptRepository
    : isRuntimeAttemptRepositoryReader(legacyRuntimeAttemptRepository)
    ? legacyRuntimeAttemptRepository
    : undefined;
  const legacyTerminalConflictRepository = resolveContainerKey(
    container,
    REFUND_STATE_MUTATION_TERMINAL_CONFLICT_PERSISTENCE_REPOSITORY_KEY,
  );
  const terminalConflictRepository = isTerminalConflictRepositoryReader(
    registration?.terminalConflictRepository,
  )
    ? registration.terminalConflictRepository
    : isTerminalConflictRepositoryReader(legacyTerminalConflictRepository)
    ? legacyTerminalConflictRepository
    : undefined;
  const pgConnection =
    (isPgConnection(registration?.pgConnection) && registration.pgConnection) ||
    (() => {
      const direct = resolveFirstContainerKey(container, [
        PG_CONNECTION_SCOPE_KEY,
        "pgConnection",
      ]);

      return isPgConnection(direct) ? direct : undefined;
    })();

  if (
    !readers &&
    approvalRepository === undefined &&
    auditRepository === undefined &&
    runtimeAttemptRepository === undefined &&
    terminalConflictRepository === undefined &&
    pgConnection === undefined
  ) {
    return undefined;
  }

  return buildRefundReviewQuerySurfaceRepositoryRegistration({
    readers,
    repositories: {
      approvalRepository,
      auditRepository,
      runtimeAttemptRepository,
      terminalConflictRepository,
    },
    pgConnection,
  });
};

export const resolveRefundReviewQuerySurfaceRepositoryReadersFromRegistration =
  async (
    registration: RefundReviewQuerySurfaceRepositoryRegistration | undefined,
  ): Promise<RefundReviewQuerySurfaceRepositoryReaders | undefined> => {
    const directReaders =
      resolveDirectRefundReviewQuerySurfaceRepositoryReadersFromRegistration(
        registration,
      );

    if (directReaders) {
      return directReaders;
    }

    return resolveRefundReviewQuerySurfacePgRepositories(
      resolveRefundReviewQuerySurfacePgConnectionFromRegistration(registration),
    );
  };

export const resolveDirectRefundReviewQuerySurfaceRepositoryReadersFromRegistration =
  (
    registration: RefundReviewQuerySurfaceRepositoryRegistration | undefined,
  ): RefundReviewQuerySurfaceRepositoryReaders | undefined => {
    if (isReaderObject(registration?.readers)) {
      return registration.readers;
    }

    if (
      isApprovalRepositoryReader(registration?.approvalRepository) &&
      isAuditRepositoryReader(registration.auditRepository) &&
      isRuntimeAttemptRepositoryReader(registration.runtimeAttemptRepository) &&
      isTerminalConflictRepositoryReader(registration.terminalConflictRepository)
    ) {
      return {
        approvalRepository: registration.approvalRepository,
        auditRepository: registration.auditRepository,
        runtimeAttemptRepository: registration.runtimeAttemptRepository,
        terminalConflictRepository: registration.terminalConflictRepository,
      };
    }
    return undefined;
  };

export const resolveDirectRefundReviewQuerySurfaceRepositoryReadersFromContainer =
  (
    container: ContainerLike | undefined,
  ): RefundReviewQuerySurfaceRepositoryReaders | undefined =>
    resolveDirectRefundReviewQuerySurfaceRepositoryReadersFromRegistration(
      resolveNormalizedRefundReviewQuerySurfaceRepositoryRegistration(container),
    );

export const resolveRefundReviewQuerySurfacePgConnectionFromRegistration = (
  registration: RefundReviewQuerySurfaceRepositoryRegistration | undefined,
): RefundReviewQuerySurfacePgConnection | undefined =>
  isPgConnection(registration?.pgConnection)
    ? registration.pgConnection
    : undefined;

export const resolveRefundReviewQuerySurfacePgConnectionFromContainer = (
  container: ContainerLike | undefined,
): RefundReviewQuerySurfacePgConnection | undefined =>
  resolveRefundReviewQuerySurfacePgConnectionFromRegistration(
    resolveNormalizedRefundReviewQuerySurfaceRepositoryRegistration(container),
  );

export const resolveRefundReviewQuerySurfacePgReadersFromRegistration = async (
  registration: RefundReviewQuerySurfaceRepositoryRegistration | undefined,
): Promise<RefundReviewQuerySurfaceRepositoryReaders | undefined> =>
  resolveRefundReviewQuerySurfacePgRepositories(
    resolveRefundReviewQuerySurfacePgConnectionFromRegistration(registration),
  );

export const resolveRefundReviewQuerySurfacePgReadersFromContainer = async (
  container: ContainerLike | undefined,
): Promise<RefundReviewQuerySurfaceRepositoryReaders | undefined> =>
  resolveRefundReviewQuerySurfacePgReadersFromRegistration(
    resolveNormalizedRefundReviewQuerySurfaceRepositoryRegistration(container),
  );

export const resolveRefundReviewQuerySurfaceRepositoryReadersFromContainer =
  async (
    container: ContainerLike | undefined,
  ): Promise<RefundReviewQuerySurfaceRepositoryReaders | undefined> =>
    resolveRefundReviewQuerySurfaceRepositoryReadersFromRegistration(
      resolveNormalizedRefundReviewQuerySurfaceRepositoryRegistration(container),
    );

export const resolveRefundReviewQuerySurfaceRepositoryReadersFromContainers =
  async (
    containers: readonly (ContainerLike | undefined)[],
  ): Promise<RefundReviewQuerySurfaceRepositoryReaders | undefined> => {
    for (const container of containers) {
      const readers =
        await resolveRefundReviewQuerySurfaceRepositoryReadersFromContainer(
          container,
        );

      if (readers) {
        return readers;
      }
    }

    return undefined;
  };

export const resolveNormalizedRefundReviewQuerySurfaceRepositoryRegistrationFromContainers =
  (
    containers: readonly (ContainerLike | undefined)[],
  ): RefundReviewQuerySurfaceRepositoryRegistration | undefined => {
    for (const container of containers) {
      const registration =
        resolveNormalizedRefundReviewQuerySurfaceRepositoryRegistration(
          container,
        );

      if (registration) {
        return registration;
      }
    }

    return undefined;
  };
