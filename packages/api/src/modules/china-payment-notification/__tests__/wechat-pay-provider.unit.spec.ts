import { createDisabledWechatPayProviderAdapter } from "..";

const adapter = createDisabledWechatPayProviderAdapter();

const createInput = {
  merchantOrderRef: "pay_wechat_disabled_001",
  amount: {
    value: 128560,
    currency: "CNY",
  },
  description: "三门海鲜市场微信支付禁用态合同",
  notifyUrl: "https://example.test/china/payment-webhooks/wechat-pay",
  payerOpenId: "openid_test_placeholder",
} as const;

describe("disabled WeChat Pay provider adapter skeleton", () => {
  it("exposes only config key names and remains disabled", () => {
    expect(adapter.config).toEqual({
      provider: "wechat_pay",
      sandboxProvider: "wechat_pay_sandbox",
      mode: "disabled",
      enabled: false,
      notifyUrlBaseKey: "CHINA_PAYMENT_WECHAT_PAY_NOTIFY_URL_BASE",
      returnUrlBaseKey: "CHINA_PAYMENT_WECHAT_PAY_RETURN_URL_BASE",
      secretReferenceKeys: {
        appIdRef: "CHINA_PAYMENT_WECHAT_PAY_APP_ID_REF",
        mchIdRef: "CHINA_PAYMENT_WECHAT_PAY_MCH_ID_REF",
        privateKeyRef: "CHINA_PAYMENT_WECHAT_PAY_PRIVATE_KEY_REF",
        merchantCertSerialNoRef:
          "CHINA_PAYMENT_WECHAT_PAY_MERCHANT_CERT_SERIAL_NO_REF",
        apiV3KeyRef: "CHINA_PAYMENT_WECHAT_PAY_API_V3_KEY_REF",
        platformCertRef: "CHINA_PAYMENT_WECHAT_PAY_PLATFORM_CERT_REF",
        publicKeyIdRef: "CHINA_PAYMENT_WECHAT_PAY_PUBLIC_KEY_ID_REF",
      },
    });
  });

  it("blocks create payment without producing checkout or workflow commands", () => {
    const decision = adapter.createPayment(createInput);

    expect(decision).toMatchObject({
      provider: "wechat_pay",
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
  });

  it("blocks query and close as contract decisions only", () => {
    const query = adapter.queryPayment({
      merchantOrderRef: createInput.merchantOrderRef,
      providerPaymentId: "wxpay_disabled_provider_payment_001",
    });
    const closed = adapter.closePayment({
      merchantOrderRef: createInput.merchantOrderRef,
      providerPaymentId: "wxpay_disabled_provider_payment_001",
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
      rawBody: JSON.stringify({
        id: "evt_wechat_disabled_001",
        resource: {
          algorithm: "AEAD_AES_256_GCM",
          ciphertext: "ciphertext_placeholder",
          nonce: "nonce_placeholder",
        },
      }),
      headers: {
        "wechatpay-timestamp": "1770000000",
        "wechatpay-nonce": "nonce_placeholder",
        "wechatpay-signature": "signature_placeholder",
        "wechatpay-serial": "serial_placeholder",
      },
    };

    const verification = adapter.verifyAndDecryptNotification(rawNotification);
    const normalized = adapter.normalizeNotification(rawNotification);

    expect(verification).toMatchObject({
      blocked: true,
      operation: "verify_and_decrypt_notification",
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
    expect(serialized).not.toContain("mch_id=");
    expect(serialized).not.toContain("appid=wx");
    expect(serialized).not.toContain("wechatpay-node");
    expect(serialized).not.toContain("axios");
    expect(serialized).not.toContain("fetch");
  });
});
