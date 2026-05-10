import { wechatPayFakeSuccessNotifyVector } from "..";

describe("WeChat Pay fake notify fixtures", () => {
  it("uses explicit fake/test identifiers only", () => {
    const serialized = JSON.stringify(wechatPayFakeSuccessNotifyVector);

    expect(wechatPayFakeSuccessNotifyVector.fixtureOnly).toBe(true);
    expect(wechatPayFakeSuccessNotifyVector.decryptedResource.appid).toBe(
      "wx_fake_test_app",
    );
    expect(wechatPayFakeSuccessNotifyVector.decryptedResource.mchid).toBe(
      "mch_fake_test_001",
    );
    expect(wechatPayFakeSuccessNotifyVector.decryptedResource.transaction_id).toBe(
      "txn_wechat_fake_test_001",
    );
    expect(serialized).toContain("fake");
    expect(serialized).not.toContain("1900000000");
    expect(serialized).not.toMatch(/mch_id[=:]\d+/);
    expect(serialized).not.toMatch(/appid=wx[a-zA-Z0-9]{10,}/);
  });

  it("keeps raw body as a stable string for future signature verification", () => {
    const { rawNotification, parsedBody } = wechatPayFakeSuccessNotifyVector;

    expect(rawNotification.rawBody).toBe(JSON.stringify(parsedBody));
    expect(rawNotification.headers["wechatpay-signature"]).toBe(
      "signature_fake_test_only_001",
    );
    expect(rawNotification.headers["wechatpay-serial"]).toBe(
      "serial_fake_test_only_001",
    );
    expect(wechatPayFakeSuccessNotifyVector.rawPayloadDigest).toMatch(/^sha256:/);
    expect(wechatPayFakeSuccessNotifyVector.decryptedPayloadDigest).toMatch(
      /^sha256:/,
    );
  });

  it("does not expose real credentials or executable payment commands", () => {
    const serialized = JSON.stringify(wechatPayFakeSuccessNotifyVector);

    expect(serialized).not.toContain("BEGIN PRIVATE KEY");
    expect(serialized).not.toContain("BEGIN CERTIFICATE");
    expect(serialized).not.toContain("APIv3");
    expect(serialized).not.toContain("payment.succeeded");
    expect(serialized).not.toContain("placeOrder");
    expect(serialized).not.toContain("workflow_execution");
    expect(wechatPayFakeSuccessNotifyVector).not.toHaveProperty("paymentUrl");
    expect(wechatPayFakeSuccessNotifyVector).not.toHaveProperty("clientPayload");
  });

  it("documents the idempotency key that future normalizers must produce", () => {
    expect(wechatPayFakeSuccessNotifyVector.expectedIdempotencyKey).toBe(
      "payment_notify:wechat_pay:evt_wechat_fake_001",
    );
  });
});
