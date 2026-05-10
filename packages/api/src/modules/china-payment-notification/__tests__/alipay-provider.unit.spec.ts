import { createDisabledAlipayProviderAdapter } from "..";

const adapter = createDisabledAlipayProviderAdapter();

const createInput = {
  merchantOrderRef: "pay_alipay_disabled_001",
  amount: {
    value: 128560,
    currency: "CNY",
  },
  subject: "三门海鲜市场支付宝禁用态合同",
  notifyUrl: "https://example.test/china/payment-webhooks/alipay",
  returnUrl: "https://example.test/cn/payment/pending",
} as const;

describe("disabled Alipay provider adapter skeleton", () => {
  it("exposes only config key names and remains disabled", () => {
    expect(adapter.config).toEqual({
      provider: "alipay",
      sandboxProvider: "alipay_sandbox",
      mode: "disabled",
      enabled: false,
      notifyUrlBaseKey: "CHINA_PAYMENT_ALIPAY_NOTIFY_URL_BASE",
      returnUrlBaseKey: "CHINA_PAYMENT_ALIPAY_RETURN_URL_BASE",
      secretReferenceKeys: {
        appIdRef: "CHINA_PAYMENT_ALIPAY_APP_ID_REF",
        merchantIdRef: "CHINA_PAYMENT_ALIPAY_MERCHANT_ID_REF",
        privateKeyRef: "CHINA_PAYMENT_ALIPAY_PRIVATE_KEY_REF",
        publicKeyRef: "CHINA_PAYMENT_ALIPAY_PUBLIC_KEY_REF",
        appCertSnRef: "CHINA_PAYMENT_ALIPAY_APP_CERT_SN_REF",
        rootCertSnRef: "CHINA_PAYMENT_ALIPAY_ROOT_CERT_SN_REF",
      },
    });
  });

  it("blocks create payment without producing checkout or workflow commands", () => {
    const decision = adapter.createPayment(createInput);

    expect(decision).toMatchObject({
      provider: "alipay",
      mode: "disabled",
      enabled: false,
      blocked: true,
      operation: "create_payment",
    });
    expect(decision.rawPayloadDigest).toMatch(/^sha256:/);
    expect(JSON.stringify(decision)).not.toContain("placeOrder");
    expect(JSON.stringify(decision)).not.toContain("workflow_execution");
    expect(decision).not.toHaveProperty("clientPayload");
    expect(decision).not.toHaveProperty("paymentUrl");
    expect(decision).not.toHaveProperty("qrCodeUrl");
  });

  it("blocks query and close as contract decisions only", () => {
    const query = adapter.queryPayment({
      merchantOrderRef: createInput.merchantOrderRef,
      providerPaymentId: "alipay_disabled_provider_payment_001",
    });
    const closed = adapter.closePayment({
      merchantOrderRef: createInput.merchantOrderRef,
      providerPaymentId: "alipay_disabled_provider_payment_001",
      reason: "operator_cancelled_before_runtime_gate",
    });

    expect(query).toMatchObject({
      blocked: true,
      operation: "query_payment",
    });
    expect(closed).toMatchObject({
      blocked: true,
      operation: "close_payment",
    });
    expect(query).not.toHaveProperty("paymentStateCommand");
    expect(closed).not.toHaveProperty("paymentStateCommand");
  });

  it("blocks notification verification and normalization without trusting return_url", () => {
    const rawNotification = {
      form: {
        notify_id: "notify_alipay_disabled_001",
        out_trade_no: createInput.merchantOrderRef,
        trade_no: "trade_alipay_disabled_001",
        total_amount: "1285.60",
        trade_status: "TRADE_SUCCESS",
        sign_type: "RSA2",
        sign: "signature_placeholder",
      },
      headers: {},
    };

    const verification = adapter.verifyNotification(rawNotification);
    const normalized = adapter.normalizeNotification(rawNotification);

    expect(verification).toMatchObject({
      blocked: true,
      operation: "verify_notification",
    });
    expect(normalized).toMatchObject({
      blocked: true,
      operation: "normalize_notification",
    });
    expect(JSON.stringify(verification)).not.toContain("payment.succeeded");
    expect(JSON.stringify(normalized)).not.toContain("payment.succeeded");
  });

  it("does not expose real credentials or SDK hooks", () => {
    const serialized = JSON.stringify(adapter);

    expect(serialized).not.toContain("BEGIN PRIVATE KEY");
    expect(serialized).not.toContain("app_id=");
    expect(serialized).not.toContain("merchant_id=");
    expect(serialized).not.toContain("alipay-sdk");
    expect(serialized).not.toContain("axios");
    expect(serialized).not.toContain("fetch");
  });
});
