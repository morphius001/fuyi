import { digestRawPayload } from "./idempotency";

export type AlipayFakeRawNotification = {
  form: Record<string, string>;
  headers?: Record<string, string | string[] | undefined>;
  receivedAt: string;
};

export type AlipayFakeNotifyVector = {
  name: "alipay_fake_success_notify";
  provider: "alipay";
  notifyId: "notify_alipay_fake_001";
  expectedIdempotencyKey: "payment_notify:alipay:notify_alipay_fake_001";
  rawNotification: AlipayFakeRawNotification;
  expectedCanonicalParamKeys: readonly string[];
  rawPayloadDigest: string;
  canonicalPayloadDigest: string;
  fixtureOnly: true;
};

export const alipayFakeNotifyForm = {
  notify_id: "notify_alipay_fake_001",
  notify_type: "trade_status_sync",
  notify_time: "2026-05-10 12:00:00",
  app_id: "app_fake_test_001",
  seller_id: "merchant_fake_test_001",
  out_trade_no: "pay_alipay_fake_001",
  trade_no: "trade_alipay_fake_001",
  trade_status: "TRADE_SUCCESS",
  total_amount: "1285.60",
  currency: "CNY",
  sign_type: "RSA2",
  sign: "signature_fake_test_only_001",
} as const;

export const alipayFakeRawNotification: AlipayFakeRawNotification = {
  form: alipayFakeNotifyForm,
  headers: {},
  receivedAt: "2026-05-10T04:00:05.000Z",
};

export const alipayFakeCanonicalParamKeys = [
  "app_id",
  "currency",
  "notify_id",
  "notify_time",
  "notify_type",
  "out_trade_no",
  "seller_id",
  "total_amount",
  "trade_no",
  "trade_status",
] as const;

export const alipayFakeCanonicalPayload =
  "app_id=app_fake_test_001&currency=CNY&notify_id=notify_alipay_fake_001&notify_time=2026-05-10 12:00:00&notify_type=trade_status_sync&out_trade_no=pay_alipay_fake_001&seller_id=merchant_fake_test_001&total_amount=1285.60&trade_no=trade_alipay_fake_001&trade_status=TRADE_SUCCESS";

export const alipayFakeSuccessNotifyVector: AlipayFakeNotifyVector = {
  name: "alipay_fake_success_notify",
  provider: "alipay",
  notifyId: "notify_alipay_fake_001",
  expectedIdempotencyKey: "payment_notify:alipay:notify_alipay_fake_001",
  rawNotification: alipayFakeRawNotification,
  expectedCanonicalParamKeys: alipayFakeCanonicalParamKeys,
  rawPayloadDigest: digestRawPayload(JSON.stringify(alipayFakeNotifyForm)),
  canonicalPayloadDigest: digestRawPayload(alipayFakeCanonicalPayload),
  fixtureOnly: true,
};
