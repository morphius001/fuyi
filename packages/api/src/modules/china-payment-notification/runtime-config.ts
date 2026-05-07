export type PaymentNotificationRuntimeMode =
  | "disabled"
  | "mock_inbox_only"
  | "mock_prepare_command";

export type PaymentNotificationRuntimeProvider = "mock_china_pay";

export type PaymentNotificationRuntimeConfig =
  | {
      enabled: false;
      mode: "disabled";
      provider: PaymentNotificationRuntimeProvider;
      reason: string;
    }
  | {
      enabled: true;
      mode: Exclude<PaymentNotificationRuntimeMode, "disabled">;
      provider: PaymentNotificationRuntimeProvider;
      reason: string;
    };

export type PaymentNotificationRuntimeConfigInput = {
  CHINA_PAYMENT_NOTIFICATION_RUNTIME_ENABLED?: string;
  CHINA_PAYMENT_NOTIFICATION_WEBHOOK_MODE?: string;
  CHINA_PAYMENT_NOTIFICATION_PROVIDER?: string;
};

const truthy = new Set(["1", "true", "yes", "on"]);
const allowedModes = new Set<PaymentNotificationRuntimeMode>([
  "disabled",
  "mock_inbox_only",
  "mock_prepare_command",
]);

export const parsePaymentNotificationRuntimeConfig = (
  input: PaymentNotificationRuntimeConfigInput,
): PaymentNotificationRuntimeConfig => {
  const runtimeEnabled = truthy.has(
    (input.CHINA_PAYMENT_NOTIFICATION_RUNTIME_ENABLED ?? "").toLowerCase(),
  );
  const mode = input.CHINA_PAYMENT_NOTIFICATION_WEBHOOK_MODE ?? "disabled";
  const provider = input.CHINA_PAYMENT_NOTIFICATION_PROVIDER ?? "mock_china_pay";

  if (!runtimeEnabled) {
    return {
      enabled: false,
      mode: "disabled",
      provider: "mock_china_pay",
      reason: "Payment notification runtime is disabled by default.",
    };
  }

  const parsedMode = mode as PaymentNotificationRuntimeMode;

  if (!allowedModes.has(parsedMode)) {
    return {
      enabled: false,
      mode: "disabled",
      provider: "mock_china_pay",
      reason: `Unsupported payment notification webhook mode: ${mode}.`,
    };
  }

  if (parsedMode === "disabled") {
    return {
      enabled: false,
      mode: "disabled",
      provider: "mock_china_pay",
      reason: "Payment notification webhook mode is disabled.",
    };
  }

  if (provider !== "mock_china_pay") {
    return {
      enabled: false,
      mode: "disabled",
      provider: "mock_china_pay",
      reason: `Unsupported payment notification provider: ${provider}.`,
    };
  }

  return {
    enabled: true,
    mode: parsedMode,
    provider,
    reason: "Mock payment notification runtime mode is explicitly enabled.",
  };
};
