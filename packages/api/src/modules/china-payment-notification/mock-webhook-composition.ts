import { parsePaymentNotificationRuntimeConfig } from "./runtime-config";
import {
  mapMockPaymentWebhookRequestToNormalizeInput,
  MockPaymentWebhookRequestInput,
} from "./mock-webhook-request";
import {
  mapMockPaymentWebhookResponse,
  MockPaymentWebhookRejectedCode,
  MockPaymentWebhookResponse,
} from "./mock-webhook-response";
import { normalizeMockPaymentNotification } from "./mock-payload-normalizer";
import {
  classifyPaymentNotificationRepositoryError,
  PaymentNotificationInboxRepositoryContract,
  PaymentNotificationInboxReceiveResult,
  PaymentNotificationRepositoryErrorCode,
} from "./inbox-repository-contract";
import { guardPaymentNotificationState } from "./state-guard";
import {
  mapWorkflowCommandToDisabledRuntimeDecision,
  PaymentWorkflowCommandAdapterDisabledRuntimeDecision,
} from "./payment-workflow-command-adapter-disabled-runtime";
import { mapGuardResultToWorkflowCommand } from "./workflow-command-mapper";
import {
  ChinaPaymentNotificationEnvelope,
  PaymentNotificationOrderSnapshot,
  PaymentNotificationPaymentSessionSnapshot,
  PaymentWorkflowCommandAuditEvent,
  PaymentWorkflowCommandDecision,
} from "./types";

export type MockPaymentWebhookCompositionInput = {
  runtimeConfigInput: Parameters<typeof parsePaymentNotificationRuntimeConfig>[0];
  request: MockPaymentWebhookRequestInput;
  repository: PaymentNotificationInboxRepositoryContract;
  paymentSession?: PaymentNotificationPaymentSessionSnapshot;
  order?: PaymentNotificationOrderSnapshot;
};

export type MockPaymentWebhookCompositionResult = {
  response: MockPaymentWebhookResponse;
  envelope?: ChinaPaymentNotificationEnvelope;
  receiveResult?: PaymentNotificationInboxReceiveResult;
  commandDecision?: PaymentWorkflowCommandDecision;
  runtimeAdapterDecision?: PaymentWorkflowCommandAdapterDisabledRuntimeDecision;
  auditEvent?: PaymentWorkflowCommandAuditEvent;
};

const mapNormalizerErrorToRejectedCode = (
  error: unknown,
): MockPaymentWebhookRejectedCode => {
  const message = error instanceof Error ? error.message : String(error);

  if (message.includes("CURRENCY")) {
    return "CURRENCY_UNSUPPORTED";
  }

  if (message.includes("EVENT_TYPE")) {
    return "EVENT_TYPE_UNSUPPORTED";
  }

  return "PAYLOAD_INVALID";
};

const mapSignatureStatusToRejectedCode = (
  status: ChinaPaymentNotificationEnvelope["signature"]["status"],
): MockPaymentWebhookRejectedCode | null => {
  if (status === "missing") {
    return "SIGNATURE_MISSING";
  }

  if (status === "invalid" || status === "unsupported") {
    return "SIGNATURE_INVALID";
  }

  return null;
};

const repositoryErrorCodes: PaymentNotificationRepositoryErrorCode[] = [
  "SIGNATURE_MISSING",
  "SIGNATURE_INVALID",
  "PAYLOAD_INVALID",
  "CURRENCY_UNSUPPORTED",
  "EVENT_TYPE_UNSUPPORTED",
  "DB_UNIQUE_CONFLICT",
  "DB_LOCK_TIMEOUT",
  "DB_CONNECTION_INTERRUPTED",
];

const getRepositoryErrorCode = (error: unknown): string => {
  const message = error instanceof Error ? error.message : String(error);

  return (
    repositoryErrorCodes.find((code) => message.includes(code)) ??
    "UNKNOWN_REPOSITORY_ERROR"
  );
};

const mapRepositoryErrorToResponse = (
  error: unknown,
): MockPaymentWebhookResponse => {
  const code = getRepositoryErrorCode(error);
  const kind = classifyPaymentNotificationRepositoryError(code);

  if (kind === "duplicate") {
    return mapMockPaymentWebhookResponse({ status: "duplicate" });
  }

  if (kind === "retryable" || kind === "unknown") {
    return mapMockPaymentWebhookResponse({
      status: "rejected",
      code: "INBOX_RETRYABLE",
    });
  }

  return mapMockPaymentWebhookResponse({
    status: "rejected",
    code: "INBOX_UNAVAILABLE",
  });
};

export const composeMockPaymentWebhookInboxOnly = async (
  input: MockPaymentWebhookCompositionInput,
): Promise<MockPaymentWebhookCompositionResult> => {
  const runtimeConfig = parsePaymentNotificationRuntimeConfig(
    input.runtimeConfigInput,
  );

  if (!runtimeConfig.enabled) {
    return {
      response: mapMockPaymentWebhookResponse({ status: "disabled" }),
    };
  }

  const requestDecision = mapMockPaymentWebhookRequestToNormalizeInput(
    input.request,
  );

  if (!requestDecision.accepted) {
    return {
      response: mapMockPaymentWebhookResponse({
        status: "rejected",
        code: requestDecision.code,
      }),
    };
  }

  let envelope: ChinaPaymentNotificationEnvelope;

  try {
    envelope = normalizeMockPaymentNotification(requestDecision.normalizeInput);
  } catch (error) {
    return {
      response: mapMockPaymentWebhookResponse({
        status: "rejected",
        code: mapNormalizerErrorToRejectedCode(error),
      }),
    };
  }

  const signatureRejectCode = mapSignatureStatusToRejectedCode(
    envelope.signature.status,
  );

  if (signatureRejectCode) {
    return {
      envelope,
      response: mapMockPaymentWebhookResponse({
        status: "rejected",
        code: signatureRejectCode,
      }),
    };
  }

  let receiveResult: PaymentNotificationInboxReceiveResult;

  try {
    receiveResult = await input.repository.receive(envelope);
  } catch (error) {
    return {
      envelope,
      response: mapRepositoryErrorToResponse(error),
    };
  }

  if (receiveResult.status === "duplicate") {
    return {
      envelope,
      receiveResult,
      response: mapMockPaymentWebhookResponse({ status: "duplicate" }),
    };
  }

  if (runtimeConfig.mode === "mock_inbox_only") {
    return {
      envelope,
      receiveResult,
      response: mapMockPaymentWebhookResponse({ status: "accepted" }),
    };
  }

  const guardInput = {
    envelope,
    inboxRecord: receiveResult.record,
    paymentSession: input.paymentSession,
    order: input.order,
  };
  const guardResult = guardPaymentNotificationState(guardInput);
  const commandDecision = mapGuardResultToWorkflowCommand(
    guardResult,
    guardInput,
  );
  const runtimeAdapterDecision = mapWorkflowCommandToDisabledRuntimeDecision({
    commandDecision,
    requestedAt: envelope.receivedAt,
    runtimeContext: {
      environment: "development",
      adapterMode: "disabled",
      featureFlagEnabled: false,
      adapterRegistered: false,
      rollbackRunbookReady: true,
      metadata: {
        routeMode: runtimeConfig.mode,
        provider: runtimeConfig.provider,
      },
    },
  });
  const auditEvent = runtimeAdapterDecision.auditEvent;

  try {
    await input.repository.appendEvent({
      inboxId: receiveResult.record.id,
      action: auditEvent.action,
      actorType: auditEvent.actorType,
      message: auditEvent.message,
      metadata: auditEvent.metadata,
    });
  } catch (error) {
    return {
      envelope,
      receiveResult,
      commandDecision,
      runtimeAdapterDecision,
      auditEvent,
      response: mapRepositoryErrorToResponse(error),
    };
  }

  return {
    envelope,
    receiveResult,
    commandDecision,
    runtimeAdapterDecision,
    auditEvent,
    response: mapMockPaymentWebhookResponse({ status: "accepted" }),
  };
};
