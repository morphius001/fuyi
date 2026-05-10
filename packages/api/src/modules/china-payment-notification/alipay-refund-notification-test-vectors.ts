import { digestRawPayload } from "./idempotency";

export type AlipayRefundNotifyMode =
  | "trade_async_notify"
  | "refund_query_follow_up"
  | "product_specific_refund_notify";

export type AlipayRefundRawNotification = {
  form: Record<string, string | undefined>;
  headers?: Record<string, string | string[] | undefined>;
  receivedAt: string;
};

export type AlipayRefundNotifyVector = {
  name:
    | "alipay_refund_success_notify"
    | "alipay_refund_trade_only_notify"
    | "alipay_refund_query_required_notify";
  notifyId: string;
  expectedIdempotencyKey: string;
  expectedCanonicalPayload: string;
  expectedFakeSignature: string;
  rawNotification: AlipayRefundRawNotification;
  rawPayloadDigest: string;
  canonicalPayloadDigest: string;
  fixtureOnly: true;
  executable: false;
};

export const alipayRefundSuccessNotifyForm = {
  notify_id: "notify_alipay_refund_001",
  notify_type: "trade_status_sync",
  notify_time: "2026-05-10 12:50:00",
  app_id: "app_fake_refund_001",
  seller_id: "merchant_fake_refund_001",
  out_trade_no: "pay_alipay_refund_order_001",
  trade_no: "trade_alipay_refund_001",
  trade_status: "TRADE_SUCCESS",
  out_request_no: "refund_req_alipay_001",
  refund_fee: "1285.60",
  refund_currency: "CNY",
  gmt_refund_pay: "2026-05-10 12:50:05",
  future_refund_field: "future_value",
  empty_field: "",
  sign_type: "RSA2",
  sign: "signature_fake_alipay_refund_001",
} as const;

export const alipayRefundTradeOnlyNotifyForm = {
  notify_id: "notify_alipay_trade_only_001",
  notify_type: "trade_status_sync",
  notify_time: "2026-05-10 12:55:00",
  app_id: "app_fake_refund_001",
  seller_id: "merchant_fake_refund_001",
  out_trade_no: "pay_alipay_refund_order_001",
  trade_no: "trade_alipay_refund_001",
  trade_status: "TRADE_SUCCESS",
  total_amount: "1285.60",
  currency: "CNY",
  sign_type: "RSA2",
  sign: "signature_fake_alipay_refund_001",
} as const;

export const buildAlipayRefundCanonicalPayloadFixture = (
  form: Record<string, string | undefined>,
): string =>
  Object.keys(form)
    .filter((key) => key !== "sign" && key !== "sign_type" && form[key] !== "")
    .sort()
    .map((key) => `${key}=${form[key]}`)
    .join("&");

const buildVector = (
  name: AlipayRefundNotifyVector["name"],
  form: Record<string, string | undefined>,
): AlipayRefundNotifyVector => {
  const canonicalPayload = buildAlipayRefundCanonicalPayloadFixture(form);
  const notifyId = form.notify_id ?? "notify_alipay_missing";

  return {
    name,
    notifyId,
    expectedIdempotencyKey: `refund_notify:alipay:${notifyId}`,
    expectedCanonicalPayload: canonicalPayload,
    expectedFakeSignature: "signature_fake_alipay_refund_001",
    rawNotification: {
      form,
      headers: {},
      receivedAt: "2026-05-10T04:50:05.000Z",
    },
    rawPayloadDigest: digestRawPayload(JSON.stringify(form)),
    canonicalPayloadDigest: digestRawPayload(canonicalPayload),
    fixtureOnly: true,
    executable: false,
  };
};

export const alipayRefundSuccessNotifyVector = buildVector(
  "alipay_refund_success_notify",
  alipayRefundSuccessNotifyForm,
);

export const alipayRefundTradeOnlyNotifyVector = buildVector(
  "alipay_refund_trade_only_notify",
  alipayRefundTradeOnlyNotifyForm,
);

export const alipayRefundQueryRequiredNotifyVector = buildVector(
  "alipay_refund_query_required_notify",
  alipayRefundSuccessNotifyForm,
);

export const alipayRefundNotifyVectors = [
  alipayRefundSuccessNotifyVector,
  alipayRefundTradeOnlyNotifyVector,
  alipayRefundQueryRequiredNotifyVector,
] as const;
