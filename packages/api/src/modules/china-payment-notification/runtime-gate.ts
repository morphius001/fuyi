import {
  PaymentNotificationRuntimeConfig,
  PaymentNotificationRuntimeMode,
  PaymentNotificationRuntimeProvider,
} from "./runtime-config";

export type PaymentNotificationRuntimeGateStage =
  | "inbox_only"
  | "prepare_command"
  | "execute_workflow";

export type PaymentNotificationRuntimeGateInput = {
  runtimeConfig: PaymentNotificationRuntimeConfig;
  nodeEnv?: string;
  dbRuntimeEnabled?: boolean;
  workflowExecutionEnabled?: boolean;
  migrationRegistered?: boolean;
  preprodDisposableDbVerified?: boolean;
  providerAdapterVerified?: boolean;
};

export type PaymentNotificationRuntimeGateDecision =
  | {
      allowed: true;
      stage: PaymentNotificationRuntimeGateStage;
      mode: Exclude<PaymentNotificationRuntimeMode, "disabled">;
      provider: PaymentNotificationRuntimeProvider;
      reason: string;
    }
  | {
      allowed: false;
      stage: "blocked";
      mode: PaymentNotificationRuntimeConfig["mode"];
      provider: PaymentNotificationRuntimeProvider;
      reason: string;
    };

export const evaluatePaymentNotificationRuntimeGate = (
  input: PaymentNotificationRuntimeGateInput,
): PaymentNotificationRuntimeGateDecision => {
  const { runtimeConfig } = input;

  if (!runtimeConfig.enabled) {
    return {
      allowed: false,
      stage: "blocked",
      mode: runtimeConfig.mode,
      provider: runtimeConfig.provider,
      reason: runtimeConfig.reason,
    };
  }

  if (input.nodeEnv === "production") {
    return {
      allowed: false,
      stage: "blocked",
      mode: runtimeConfig.mode,
      provider: runtimeConfig.provider,
      reason: "Payment notification runtime gate refuses production by default.",
    };
  }

  if (!input.dbRuntimeEnabled) {
    return {
      allowed: false,
      stage: "blocked",
      mode: runtimeConfig.mode,
      provider: runtimeConfig.provider,
      reason: "Payment notification DB runtime gate is disabled.",
    };
  }

  if (!input.migrationRegistered) {
    return {
      allowed: false,
      stage: "blocked",
      mode: runtimeConfig.mode,
      provider: runtimeConfig.provider,
      reason: "Payment notification migration registration has not been verified.",
    };
  }

  if (!input.preprodDisposableDbVerified) {
    return {
      allowed: false,
      stage: "blocked",
      mode: runtimeConfig.mode,
      provider: runtimeConfig.provider,
      reason: "Payment notification preprod disposable DB verification is missing.",
    };
  }

  if (!input.providerAdapterVerified) {
    return {
      allowed: false,
      stage: "blocked",
      mode: runtimeConfig.mode,
      provider: runtimeConfig.provider,
      reason: "Payment notification provider adapter verification is missing.",
    };
  }

  if (runtimeConfig.mode === "mock_inbox_only") {
    return {
      allowed: true,
      stage: "inbox_only",
      mode: runtimeConfig.mode,
      provider: runtimeConfig.provider,
      reason: "Payment notification inbox-only runtime gate is satisfied.",
    };
  }

  if (runtimeConfig.mode === "mock_prepare_command") {
    return {
      allowed: true,
      stage: "prepare_command",
      mode: runtimeConfig.mode,
      provider: runtimeConfig.provider,
      reason: "Payment notification prepare-command runtime gate is satisfied.",
    };
  }

  if (!input.workflowExecutionEnabled) {
    return {
      allowed: false,
      stage: "blocked",
      mode: runtimeConfig.mode,
      provider: runtimeConfig.provider,
      reason: "Payment notification workflow execution gate is disabled.",
    };
  }

  return {
    allowed: true,
    stage: "execute_workflow",
    mode: runtimeConfig.mode,
    provider: runtimeConfig.provider,
    reason: "Payment notification workflow execution gate is satisfied.",
  };
};
