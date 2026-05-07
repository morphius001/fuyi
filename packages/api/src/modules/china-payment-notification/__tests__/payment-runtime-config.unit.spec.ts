import { parsePaymentNotificationRuntimeConfig } from "..";

describe("parsePaymentNotificationRuntimeConfig", () => {
  it("defaults to disabled without environment variables", () => {
    expect(parsePaymentNotificationRuntimeConfig({})).toEqual({
      enabled: false,
      mode: "disabled",
      provider: "mock_china_pay",
      reason: "Payment notification runtime is disabled by default.",
    });
  });

  it("keeps runtime disabled when mode is disabled even if enabled flag is true", () => {
    expect(
      parsePaymentNotificationRuntimeConfig({
        CHINA_PAYMENT_NOTIFICATION_RUNTIME_ENABLED: "true",
        CHINA_PAYMENT_NOTIFICATION_WEBHOOK_MODE: "disabled",
      }),
    ).toMatchObject({
      enabled: false,
      mode: "disabled",
    });
  });

  it("allows mock inbox-only mode when explicitly enabled", () => {
    expect(
      parsePaymentNotificationRuntimeConfig({
        CHINA_PAYMENT_NOTIFICATION_RUNTIME_ENABLED: "true",
        CHINA_PAYMENT_NOTIFICATION_WEBHOOK_MODE: "mock_inbox_only",
        CHINA_PAYMENT_NOTIFICATION_PROVIDER: "mock_china_pay",
      }),
    ).toEqual({
      enabled: true,
      mode: "mock_inbox_only",
      provider: "mock_china_pay",
      reason: "Mock payment notification runtime mode is explicitly enabled.",
    });
  });

  it("allows mock prepare-command mode when explicitly enabled", () => {
    expect(
      parsePaymentNotificationRuntimeConfig({
        CHINA_PAYMENT_NOTIFICATION_RUNTIME_ENABLED: "1",
        CHINA_PAYMENT_NOTIFICATION_WEBHOOK_MODE: "mock_prepare_command",
        CHINA_PAYMENT_NOTIFICATION_PROVIDER: "mock_china_pay",
      }),
    ).toMatchObject({
      enabled: true,
      mode: "mock_prepare_command",
    });
  });

  it("rejects unknown modes", () => {
    expect(
      parsePaymentNotificationRuntimeConfig({
        CHINA_PAYMENT_NOTIFICATION_RUNTIME_ENABLED: "true",
        CHINA_PAYMENT_NOTIFICATION_WEBHOOK_MODE: "workflow_execute",
      }),
    ).toMatchObject({
      enabled: false,
      mode: "disabled",
    });
  });

  it("rejects real providers in the runtime skeleton", () => {
    expect(
      parsePaymentNotificationRuntimeConfig({
        CHINA_PAYMENT_NOTIFICATION_RUNTIME_ENABLED: "true",
        CHINA_PAYMENT_NOTIFICATION_WEBHOOK_MODE: "mock_inbox_only",
        CHINA_PAYMENT_NOTIFICATION_PROVIDER: "alipay",
      }),
    ).toMatchObject({
      enabled: false,
      mode: "disabled",
      provider: "mock_china_pay",
    });
  });
});
