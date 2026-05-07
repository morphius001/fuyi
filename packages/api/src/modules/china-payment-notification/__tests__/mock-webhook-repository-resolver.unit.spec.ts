import {
  PaymentNotificationInboxRepositoryContract,
  resolveMockWebhookInboxRepository,
} from "..";

const enabledMockInboxRuntime = {
  CHINA_PAYMENT_NOTIFICATION_RUNTIME_ENABLED: "true",
  CHINA_PAYMENT_NOTIFICATION_WEBHOOK_MODE: "mock_inbox_only",
  CHINA_PAYMENT_NOTIFICATION_PROVIDER: "mock_china_pay",
};

const makeRepository = (): PaymentNotificationInboxRepositoryContract =>
  ({
    receive: jest.fn(),
    appendEvent: jest.fn(),
    markProcessing: jest.fn(),
    markProcessed: jest.fn(),
    markRetryableFailed: jest.fn(),
    markTerminalFailed: jest.fn(),
    getByIdempotencyKey: jest.fn(),
  }) as unknown as PaymentNotificationInboxRepositoryContract;

describe("resolveMockWebhookInboxRepository", () => {
  it("defaults to disabled without runtime env", () => {
    expect(
      resolveMockWebhookInboxRepository({
        runtimeConfigInput: {},
        nodeEnv: "development",
      }),
    ).toEqual({
      status: "disabled",
      reason: "runtime_disabled",
    });
  });

  it("keeps production disabled even when local DB inputs are present", () => {
    const repositoryFactory = jest.fn(makeRepository);

    expect(
      resolveMockWebhookInboxRepository({
        runtimeConfigInput: {
          ...enabledMockInboxRuntime,
          CHINA_PAYMENT_NOTIFICATION_LOCAL_DB: "true",
        },
        nodeEnv: "production",
        transactionClient: { tx: true },
        repositoryFactory,
      }),
    ).toEqual({
      status: "disabled",
      reason: "production_disabled",
    });
    expect(repositoryFactory).not.toHaveBeenCalled();
  });

  it("keeps real providers disabled through runtime config", () => {
    const repositoryFactory = jest.fn(makeRepository);

    expect(
      resolveMockWebhookInboxRepository({
        runtimeConfigInput: {
          CHINA_PAYMENT_NOTIFICATION_RUNTIME_ENABLED: "true",
          CHINA_PAYMENT_NOTIFICATION_WEBHOOK_MODE: "mock_inbox_only",
          CHINA_PAYMENT_NOTIFICATION_PROVIDER: "alipay",
          CHINA_PAYMENT_NOTIFICATION_LOCAL_DB: "true",
        },
        nodeEnv: "development",
        transactionClient: { tx: true },
        repositoryFactory,
      }),
    ).toEqual({
      status: "disabled",
      reason: "runtime_disabled",
    });
    expect(repositoryFactory).not.toHaveBeenCalled();
  });

  it("requires mock inbox-only mode", () => {
    expect(
      resolveMockWebhookInboxRepository({
        runtimeConfigInput: {
          CHINA_PAYMENT_NOTIFICATION_RUNTIME_ENABLED: "true",
          CHINA_PAYMENT_NOTIFICATION_WEBHOOK_MODE: "mock_prepare_command",
          CHINA_PAYMENT_NOTIFICATION_PROVIDER: "mock_china_pay",
          CHINA_PAYMENT_NOTIFICATION_LOCAL_DB: "true",
        },
        nodeEnv: "development",
        transactionClient: { tx: true },
        repositoryFactory: jest.fn(makeRepository),
      }),
    ).toEqual({
      status: "disabled",
      reason: "mode_not_inbox_only",
    });
  });

  it("requires explicit local DB flag", () => {
    expect(
      resolveMockWebhookInboxRepository({
        runtimeConfigInput: enabledMockInboxRuntime,
        nodeEnv: "development",
        transactionClient: { tx: true },
        repositoryFactory: jest.fn(makeRepository),
      }),
    ).toEqual({
      status: "disabled",
      reason: "local_db_not_enabled",
    });
  });

  it("returns unavailable when the transaction client is missing", () => {
    expect(
      resolveMockWebhookInboxRepository({
        runtimeConfigInput: {
          ...enabledMockInboxRuntime,
          CHINA_PAYMENT_NOTIFICATION_LOCAL_DB: "true",
        },
        nodeEnv: "development",
        repositoryFactory: jest.fn(makeRepository),
      }),
    ).toEqual({
      status: "unavailable",
      reason: "transaction_client_missing",
    });
  });

  it("returns unavailable when the repository factory is missing", () => {
    expect(
      resolveMockWebhookInboxRepository({
        runtimeConfigInput: {
          ...enabledMockInboxRuntime,
          CHINA_PAYMENT_NOTIFICATION_LOCAL_DB: "true",
        },
        nodeEnv: "development",
        transactionClient: { tx: true },
      }),
    ).toEqual({
      status: "unavailable",
      reason: "repository_not_configured",
    });
  });

  it("returns a local disposable repository when all local-only gates pass", () => {
    const transactionClient = { tx: true };
    const repository = makeRepository();
    const repositoryFactory = jest.fn(() => repository);

    const resolution = resolveMockWebhookInboxRepository({
      runtimeConfigInput: {
        ...enabledMockInboxRuntime,
        CHINA_PAYMENT_NOTIFICATION_LOCAL_DB: "true",
      },
      nodeEnv: "development",
      transactionClient,
      repositoryFactory,
    });

    expect(resolution).toEqual({
      status: "available",
      repository,
      source: "local_disposable_db",
    });
    expect(repositoryFactory).toHaveBeenCalledWith(transactionClient);
  });

  it("does not expose database URLs or secrets in disabled responses", () => {
    const resolution = resolveMockWebhookInboxRepository({
      runtimeConfigInput: {
        CHINA_PAYMENT_NOTIFICATION_RUNTIME_ENABLED: "false",
        CHINA_PAYMENT_NOTIFICATION_LOCAL_DB: "true",
      },
      nodeEnv: "development",
      transactionClient: {
        databaseUrl: "postgres://user:secret@localhost/fuyi",
      },
    });

    expect(JSON.stringify(resolution)).not.toContain("postgres://");
    expect(JSON.stringify(resolution)).not.toContain("secret");
  });
});
