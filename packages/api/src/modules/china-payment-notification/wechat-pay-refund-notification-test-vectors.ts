import { digestRawPayload } from "./idempotency";

export type WechatPayRefundNotificationHeaders = {
  "wechatpay-timestamp"?: string;
  "wechatpay-nonce"?: string;
  "wechatpay-signature"?: string;
  "wechatpay-serial"?: string;
  [key: string]: string | undefined;
};

export type WechatPayRefundEncryptedResource = {
  algorithm: "AEAD_AES_256_GCM" | string;
  ciphertext: string;
  associated_data: "refund" | string;
  nonce: string;
};

export type WechatPayRefundNotificationBody = {
  id: string;
  create_time: string;
  event_type: "REFUND.SUCCESS" | "REFUND.ABNORMAL" | "REFUND.CLOSED" | string;
  resource_type: "encrypt-resource";
  resource: WechatPayRefundEncryptedResource;
};

export type WechatPayRefundDecryptedResource = {
  mchid: "mch_fake_refund_001";
  appid: "wx_fake_refund_app";
  out_trade_no: "pay_wechat_refund_order_001";
  transaction_id: "txn_wechat_refund_001";
  out_refund_no: "refund_req_wechat_001";
  refund_id: "refund_wechat_provider_001";
  refund_status: "SUCCESS" | "ABNORMAL" | "CLOSED";
  success_time?: string;
  amount: {
    refund: 128560;
    total: 128560;
    currency: "CNY";
  };
};

export type WechatPayRefundRawNotification = {
  headers: WechatPayRefundNotificationHeaders;
  rawBody: string;
  receivedAt: string;
};

export type WechatPayRefundNotifyVector = {
  name:
    | "wechat_pay_refund_success_notify"
    | "wechat_pay_refund_abnormal_notify"
    | "wechat_pay_refund_closed_notify";
  eventId: string;
  eventType: WechatPayRefundNotificationBody["event_type"];
  providerRefundId: string;
  merchantRefundRequestRef: string;
  expectedIdempotencyKey: string;
  expectedSignature: string;
  expectedCiphertext: string;
  rawNotification: WechatPayRefundRawNotification;
  parsedBody: WechatPayRefundNotificationBody;
  decryptedResource: WechatPayRefundDecryptedResource;
  rawPayloadDigest: string;
  decryptedPayloadDigest: string;
  fixtureOnly: true;
  executable: false;
};

const buildBody = (
  eventType: WechatPayRefundNotificationBody["event_type"],
  eventId: string,
  ciphertext: string,
): WechatPayRefundNotificationBody => ({
  id: eventId,
  create_time: "2026-05-10T12:40:00+08:00",
  event_type: eventType,
  resource_type: "encrypt-resource",
  resource: {
    algorithm: "AEAD_AES_256_GCM",
    ciphertext,
    associated_data: "refund",
    nonce: "nonce_refund_resource_fake_001",
  },
});

const baseDecryptedResource: WechatPayRefundDecryptedResource = {
  mchid: "mch_fake_refund_001",
  appid: "wx_fake_refund_app",
  out_trade_no: "pay_wechat_refund_order_001",
  transaction_id: "txn_wechat_refund_001",
  out_refund_no: "refund_req_wechat_001",
  refund_id: "refund_wechat_provider_001",
  refund_status: "SUCCESS",
  success_time: "2026-05-10T12:40:10+08:00",
  amount: {
    refund: 128560,
    total: 128560,
    currency: "CNY",
  },
};

const buildVector = (
  name: WechatPayRefundNotifyVector["name"],
  eventType: WechatPayRefundNotificationBody["event_type"],
  eventId: string,
  status: WechatPayRefundDecryptedResource["refund_status"],
  ciphertext: string,
): WechatPayRefundNotifyVector => {
  const body = buildBody(eventType, eventId, ciphertext);
  const rawBody = JSON.stringify(body);
  const decryptedResource = {
    ...baseDecryptedResource,
    refund_status: status,
  };

  return {
    name,
    eventId,
    eventType,
    providerRefundId: decryptedResource.refund_id,
    merchantRefundRequestRef: decryptedResource.out_refund_no,
    expectedIdempotencyKey: `refund_notify:wechat_pay:${eventId}`,
    expectedSignature: "signature_fake_wechat_refund_001",
    expectedCiphertext: ciphertext,
    rawNotification: {
      headers: {
        "wechatpay-timestamp": "1770000000",
        "wechatpay-nonce": "nonce_header_refund_fake_001",
        "wechatpay-signature": "signature_fake_wechat_refund_001",
        "wechatpay-serial": "serial_fake_wechat_refund_001",
      },
      rawBody,
      receivedAt: "2026-05-10T04:40:05.000Z",
    },
    parsedBody: body,
    decryptedResource,
    rawPayloadDigest: digestRawPayload(rawBody),
    decryptedPayloadDigest: digestRawPayload(JSON.stringify(decryptedResource)),
    fixtureOnly: true,
    executable: false,
  };
};

export const wechatPayRefundSuccessNotifyVector = buildVector(
  "wechat_pay_refund_success_notify",
  "REFUND.SUCCESS",
  "evt_wechat_refund_success_001",
  "SUCCESS",
  "ciphertext_fake_wechat_refund_success_001",
);

export const wechatPayRefundAbnormalNotifyVector = buildVector(
  "wechat_pay_refund_abnormal_notify",
  "REFUND.ABNORMAL",
  "evt_wechat_refund_abnormal_001",
  "ABNORMAL",
  "ciphertext_fake_wechat_refund_abnormal_001",
);

export const wechatPayRefundClosedNotifyVector = buildVector(
  "wechat_pay_refund_closed_notify",
  "REFUND.CLOSED",
  "evt_wechat_refund_closed_001",
  "CLOSED",
  "ciphertext_fake_wechat_refund_closed_001",
);

export const wechatPayRefundNotifyVectors = [
  wechatPayRefundSuccessNotifyVector,
  wechatPayRefundAbnormalNotifyVector,
  wechatPayRefundClosedNotifyVector,
] as const;
