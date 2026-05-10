import {
  buildProviderRefundRequestKey,
  buildRefundCommandIdempotencyKey,
  getAsiaShanghaiRequestDay,
} from "..";

const commandInput = {
  provider: "mock_china_pay",
  orderId: "order_001",
  paymentId: "pay_001",
  requestedAmountMinor: 128560,
  actorType: "admin" as const,
  actorId: "admin_001",
  reasonCode: "customer_requested",
  requestedAt: "2026-05-10T15:30:00.000Z",
};

const sensitiveValues = [
  "mock_secret",
  "-----BEGIN PRIVATE KEY-----",
  "api_v3_key",
  "13800138000",
  "{\"raw\":\"payload\"}",
];

describe("refund request idempotency contract", () => {
  it("builds stable local refund command keys", () => {
    const first = buildRefundCommandIdempotencyKey(commandInput);
    const second = buildRefundCommandIdempotencyKey({ ...commandInput });

    expect(first).toBe(second);
    expect(first).toBe(
      "refund_cmd:mock_china_pay:order_001:pay_001:128560:admin:admin_001:customer_requested:2026-05-10",
    );
  });

  it("uses Asia Shanghai request day buckets", () => {
    expect(getAsiaShanghaiRequestDay("2026-05-10T15:59:59.000Z")).toBe(
      "2026-05-10",
    );
    expect(getAsiaShanghaiRequestDay("2026-05-10T16:00:00.000Z")).toBe(
      "2026-05-11",
    );
    expect(getAsiaShanghaiRequestDay("not-a-date")).toBe("invalid_date");
  });

  it("forks command keys by amount, actor, reason, and day", () => {
    const base = buildRefundCommandIdempotencyKey(commandInput);

    expect(
      buildRefundCommandIdempotencyKey({
        ...commandInput,
        requestedAmountMinor: 1000,
      }),
    ).not.toBe(base);
    expect(
      buildRefundCommandIdempotencyKey({
        ...commandInput,
        actorType: "vendor",
        actorId: "vendor_001",
      }),
    ).not.toBe(base);
    expect(
      buildRefundCommandIdempotencyKey({
        ...commandInput,
        reasonCode: "quality_issue",
      }),
    ).not.toBe(base);
    expect(
      buildRefundCommandIdempotencyKey({
        ...commandInput,
        requestedAt: "2026-05-10T16:00:00.000Z",
      }),
    ).not.toBe(base);
  });

  it("builds stable provider refund request keys from backend references", () => {
    const localCommandId = buildRefundCommandIdempotencyKey(commandInput);
    const key = buildProviderRefundRequestKey({
      provider: "mock_china_pay",
      merchantOrderRef: "pay_mock_001",
      paymentSessionId: "payses_001",
      requestedAmountMinor: 128560,
      localCommandId,
    });

    expect(key).toBe(
      "refund_req:mock_china_pay:pay_mock_001:payses_001:128560:refund_cmd:mock_china_pay:order_001:pay_001:128560:admin:admin_001:customer_requested:2026-05-10",
    );
  });

  it("forks provider request keys by amount and local command id", () => {
    const localCommandId = buildRefundCommandIdempotencyKey(commandInput);
    const base = buildProviderRefundRequestKey({
      provider: "mock_china_pay",
      merchantOrderRef: "pay_mock_001",
      paymentSessionId: "payses_001",
      requestedAmountMinor: 128560,
      localCommandId,
    });

    expect(
      buildProviderRefundRequestKey({
        provider: "mock_china_pay",
        merchantOrderRef: "pay_mock_001",
        paymentSessionId: "payses_001",
        requestedAmountMinor: 1000,
        localCommandId,
      }),
    ).not.toBe(base);
    expect(
      buildProviderRefundRequestKey({
        provider: "mock_china_pay",
        merchantOrderRef: "pay_mock_001",
        paymentSessionId: "payses_001",
        requestedAmountMinor: 128560,
        localCommandId: `${localCommandId}:manual_review`,
      }),
    ).not.toBe(base);
  });

  it("normalizes noisy key parts without adding success semantics", () => {
    const key = buildProviderRefundRequestKey({
      provider: "Mock China Pay",
      merchantOrderRef: "PAY MOCK 001",
      paymentSessionId: "PAYSES/001",
      requestedAmountMinor: 128560,
      localCommandId: "Refund CMD 001",
    });

    expect(key).toBe(
      "refund_req:mock_china_pay:pay_mock_001:payses_001:128560:refund_cmd_001",
    );
    expect(key).not.toContain("succeeded");
    expect(key).not.toContain("success");
    expect(key).not.toContain("refunded");
  });

  it("does not include raw payloads or secrets in generated keys", () => {
    const localCommandId = buildRefundCommandIdempotencyKey(commandInput);
    const key = buildProviderRefundRequestKey({
      provider: "mock_china_pay",
      merchantOrderRef: "pay_mock_001",
      paymentSessionId: "payses_001",
      requestedAmountMinor: 128560,
      localCommandId,
    });

    for (const sensitive of sensitiveValues) {
      expect(localCommandId).not.toContain(sensitive);
      expect(key).not.toContain(sensitive);
    }
  });
});
