import { digestRawPayload } from "./idempotency";

export type WechatPayFakeRawNotification = {
  headers: {
    "wechatpay-timestamp": string;
    "wechatpay-nonce": string;
    "wechatpay-signature": string;
    "wechatpay-serial": string;
  };
  rawBody: string;
  receivedAt: string;
};

export type WechatPayFakeEncryptedResource = {
  algorithm: "AEAD_AES_256_GCM";
  ciphertext: string;
  associated_data: "transaction";
  nonce: string;
};

export type WechatPayFakeNotificationBody = {
  id: string;
  create_time: string;
  event_type: "TRANSACTION.SUCCESS";
  resource_type: "encrypt-resource";
  resource: WechatPayFakeEncryptedResource;
};

export type WechatPayFakeDecryptedResource = {
  appid: "wx_fake_test_app";
  mchid: "mch_fake_test_001";
  out_trade_no: "pay_wechat_fake_001";
  transaction_id: "txn_wechat_fake_test_001";
  trade_state: "SUCCESS";
  success_time: string;
  amount: {
    total: 128560;
    payer_total: 128560;
    currency: "CNY";
    payer_currency: "CNY";
  };
};

export type WechatPayFakeNotifyVector = {
  name: "wechat_pay_fake_success_notify";
  provider: "wechat_pay";
  eventId: "evt_wechat_fake_001";
  expectedIdempotencyKey: "payment_notify:wechat_pay:evt_wechat_fake_001";
  rawNotification: WechatPayFakeRawNotification;
  parsedBody: WechatPayFakeNotificationBody;
  decryptedResource: WechatPayFakeDecryptedResource;
  rawPayloadDigest: string;
  decryptedPayloadDigest: string;
  fixtureOnly: true;
};

export const wechatPayFakeNotificationBody: WechatPayFakeNotificationBody = {
  id: "evt_wechat_fake_001",
  create_time: "2026-05-10T12:00:00+08:00",
  event_type: "TRANSACTION.SUCCESS",
  resource_type: "encrypt-resource",
  resource: {
    algorithm: "AEAD_AES_256_GCM",
    ciphertext: "ciphertext_fake_test_only_001",
    associated_data: "transaction",
    nonce: "nonce_fake_test_only_001",
  },
};

export const wechatPayFakeRawBody = JSON.stringify(wechatPayFakeNotificationBody);

export const wechatPayFakeRawNotification: WechatPayFakeRawNotification = {
  headers: {
    "wechatpay-timestamp": "1770000000",
    "wechatpay-nonce": "nonce_header_fake_test_only_001",
    "wechatpay-signature": "signature_fake_test_only_001",
    "wechatpay-serial": "serial_fake_test_only_001",
  },
  rawBody: wechatPayFakeRawBody,
  receivedAt: "2026-05-10T04:00:05.000Z",
};

export const wechatPayFakeDecryptedResource: WechatPayFakeDecryptedResource = {
  appid: "wx_fake_test_app",
  mchid: "mch_fake_test_001",
  out_trade_no: "pay_wechat_fake_001",
  transaction_id: "txn_wechat_fake_test_001",
  trade_state: "SUCCESS",
  success_time: "2026-05-10T12:00:00+08:00",
  amount: {
    total: 128560,
    payer_total: 128560,
    currency: "CNY",
    payer_currency: "CNY",
  },
};

export const wechatPayFakeSuccessNotifyVector: WechatPayFakeNotifyVector = {
  name: "wechat_pay_fake_success_notify",
  provider: "wechat_pay",
  eventId: "evt_wechat_fake_001",
  expectedIdempotencyKey: "payment_notify:wechat_pay:evt_wechat_fake_001",
  rawNotification: wechatPayFakeRawNotification,
  parsedBody: wechatPayFakeNotificationBody,
  decryptedResource: wechatPayFakeDecryptedResource,
  rawPayloadDigest: digestRawPayload(wechatPayFakeRawBody),
  decryptedPayloadDigest: digestRawPayload(JSON.stringify(wechatPayFakeDecryptedResource)),
  fixtureOnly: true,
};

