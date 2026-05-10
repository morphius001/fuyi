import {
  alipayRefundSuccessNotifyVector,
  alipayRefundTradeOnlyNotifyVector,
  buildAlipayRefundNotificationCanonicalPayloadContract,
  verifyAlipayRefundNotificationContract,
} from "..";

const baseInput = {
  rawNotification: alipayRefundSuccessNotifyVector.rawNotification,
  expectedAppId: "app_fake_refund_001",
  expectedSellerId: "merchant_fake_refund_001",
  expectedOutTradeNo: "pay_alipay_refund_order_001",
  expectedTradeNo: "trade_alipay_refund_001",
  expectedOutRequestNo: "refund_req_alipay_001",
  expectedAmountValue: 128560,
  expectedCurrency: "CNY",
  expectedFakeSignature: alipayRefundSuccessNotifyVector.expectedFakeSignature,
  expectedCanonicalPayload:
    alipayRefundSuccessNotifyVector.expectedCanonicalPayload,
  refundNotifyMode: "product_specific_refund_notify",
} as const;

describe("Alipay refund notification verifier contract", () => {
  it("verifies a redacted refund notification without executable output", () => {
    const result = verifyAlipayRefundNotificationContract(baseInput);

    expect(result).toMatchObject({
      provider: "alipay",
      signatureStatus: "verified",
      productModeStatus: "confirmed",
      signType: "RSA2",
      notifyId: "notify_alipay_refund_001",
      appId: "app_fake_refund_001",
      sellerId: "merchant_fake_refund_001",
      tradeNo: "trade_alipay_refund_001",
      merchantOrderRef: "pay_alipay_refund_order_001",
      merchantRefundRequestRef: "refund_req_alipay_001",
      eventType: "refund.succeeded",
      amountValue: 128560,
      currency: "CNY",
      idempotencyKey: "refund_notify:alipay:notify_alipay_refund_001",
      rawPayloadDigest: alipayRefundSuccessNotifyVector.rawPayloadDigest,
      canonicalPayloadDigest:
        alipayRefundSuccessNotifyVector.canonicalPayloadDigest,
      fixtureOnly: true,
      executable: false,
    });

    const serialized = JSON.stringify(result);

    expect(serialized).not.toContain("refundStateMutation");
    expect(serialized).not.toContain("providerRefundRequest");
    expect(serialized).not.toContain("execute_workflow");
    expect(serialized).not.toContain("BEGIN PRIVATE KEY");
    expect(result).not.toHaveProperty("canonicalPayload");
  });

  it("builds canonical payload with future fields while excluding sign, sign_type, and empty values", () => {
    const canonicalPayload = buildAlipayRefundNotificationCanonicalPayloadContract(
      alipayRefundSuccessNotifyVector.rawNotification.form,
    );

    expect(canonicalPayload).toBe(
      alipayRefundSuccessNotifyVector.expectedCanonicalPayload,
    );
    expect(canonicalPayload).toContain("future_refund_field=future_value");
    expect(canonicalPayload).not.toContain("sign=");
    expect(canonicalPayload).not.toContain("sign_type=");
    expect(canonicalPayload).not.toContain("empty_field=");
  });

  it("keeps trade-only notifications in manual review semantics instead of refund success", () => {
    const result = verifyAlipayRefundNotificationContract({
      ...baseInput,
      rawNotification: alipayRefundTradeOnlyNotifyVector.rawNotification,
      expectedCanonicalPayload:
        alipayRefundTradeOnlyNotifyVector.expectedCanonicalPayload,
      refundNotifyMode: "trade_async_notify",
      expectedOutRequestNo: undefined,
    });

    expect(result).toMatchObject({
      signatureStatus: "verified",
      productModeStatus: "unconfirmed",
      eventType: "trade.updated",
      failureCode: "ALIPAY_REFUND_REQUEST_REF_MISSING",
      executable: false,
    });
    expect(JSON.stringify(result)).not.toContain("refund.succeeded");
  });

  it("requires follow-up query mode without calling query APIs", () => {
    const result = verifyAlipayRefundNotificationContract({
      ...baseInput,
      refundNotifyMode: "refund_query_follow_up",
    });

    expect(result.signatureStatus).toBe("verified");
    expect(result.productModeStatus).toBe("query_required");
    expect(result.eventType).toBe("refund.unknown");
    expect(result.failureCode).toBe("ALIPAY_REFUND_PRODUCT_MODE_UNCONFIRMED");
    expect(JSON.stringify(result)).not.toContain("refundQueryApi");
  });

  it("blocks missing sign and sign_type fields", () => {
    const { sign: _sign, ...missingSignForm } =
      alipayRefundSuccessNotifyVector.rawNotification.form;
    const { sign_type: _signType, ...missingSignTypeForm } =
      alipayRefundSuccessNotifyVector.rawNotification.form;

    const missingSign = verifyAlipayRefundNotificationContract({
      ...baseInput,
      rawNotification: {
        ...baseInput.rawNotification,
        form: missingSignForm,
      },
    });
    const missingSignType = verifyAlipayRefundNotificationContract({
      ...baseInput,
      rawNotification: {
        ...baseInput.rawNotification,
        form: missingSignTypeForm,
      },
    });

    expect(missingSign.signatureStatus).toBe("missing");
    expect(missingSign.failureCode).toBe("ALIPAY_REFUND_SIGN_MISSING");
    expect(missingSignType.signatureStatus).toBe("missing");
    expect(missingSignType.failureCode).toBe(
      "ALIPAY_REFUND_SIGN_TYPE_MISSING",
    );
  });

  it("blocks unsupported sign types and bad signatures", () => {
    const unsupported = verifyAlipayRefundNotificationContract({
      ...baseInput,
      rawNotification: {
        ...baseInput.rawNotification,
        form: {
          ...baseInput.rawNotification.form,
          sign_type: "RSA",
        },
      },
    });
    const badSignature = verifyAlipayRefundNotificationContract({
      ...baseInput,
      expectedFakeSignature: "signature_fake_alipay_refund_other",
    });

    expect(unsupported.signatureStatus).toBe("unsupported");
    expect(unsupported.failureCode).toBe(
      "ALIPAY_REFUND_SIGN_TYPE_UNSUPPORTED",
    );
    expect(badSignature.signatureStatus).toBe("invalid");
    expect(badSignature.failureCode).toBe("ALIPAY_REFUND_SIGNATURE_FAILED");
  });

  it("blocks identity mismatches before refund success semantics", () => {
    const app = verifyAlipayRefundNotificationContract({
      ...baseInput,
      expectedAppId: "app_fake_refund_other",
    });
    const seller = verifyAlipayRefundNotificationContract({
      ...baseInput,
      expectedSellerId: "merchant_fake_refund_other",
    });
    const order = verifyAlipayRefundNotificationContract({
      ...baseInput,
      expectedOutTradeNo: "pay_alipay_refund_order_other",
    });
    const trade = verifyAlipayRefundNotificationContract({
      ...baseInput,
      expectedTradeNo: "trade_alipay_refund_other",
    });

    expect(app.failureCode).toBe("ALIPAY_REFUND_APP_MISMATCH");
    expect(seller.failureCode).toBe("ALIPAY_REFUND_SELLER_MISMATCH");
    expect(order.failureCode).toBe("ALIPAY_REFUND_ORDER_MISMATCH");
    expect(trade.failureCode).toBe("ALIPAY_REFUND_TRADE_MISMATCH");
  });

  it("blocks refund request, amount, and currency mismatches", () => {
    const request = verifyAlipayRefundNotificationContract({
      ...baseInput,
      expectedOutRequestNo: "refund_req_alipay_other",
    });
    const amount = verifyAlipayRefundNotificationContract({
      ...baseInput,
      expectedAmountValue: 1,
    });
    const currency = verifyAlipayRefundNotificationContract({
      ...baseInput,
      expectedCanonicalPayload: undefined,
      rawNotification: {
        ...baseInput.rawNotification,
        form: {
          ...baseInput.rawNotification.form,
          refund_currency: "USD",
        },
      },
    });

    expect(request.failureCode).toBe("ALIPAY_REFUND_REQUEST_REF_MISSING");
    expect(amount.failureCode).toBe("ALIPAY_REFUND_AMOUNT_MISMATCH");
    expect(currency.failureCode).toBe("ALIPAY_REFUND_CURRENCY_MISMATCH");
  });

  it("blocks invalid refund amount formats", () => {
    const result = verifyAlipayRefundNotificationContract({
      ...baseInput,
      expectedCanonicalPayload: undefined,
      rawNotification: {
        ...baseInput.rawNotification,
        form: {
          ...baseInput.rawNotification.form,
          refund_fee: "1285.605",
        },
      },
    });

    expect(result.signatureStatus).toBe("verified");
    expect(result.failureCode).toBe("ALIPAY_REFUND_AMOUNT_INVALID");
  });
});
