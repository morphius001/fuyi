import {
  classifyPaymentNotificationRepositoryError,
  paymentNotificationRepositoryErrorKinds,
} from "..";

describe("payment inbox repository contract", () => {
  it("classifies terminal repository errors", () => {
    expect(classifyPaymentNotificationRepositoryError("SIGNATURE_MISSING")).toBe(
      "terminal",
    );
    expect(classifyPaymentNotificationRepositoryError("SIGNATURE_INVALID")).toBe(
      "terminal",
    );
    expect(classifyPaymentNotificationRepositoryError("PAYLOAD_INVALID")).toBe(
      "terminal",
    );
    expect(classifyPaymentNotificationRepositoryError("CURRENCY_UNSUPPORTED")).toBe(
      "terminal",
    );
    expect(
      classifyPaymentNotificationRepositoryError("EVENT_TYPE_UNSUPPORTED"),
    ).toBe("terminal");
  });

  it("classifies duplicate and retryable repository errors", () => {
    expect(classifyPaymentNotificationRepositoryError("DB_UNIQUE_CONFLICT")).toBe(
      "duplicate",
    );
    expect(classifyPaymentNotificationRepositoryError("DB_LOCK_TIMEOUT")).toBe(
      "retryable",
    );
    expect(
      classifyPaymentNotificationRepositoryError("DB_CONNECTION_INTERRUPTED"),
    ).toBe("retryable");
  });

  it("keeps unknown repository errors out of terminal decisions by default", () => {
    expect(classifyPaymentNotificationRepositoryError("SOMETHING_NEW")).toBe(
      "unknown",
    );
  });

  it("keeps the repository error map explicit", () => {
    expect(Object.keys(paymentNotificationRepositoryErrorKinds).sort()).toEqual([
      "CURRENCY_UNSUPPORTED",
      "DB_CONNECTION_INTERRUPTED",
      "DB_LOCK_TIMEOUT",
      "DB_UNIQUE_CONFLICT",
      "EVENT_TYPE_UNSUPPORTED",
      "PAYLOAD_INVALID",
      "SIGNATURE_INVALID",
      "SIGNATURE_MISSING",
    ]);
  });
});
