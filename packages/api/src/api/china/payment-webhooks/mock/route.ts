import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

import {
  handleMockPaymentWebhookNotification,
  InMemoryPaymentNotificationInboxRepository,
  mapMockPaymentWebhookResponse,
  parsePaymentNotificationRuntimeConfig,
  PaymentNotificationInboxRepositoryContract,
} from "../../../../modules/china-payment-notification";

const buildRuntimeConfigInput = () => ({
  CHINA_PAYMENT_NOTIFICATION_RUNTIME_ENABLED:
    process.env.CHINA_PAYMENT_NOTIFICATION_RUNTIME_ENABLED,
  CHINA_PAYMENT_NOTIFICATION_WEBHOOK_MODE:
    process.env.CHINA_PAYMENT_NOTIFICATION_WEBHOOK_MODE,
  CHINA_PAYMENT_NOTIFICATION_PROVIDER:
    process.env.CHINA_PAYMENT_NOTIFICATION_PROVIDER,
});

const buildHeadersRecord = (
  headers: MedusaRequest["headers"],
): Record<string, string | string[] | undefined> => {
  if (!headers) {
    return {};
  }

  const maybeHeaders = headers as unknown as Headers;

  if (typeof maybeHeaders.forEach === "function") {
    const result: Record<string, string> = {};
    maybeHeaders.forEach((value, key) => {
      result[key] = value;
    });

    return result;
  }

  return headers as Record<string, string | string[] | undefined>;
};

const buildLocalInMemoryRepository = (): PaymentNotificationInboxRepositoryContract => {
  const repository = new InMemoryPaymentNotificationInboxRepository();

  return {
    receive: async (envelope) => {
      const result = repository.receive(envelope);

      return {
        status: result.replayed ? "duplicate" : "received",
        record: result.record,
      };
    },
    appendEvent: async () => undefined,
    markProcessing: async (idempotencyKey) =>
      repository.markProcessing(idempotencyKey),
    markProcessed: async (idempotencyKey) =>
      repository.markProcessed(idempotencyKey),
    markRetryableFailed: async (input) =>
      repository.markRetryableFailed(
        input.idempotencyKey,
        input.errorCode,
        input.errorMessage,
      ),
    markTerminalFailed: async (input) =>
      repository.markRetryableFailed(
        input.idempotencyKey,
        input.errorCode,
        input.errorMessage,
      ),
    getByIdempotencyKey: async (idempotencyKey) =>
      repository.getByIdempotencyKey(idempotencyKey) ?? null,
  };
};

const isLocalInMemoryEnabled = () =>
  process.env.CHINA_PAYMENT_NOTIFICATION_LOCAL_INMEMORY === "true" &&
  process.env.NODE_ENV !== "production";

const readRawBody = async (req: MedusaRequest): Promise<string | null> => {
  if (typeof (req as unknown as { text?: unknown }).text === "function") {
    return (req as unknown as { text: () => Promise<string> }).text();
  }

  const body = (req as unknown as { body?: unknown }).body;

  if (typeof body === "string") {
    return body;
  }

  if (Buffer.isBuffer(body)) {
    return body.toString("utf8");
  }

  if (body && typeof body === "object") {
    return JSON.stringify(body);
  }

  return null;
};

const disabledResponse = (runtimeRequested: boolean) => {
  const response = mapMockPaymentWebhookResponse({
    status: "disabled",
    code: "RUNTIME_DISABLED",
  });

  return {
    response,
    body: {
      ...response.body,
      route: "mock_payment_webhook_neutral_disabled_only",
      runtimeRequested,
    },
  };
};

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const runtimeConfig = parsePaymentNotificationRuntimeConfig(
    buildRuntimeConfigInput(),
  );
  const routeEnabled =
    runtimeConfig.enabled &&
    runtimeConfig.mode === "mock_inbox_only" &&
    isLocalInMemoryEnabled();

  if (!routeEnabled) {
    const disabled = disabledResponse(runtimeConfig.enabled);

    return res.status(disabled.response.httpStatus).json(disabled.body);
  }

  const rawBody = await readRawBody(req);

  if (rawBody === null) {
    const response = mapMockPaymentWebhookResponse({
      status: "rejected",
      code: "PAYLOAD_INVALID",
    });

    return res.status(response.httpStatus).json({
      ...response.body,
      route: "mock_payment_webhook_neutral_local_inmemory",
    });
  }

  const result = await handleMockPaymentWebhookNotification({
    runtimeConfigInput: buildRuntimeConfigInput(),
    rawBody,
    headers: buildHeadersRecord(req.headers),
    secret: process.env.CHINA_PAYMENT_NOTIFICATION_MOCK_SECRET,
    receivedAt: new Date().toISOString(),
    repository: buildLocalInMemoryRepository(),
  });

  return res.status(result.response.httpStatus).json({
    ...result.response.body,
    route: "mock_payment_webhook_neutral_local_inmemory",
    safeDebug: result.safeDebug,
  });
}
