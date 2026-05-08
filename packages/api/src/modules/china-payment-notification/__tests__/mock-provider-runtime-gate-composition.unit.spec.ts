import {
  evaluatePaymentNotificationRuntimeGate,
  parsePaymentNotificationRuntimeConfig,
  resolveChinaPaymentProviderAdapter,
} from "..";

const runtimeConfig = (mode = "mock_inbox_only") =>
  parsePaymentNotificationRuntimeConfig({
    CHINA_PAYMENT_NOTIFICATION_RUNTIME_ENABLED: "true",
    CHINA_PAYMENT_NOTIFICATION_WEBHOOK_MODE: mode,
    CHINA_PAYMENT_NOTIFICATION_PROVIDER: "mock_china_pay",
  });

const resolvedMockRegistry = () =>
  resolveChinaPaymentProviderAdapter({
    provider: "mock_china_pay",
    mode: "mock_contract_only",
    nodeEnv: "test",
  });

describe("mock provider runtime gate composition", () => {
  it("blocks runtime when provider registry is not resolved", () => {
    const registry = resolveChinaPaymentProviderAdapter({
      provider: "alipay",
      mode: "mock_contract_only",
      nodeEnv: "test",
    });
    const gate = evaluatePaymentNotificationRuntimeGate({
      runtimeConfig: runtimeConfig(),
      nodeEnv: "test",
      dbRuntimeEnabled: true,
      migrationRegistered: true,
      preprodDisposableDbVerified: true,
      providerAdapterVerified: registry.resolved,
    });

    expect(registry).toMatchObject({
      resolved: false,
      provider: "alipay",
    });
    expect(gate).toMatchObject({
      allowed: false,
      reason: "Payment notification provider adapter verification is missing.",
    });
  });

  it("blocks mock registry in production before runtime gate can proceed", () => {
    const registry = resolveChinaPaymentProviderAdapter({
      provider: "mock_china_pay",
      mode: "mock_contract_only",
      nodeEnv: "production",
    });
    const gate = evaluatePaymentNotificationRuntimeGate({
      runtimeConfig: runtimeConfig(),
      nodeEnv: "production",
      dbRuntimeEnabled: true,
      migrationRegistered: true,
      preprodDisposableDbVerified: true,
      providerAdapterVerified: registry.resolved,
    });

    expect(registry).toMatchObject({
      resolved: false,
      reason: "China payment provider registry refuses production by default.",
    });
    expect(gate).toMatchObject({
      allowed: false,
      reason: "Payment notification runtime gate refuses production by default.",
    });
  });

  it("keeps preprod disposable DB as a required gate even with registry resolved", () => {
    const registry = resolvedMockRegistry();
    const gate = evaluatePaymentNotificationRuntimeGate({
      runtimeConfig: runtimeConfig(),
      nodeEnv: "test",
      dbRuntimeEnabled: true,
      migrationRegistered: true,
      preprodDisposableDbVerified: false,
      providerAdapterVerified: registry.resolved,
    });

    expect(registry.resolved).toBe(true);
    expect(gate).toMatchObject({
      allowed: false,
      reason: "Payment notification preprod disposable DB verification is missing.",
    });
  });

  it("allows prepare-command only after all non-workflow gates are satisfied", () => {
    const registry = resolvedMockRegistry();
    const gate = evaluatePaymentNotificationRuntimeGate({
      runtimeConfig: runtimeConfig("mock_prepare_command"),
      nodeEnv: "test",
      dbRuntimeEnabled: true,
      migrationRegistered: true,
      preprodDisposableDbVerified: true,
      providerAdapterVerified: registry.resolved,
      workflowExecutionEnabled: false,
    });

    expect(gate).toEqual({
      allowed: true,
      stage: "prepare_command",
      mode: "mock_prepare_command",
      provider: "mock_china_pay",
      reason: "Payment notification prepare-command runtime gate is satisfied.",
    });
  });

  it("does not expose workflow execution in current mock composition", () => {
    const registry = resolvedMockRegistry();
    const gate = evaluatePaymentNotificationRuntimeGate({
      runtimeConfig: runtimeConfig("mock_prepare_command"),
      nodeEnv: "test",
      dbRuntimeEnabled: true,
      migrationRegistered: true,
      preprodDisposableDbVerified: true,
      providerAdapterVerified: registry.resolved,
      workflowExecutionEnabled: true,
    });

    expect(gate).toMatchObject({
      allowed: true,
      stage: "prepare_command",
    });
    expect(JSON.stringify({ registry, gate })).not.toContain("execute_workflow");
  });
});
