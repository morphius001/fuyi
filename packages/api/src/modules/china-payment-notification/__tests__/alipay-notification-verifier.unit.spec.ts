import {
  alipayFakeCanonicalPayload,
  alipayFakeSuccessNotifyVector,
  buildAlipayNotificationCanonicalPayloadContract,
  verifyAlipayNotificationContract,
} from "..";

const baseInput = {
  rawNotification: alipayFakeSuccessNotifyVector.rawNotification,
  expectedAppId: "app_fake_test_001",
  expectedSellerId: "merchant_fake_test_001",
  expectedFakeSignature: "signature_fake_test_only_001",
  expectedCanonicalPayload: alipayFakeCanonicalPayload,
};

describe("Alipay notification verifier contract", () => {
  it("verifies the fake success notification contract without executing payment workflow", () => {
    const result = verifyAlipayNotificationContract(baseInput);

    expect(result).toMatchObject({
      provider: "alipay",
      signatureStatus: "verified",
      signType: "RSA2",
      notifyId: "notify_alipay_fake_001",
      tradeNo: "trade_alipay_fake_001",
      tradeStatus: "TRADE_SUCCESS",
      fixtureOnly: true,
      executable: false,
    });
    expect(result.rawPayloadDigest).toBe(
      alipayFakeSuccessNotifyVector.rawPayloadDigest,
    );
    expect(result.canonicalPayloadDigest).toBe(
      alipayFakeSuccessNotifyVector.canonicalPayloadDigest,
    );
    expect(JSON.stringify(result)).not.toContain("payment.succeeded");
    expect(result).not.toHaveProperty("paymentUrl");
    expect(result).not.toHaveProperty("clientPayload");
    expect(result).not.toHaveProperty("canonicalPayload");
  });

  it("builds canonical payload while excluding sign and sign_type", () => {
    const canonicalPayload = buildAlipayNotificationCanonicalPayloadContract(
      alipayFakeSuccessNotifyVector.rawNotification.form,
    );

    expect(canonicalPayload).toBe(alipayFakeCanonicalPayload);
    expect(canonicalPayload).not.toContain("sign=");
    expect(canonicalPayload).not.toContain("sign_type=");
  });

  it("blocks missing signatures", () => {
    const { sign: _sign, ...form } =
      alipayFakeSuccessNotifyVector.rawNotification.form;

    const result = verifyAlipayNotificationContract({
      ...baseInput,
      rawNotification: {
        ...baseInput.rawNotification,
        form,
      },
    });

    expect(result.signatureStatus).toBe("missing");
    expect(result.failureCode).toBe("ALIPAY_SIGNATURE_MISSING");
    expect(result.executable).toBe(false);
  });

  it("blocks unsupported sign types", () => {
    const result = verifyAlipayNotificationContract({
      ...baseInput,
      rawNotification: {
        ...baseInput.rawNotification,
        form: {
          ...baseInput.rawNotification.form,
          sign_type: "RSA",
        },
      },
    });

    expect(result.signatureStatus).toBe("unsupported");
    expect(result.failureCode).toBe("ALIPAY_SIGN_TYPE_UNSUPPORTED");
  });

  it("blocks app id mismatches", () => {
    const result = verifyAlipayNotificationContract({
      ...baseInput,
      expectedAppId: "app_fake_test_other",
    });

    expect(result.signatureStatus).toBe("invalid");
    expect(result.failureCode).toBe("ALIPAY_APP_ID_MISMATCH");
  });

  it("blocks seller id mismatches", () => {
    const result = verifyAlipayNotificationContract({
      ...baseInput,
      expectedSellerId: "merchant_fake_test_other",
    });

    expect(result.signatureStatus).toBe("invalid");
    expect(result.failureCode).toBe("ALIPAY_SELLER_ID_MISMATCH");
  });

  it("blocks fake signature mismatches", () => {
    const result = verifyAlipayNotificationContract({
      ...baseInput,
      expectedFakeSignature: "signature_fake_test_only_other",
    });

    expect(result.signatureStatus).toBe("invalid");
    expect(result.failureCode).toBe("ALIPAY_SIGNATURE_INVALID");
  });

  it("blocks canonical payload mismatches", () => {
    const result = verifyAlipayNotificationContract({
      ...baseInput,
      expectedCanonicalPayload: `${alipayFakeCanonicalPayload}&extra=fake`,
    });

    expect(result.signatureStatus).toBe("invalid");
    expect(result.failureCode).toBe("ALIPAY_CANONICAL_PAYLOAD_MISMATCH");
  });
});
