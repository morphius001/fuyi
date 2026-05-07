import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

import {
  mapMockPaymentWebhookResponse,
  parsePaymentNotificationRuntimeConfig,
} from "../../../../modules/china-payment-notification";

const buildRuntimeConfigInput = () => ({
  CHINA_PAYMENT_NOTIFICATION_RUNTIME_ENABLED:
    process.env.CHINA_PAYMENT_NOTIFICATION_RUNTIME_ENABLED,
  CHINA_PAYMENT_NOTIFICATION_WEBHOOK_MODE:
    process.env.CHINA_PAYMENT_NOTIFICATION_WEBHOOK_MODE,
  CHINA_PAYMENT_NOTIFICATION_PROVIDER:
    process.env.CHINA_PAYMENT_NOTIFICATION_PROVIDER,
});

const disabledResponse = (runtimeRequested: boolean) => {
  const response = mapMockPaymentWebhookResponse({
    status: "disabled",
    code: "RUNTIME_DISABLED",
  });

  return {
    response,
    body: {
      ...response.body,
      route: "mock_payment_webhook_disabled_only",
      runtimeRequested,
    },
  };
};

export async function POST(_req: MedusaRequest, res: MedusaResponse) {
  const runtimeConfig = parsePaymentNotificationRuntimeConfig(
    buildRuntimeConfigInput(),
  );
  const disabled = disabledResponse(runtimeConfig.enabled);

  return res.status(disabled.response.httpStatus).json(disabled.body);
}
