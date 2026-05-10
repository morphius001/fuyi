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

export type RefundCommandIdempotencyKeyInput = {
  provider: string;
  orderId: string;
  paymentId: string;
  requestedAmountMinor: number;
  actorType: "admin" | "vendor" | "system_job";
  actorId: string;
  reasonCode: string;
  requestedAt: string;
};

export type ProviderRefundRequestKeyInput = {
  provider: string;
  merchantOrderRef: string;
  paymentSessionId: string;
  requestedAmountMinor: number;
  localCommandId: string;
};

const normalizeKeyPart = (value: string | number): string =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_.:-]+/g, "_")
    .replace(/^_+|_+$/g, "");

export const getAsiaShanghaiRequestDay = (requestedAt: string): string => {
  const date = new Date(requestedAt);

  if (Number.isNaN(date.getTime())) {
    return "invalid_date";
  }

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const byType = new Map(parts.map((part) => [part.type, part.value]));

  return `${byType.get("year")}-${byType.get("month")}-${byType.get("day")}`;
};

export const buildRefundCommandIdempotencyKey = (
  input: RefundCommandIdempotencyKeyInput,
): string =>
  [
    "refund_cmd",
    normalizeKeyPart(input.provider),
    normalizeKeyPart(input.orderId),
    normalizeKeyPart(input.paymentId),
    input.requestedAmountMinor,
    normalizeKeyPart(input.actorType),
    normalizeKeyPart(input.actorId),
    normalizeKeyPart(input.reasonCode),
    getAsiaShanghaiRequestDay(input.requestedAt),
  ].join(":");

export const buildProviderRefundRequestKey = (
  input: ProviderRefundRequestKeyInput,
): string =>
  [
    "refund_req",
    normalizeKeyPart(input.provider),
    normalizeKeyPart(input.merchantOrderRef),
    normalizeKeyPart(input.paymentSessionId),
    input.requestedAmountMinor,
    normalizeKeyPart(input.localCommandId),
  ].join(":");
