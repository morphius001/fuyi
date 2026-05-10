import { digestRawPayload } from "./idempotency";
import { ChinaPaymentNotificationSignatureStatus } from "./types";
import {
  AlipayRefundNotifyMode,
  AlipayRefundRawNotification,
  buildAlipayRefundCanonicalPayloadFixture,
} from "./alipay-refund-notification-test-vectors";

export type AlipayRefundVerifierFailureCode =
  | "ALIPAY_REFUND_SIGN_MISSING"
  | "ALIPAY_REFUND_SIGN_TYPE_MISSING"
  | "ALIPAY_REFUND_SIGN_TYPE_UNSUPPORTED"
  | "ALIPAY_REFUND_SIGNATURE_FAILED"
  | "ALIPAY_REFUND_CANONICAL_PAYLOAD_MISMATCH"
  | "ALIPAY_REFUND_APP_MISMATCH"
  | "ALIPAY_REFUND_SELLER_MISMATCH"
  | "ALIPAY_REFUND_ORDER_MISMATCH"
  | "ALIPAY_REFUND_TRADE_MISMATCH"
  | "ALIPAY_REFUND_REQUEST_REF_MISSING"
  | "ALIPAY_REFUND_AMOUNT_MISSING"
  | "ALIPAY_REFUND_AMOUNT_INVALID"
  | "ALIPAY_REFUND_AMOUNT_MISMATCH"
  | "ALIPAY_REFUND_CURRENCY_MISMATCH"
  | "ALIPAY_REFUND_PRODUCT_MODE_UNCONFIRMED"
  | "ALIPAY_REFUND_NOTIFY_ID_MISSING"
  | "ALIPAY_REFUND_STATUS_UNKNOWN";

export type AlipayRefundEventType =
  | "refund.succeeded"
  | "refund.failed"
  | "refund.unknown"
  | "trade.updated"
  | "unknown";

export type AlipayRefundVerifierContractInput = {
  rawNotification: AlipayRefundRawNotification;
  expectedAppId: string;
  expectedSellerId?: string;
  expectedOutTradeNo?: string;
  expectedTradeNo?: string;
  expectedOutRequestNo?: string;
  expectedAmountValue?: number;
  expectedCurrency: "CNY";
  expectedFakeSignature: string;
  expectedCanonicalPayload?: string;
  refundNotifyMode: AlipayRefundNotifyMode;
};

export type AlipayRefundVerifierContractResult = {
  provider: "alipay";
  signatureStatus: ChinaPaymentNotificationSignatureStatus;
  productModeStatus: "confirmed" | "unconfirmed" | "query_required";
  signType?: "RSA2" | "RSA";
  notifyId?: string;
  appId?: string;
  sellerId?: string;
  tradeNo?: string;
  merchantOrderRef?: string;
  merchantRefundRequestRef?: string;
  eventType?: AlipayRefundEventType;
  amountValue?: number;
  currency?: "CNY";
  rawPayloadDigest: string;
  canonicalPayloadDigest: string;
  idempotencyKey?: string;
  failureCode?: AlipayRefundVerifierFailureCode;
  failureMessage?: string;
  receivedAt: string;
  fixtureOnly: true;
  executable: false;
};

export const buildAlipayRefundNotificationCanonicalPayloadContract =
  buildAlipayRefundCanonicalPayloadFixture;

const rawDigest = (form: Record<string, string | undefined>): string =>
  digestRawPayload(JSON.stringify(form));

const parseAmountToMinor = (amount: string | undefined): number | undefined => {
  if (!amount) {
    return undefined;
  }

  const match = amount.match(/^(\d+)(?:\.(\d{1,2}))?$/);

  if (!match) {
    return undefined;
  }

  const major = Number(match[1]);
  const minor = Number((match[2] ?? "").padEnd(2, "0"));

  if (!Number.isSafeInteger(major) || !Number.isSafeInteger(minor)) {
    return undefined;
  }

  return major * 100 + minor;
};

const idempotencyKeyFromNotifyId = (notifyId: string): string =>
  `refund_notify:alipay:${notifyId}`;

const idempotencyKeyFromRefundFields = (
  outTradeNo: string,
  outRequestNo: string,
  refundFee: string,
): string =>
  `refund_notify:alipay:${outTradeNo}:${outRequestNo}:${refundFee}`;

const failed = (
  input: AlipayRefundVerifierContractInput,
  status: ChinaPaymentNotificationSignatureStatus,
  productModeStatus: AlipayRefundVerifierContractResult["productModeStatus"],
  canonicalPayload: string,
  failureCode: AlipayRefundVerifierFailureCode,
  failureMessage: string,
  eventType?: AlipayRefundEventType,
): AlipayRefundVerifierContractResult => {
  const form = input.rawNotification.form;

  return {
    provider: "alipay",
    signatureStatus: status,
    productModeStatus,
    signType: form.sign_type === "RSA" ? "RSA" : form.sign_type === "RSA2" ? "RSA2" : undefined,
    notifyId: form.notify_id,
    appId: form.app_id,
    sellerId: form.seller_id,
    tradeNo: form.trade_no,
    merchantOrderRef: form.out_trade_no,
    merchantRefundRequestRef: form.out_request_no ?? form.out_biz_no,
    eventType,
    rawPayloadDigest: rawDigest(form),
    canonicalPayloadDigest: digestRawPayload(canonicalPayload),
    failureCode,
    failureMessage,
    receivedAt: input.rawNotification.receivedAt,
    fixtureOnly: true,
    executable: false,
  };
};

export const verifyAlipayRefundNotificationContract = (
  input: AlipayRefundVerifierContractInput,
): AlipayRefundVerifierContractResult => {
  const form = input.rawNotification.form;
  const canonicalPayload =
    buildAlipayRefundNotificationCanonicalPayloadContract(form);

  if (!form.sign) {
    return failed(
      input,
      "missing",
      "unconfirmed",
      canonicalPayload,
      "ALIPAY_REFUND_SIGN_MISSING",
      "Alipay refund notification sign field is missing.",
    );
  }

  if (!form.sign_type) {
    return failed(
      input,
      "missing",
      "unconfirmed",
      canonicalPayload,
      "ALIPAY_REFUND_SIGN_TYPE_MISSING",
      "Alipay refund notification sign_type field is missing.",
    );
  }

  if (form.sign_type !== "RSA2") {
    return failed(
      input,
      "unsupported",
      "unconfirmed",
      canonicalPayload,
      "ALIPAY_REFUND_SIGN_TYPE_UNSUPPORTED",
      "Alipay refund notification sign_type is unsupported.",
    );
  }

  if (
    input.expectedCanonicalPayload &&
    canonicalPayload !== input.expectedCanonicalPayload
  ) {
    return failed(
      input,
      "invalid",
      "unconfirmed",
      canonicalPayload,
      "ALIPAY_REFUND_CANONICAL_PAYLOAD_MISMATCH",
      "Alipay refund notification canonical payload does not match.",
    );
  }

  if (form.sign !== input.expectedFakeSignature) {
    return failed(
      input,
      "invalid",
      "unconfirmed",
      canonicalPayload,
      "ALIPAY_REFUND_SIGNATURE_FAILED",
      "Alipay refund notification fake signature did not match.",
    );
  }

  if (form.app_id !== input.expectedAppId) {
    return failed(
      input,
      "invalid",
      "unconfirmed",
      canonicalPayload,
      "ALIPAY_REFUND_APP_MISMATCH",
      "Alipay refund notification app id does not match.",
    );
  }

  if (input.expectedSellerId && form.seller_id !== input.expectedSellerId) {
    return failed(
      input,
      "invalid",
      "unconfirmed",
      canonicalPayload,
      "ALIPAY_REFUND_SELLER_MISMATCH",
      "Alipay refund notification seller id does not match.",
    );
  }

  if (
    input.expectedOutTradeNo &&
    form.out_trade_no !== input.expectedOutTradeNo
  ) {
    return failed(
      input,
      "invalid",
      "unconfirmed",
      canonicalPayload,
      "ALIPAY_REFUND_ORDER_MISMATCH",
      "Alipay refund notification merchant order reference does not match.",
    );
  }

  if (input.expectedTradeNo && form.trade_no !== input.expectedTradeNo) {
    return failed(
      input,
      "invalid",
      "unconfirmed",
      canonicalPayload,
      "ALIPAY_REFUND_TRADE_MISMATCH",
      "Alipay refund notification trade number does not match.",
    );
  }

  if (!form.notify_id) {
    return failed(
      input,
      "verified",
      "unconfirmed",
      canonicalPayload,
      "ALIPAY_REFUND_NOTIFY_ID_MISSING",
      "Alipay refund notification notify_id is missing.",
    );
  }

  if (input.refundNotifyMode === "refund_query_follow_up") {
    return failed(
      input,
      "verified",
      "query_required",
      canonicalPayload,
      "ALIPAY_REFUND_PRODUCT_MODE_UNCONFIRMED",
      "Alipay refund notification product mode requires a follow-up query plan.",
      "refund.unknown",
    );
  }

  const requestRef = form.out_request_no ?? form.out_biz_no;

  if (!requestRef) {
    return {
      provider: "alipay",
      signatureStatus: "verified",
      productModeStatus: "unconfirmed",
      signType: "RSA2",
      notifyId: form.notify_id,
      appId: form.app_id,
      sellerId: form.seller_id,
      tradeNo: form.trade_no,
      merchantOrderRef: form.out_trade_no,
      eventType: "trade.updated",
      rawPayloadDigest: rawDigest(form),
      canonicalPayloadDigest: digestRawPayload(canonicalPayload),
      idempotencyKey: idempotencyKeyFromNotifyId(form.notify_id),
      failureCode: "ALIPAY_REFUND_REQUEST_REF_MISSING",
      failureMessage:
        "Alipay refund notification lacks a stable refund request reference.",
      receivedAt: input.rawNotification.receivedAt,
      fixtureOnly: true,
      executable: false,
    };
  }

  if (input.expectedOutRequestNo && requestRef !== input.expectedOutRequestNo) {
    return failed(
      input,
      "invalid",
      "unconfirmed",
      canonicalPayload,
      "ALIPAY_REFUND_REQUEST_REF_MISSING",
      "Alipay refund notification refund request reference does not match.",
    );
  }

  if (!form.refund_fee) {
    return failed(
      input,
      "verified",
      "unconfirmed",
      canonicalPayload,
      "ALIPAY_REFUND_AMOUNT_MISSING",
      "Alipay refund notification refund amount is missing.",
    );
  }

  const amountValue = parseAmountToMinor(form.refund_fee);

  if (!amountValue || amountValue <= 0) {
    return failed(
      input,
      "verified",
      "unconfirmed",
      canonicalPayload,
      "ALIPAY_REFUND_AMOUNT_INVALID",
      "Alipay refund notification refund amount is invalid.",
    );
  }

  if (
    input.expectedAmountValue !== undefined &&
    amountValue !== input.expectedAmountValue
  ) {
    return failed(
      input,
      "verified",
      "unconfirmed",
      canonicalPayload,
      "ALIPAY_REFUND_AMOUNT_MISMATCH",
      "Alipay refund notification refund amount does not match.",
    );
  }

  const currency = form.refund_currency ?? form.currency;

  if (currency !== input.expectedCurrency) {
    return failed(
      input,
      "verified",
      "unconfirmed",
      canonicalPayload,
      "ALIPAY_REFUND_CURRENCY_MISMATCH",
      "Alipay refund notification refund currency does not match.",
    );
  }

  const eventType: AlipayRefundEventType =
    form.trade_status === "TRADE_CLOSED" ? "refund.failed" : "refund.succeeded";
  const idempotencyKey = form.notify_id
    ? idempotencyKeyFromNotifyId(form.notify_id)
    : idempotencyKeyFromRefundFields(
        form.out_trade_no ?? "unknown_order",
        requestRef,
        form.refund_fee,
      );

  return {
    provider: "alipay",
    signatureStatus: "verified",
    productModeStatus:
      input.refundNotifyMode === "product_specific_refund_notify"
        ? "confirmed"
        : "unconfirmed",
    signType: "RSA2",
    notifyId: form.notify_id,
    appId: form.app_id,
    sellerId: form.seller_id,
    tradeNo: form.trade_no,
    merchantOrderRef: form.out_trade_no,
    merchantRefundRequestRef: requestRef,
    eventType,
    amountValue,
    currency,
    rawPayloadDigest: rawDigest(form),
    canonicalPayloadDigest: digestRawPayload(canonicalPayload),
    idempotencyKey,
    receivedAt: input.rawNotification.receivedAt,
    fixtureOnly: true,
    executable: false,
  };
};
