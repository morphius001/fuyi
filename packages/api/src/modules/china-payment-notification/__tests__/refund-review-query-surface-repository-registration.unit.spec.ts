import {
  buildRefundReviewQuerySurfaceRepositoryRegistration,
  resolveDirectRefundReviewQuerySurfaceRepositoryReadersFromContainer,
  resolveDirectRefundReviewQuerySurfaceRepositoryReadersFromRegistration,
  resolveNormalizedRefundReviewQuerySurfaceRepositoryRegistration,
  resolveRefundReviewQuerySurfacePgConnectionFromContainer,
  resolveRefundReviewQuerySurfacePgConnectionFromRegistration,
  resolveRefundReviewQuerySurfacePgReadersFromContainer,
  resolveRefundReviewQuerySurfacePgReadersFromRegistration,
  resolveRefundReviewQuerySurfaceRepositoryReadersFromContainers,
  resolveRefundReviewQuerySurfaceRepositoryReadersFromContainer,
  resolveRefundReviewQuerySurfaceRepositoryReadersFromRegistration,
  resolveNormalizedRefundReviewQuerySurfaceRepositoryRegistrationFromContainers,
  REFUND_REVIEW_QUERY_SURFACE_REPOSITORY_REGISTRATION_KEY,
} from "../refund-review-query-surface-repository-registration";
import { REFUND_REVIEW_QUERY_SURFACE_REPOSITORY_READERS_SCOPE_KEY } from "../refund-review-query-surface-repository-readers-scope-key";
import {
  REFUND_STATE_MUTATION_APPROVAL_PERSISTENCE_REPOSITORY_KEY,
  REFUND_STATE_MUTATION_AUDIT_PERSISTENCE_REPOSITORY_KEY,
  REFUND_STATE_MUTATION_RUNTIME_ATTEMPT_PERSISTENCE_REPOSITORY_KEY,
  REFUND_STATE_MUTATION_TERMINAL_CONFLICT_PERSISTENCE_REPOSITORY_KEY,
} from "../refund-review-query-surface-repository-registration-keys";
import { PG_CONNECTION_SCOPE_KEY } from "../pg-connection-scope-key";
import { operatorReviewReadyReviewInput } from "../fixtures/review-query-surface/scenarios/operator-review-ready.fixture";

const createReaders = () => {
  const input = operatorReviewReadyReviewInput();

  return {
    approvalRepository: {
      async getByApprovalIdempotencyKey(approvalIdempotencyKey: string) {
        return (
          input.approvalRecords.find(
            (record) =>
              record.approvalIdempotencyKey === approvalIdempotencyKey,
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

const createPg = () => {
  const input = operatorReviewReadyReviewInput();

  const tables: Record<string, Record<string, unknown>[]> = {
    china_refund_state_mutation_approval: input.approvalRecords.map((record) => ({
      id: record.id,
      approval_idempotency_key: record.approvalIdempotencyKey,
      platform_refund_id: record.platformRefundId,
    })),
    china_refund_state_mutation_audit: input.auditRecords.map((record) => ({
      id: record.id,
      approval_persistence_idempotency_key:
        record.approvalPersistenceIdempotencyKey,
    })),
    china_refund_state_mutation_runtime_attempt: input.runtimeAttemptRecords.map(
      (record) => ({
        id: record.id,
        platform_refund_id: record.platformRefundId,
      }),
    ),
    china_refund_state_mutation_terminal_conflict:
      input.terminalConflictSnapshots.map((record) => ({
        id: record.id,
        platform_refund_id: record.platformRefundId,
      })),
  };

  const callable = ((tableName: string) => {
    let rows = [...(tables[tableName] ?? [])];
    const builder = {
      where(column: string, value: unknown) {
        rows = rows.filter((row) => row[column] === value);
        return builder;
      },
      whereNull(_column: string) {
        return builder;
      },
      orderBy(_column: string, _direction: "asc" | "desc") {
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

describe("refund review query surface repository registration", () => {
  it("normalizes canonical registration readers ahead of legacy readers", () => {
    const canonicalReaders = createReaders();
    const legacyReaders = createReaders();

    const normalized =
      resolveNormalizedRefundReviewQuerySurfaceRepositoryRegistration({
        [REFUND_REVIEW_QUERY_SURFACE_REPOSITORY_REGISTRATION_KEY]:
          buildRefundReviewQuerySurfaceRepositoryRegistration({
            readers: canonicalReaders,
          }),
        [REFUND_REVIEW_QUERY_SURFACE_REPOSITORY_READERS_SCOPE_KEY]:
          legacyReaders,
      });

    expect(normalized?.readers).toBe(canonicalReaders);
  });

  it("falls back to legacy readers when canonical readers are malformed", () => {
    const legacyReaders = createReaders();

    const normalized =
      resolveNormalizedRefundReviewQuerySurfaceRepositoryRegistration({
        [REFUND_REVIEW_QUERY_SURFACE_REPOSITORY_REGISTRATION_KEY]:
          buildRefundReviewQuerySurfaceRepositoryRegistration({
            readers: {
              approvalRepository: {},
              auditRepository: {},
              runtimeAttemptRepository: {},
              terminalConflictRepository: {},
            } as ReturnType<typeof createReaders>,
          }),
        [REFUND_REVIEW_QUERY_SURFACE_REPOSITORY_READERS_SCOPE_KEY]:
          legacyReaders,
      });

    expect(normalized?.readers).toBe(legacyReaders);
  });

  it("normalizes canonical repo properties ahead of legacy flat repo keys", () => {
    const canonicalReaders = createReaders();
    const legacyReaders = createReaders();

    const normalized =
      resolveNormalizedRefundReviewQuerySurfaceRepositoryRegistration({
        [REFUND_REVIEW_QUERY_SURFACE_REPOSITORY_REGISTRATION_KEY]:
          buildRefundReviewQuerySurfaceRepositoryRegistration({
            repositories: {
              approvalRepository: canonicalReaders.approvalRepository,
              auditRepository: canonicalReaders.auditRepository,
              runtimeAttemptRepository:
                canonicalReaders.runtimeAttemptRepository,
              terminalConflictRepository:
                canonicalReaders.terminalConflictRepository,
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
      });

    expect(normalized?.approvalRepository).toBe(
      canonicalReaders.approvalRepository,
    );
    expect(normalized?.auditRepository).toBe(canonicalReaders.auditRepository);
  });

  it("falls back to legacy repo keys when canonical repo properties are malformed", () => {
    const legacyReaders = createReaders();

    const normalized =
      resolveNormalizedRefundReviewQuerySurfaceRepositoryRegistration({
        [REFUND_REVIEW_QUERY_SURFACE_REPOSITORY_REGISTRATION_KEY]:
          buildRefundReviewQuerySurfaceRepositoryRegistration({
            repositories: {
              approvalRepository: {} as ReturnType<
                typeof createReaders
              >["approvalRepository"],
              auditRepository: {} as ReturnType<
                typeof createReaders
              >["auditRepository"],
              runtimeAttemptRepository: {} as ReturnType<
                typeof createReaders
              >["runtimeAttemptRepository"],
              terminalConflictRepository: {} as ReturnType<
                typeof createReaders
              >["terminalConflictRepository"],
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
      });

    expect(normalized?.approvalRepository).toBe(
      legacyReaders.approvalRepository,
    );
    expect(normalized?.runtimeAttemptRepository).toBe(
      legacyReaders.runtimeAttemptRepository,
    );
  });

  it("normalizes canonical pgConnection ahead of legacy pg keys", () => {
    const canonicalPg = createPg();
    const legacyPg = createPg();

    const normalized =
      resolveNormalizedRefundReviewQuerySurfaceRepositoryRegistration({
        [REFUND_REVIEW_QUERY_SURFACE_REPOSITORY_REGISTRATION_KEY]:
          buildRefundReviewQuerySurfaceRepositoryRegistration({
            pgConnection: canonicalPg,
          }),
        [PG_CONNECTION_SCOPE_KEY]: legacyPg,
      });

    expect(normalized?.pgConnection).toBe(canonicalPg);
  });

  it("resolves readers directly from canonical registration", async () => {
    const readers = createReaders();

    await expect(
      resolveRefundReviewQuerySurfaceRepositoryReadersFromRegistration(
        buildRefundReviewQuerySurfaceRepositoryRegistration({
          readers,
        }),
      ),
    ).resolves.toBe(readers);
  });

  it("builds readers from canonical repo properties", async () => {
    const readers = createReaders();

    const resolvedReaders =
      await resolveRefundReviewQuerySurfaceRepositoryReadersFromRegistration(
        buildRefundReviewQuerySurfaceRepositoryRegistration({
          repositories: {
            approvalRepository: readers.approvalRepository,
            auditRepository: readers.auditRepository,
            runtimeAttemptRepository: readers.runtimeAttemptRepository,
            terminalConflictRepository: readers.terminalConflictRepository,
          },
        }),
      );

    expect(resolvedReaders?.approvalRepository).toBe(
      readers.approvalRepository,
    );
    expect(resolvedReaders?.terminalConflictRepository).toBe(
      readers.terminalConflictRepository,
    );
  });

  it("resolves direct readers from canonical registration repo properties", () => {
    const readers = createReaders();

    const resolvedReaders =
      resolveDirectRefundReviewQuerySurfaceRepositoryReadersFromRegistration(
        buildRefundReviewQuerySurfaceRepositoryRegistration({
          repositories: {
            approvalRepository: readers.approvalRepository,
            auditRepository: readers.auditRepository,
            runtimeAttemptRepository: readers.runtimeAttemptRepository,
            terminalConflictRepository: readers.terminalConflictRepository,
          },
        }),
      );

    expect(resolvedReaders?.approvalRepository).toBe(
      readers.approvalRepository,
    );
    expect(resolvedReaders?.terminalConflictRepository).toBe(
      readers.terminalConflictRepository,
    );
  });

  it("builds readers from canonical pgConnection", async () => {
    const resolvedReaders =
      await resolveRefundReviewQuerySurfaceRepositoryReadersFromRegistration(
        buildRefundReviewQuerySurfaceRepositoryRegistration({
          pgConnection: createPg(),
        }),
      );

    expect(resolvedReaders).toBeDefined();
    await expect(
      resolvedReaders?.approvalRepository.getByPlatformRefundId(
        "refund_platform_001",
      ),
    ).resolves.toHaveLength(1);
  });

  it("resolves pgConnection from canonical registration", () => {
    const pg = createPg();

    expect(
      resolveRefundReviewQuerySurfacePgConnectionFromRegistration(
        buildRefundReviewQuerySurfaceRepositoryRegistration({
          pgConnection: pg,
        }),
      ),
    ).toBe(pg);
  });

  it("ignores malformed canonical pgConnection registrations", async () => {
    const malformedPg = {
      schema: {
        hasTable: jest.fn().mockResolvedValue(true),
      },
    };

    const registration = buildRefundReviewQuerySurfaceRepositoryRegistration({
      pgConnection: malformedPg,
    });

    expect(
      resolveRefundReviewQuerySurfacePgConnectionFromRegistration(registration),
    ).toBeUndefined();
    await expect(
      resolveRefundReviewQuerySurfaceRepositoryReadersFromRegistration(
        registration,
      ),
    ).resolves.toBeUndefined();
  });

  it("resolves readers from container through canonical registration", async () => {
    const readers = createReaders();

    await expect(
      resolveRefundReviewQuerySurfaceRepositoryReadersFromContainer({
        [REFUND_REVIEW_QUERY_SURFACE_REPOSITORY_REGISTRATION_KEY]:
          buildRefundReviewQuerySurfaceRepositoryRegistration({
            readers,
          }),
      }),
    ).resolves.toBe(readers);
  });

  it("resolves readers from container through canonical pgConnection", async () => {
    const resolvedReaders =
      await resolveRefundReviewQuerySurfaceRepositoryReadersFromContainer({
        [REFUND_REVIEW_QUERY_SURFACE_REPOSITORY_REGISTRATION_KEY]:
          buildRefundReviewQuerySurfaceRepositoryRegistration({
            pgConnection: createPg(),
          }),
      });

    expect(resolvedReaders).toBeDefined();
    await expect(
      resolvedReaders?.approvalRepository.getByPlatformRefundId(
        "refund_platform_001",
      ),
    ).resolves.toHaveLength(1);
  });

  it("returns undefined for direct readers when only canonical pgConnection is present", () => {
    expect(
      resolveDirectRefundReviewQuerySurfaceRepositoryReadersFromRegistration(
        buildRefundReviewQuerySurfaceRepositoryRegistration({
          pgConnection: createPg(),
        }),
      ),
    ).toBeUndefined();
  });

  it("resolves direct readers from container through canonical registration", () => {
    const readers = createReaders();

    expect(
      resolveDirectRefundReviewQuerySurfaceRepositoryReadersFromContainer({
        [REFUND_REVIEW_QUERY_SURFACE_REPOSITORY_REGISTRATION_KEY]:
          buildRefundReviewQuerySurfaceRepositoryRegistration({
            readers,
          }),
      }),
    ).toBe(readers);
  });

  it("returns undefined for direct container readers when only canonical pgConnection is present", () => {
    expect(
      resolveDirectRefundReviewQuerySurfaceRepositoryReadersFromContainer({
        [REFUND_REVIEW_QUERY_SURFACE_REPOSITORY_REGISTRATION_KEY]:
          buildRefundReviewQuerySurfaceRepositoryRegistration({
            pgConnection: createPg(),
          }),
      }),
    ).toBeUndefined();
  });

  it("resolves pgConnection from container through canonical registration", () => {
    const pg = createPg();

    expect(
      resolveRefundReviewQuerySurfacePgConnectionFromContainer({
        [REFUND_REVIEW_QUERY_SURFACE_REPOSITORY_REGISTRATION_KEY]:
          buildRefundReviewQuerySurfaceRepositoryRegistration({
            pgConnection: pg,
        }),
      }),
    ).toBe(pg);
  });

  it("resolves pg readers from canonical registration", async () => {
    const resolvedReaders =
      await resolveRefundReviewQuerySurfacePgReadersFromRegistration(
        buildRefundReviewQuerySurfaceRepositoryRegistration({
          pgConnection: createPg(),
        }),
      );

    expect(resolvedReaders).toBeDefined();
    await expect(
      resolvedReaders?.approvalRepository.getByPlatformRefundId(
        "refund_platform_001",
      ),
    ).resolves.toHaveLength(1);
  });

  it("resolves pg readers from container through canonical registration", async () => {
    const resolvedReaders =
      await resolveRefundReviewQuerySurfacePgReadersFromContainer({
        [REFUND_REVIEW_QUERY_SURFACE_REPOSITORY_REGISTRATION_KEY]:
          buildRefundReviewQuerySurfaceRepositoryRegistration({
            pgConnection: createPg(),
          }),
      });

    expect(resolvedReaders).toBeDefined();
    await expect(
      resolvedReaders?.approvalRepository.getByPlatformRefundId(
        "refund_platform_001",
      ),
    ).resolves.toHaveLength(1);
  });

  it("resolves readers from the first container with a usable canonical registration", async () => {
    const firstReaders = createReaders();
    const secondReaders = createReaders();

    await expect(
      resolveRefundReviewQuerySurfaceRepositoryReadersFromContainers([
        undefined,
        {
          [REFUND_REVIEW_QUERY_SURFACE_REPOSITORY_REGISTRATION_KEY]:
            buildRefundReviewQuerySurfaceRepositoryRegistration({
              readers: firstReaders,
            }),
        },
        {
          [REFUND_REVIEW_QUERY_SURFACE_REPOSITORY_REGISTRATION_KEY]:
            buildRefundReviewQuerySurfaceRepositoryRegistration({
              readers: secondReaders,
            }),
        },
      ]),
    ).resolves.toBe(firstReaders);
  });

  it("falls through to the next container when earlier containers cannot build readers", async () => {
    const fallbackReaders = createReaders();

    await expect(
      resolveRefundReviewQuerySurfaceRepositoryReadersFromContainers([
        {
          [REFUND_REVIEW_QUERY_SURFACE_REPOSITORY_REGISTRATION_KEY]:
            buildRefundReviewQuerySurfaceRepositoryRegistration({
              repositories: {
                approvalRepository: fallbackReaders.approvalRepository,
              },
            }),
        },
        {
          [REFUND_REVIEW_QUERY_SURFACE_REPOSITORY_REGISTRATION_KEY]:
            buildRefundReviewQuerySurfaceRepositoryRegistration({
              readers: fallbackReaders,
            }),
        },
      ]),
    ).resolves.toBe(fallbackReaders);
  });

  it("falls through to the next container when an earlier pgConnection is malformed", async () => {
    const fallbackReaders = createReaders();

    await expect(
      resolveRefundReviewQuerySurfaceRepositoryReadersFromContainers([
        {
          [REFUND_REVIEW_QUERY_SURFACE_REPOSITORY_REGISTRATION_KEY]:
            buildRefundReviewQuerySurfaceRepositoryRegistration({
              pgConnection: {
                schema: {
                  hasTable: jest.fn().mockResolvedValue(true),
                },
              },
            }),
        },
        {
          [REFUND_REVIEW_QUERY_SURFACE_REPOSITORY_REGISTRATION_KEY]:
            buildRefundReviewQuerySurfaceRepositoryRegistration({
              readers: fallbackReaders,
            }),
        },
      ]),
    ).resolves.toBe(fallbackReaders);
  });

  it("normalizes registration from the first container with registration inputs", () => {
    const firstReaders = createReaders();
    const secondReaders = createReaders();

    const registration =
      resolveNormalizedRefundReviewQuerySurfaceRepositoryRegistrationFromContainers([
        undefined,
        {
          [REFUND_REVIEW_QUERY_SURFACE_REPOSITORY_REGISTRATION_KEY]:
            buildRefundReviewQuerySurfaceRepositoryRegistration({
              readers: firstReaders,
            }),
        },
        {
          [REFUND_REVIEW_QUERY_SURFACE_REPOSITORY_REGISTRATION_KEY]:
            buildRefundReviewQuerySurfaceRepositoryRegistration({
              readers: secondReaders,
            }),
        },
      ]);

    expect(registration?.readers).toBe(firstReaders);
  });
});
