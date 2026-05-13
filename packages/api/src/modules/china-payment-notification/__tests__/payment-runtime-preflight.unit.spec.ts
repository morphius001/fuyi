import { evaluatePaymentNotificationRuntimePreflight } from "../payment-runtime-preflight";

describe("evaluatePaymentNotificationRuntimePreflight", () => {
  it("allows inbox-only runtime when gate and local disposable db checks pass", () => {
    const decision = evaluatePaymentNotificationRuntimePreflight({
      CHINA_PAYMENT_NOTIFICATION_RUNTIME_ENABLED: "true",
      CHINA_PAYMENT_NOTIFICATION_WEBHOOK_MODE: "mock_inbox_only",
      CHINA_PAYMENT_NOTIFICATION_PROVIDER: "mock_china_pay",
      nodeEnv: "development",
      dbRuntimeEnabled: true,
      migrationRegistered: true,
      preprodDisposableDbVerified: true,
      providerAdapterVerified: true,
      databaseUrl:
        "postgres://localhost:5432/fuyi_payment_notification_route_dry_run_alpha",
      localDbEnabled: true,
      metadata: {
        note: "kept",
        dbUrl: "redacted",
      },
    });

    expect(decision.allowed).toBe(true);
    if (decision.allowed) {
      expect(decision.stage).toBe("inbox_only");
      expect(decision.dbWriteAllowed).toBe(true);
      expect(decision.workflowExecutionAllowed).toBe(false);
      expect(decision.auditMetadata).toEqual({
        note: "kept",
        databaseName: "fuyi_payment_notification_route_dry_run_alpha",
        host: "localhost",
        runtimeMode: "mock_inbox_only",
      });
    }
  });

  it("blocks when local db assessment refuses a remote host", () => {
    const decision = evaluatePaymentNotificationRuntimePreflight({
      CHINA_PAYMENT_NOTIFICATION_RUNTIME_ENABLED: "true",
      CHINA_PAYMENT_NOTIFICATION_WEBHOOK_MODE: "mock_inbox_only",
      CHINA_PAYMENT_NOTIFICATION_PROVIDER: "mock_china_pay",
      nodeEnv: "development",
      dbRuntimeEnabled: true,
      migrationRegistered: true,
      preprodDisposableDbVerified: true,
      providerAdapterVerified: true,
      databaseUrl:
        "postgres://db.internal:5432/fuyi_payment_notification_route_dry_run_alpha",
      localDbEnabled: true,
    });

    expect(decision.allowed).toBe(false);
    if (!decision.allowed) {
      expect(decision.localDbReason).toBe("remote_host_refused");
      expect(decision.dbWriteAllowed).toBe(false);
      expect(decision.reason).toContain("remote_host_refused");
    }
  });

  it("blocks before local db checks when runtime gate is disabled", () => {
    const decision = evaluatePaymentNotificationRuntimePreflight({
      CHINA_PAYMENT_NOTIFICATION_RUNTIME_ENABLED: "false",
      CHINA_PAYMENT_NOTIFICATION_WEBHOOK_MODE: "mock_inbox_only",
      CHINA_PAYMENT_NOTIFICATION_PROVIDER: "mock_china_pay",
      nodeEnv: "development",
      dbRuntimeEnabled: true,
      migrationRegistered: true,
      preprodDisposableDbVerified: true,
      providerAdapterVerified: true,
      databaseUrl:
        "postgres://localhost:5432/fuyi_payment_notification_route_dry_run_alpha",
      localDbEnabled: true,
    });

    expect(decision.allowed).toBe(false);
    if (!decision.allowed) {
      expect(decision.localDbReason).toBeNull();
      expect(decision.reason).toContain("disabled");
    }
  });
});
