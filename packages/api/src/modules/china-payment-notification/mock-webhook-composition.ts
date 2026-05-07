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
  PaymentNotificationInboxRepositoryContract,
  PaymentNotificationInboxReceiveResult,
} from "./inbox-repository-contract";
import { guardPaymentNotificationState } from "./state-guard";
import { mapGuardResultToWorkflowCommand } from "./workflow-command-mapper";
import { mapWorkflowCommandDecisionToAuditEvent } from "./workflow-command-audit-mapper";
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

  const receiveResult = await input.repository.receive(envelope);

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
  const auditEvent = mapWorkflowCommandDecisionToAuditEvent(commandDecision);

  await input.repository.appendEvent({
    inboxId: receiveResult.record.id,
    action: auditEvent.action,
    actorType: auditEvent.actorType,
    message: auditEvent.message,
    metadata: auditEvent.metadata,
  });

  return {
    envelope,
    receiveResult,
    commandDecision,
    auditEvent,
    response: mapMockPaymentWebhookResponse({ status: "accepted" }),
  };
};
