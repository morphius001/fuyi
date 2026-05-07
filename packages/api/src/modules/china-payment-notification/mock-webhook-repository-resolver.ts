import {
  PaymentNotificationRuntimeConfigInput,
  parsePaymentNotificationRuntimeConfig,
} from "./runtime-config";
import { PaymentNotificationInboxRepositoryContract } from "./inbox-repository-contract";

export type MockWebhookRepositoryResolverInput = {
  runtimeConfigInput: PaymentNotificationRuntimeConfigInput & {
    CHINA_PAYMENT_NOTIFICATION_LOCAL_DB?: string;
  };
  nodeEnv?: string;
  transactionClient?: unknown;
  repositoryFactory?: (
    client: unknown,
  ) => PaymentNotificationInboxRepositoryContract;
};

export type MockWebhookRepositoryDisabledReason =
  | "runtime_disabled"
  | "production_disabled"
  | "mode_not_inbox_only"
  | "local_db_not_enabled";

export type MockWebhookRepositoryUnavailableReason =
  | "repository_not_configured"
  | "transaction_client_missing";

export type MockWebhookRepositoryResolution =
  | {
      status: "disabled";
      reason: MockWebhookRepositoryDisabledReason;
    }
  | {
      status: "unavailable";
      reason: MockWebhookRepositoryUnavailableReason;
    }
  | {
      status: "available";
      repository: PaymentNotificationInboxRepositoryContract;
      source: "local_disposable_db";
    };

const truthy = new Set(["1", "true", "yes", "on"]);

export const resolveMockWebhookInboxRepository = (
  input: MockWebhookRepositoryResolverInput,
): MockWebhookRepositoryResolution => {
  const runtimeConfig = parsePaymentNotificationRuntimeConfig(
    input.runtimeConfigInput,
  );

  if (input.nodeEnv === "production") {
    return {
      status: "disabled",
      reason: "production_disabled",
    };
  }

  if (!runtimeConfig.enabled) {
    return {
      status: "disabled",
      reason: "runtime_disabled",
    };
  }

  if (runtimeConfig.mode !== "mock_inbox_only") {
    return {
      status: "disabled",
      reason: "mode_not_inbox_only",
    };
  }

  const localDbEnabled = truthy.has(
    (
      input.runtimeConfigInput.CHINA_PAYMENT_NOTIFICATION_LOCAL_DB ?? ""
    ).toLowerCase(),
  );

  if (!localDbEnabled) {
    return {
      status: "disabled",
      reason: "local_db_not_enabled",
    };
  }

  if (!input.transactionClient) {
    return {
      status: "unavailable",
      reason: "transaction_client_missing",
    };
  }

  if (!input.repositoryFactory) {
    return {
      status: "unavailable",
      reason: "repository_not_configured",
    };
  }

  return {
    status: "available",
    repository: input.repositoryFactory(input.transactionClient),
    source: "local_disposable_db",
  };
};
