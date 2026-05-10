import { ChinaPaymentNotificationEnvelope } from "./types";
import { WechatPayNotificationVerifierContractResult } from "./wechat-pay-notification-verifier";
import { WechatPayFakeDecryptedResource } from "./wechat-pay-test-vectors";

export type WechatPayNotificationNormalizerFailureCode =
  | "WECHAT_PAY_VERIFICATION_NOT_ACCEPTED"
  | "WECHAT_PAY_APP_ID_MISMATCH"
  | "WECHAT_PAY_MCH_ID_MISMATCH"
  | "WECHAT_PAY_TRADE_STATE_UNSUPPORTED"
  | "WECHAT_PAY_CURRENCY_UNSUPPORTED"
  | "WECHAT_PAY_AMOUNT_MISMATCH"
  | "WECHAT_PAY_REFERENCE_MISSING";

export type WechatPayNotificationNormalizerContractInput = {
  verification: WechatPayNotificationVerifierContractResult;
  decryptedResource: WechatPayFakeDecryptedResource;
  expectedAppId: string;
  expectedMchId: string;
  expectedAmount?: {
    value: number;
    currency: "CNY";
  };
};

export type WechatPayNotificationNormalizerContractResult =
  | {
      normalized: true;
      envelope: ChinaPaymentNotificationEnvelope;
      fixtureOnly: true;
      executable: false;
    }
  | {
      normalized: false;
      provider: "wechat_pay";
      failureCode: WechatPayNotificationNormalizerFailureCode;
      failureMessage: string;
      riskFlags: string[];
      fixtureOnly: true;
      executable: false;
    };

const failed = (
  failureCode: WechatPayNotificationNormalizerFailureCode,
  failureMessage: string,
  riskFlags: string[],
): WechatPayNotificationNormalizerContractResult => ({
  normalized: false,
  provider: "wechat_pay",
  failureCode,
  failureMessage,
  riskFlags,
  fixtureOnly: true,
  executable: false,
});

const mapTradeState = (
  tradeState: WechatPayFakeDecryptedResource["trade_state"] | string,
): ChinaPaymentNotificationEnvelope["eventType"] | undefined => {
  if (tradeState === "SUCCESS") {
    return "payment.succeeded";
  }

  return undefined;
};

export const normalizeWechatPayNotificationContract = (
  input: WechatPayNotificationNormalizerContractInput,
): WechatPayNotificationNormalizerContractResult => {
  const { verification, decryptedResource } = input;

  if (
    verification.signatureStatus !== "verified" ||
    verification.resourceStatus !== "accepted"
  ) {
    return failed(
      "WECHAT_PAY_VERIFICATION_NOT_ACCEPTED",
      "WeChat Pay notification verification result is not accepted.",
      ["invalid_signature"],
    );
  }

  if (decryptedResource.appid !== input.expectedAppId) {
    return failed(
      "WECHAT_PAY_APP_ID_MISMATCH",
      "WeChat Pay decrypted appid does not match the expected fake app id.",
      ["provider_app_mismatch"],
    );
  }

  if (decryptedResource.mchid !== input.expectedMchId) {
    return failed(
      "WECHAT_PAY_MCH_ID_MISMATCH",
      "WeChat Pay decrypted mchid does not match the expected fake mch id.",
      ["provider_merchant_mismatch"],
    );
  }

  const eventType = mapTradeState(decryptedResource.trade_state);

  if (!eventType) {
    return failed(
      "WECHAT_PAY_TRADE_STATE_UNSUPPORTED",
      "WeChat Pay trade_state cannot be normalized to a payment event type.",
      ["unsupported_trade_state"],
    );
  }

  if (
    decryptedResource.amount.currency !== "CNY" ||
    decryptedResource.amount.payer_currency !== "CNY"
  ) {
    return failed(
      "WECHAT_PAY_CURRENCY_UNSUPPORTED",
      "WeChat Pay notification currency must be CNY.",
      ["currency_mismatch"],
    );
  }

  if (decryptedResource.amount.total !== decryptedResource.amount.payer_total) {
    return failed(
      "WECHAT_PAY_AMOUNT_MISMATCH",
      "WeChat Pay total amount and payer amount must match for this fake contract.",
      ["amount_mismatch"],
    );
  }

  if (
    input.expectedAmount &&
    (input.expectedAmount.value !== decryptedResource.amount.total ||
      input.expectedAmount.currency !== decryptedResource.amount.currency)
  ) {
    return failed(
      "WECHAT_PAY_AMOUNT_MISMATCH",
      "WeChat Pay notification amount does not match the expected amount.",
      ["amount_mismatch"],
    );
  }

  if (!decryptedResource.out_trade_no || !decryptedResource.transaction_id) {
    return failed(
      "WECHAT_PAY_REFERENCE_MISSING",
      "WeChat Pay notification is missing order or transaction reference.",
      ["unknown_merchant_order_ref"],
    );
  }

  const envelope: ChinaPaymentNotificationEnvelope = {
    provider: "wechat_pay",
    eventId: verification.eventId ?? decryptedResource.transaction_id,
    eventType,
    providerTransactionId: decryptedResource.transaction_id,
    merchantOrderRef: decryptedResource.out_trade_no,
    amount: {
      value: decryptedResource.amount.total,
      currency: decryptedResource.amount.currency,
    },
    occurredAt: decryptedResource.success_time,
    receivedAt: verification.verifiedAt,
    idempotencyKey: `payment_notify:wechat_pay:${
      verification.eventId ?? `${decryptedResource.out_trade_no}:${decryptedResource.transaction_id}`
    }`,
    signature: {
      status: verification.signatureStatus,
      algorithm: "WECHATPAY2-SHA256-RSA2048",
      keyId: verification.serial,
      verifiedAt: verification.verifiedAt,
    },
    rawPayloadDigest: verification.rawPayloadDigest,
    riskFlags: [],
  };

  return {
    normalized: true,
    envelope,
    fixtureOnly: true,
    executable: false,
  };
};
