import {
  verifyWechatPayNotificationContract,
  wechatPayFakeSuccessNotifyVector,
} from "..";

const baseInput = {
  rawNotification: wechatPayFakeSuccessNotifyVector.rawNotification,
  trustedSerials: ["serial_fake_test_only_001"] as const,
  expectedFakeSignature: "signature_fake_test_only_001",
  currentUnixSeconds: 1770000000,
};

describe("WeChat Pay notification verifier contract", () => {
  it("verifies the fake success notification contract without executing payment workflow", () => {
    const result = verifyWechatPayNotificationContract(baseInput);

    expect(result).toMatchObject({
      provider: "wechat_pay",
      signatureStatus: "verified",
      resourceStatus: "accepted",
      serial: "serial_fake_test_only_001",
      eventId: "evt_wechat_fake_001",
      eventType: "TRANSACTION.SUCCESS",
      fixtureOnly: true,
      executable: false,
    });
    expect(result.rawPayloadDigest).toBe(
      wechatPayFakeSuccessNotifyVector.rawPayloadDigest,
    );
    expect(JSON.stringify(result)).not.toContain("payment.succeeded");
    expect(result).not.toHaveProperty("paymentUrl");
    expect(result).not.toHaveProperty("clientPayload");
    expect(result).not.toHaveProperty("decryptedResource");
  });

  it("blocks missing signature headers", () => {
    const result = verifyWechatPayNotificationContract({
      ...baseInput,
      rawNotification: {
        ...baseInput.rawNotification,
        headers: {
          ...baseInput.rawNotification.headers,
          "wechatpay-signature": "",
        },
      },
    });

    expect(result.signatureStatus).toBe("missing");
    expect(result.failureCode).toBe("WECHAT_PAY_SIGNATURE_MISSING");
    expect(result.executable).toBe(false);
  });

  it("blocks untrusted platform serials", () => {
    const result = verifyWechatPayNotificationContract({
      ...baseInput,
      trustedSerials: ["serial_fake_test_only_other"],
    });

    expect(result.signatureStatus).toBe("invalid");
    expect(result.failureCode).toBe("WECHAT_PAY_SERIAL_UNTRUSTED");
  });

  it("blocks timestamp replay outside tolerance", () => {
    const result = verifyWechatPayNotificationContract({
      ...baseInput,
      currentUnixSeconds: 1770000601,
      timestampToleranceSeconds: 300,
    });

    expect(result.signatureStatus).toBe("invalid");
    expect(result.failureCode).toBe(
      "WECHAT_PAY_TIMESTAMP_OUTSIDE_TOLERANCE",
    );
  });

  it("blocks fake signature mismatches", () => {
    const result = verifyWechatPayNotificationContract({
      ...baseInput,
      expectedFakeSignature: "signature_fake_test_only_other",
    });

    expect(result.signatureStatus).toBe("invalid");
    expect(result.failureCode).toBe("WECHAT_PAY_SIGNATURE_INVALID");
  });

  it("blocks unsupported encrypted resource algorithms", () => {
    const rawBody = JSON.stringify({
      ...wechatPayFakeSuccessNotifyVector.parsedBody,
      resource: {
        ...wechatPayFakeSuccessNotifyVector.parsedBody.resource,
        algorithm: "RSA_OAEP",
      },
    });

    const result = verifyWechatPayNotificationContract({
      ...baseInput,
      rawNotification: {
        ...baseInput.rawNotification,
        rawBody,
      },
    });

    expect(result.signatureStatus).toBe("unsupported");
    expect(result.resourceStatus).toBe("unsupported");
    expect(result.failureCode).toBe(
      "WECHAT_PAY_RESOURCE_ALGORITHM_UNSUPPORTED",
    );
  });

  it("blocks malformed raw bodies before any executable decision", () => {
    const result = verifyWechatPayNotificationContract({
      ...baseInput,
      rawNotification: {
        ...baseInput.rawNotification,
        rawBody: "{not-json",
      },
    });

    expect(result.signatureStatus).toBe("invalid");
    expect(result.resourceStatus).toBe("unparsed");
    expect(result.failureCode).toBe("WECHAT_PAY_RAW_BODY_INVALID");
    expect(result.executable).toBe(false);
  });
});
