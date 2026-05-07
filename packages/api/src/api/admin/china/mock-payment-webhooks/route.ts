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

export async function POST(_req: MedusaRequest, res: MedusaResponse) {
  const runtimeConfig = parsePaymentNotificationRuntimeConfig(
    buildRuntimeConfigInput(),
  );
  const response = mapMockPaymentWebhookResponse({
    status: "disabled",
    code: "RUNTIME_DISABLED",
  });

  return res.status(response.httpStatus).json({
    ...response.body,
    route: "mock_payment_webhook_disabled_only",
    runtimeRequested: runtimeConfig.enabled,
  });
}
