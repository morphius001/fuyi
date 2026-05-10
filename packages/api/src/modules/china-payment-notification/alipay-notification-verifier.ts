import { digestRawPayload } from "./idempotency";
import { ChinaPaymentNotificationSignatureStatus } from "./types";
import { AlipayFakeRawNotification } from "./alipay-test-vectors";

export type AlipayNotificationVerifierFailureCode =
  | "ALIPAY_SIGNATURE_MISSING"
  | "ALIPAY_SIGN_TYPE_MISSING"
  | "ALIPAY_SIGN_TYPE_UNSUPPORTED"
  | "ALIPAY_APP_ID_MISMATCH"
  | "ALIPAY_SELLER_ID_MISMATCH"
  | "ALIPAY_SIGNATURE_INVALID"
  | "ALIPAY_CANONICAL_PAYLOAD_MISMATCH";

export type AlipayNotificationVerifierContractInput = {
  rawNotification: AlipayFakeRawNotification;
  expectedAppId: string;
  expectedSellerId: string;
  expectedFakeSignature: string;
  expectedCanonicalPayload?: string;
};

export type AlipayNotificationVerifierContractResult = {
  provider: "alipay";
  signatureStatus: ChinaPaymentNotificationSignatureStatus;
  signType?: string;
  notifyId?: string;
  tradeNo?: string;
  tradeStatus?: string;
  rawPayloadDigest: string;
  canonicalPayloadDigest: string;
  verifiedAt: string;
  failureCode?: AlipayNotificationVerifierFailureCode;
  failureMessage?: string;
  fixtureOnly: true;
  executable: false;
};

export const buildAlipayNotificationCanonicalPayloadContract = (
  form: Record<string, string>,
): string =>
  Object.keys(form)
    .filter((key) => key !== "sign" && key !== "sign_type" && form[key] !== "")
    .sort()
    .map((key) => `${key}=${form[key]}`)
    .join("&");

const failed = (
  input: AlipayNotificationVerifierContractInput,
  status: ChinaPaymentNotificationSignatureStatus,
  canonicalPayload: string,
  failureCode: AlipayNotificationVerifierFailureCode,
  failureMessage: string,
): AlipayNotificationVerifierContractResult => ({
  provider: "alipay",
  signatureStatus: status,
  signType: input.rawNotification.form.sign_type,
  notifyId: input.rawNotification.form.notify_id,
  tradeNo: input.rawNotification.form.trade_no,
  tradeStatus: input.rawNotification.form.trade_status,
  rawPayloadDigest: digestRawPayload(JSON.stringify(input.rawNotification.form)),
  canonicalPayloadDigest: digestRawPayload(canonicalPayload),
  verifiedAt: input.rawNotification.receivedAt,
  failureCode,
  failureMessage,
  fixtureOnly: true,
  executable: false,
});

export const verifyAlipayNotificationContract = (
  input: AlipayNotificationVerifierContractInput,
): AlipayNotificationVerifierContractResult => {
  const form = input.rawNotification.form;
  const canonicalPayload = buildAlipayNotificationCanonicalPayloadContract(form);

  if (!form.sign) {
    return failed(
      input,
      "missing",
      canonicalPayload,
      "ALIPAY_SIGNATURE_MISSING",
      "Alipay notification sign field is missing.",
    );
  }

  if (!form.sign_type) {
    return failed(
      input,
      "missing",
      canonicalPayload,
      "ALIPAY_SIGN_TYPE_MISSING",
      "Alipay notification sign_type field is missing.",
    );
  }

  if (form.sign_type !== "RSA2") {
    return failed(
      input,
      "unsupported",
      canonicalPayload,
      "ALIPAY_SIGN_TYPE_UNSUPPORTED",
      "Alipay notification sign_type is unsupported.",
    );
  }

  if (form.app_id !== input.expectedAppId) {
    return failed(
      input,
      "invalid",
      canonicalPayload,
      "ALIPAY_APP_ID_MISMATCH",
      "Alipay notification app_id does not match the expected fake app id.",
    );
  }

  if (form.seller_id !== input.expectedSellerId) {
    return failed(
      input,
      "invalid",
      canonicalPayload,
      "ALIPAY_SELLER_ID_MISMATCH",
      "Alipay notification seller_id does not match the expected fake seller id.",
    );
  }

  if (form.sign !== input.expectedFakeSignature) {
    return failed(
      input,
      "invalid",
      canonicalPayload,
      "ALIPAY_SIGNATURE_INVALID",
      "Alipay fake signature did not match the expected fake signature.",
    );
  }

  if (
    input.expectedCanonicalPayload &&
    canonicalPayload !== input.expectedCanonicalPayload
  ) {
    return failed(
      input,
      "invalid",
      canonicalPayload,
      "ALIPAY_CANONICAL_PAYLOAD_MISMATCH",
      "Alipay canonical payload did not match the expected fake canonical payload.",
    );
  }

  return {
    provider: "alipay",
    signatureStatus: "verified",
    signType: form.sign_type,
    notifyId: form.notify_id,
    tradeNo: form.trade_no,
    tradeStatus: form.trade_status,
    rawPayloadDigest: digestRawPayload(JSON.stringify(form)),
    canonicalPayloadDigest: digestRawPayload(canonicalPayload),
    verifiedAt: input.rawNotification.receivedAt,
    fixtureOnly: true,
    executable: false,
  };
};
