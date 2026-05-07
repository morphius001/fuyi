import { createHash } from "crypto";

import { MockChinaPaymentNotificationPayload } from "./types";

const digestPart = (value: unknown): string =>
  createHash("sha256")
    .update(JSON.stringify(value))
    .digest("hex")
    .slice(0, 16);

export const buildPaymentNotificationIdempotencyKey = (
  provider: string,
  payload: MockChinaPaymentNotificationPayload,
): string => {
  if (payload.event_id) {
    return `payment_notify:${provider}:${payload.event_id}`;
  }

  return [
    "payment_notify",
    provider,
    payload.provider_transaction_id ?? "missing_transaction",
    payload.event_type,
    payload.amount,
    payload.occurred_at ?? digestPart(payload),
  ].join(":");
};

export const digestRawPayload = (rawBody: string): string =>
  `sha256:${createHash("sha256").update(rawBody).digest("hex")}`;
