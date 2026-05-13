import {
  LocalDbRefusalReason,
  assessLocalPaymentNotificationDbInput,
  LocalPaymentNotificationPostgresClientInput,
} from "./local-postgres-db-client";
import {
  parsePaymentNotificationRuntimeConfig,
  PaymentNotificationRuntimeConfigInput,
} from "./runtime-config";
import {
  evaluatePaymentNotificationRuntimeGate,
  PaymentNotificationRuntimeGateInput,
  PaymentNotificationRuntimeGateStage,
} from "./runtime-gate";

export type PaymentNotificationRuntimePreflightInput =
  PaymentNotificationRuntimeConfigInput &
    Omit<
      PaymentNotificationRuntimeGateInput,
      "runtimeConfig" | "providerAdapterVerified"
    > &
    Omit<LocalPaymentNotificationPostgresClientInput, "driver"> & {
      providerAdapterVerified?: boolean;
      metadata?: Record<string, unknown>;
    };

export type PaymentNotificationRuntimePreflightDecision =
  | {
      allowed: true;
      stage: Exclude<PaymentNotificationRuntimeGateStage, "execute_workflow">;
      reason: string;
      runtimeEnabled: true;
      workflowExecutionAllowed: false;
      stateMutationAllowed: false;
      dbWriteAllowed: true;
      providerAdapterVerified: true;
      localDbReason: null;
      auditMetadata: Record<string, unknown>;
    }
  | {
      allowed: false;
      stage: "blocked";
      reason: string;
      runtimeEnabled: boolean;
      workflowExecutionAllowed: false;
      stateMutationAllowed: false;
      dbWriteAllowed: false;
      providerAdapterVerified: boolean;
      localDbReason: LocalDbRefusalReason | null;
      auditMetadata: Record<string, unknown>;
    };

const deniedMetadataKeys = new Set(
  [
    "rawProviderPayload",
    "rawPayload",
    "signature",
    "secret",
    "key",
    "apiKey",
    "privateKey",
    "certificate",
    "apiV3Key",
    "webhookSecret",
    "dbUrl",
    "databaseUrl",
    "productionDbUrl",
    "providerRequest",
    "providerQuery",
    "providerRefundRequest",
    "providerRefundQuery",
    "workflowExecutionAllowed",
    "stateMutationAllowed",
    "dbWriteAllowed",
    "fullPhone",
    "fullAddress",
    "identityNumber",
    "bankCardNumber",
  ].map((key) => key.toLowerCase().replace(/[^a-z0-9]/g, "")),
);

const normalizeMetadataKey = (key: string): string =>
  key.toLowerCase().replace(/[^a-z0-9]/g, "");

const sanitizeMetadataValue = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(sanitizeMetadataValue);
  }

  if (value && typeof value === "object") {
    return sanitizeMetadata(value as Record<string, unknown>);
  }

  return value;
};

const sanitizeMetadata = (
  metadata: Record<string, unknown> = {},
): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(metadata)
      .filter(([key]) => !deniedMetadataKeys.has(normalizeMetadataKey(key)))
      .map(([key, value]) => [key, sanitizeMetadataValue(value)]),
  );

export const evaluatePaymentNotificationRuntimePreflight = (
  input: PaymentNotificationRuntimePreflightInput,
): PaymentNotificationRuntimePreflightDecision => {
  const runtimeConfig = parsePaymentNotificationRuntimeConfig(input);
  const providerAdapterVerified = input.providerAdapterVerified === true;
  const gate = evaluatePaymentNotificationRuntimeGate({
    runtimeConfig,
    nodeEnv: input.nodeEnv,
    dbRuntimeEnabled: input.dbRuntimeEnabled,
    workflowExecutionEnabled: false,
    migrationRegistered: input.migrationRegistered,
    preprodDisposableDbVerified: input.preprodDisposableDbVerified,
    providerAdapterVerified,
  });

  if (!gate.allowed) {
    return {
      allowed: false,
      stage: "blocked",
      reason: gate.reason,
      runtimeEnabled: runtimeConfig.enabled,
      workflowExecutionAllowed: false,
      stateMutationAllowed: false,
      dbWriteAllowed: false,
      providerAdapterVerified,
      localDbReason: null,
      auditMetadata: sanitizeMetadata(input.metadata),
    };
  }

  const localDbAssessment = assessLocalPaymentNotificationDbInput({
    databaseUrl: input.databaseUrl,
    databaseName: input.databaseName,
    nodeEnv: input.nodeEnv,
    localDbEnabled: input.localDbEnabled,
    driver: { connect: async () => ({ query: async () => ({ rows: [] }), release() {} }) },
  });

  if (!localDbAssessment.allowed) {
    return {
      allowed: false,
      stage: "blocked",
      reason: `Payment notification local DB preflight refused: ${localDbAssessment.reason}.`,
      runtimeEnabled: runtimeConfig.enabled,
      workflowExecutionAllowed: false,
      stateMutationAllowed: false,
      dbWriteAllowed: false,
      providerAdapterVerified,
      localDbReason: localDbAssessment.reason,
      auditMetadata: sanitizeMetadata({
        ...input.metadata,
        databaseName: localDbAssessment.databaseName ?? undefined,
        host: localDbAssessment.host ?? undefined,
      }),
    };
  }

  if (gate.stage === "execute_workflow") {
    return {
      allowed: false,
      stage: "blocked",
      reason:
        "Payment notification runtime preflight refuses workflow execution at preflight stage.",
      runtimeEnabled: runtimeConfig.enabled,
      workflowExecutionAllowed: false,
      stateMutationAllowed: false,
      dbWriteAllowed: false,
      providerAdapterVerified,
      localDbReason: null,
      auditMetadata: sanitizeMetadata(input.metadata),
    };
  }

  return {
    allowed: true,
    stage: gate.stage,
    reason: "Payment notification runtime preflight passed for local/disposable DB.",
    runtimeEnabled: true,
    workflowExecutionAllowed: false,
    stateMutationAllowed: false,
    dbWriteAllowed: true,
    providerAdapterVerified: true,
    localDbReason: null,
    auditMetadata: sanitizeMetadata({
      ...input.metadata,
      databaseName: localDbAssessment.databaseName,
      host: localDbAssessment.host,
      runtimeMode: runtimeConfig.mode,
    }),
  };
};
