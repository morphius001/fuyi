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
import { resolveRefundReviewQuerySurfaceRepositoryReadersFromScope } from "../refund-state-mutation-review-query-surface-repository-readers-scope";

const createReaders = () => {
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

describe("refund state mutation review query surface repository readers scope", () => {
  it("resolves a direct readers provider from scope", () => {
    const readers = createReaders();
    const scope = {
      resolve: jest.fn().mockImplementation((key: string) => {
        if (key === REFUND_REVIEW_QUERY_SURFACE_REPOSITORY_READERS_SCOPE_KEY) {
          return readers;
        }

        return undefined;
      }),
    };

    expect(
      resolveRefundReviewQuerySurfaceRepositoryReadersFromScope(scope),
    ).toBe(readers);
  });

  it("builds readers from individually registered repository keys", () => {
    const readers = createReaders();
    const scope = {
      resolve: jest.fn().mockImplementation((key: string) => {
        switch (key) {
          case REFUND_STATE_MUTATION_APPROVAL_PERSISTENCE_REPOSITORY_KEY:
            return readers.approvalRepository;
          case REFUND_STATE_MUTATION_AUDIT_PERSISTENCE_REPOSITORY_KEY:
            return readers.auditRepository;
          case REFUND_STATE_MUTATION_RUNTIME_ATTEMPT_PERSISTENCE_REPOSITORY_KEY:
            return readers.runtimeAttemptRepository;
          case REFUND_STATE_MUTATION_TERMINAL_CONFLICT_PERSISTENCE_REPOSITORY_KEY:
            return readers.terminalConflictRepository;
          default:
            return undefined;
        }
      }),
    };

    expect(
      resolveRefundReviewQuerySurfaceRepositoryReadersFromScope(scope),
    ).toEqual(readers);
  });

  it("falls back to direct container properties when resolve is unavailable", () => {
    const readers = createReaders();
    const scope = {
      [REFUND_REVIEW_QUERY_SURFACE_REPOSITORY_READERS_SCOPE_KEY]: readers,
      get resolve(): never {
        throw new Error("resolve getter should not be required");
      },
    };

    expect(
      resolveRefundReviewQuerySurfaceRepositoryReadersFromScope(scope),
    ).toBe(readers);
  });

  it("resolves readers from canonical registration object", () => {
    const readers = createReaders();
    const scope = {
      [REFUND_REVIEW_QUERY_SURFACE_REPOSITORY_REGISTRATION_KEY]:
        buildRefundReviewQuerySurfaceRepositoryRegistration({
          readers,
        }),
      get resolve(): never {
        throw new Error("resolve getter should not be required");
      },
    };

    expect(
      resolveRefundReviewQuerySurfaceRepositoryReadersFromScope(scope),
    ).toBe(readers);
  });

  it("builds readers from direct container repository properties", () => {
    const readers = createReaders();
    const scope = {
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
    };

    expect(
      resolveRefundReviewQuerySurfaceRepositoryReadersFromScope(scope),
    ).toEqual(readers);
  });

  it("builds readers from canonical registration repository properties", () => {
    const readers = createReaders();
    const scope = {
      [REFUND_REVIEW_QUERY_SURFACE_REPOSITORY_REGISTRATION_KEY]:
        buildRefundReviewQuerySurfaceRepositoryRegistration({
          repositories: {
            approvalRepository: readers.approvalRepository,
            auditRepository: readers.auditRepository,
            runtimeAttemptRepository: readers.runtimeAttemptRepository,
            terminalConflictRepository: readers.terminalConflictRepository,
          },
        }),
      get resolve(): never {
        throw new Error("resolve getter should not be required");
      },
    };

    expect(
      resolveRefundReviewQuerySurfaceRepositoryReadersFromScope(scope),
    ).toEqual(readers);
  });

  it("returns undefined when required repositories are missing", () => {
    const scope = {
      resolve: jest.fn().mockImplementation((key: string) => {
        if (key === REFUND_STATE_MUTATION_APPROVAL_PERSISTENCE_REPOSITORY_KEY) {
          return {};
        }

        return undefined;
      }),
    };

    expect(
      resolveRefundReviewQuerySurfaceRepositoryReadersFromScope(scope),
    ).toBeUndefined();
  });
});
