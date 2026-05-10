import {
  refundFakeFailedNotifyVector,
  refundFakeNotifyVectors,
  refundFakeSucceededNotifyVector,
} from "..";

describe("refund notification fake fixtures", () => {
  it("contains fake succeeded and failed refund notifications only", () => {
    expect(refundFakeNotifyVectors).toHaveLength(2);
    expect(refundFakeSucceededNotifyVector.body.event_type).toBe(
      "refund.succeeded",
    );
    expect(refundFakeFailedNotifyVector.body.event_type).toBe("refund.failed");

    for (const vector of refundFakeNotifyVectors) {
      expect(vector.fixtureOnly).toBe(true);
      expect(vector.executable).toBe(false);
      expect(vector.provider).toBe("mock_china_pay");
      expect(vector.providerRefundId).toContain("refund_fake");
      expect(JSON.stringify(vector)).toContain("fake");
    }
  });

  it("documents stable refund notification idempotency keys", () => {
    expect(refundFakeSucceededNotifyVector.expectedIdempotencyKey).toBe(
      "refund_notify:mock_china_pay:evt_refund_fake_succeeded_001",
    );
    expect(refundFakeFailedNotifyVector.expectedIdempotencyKey).toBe(
      "refund_notify:mock_china_pay:evt_refund_fake_failed_001",
    );
    expect(refundFakeSucceededNotifyVector.expectedIdempotencyKey).not.toContain(
      "payment_notify",
    );
    expect(refundFakeSucceededNotifyVector.expectedIdempotencyKey).not.toContain(
      "refund_req",
    );
  });

  it("keeps raw body and digest stable for future verifier contracts", () => {
    for (const vector of refundFakeNotifyVectors) {
      expect(vector.rawBody).toBe(JSON.stringify(vector.body));
      expect(vector.rawPayloadDigest).toMatch(/^sha256:/);
      expect(vector.body.provider_refund_id).toBe(vector.providerRefundId);
      expect(vector.body.currency).toBe("CNY");
      expect(vector.body.amount).toBeGreaterThan(0);
    }
  });

  it("does not expose credentials, provider APIs, or executable refund commands", () => {
    const serialized = JSON.stringify(refundFakeNotifyVectors);

    expect(serialized).not.toContain("BEGIN PRIVATE KEY");
    expect(serialized).not.toContain("BEGIN CERTIFICATE");
    expect(serialized).not.toContain("APIv3");
    expect(serialized).not.toContain("app_secret");
    expect(serialized).not.toContain("wechat_refund");
    expect(serialized).not.toContain("alipay_refund");
    expect(serialized).not.toContain("createRefund");
    expect(serialized).not.toContain("workflow_execution");
    expect(refundFakeSucceededNotifyVector).not.toHaveProperty(
      "providerRefundRequest",
    );
    expect(refundFakeSucceededNotifyVector).not.toHaveProperty(
      "refundStateMutation",
    );
  });
});
