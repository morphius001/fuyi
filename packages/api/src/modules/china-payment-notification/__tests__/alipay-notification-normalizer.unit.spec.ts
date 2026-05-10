import {
  alipayFakeCanonicalPayload,
  alipayFakeSuccessNotifyVector,
  normalizeAlipayNotificationContract,
  parseAlipayAmountToMinorUnitsContract,
  verifyAlipayNotificationContract,
} from "..";

const verification = verifyAlipayNotificationContract({
  rawNotification: alipayFakeSuccessNotifyVector.rawNotification,
  expectedAppId: "app_fake_test_001",
  expectedSellerId: "merchant_fake_test_001",
  expectedFakeSignature: "signature_fake_test_only_001",
  expectedCanonicalPayload: alipayFakeCanonicalPayload,
});

const baseInput = {
  verification,
  rawNotification: alipayFakeSuccessNotifyVector.rawNotification,
  expectedAppId: "app_fake_test_001",
  expectedSellerId: "merchant_fake_test_001",
  expectedAmount: {
    value: 128560,
    currency: "CNY" as const,
  },
};

describe("Alipay notification normalizer contract", () => {
  it("normalizes verified fake success notifications into an envelope without executing workflow", () => {
    const result = normalizeAlipayNotificationContract(baseInput);

    expect(result).toMatchObject({
      normalized: true,
      fixtureOnly: true,
      executable: false,
    });

    if (!result.normalized) {
      throw new Error("Expected normalized result");
    }

    expect(result.envelope).toMatchObject({
      provider: "alipay",
      eventId: "notify_alipay_fake_001",
      eventType: "payment.succeeded",
      providerTransactionId: "trade_alipay_fake_001",
      merchantOrderRef: "pay_alipay_fake_001",
      amount: {
        value: 128560,
        currency: "CNY",
      },
      idempotencyKey: "payment_notify:alipay:notify_alipay_fake_001",
      rawPayloadDigest: alipayFakeSuccessNotifyVector.rawPayloadDigest,
      riskFlags: [],
    });
    expect(result.envelope.signature.status).toBe("verified");
    expect(JSON.stringify(result)).not.toContain("placeOrder");
    expect(result).not.toHaveProperty("paymentUrl");
    expect(result).not.toHaveProperty("clientPayload");
  });

  it("parses Alipay amount strings into minor units without floating point math", () => {
    expect(parseAlipayAmountToMinorUnitsContract("1285.60")).toBe(128560);
    expect(parseAlipayAmountToMinorUnitsContract("1")).toBe(100);
    expect(parseAlipayAmountToMinorUnitsContract("1.5")).toBe(150);
    expect(parseAlipayAmountToMinorUnitsContract("1.234")).toBeUndefined();
  });

  it("blocks unverified notifications", () => {
    const result = normalizeAlipayNotificationContract({
      ...baseInput,
      verification: {
        ...verification,
        signatureStatus: "invalid",
        failureCode: "ALIPAY_SIGNATURE_INVALID",
      },
    });

    expect(result).toMatchObject({
      normalized: false,
      failureCode: "ALIPAY_VERIFICATION_NOT_ACCEPTED",
      riskFlags: ["invalid_signature"],
      fixtureOnly: true,
      executable: false,
    });
  });

  it("blocks app id mismatches", () => {
    const result = normalizeAlipayNotificationContract({
      ...baseInput,
      expectedAppId: "app_fake_test_other",
    });

    expect(result.normalized).toBe(false);
    expect(result).toHaveProperty("failureCode", "ALIPAY_APP_ID_MISMATCH");
  });

  it("blocks seller id mismatches", () => {
    const result = normalizeAlipayNotificationContract({
      ...baseInput,
      expectedSellerId: "merchant_fake_test_other",
    });

    expect(result.normalized).toBe(false);
    expect(result).toHaveProperty("failureCode", "ALIPAY_SELLER_ID_MISMATCH");
  });

  it("blocks unsupported trade statuses", () => {
    const result = normalizeAlipayNotificationContract({
      ...baseInput,
      rawNotification: {
        ...baseInput.rawNotification,
        form: {
          ...baseInput.rawNotification.form,
          trade_status: "WAIT_BUYER_PAY",
        },
      },
    });

    expect(result.normalized).toBe(false);
    expect(result).toHaveProperty(
      "failureCode",
      "ALIPAY_TRADE_STATUS_UNSUPPORTED",
    );
  });

  it("blocks non-CNY currencies", () => {
    const result = normalizeAlipayNotificationContract({
      ...baseInput,
      rawNotification: {
        ...baseInput.rawNotification,
        form: {
          ...baseInput.rawNotification.form,
          currency: "USD",
        },
      },
    });

    expect(result.normalized).toBe(false);
    expect(result).toHaveProperty("failureCode", "ALIPAY_CURRENCY_UNSUPPORTED");
  });

  it("blocks invalid amounts", () => {
    const result = normalizeAlipayNotificationContract({
      ...baseInput,
      rawNotification: {
        ...baseInput.rawNotification,
        form: {
          ...baseInput.rawNotification.form,
          total_amount: "1285.601",
        },
      },
    });

    expect(result.normalized).toBe(false);
    expect(result).toHaveProperty("failureCode", "ALIPAY_AMOUNT_INVALID");
  });

  it("blocks amount mismatches", () => {
    const result = normalizeAlipayNotificationContract({
      ...baseInput,
      expectedAmount: {
        value: 128561,
        currency: "CNY",
      },
    });

    expect(result.normalized).toBe(false);
    expect(result).toHaveProperty("failureCode", "ALIPAY_AMOUNT_MISMATCH");
  });

  it("blocks missing merchant or trade references", () => {
    const result = normalizeAlipayNotificationContract({
      ...baseInput,
      rawNotification: {
        ...baseInput.rawNotification,
        form: {
          ...baseInput.rawNotification.form,
          out_trade_no: "",
        },
      },
    });

    expect(result.normalized).toBe(false);
    expect(result).toHaveProperty("failureCode", "ALIPAY_REFERENCE_MISSING");
  });
});
