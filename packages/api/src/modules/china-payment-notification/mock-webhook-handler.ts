import {
  composeMockPaymentWebhookInboxOnly,
  MockPaymentWebhookCompositionInput,
  MockPaymentWebhookCompositionResult,
} from "./mock-webhook-composition";
import { MockPaymentWebhookRequestHeaders } from "./mock-webhook-request";
import {
  ChinaPaymentNotificationMoney,
  PaymentNotificationOrderSnapshot,
  PaymentNotificationPaymentSessionSnapshot,
} from "./types";

export type MockPaymentWebhookHandlerInput = {
  runtimeConfigInput: MockPaymentWebhookCompositionInput["runtimeConfigInput"];
  rawBody?: string;
  headers?: MockPaymentWebhookRequestHeaders;
  secret?: string;
  receivedAt?: string;
  expectedAmount?: ChinaPaymentNotificationMoney;
  repository: MockPaymentWebhookCompositionInput["repository"];
  paymentSession?: PaymentNotificationPaymentSessionSnapshot;
  order?: PaymentNotificationOrderSnapshot;
};

export type MockPaymentWebhookHandlerResult =
  MockPaymentWebhookCompositionResult & {
    safeDebug: {
      receivedAt?: string;
      hasRawBody: boolean;
      headerNames: string[];
      runtimeRequested: boolean;
    };
  };

export const handleMockPaymentWebhookNotification = async (
  input: MockPaymentWebhookHandlerInput,
): Promise<MockPaymentWebhookHandlerResult> => {
  const result = await composeMockPaymentWebhookInboxOnly({
    runtimeConfigInput: input.runtimeConfigInput,
    request: {
      rawBody: input.rawBody,
      headers: input.headers,
      secret: input.secret,
      receivedAt: input.receivedAt,
      expectedAmount: input.expectedAmount,
    },
    repository: input.repository,
    paymentSession: input.paymentSession,
    order: input.order,
  });

  return {
    ...result,
    safeDebug: {
      receivedAt: input.receivedAt,
      hasRawBody: Boolean(input.rawBody && input.rawBody.trim().length > 0),
      headerNames: Object.keys(input.headers ?? {}).sort(),
      runtimeRequested:
        input.runtimeConfigInput.CHINA_PAYMENT_NOTIFICATION_RUNTIME_ENABLED ===
          "true" ||
        input.runtimeConfigInput.CHINA_PAYMENT_NOTIFICATION_RUNTIME_ENABLED === "1",
    },
  };
};
