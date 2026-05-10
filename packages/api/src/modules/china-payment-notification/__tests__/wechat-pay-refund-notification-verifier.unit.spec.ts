import {
  verifyWechatPayRefundNotificationContract,
  wechatPayRefundAbnormalNotifyVector,
  wechatPayRefundClosedNotifyVector,
  wechatPayRefundSuccessNotifyVector,
} from "..";

const trustedPlatformCertificates = [
  {
    serial: "serial_fake_wechat_refund_001",
    publicKeyRef: "fake_wechat_platform_public_key_ref_001",
    notBefore: "2026-05-10T00:00:00.000Z",
    notAfter: "2026-05-11T00:00:00.000Z",
  },
] as const;

const baseInput = {
  rawNotification: wechatPayRefundSuccessNotifyVector.rawNotification,
  currentUnixSeconds: 1770000000,
  timestampToleranceSeconds: 300,
  trustedPlatformCertificates,
  expectedSignature: wechatPayRefundSuccessNotifyVector.expectedSignature,
  expectedCiphertext: wechatPayRefundSuccessNotifyVector.expectedCiphertext,
  decryptedResource: wechatPayRefundSuccessNotifyVector.decryptedResource,
  expectedMchId: "mch_fake_refund_001",
  expectedAppId: "wx_fake_refund_app",
  expectedOutTradeNo: "pay_wechat_refund_order_001",
  expectedOutRefundNo: "refund_req_wechat_001",
  expectedAmountValue: 128560,
  expectedCurrency: "CNY",
} as const;

describe("WeChat Pay refund notification verifier contract", () => {
  it("verifies the redacted success refund callback without executable output", () => {
    const result = verifyWechatPayRefundNotificationContract(baseInput);

    expect(result).toMatchObject({
      provider: "wechat_pay",
      signatureStatus: "verified",
      decryptStatus: "decrypted",
      serial: "serial_fake_wechat_refund_001",
      eventId: "evt_wechat_refund_success_001",
      eventType: "refund.succeeded",
      providerRefundId: "refund_wechat_provider_001",
      merchantRefundRequestRef: "refund_req_wechat_001",
      merchantOrderRef: "pay_wechat_refund_order_001",
      providerTransactionId: "txn_wechat_refund_001",
      amountValue: 128560,
      currency: "CNY",
      idempotencyKey:
        "refund_notify:wechat_pay:evt_wechat_refund_success_001",
      rawPayloadDigest: wechatPayRefundSuccessNotifyVector.rawPayloadDigest,
      decryptedPayloadDigest:
        wechatPayRefundSuccessNotifyVector.decryptedPayloadDigest,
      fixtureOnly: true,
      executable: false,
    });

    const serialized = JSON.stringify(result);

    expect(serialized).not.toContain("refundStateMutation");
    expect(serialized).not.toContain("providerRefundRequest");
    expect(serialized).not.toContain("execute_workflow");
    expect(serialized).not.toContain("BEGIN PRIVATE KEY");
    expect(serialized).not.toContain("APIv3");
  });

  it("maps abnormal and closed events without converting them into platform refund success", () => {
    const abnormal = verifyWechatPayRefundNotificationContract({
      ...baseInput,
      rawNotification: wechatPayRefundAbnormalNotifyVector.rawNotification,
      expectedCiphertext: wechatPayRefundAbnormalNotifyVector.expectedCiphertext,
      decryptedResource: wechatPayRefundAbnormalNotifyVector.decryptedResource,
    });
    const closed = verifyWechatPayRefundNotificationContract({
      ...baseInput,
      rawNotification: wechatPayRefundClosedNotifyVector.rawNotification,
      expectedCiphertext: wechatPayRefundClosedNotifyVector.expectedCiphertext,
      decryptedResource: wechatPayRefundClosedNotifyVector.decryptedResource,
    });

    expect(abnormal).toMatchObject({
      eventType: "refund.abnormal",
      executable: false,
    });
    expect(closed).toMatchObject({
      eventType: "refund.closed",
      executable: false,
    });
    expect(JSON.stringify(abnormal)).not.toContain("refund.succeeded");
    expect(JSON.stringify(closed)).not.toContain("refund.succeeded");
  });

  it("blocks missing signature headers", () => {
    const result = verifyWechatPayRefundNotificationContract({
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
    expect(result.decryptStatus).toBe("not_attempted");
    expect(result.failureCode).toBe("WECHAT_REFUND_HEADER_MISSING");
  });

  it("blocks untrusted serials", () => {
    const result = verifyWechatPayRefundNotificationContract({
      ...baseInput,
      trustedPlatformCertificates: [
        {
          serial: "serial_fake_wechat_refund_other",
          publicKeyRef: "fake_wechat_platform_public_key_ref_other",
        },
      ],
    });

    expect(result.signatureStatus).toBe("invalid");
    expect(result.failureCode).toBe("WECHAT_REFUND_SERIAL_UNKNOWN");
  });

  it("blocks expired platform credentials", () => {
    const result = verifyWechatPayRefundNotificationContract({
      ...baseInput,
      trustedPlatformCertificates: [
        {
          serial: "serial_fake_wechat_refund_001",
          publicKeyRef: "fake_wechat_platform_public_key_ref_001",
          notAfter: "2026-05-09T00:00:00.000Z",
        },
      ],
    });

    expect(result.signatureStatus).toBe("invalid");
    expect(result.failureCode).toBe("WECHAT_REFUND_CERT_EXPIRED");
  });

  it("blocks stale timestamps", () => {
    const result = verifyWechatPayRefundNotificationContract({
      ...baseInput,
      currentUnixSeconds: 1770000601,
    });

    expect(result.signatureStatus).toBe("invalid");
    expect(result.failureCode).toBe("WECHAT_REFUND_TIMESTAMP_OUT_OF_RANGE");
  });

  it("blocks bad signatures before parsing success semantics", () => {
    const result = verifyWechatPayRefundNotificationContract({
      ...baseInput,
      expectedSignature: "signature_fake_wechat_refund_other",
    });

    expect(result.signatureStatus).toBe("invalid");
    expect(result.decryptStatus).toBe("not_attempted");
    expect(result.failureCode).toBe("WECHAT_REFUND_SIGNATURE_FAILED");
  });

  it("blocks malformed bodies", () => {
    const result = verifyWechatPayRefundNotificationContract({
      ...baseInput,
      rawNotification: {
        ...baseInput.rawNotification,
        rawBody: "{not-json",
      },
    });

    expect(result.signatureStatus).toBe("invalid");
    expect(result.failureCode).toBe("WECHAT_REFUND_BODY_MALFORMED");
    expect(result.executable).toBe(false);
  });

  it("blocks unsupported resource algorithms", () => {
    const rawBody = JSON.stringify({
      ...wechatPayRefundSuccessNotifyVector.parsedBody,
      resource: {
        ...wechatPayRefundSuccessNotifyVector.parsedBody.resource,
        algorithm: "RSA_OAEP",
      },
    });

    const result = verifyWechatPayRefundNotificationContract({
      ...baseInput,
      rawNotification: {
        ...baseInput.rawNotification,
        rawBody,
      },
    });

    expect(result.signatureStatus).toBe("unsupported");
    expect(result.failureCode).toBe(
      "WECHAT_REFUND_RESOURCE_ALGORITHM_UNSUPPORTED",
    );
  });

  it("blocks deterministic decrypt failures", () => {
    const result = verifyWechatPayRefundNotificationContract({
      ...baseInput,
      expectedCiphertext: "ciphertext_fake_wechat_refund_other",
    });

    expect(result.signatureStatus).toBe("verified");
    expect(result.decryptStatus).toBe("failed");
    expect(result.failureCode).toBe("WECHAT_REFUND_DECRYPT_FAILED");
  });

  it("blocks merchant, order, request, amount, and currency mismatches", () => {
    const merchant = verifyWechatPayRefundNotificationContract({
      ...baseInput,
      expectedMchId: "mch_fake_refund_other",
    });
    const order = verifyWechatPayRefundNotificationContract({
      ...baseInput,
      expectedOutTradeNo: "pay_wechat_refund_order_other",
    });
    const request = verifyWechatPayRefundNotificationContract({
      ...baseInput,
      expectedOutRefundNo: "refund_req_wechat_other",
    });
    const amount = verifyWechatPayRefundNotificationContract({
      ...baseInput,
      expectedAmountValue: 1,
    });
    const currency = verifyWechatPayRefundNotificationContract({
      ...baseInput,
      expectedCurrency: "CNY",
      decryptedResource: {
        ...baseInput.decryptedResource,
        amount: {
          ...baseInput.decryptedResource.amount,
          currency: "USD" as "CNY",
        },
      },
    });

    expect(merchant.failureCode).toBe("WECHAT_REFUND_MCH_MISMATCH");
    expect(order.failureCode).toBe("WECHAT_REFUND_ORDER_MISMATCH");
    expect(request.failureCode).toBe("WECHAT_REFUND_REQUEST_MISMATCH");
    expect(amount.failureCode).toBe("WECHAT_REFUND_AMOUNT_MISMATCH");
    expect(currency.failureCode).toBe("WECHAT_REFUND_CURRENCY_MISMATCH");
  });

  it("routes unknown refund events to a non-executable verifier failure", () => {
    const rawBody = JSON.stringify({
      ...wechatPayRefundSuccessNotifyVector.parsedBody,
      event_type: "REFUND.UNKNOWN",
    });

    const result = verifyWechatPayRefundNotificationContract({
      ...baseInput,
      rawNotification: {
        ...baseInput.rawNotification,
        rawBody,
      },
    });

    expect(result.signatureStatus).toBe("verified");
    expect(result.decryptStatus).toBe("decrypted");
    expect(result.eventType).toBe("unknown");
    expect(result.failureCode).toBe("WECHAT_REFUND_EVENT_UNKNOWN");
    expect(result.executable).toBe(false);
  });
});
