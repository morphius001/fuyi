import {
  normalizeWechatPayNotificationContract,
  verifyWechatPayNotificationContract,
  wechatPayFakeSuccessNotifyVector,
} from "..";

const verification = verifyWechatPayNotificationContract({
  rawNotification: wechatPayFakeSuccessNotifyVector.rawNotification,
  trustedSerials: ["serial_fake_test_only_001"],
  expectedFakeSignature: "signature_fake_test_only_001",
  currentUnixSeconds: 1770000000,
});

const baseInput = {
  verification,
  decryptedResource: wechatPayFakeSuccessNotifyVector.decryptedResource,
  expectedAppId: "wx_fake_test_app",
  expectedMchId: "mch_fake_test_001",
  expectedAmount: {
    value: 128560,
    currency: "CNY" as const,
  },
};

describe("WeChat Pay notification normalizer contract", () => {
  it("normalizes verified fake success notifications into an envelope without executing workflow", () => {
    const result = normalizeWechatPayNotificationContract(baseInput);

    expect(result).toMatchObject({
      normalized: true,
      fixtureOnly: true,
      executable: false,
    });

    if (!result.normalized) {
      throw new Error("Expected normalized result");
    }

    expect(result.envelope).toMatchObject({
      provider: "wechat_pay",
      eventId: "evt_wechat_fake_001",
      eventType: "payment.succeeded",
      providerTransactionId: "txn_wechat_fake_test_001",
      merchantOrderRef: "pay_wechat_fake_001",
      amount: {
        value: 128560,
        currency: "CNY",
      },
      idempotencyKey: "payment_notify:wechat_pay:evt_wechat_fake_001",
      rawPayloadDigest: wechatPayFakeSuccessNotifyVector.rawPayloadDigest,
      riskFlags: [],
    });
    expect(result.envelope.signature.status).toBe("verified");
    expect(JSON.stringify(result)).not.toContain("placeOrder");
    expect(result).not.toHaveProperty("paymentUrl");
    expect(result).not.toHaveProperty("clientPayload");
  });

  it("blocks unverified notifications", () => {
    const result = normalizeWechatPayNotificationContract({
      ...baseInput,
      verification: {
        ...verification,
        signatureStatus: "invalid",
        failureCode: "WECHAT_PAY_SIGNATURE_INVALID",
      },
    });

    expect(result).toMatchObject({
      normalized: false,
      failureCode: "WECHAT_PAY_VERIFICATION_NOT_ACCEPTED",
      riskFlags: ["invalid_signature"],
      fixtureOnly: true,
      executable: false,
    });
  });

  it("blocks app id mismatches", () => {
    const result = normalizeWechatPayNotificationContract({
      ...baseInput,
      expectedAppId: "wx_fake_test_other",
    });

    expect(result.normalized).toBe(false);
    expect(result).toHaveProperty("failureCode", "WECHAT_PAY_APP_ID_MISMATCH");
  });

  it("blocks mch id mismatches", () => {
    const result = normalizeWechatPayNotificationContract({
      ...baseInput,
      expectedMchId: "mch_fake_test_other",
    });

    expect(result.normalized).toBe(false);
    expect(result).toHaveProperty("failureCode", "WECHAT_PAY_MCH_ID_MISMATCH");
  });

  it("blocks unsupported trade states", () => {
    const result = normalizeWechatPayNotificationContract({
      ...baseInput,
      decryptedResource: {
        ...baseInput.decryptedResource,
        trade_state: "REFUND" as "SUCCESS",
      },
    });

    expect(result.normalized).toBe(false);
    expect(result).toHaveProperty(
      "failureCode",
      "WECHAT_PAY_TRADE_STATE_UNSUPPORTED",
    );
  });

  it("blocks non-CNY currencies", () => {
    const result = normalizeWechatPayNotificationContract({
      ...baseInput,
      decryptedResource: {
        ...baseInput.decryptedResource,
        amount: {
          ...baseInput.decryptedResource.amount,
          currency: "USD" as "CNY",
        },
      },
    });

    expect(result.normalized).toBe(false);
    expect(result).toHaveProperty(
      "failureCode",
      "WECHAT_PAY_CURRENCY_UNSUPPORTED",
    );
  });

  it("blocks amount mismatches", () => {
    const result = normalizeWechatPayNotificationContract({
      ...baseInput,
      expectedAmount: {
        value: 128561,
        currency: "CNY",
      },
    });

    expect(result.normalized).toBe(false);
    expect(result).toHaveProperty("failureCode", "WECHAT_PAY_AMOUNT_MISMATCH");
  });

  it("blocks missing merchant or transaction references", () => {
    const result = normalizeWechatPayNotificationContract({
      ...baseInput,
      decryptedResource: {
        ...baseInput.decryptedResource,
        out_trade_no: "" as "pay_wechat_fake_001",
      },
    });

    expect(result.normalized).toBe(false);
    expect(result).toHaveProperty("failureCode", "WECHAT_PAY_REFERENCE_MISSING");
  });
});
