import {
  alipayFakeCanonicalPayload,
  alipayFakeNotifyForm,
  alipayFakeSuccessNotifyVector,
} from "..";

describe("Alipay fake notify fixtures", () => {
  it("uses explicit fake/test identifiers only", () => {
    const serialized = JSON.stringify(alipayFakeSuccessNotifyVector);

    expect(alipayFakeSuccessNotifyVector.fixtureOnly).toBe(true);
    expect(alipayFakeNotifyForm.app_id).toBe("app_fake_test_001");
    expect(alipayFakeNotifyForm.seller_id).toBe("merchant_fake_test_001");
    expect(alipayFakeNotifyForm.trade_no).toBe("trade_alipay_fake_001");
    expect(serialized).toContain("fake");
    expect(serialized).not.toMatch(/app_id=[0-9A-Za-z]{10,}/);
    expect(serialized).not.toMatch(/merchant_id[=:]\d+/);
  });

  it("documents canonical keys while excluding sign", () => {
    expect(alipayFakeSuccessNotifyVector.expectedCanonicalParamKeys).toEqual([
      "app_id",
      "currency",
      "notify_id",
      "notify_time",
      "notify_type",
      "out_trade_no",
      "seller_id",
      "total_amount",
      "trade_no",
      "trade_status",
    ]);
    expect(alipayFakeCanonicalPayload).not.toContain("sign=");
    expect(alipayFakeCanonicalPayload).not.toContain("sign_type=");
    expect(alipayFakeNotifyForm.sign_type).toBe("RSA2");
    expect(alipayFakeSuccessNotifyVector.rawPayloadDigest).toMatch(/^sha256:/);
    expect(alipayFakeSuccessNotifyVector.canonicalPayloadDigest).toMatch(
      /^sha256:/,
    );
  });

  it("does not expose real credentials or executable payment commands", () => {
    const serialized = JSON.stringify(alipayFakeSuccessNotifyVector);

    expect(serialized).not.toContain("BEGIN PRIVATE KEY");
    expect(serialized).not.toContain("BEGIN PUBLIC KEY");
    expect(serialized).not.toContain("BEGIN CERTIFICATE");
    expect(serialized).not.toContain("payment.succeeded");
    expect(serialized).not.toContain("placeOrder");
    expect(serialized).not.toContain("workflow_execution");
    expect(alipayFakeSuccessNotifyVector).not.toHaveProperty("paymentUrl");
    expect(alipayFakeSuccessNotifyVector).not.toHaveProperty("clientPayload");
  });

  it("documents the idempotency key that future normalizers must produce", () => {
    expect(alipayFakeSuccessNotifyVector.expectedIdempotencyKey).toBe(
      "payment_notify:alipay:notify_alipay_fake_001",
    );
  });
});
