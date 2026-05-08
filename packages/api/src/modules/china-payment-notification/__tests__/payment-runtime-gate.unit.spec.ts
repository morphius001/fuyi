import {
  evaluatePaymentNotificationRuntimeGate,
  parsePaymentNotificationRuntimeConfig,
} from "..";

const enabledRuntime = (mode = "mock_inbox_only") =>
  parsePaymentNotificationRuntimeConfig({
    CHINA_PAYMENT_NOTIFICATION_RUNTIME_ENABLED: "true",
    CHINA_PAYMENT_NOTIFICATION_WEBHOOK_MODE: mode,
    CHINA_PAYMENT_NOTIFICATION_PROVIDER: "mock_china_pay",
  });

const satisfiedGateInput = () => ({
  runtimeConfig: enabledRuntime(),
  nodeEnv: "development",
  dbRuntimeEnabled: true,
  migrationRegistered: true,
  preprodDisposableDbVerified: true,
  providerAdapterVerified: true,
});

describe("evaluatePaymentNotificationRuntimeGate", () => {
  it("defaults to blocked when runtime config is disabled", () => {
    expect(
      evaluatePaymentNotificationRuntimeGate({
        runtimeConfig: parsePaymentNotificationRuntimeConfig({}),
      }),
    ).toMatchObject({
      allowed: false,
      stage: "blocked",
    });
  });

  it("refuses production by default", () => {
    expect(
      evaluatePaymentNotificationRuntimeGate({
        ...satisfiedGateInput(),
        nodeEnv: "production",
      }),
    ).toMatchObject({
      allowed: false,
      reason: "Payment notification runtime gate refuses production by default.",
    });
  });

  it("requires DB runtime to be explicitly enabled", () => {
    expect(
      evaluatePaymentNotificationRuntimeGate({
        ...satisfiedGateInput(),
        dbRuntimeEnabled: false,
      }),
    ).toMatchObject({
      allowed: false,
      reason: "Payment notification DB runtime gate is disabled.",
    });
  });

  it("requires verified migration registration", () => {
    expect(
      evaluatePaymentNotificationRuntimeGate({
        ...satisfiedGateInput(),
        migrationRegistered: false,
      }),
    ).toMatchObject({
      allowed: false,
      reason: "Payment notification migration registration has not been verified.",
    });
  });

  it("requires preprod disposable DB verification", () => {
    expect(
      evaluatePaymentNotificationRuntimeGate({
        ...satisfiedGateInput(),
        preprodDisposableDbVerified: false,
      }),
    ).toMatchObject({
      allowed: false,
      reason: "Payment notification preprod disposable DB verification is missing.",
    });
  });

  it("requires provider adapter verification", () => {
    expect(
      evaluatePaymentNotificationRuntimeGate({
        ...satisfiedGateInput(),
        providerAdapterVerified: false,
      }),
    ).toMatchObject({
      allowed: false,
      reason: "Payment notification provider adapter verification is missing.",
    });
  });

  it("allows inbox-only when every non-workflow gate is satisfied", () => {
    expect(evaluatePaymentNotificationRuntimeGate(satisfiedGateInput())).toEqual({
      allowed: true,
      stage: "inbox_only",
      mode: "mock_inbox_only",
      provider: "mock_china_pay",
      reason: "Payment notification inbox-only runtime gate is satisfied.",
    });
  });

  it("allows prepare-command without enabling workflow execution", () => {
    expect(
      evaluatePaymentNotificationRuntimeGate({
        ...satisfiedGateInput(),
        runtimeConfig: enabledRuntime("mock_prepare_command"),
        workflowExecutionEnabled: false,
      }),
    ).toMatchObject({
      allowed: true,
      stage: "prepare_command",
    });
  });

  it("does not expose workflow execution for currently allowed mock modes", () => {
    expect(
      evaluatePaymentNotificationRuntimeGate({
        ...satisfiedGateInput(),
        workflowExecutionEnabled: true,
      }),
    ).toMatchObject({
      allowed: true,
      stage: "inbox_only",
    });

    expect(
      evaluatePaymentNotificationRuntimeGate({
        ...satisfiedGateInput(),
        runtimeConfig: enabledRuntime("mock_prepare_command"),
        workflowExecutionEnabled: true,
      }),
    ).toMatchObject({
      allowed: true,
      stage: "prepare_command",
    });
  });
});
