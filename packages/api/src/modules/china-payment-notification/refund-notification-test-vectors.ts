import { digestRawPayload } from "./idempotency";
import { ChinaPaymentNotificationEventType } from "./types";

export type RefundFakeNotificationBody = {
  event_id: string;
  event_type: Extract<
    ChinaPaymentNotificationEventType,
    "refund.succeeded" | "refund.failed"
  >;
  provider: "mock_china_pay";
  merchant_order_ref: string;
  payment_session_id: string;
  provider_transaction_id: string;
  provider_refund_id: string;
  amount: number;
  currency: "CNY";
  occurred_at: string;
  refund_request_key: string;
};

export type RefundFakeNotificationVector = {
  name: "refund_fake_succeeded_notify" | "refund_fake_failed_notify";
  provider: "mock_china_pay";
  eventId: string;
  providerRefundId: string;
  expectedIdempotencyKey: string;
  body: RefundFakeNotificationBody;
  rawBody: string;
  rawPayloadDigest: string;
  fixtureOnly: true;
  executable: false;
};

export const refundFakeSucceededBody: RefundFakeNotificationBody = {
  event_id: "evt_refund_fake_succeeded_001",
  event_type: "refund.succeeded",
  provider: "mock_china_pay",
  merchant_order_ref: "pay_mock_001",
  payment_session_id: "payses_001",
  provider_transaction_id: "mock_txn_001",
  provider_refund_id: "refund_fake_001",
  amount: 128560,
  currency: "CNY",
  occurred_at: "2026-05-10T12:30:00+08:00",
  refund_request_key:
    "refund_req:mock_china_pay:pay_mock_001:payses_001:128560:refund_cmd:mock_china_pay:order_001:pay_001:128560:admin:admin_001:customer_requested:2026-05-10",
};

export const refundFakeFailedBody: RefundFakeNotificationBody = {
  ...refundFakeSucceededBody,
  event_id: "evt_refund_fake_failed_001",
  event_type: "refund.failed",
  provider_refund_id: "refund_fake_failed_001",
  occurred_at: "2026-05-10T12:35:00+08:00",
};

const buildVector = (
  name: RefundFakeNotificationVector["name"],
  body: RefundFakeNotificationBody,
): RefundFakeNotificationVector => {
  const rawBody = JSON.stringify(body);

  return {
    name,
    provider: "mock_china_pay",
    eventId: body.event_id,
    providerRefundId: body.provider_refund_id,
    expectedIdempotencyKey: `refund_notify:mock_china_pay:${body.event_id}`,
    body,
    rawBody,
    rawPayloadDigest: digestRawPayload(rawBody),
    fixtureOnly: true,
    executable: false,
  };
};

export const refundFakeSucceededNotifyVector = buildVector(
  "refund_fake_succeeded_notify",
  refundFakeSucceededBody,
);

export const refundFakeFailedNotifyVector = buildVector(
  "refund_fake_failed_notify",
  refundFakeFailedBody,
);

export const refundFakeNotifyVectors = [
  refundFakeSucceededNotifyVector,
  refundFakeFailedNotifyVector,
] as const;
