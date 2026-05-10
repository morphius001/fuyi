import {
  classifyRefundInboxRepositoryError,
  refundInboxRepositoryErrorKinds,
  RefundInboxReceiveResult,
  RefundInboxRepositoryContract,
} from "..";

describe("refund inbox repository contract", () => {
  it("classifies duplicate and manual review repository errors", () => {
    expect(classifyRefundInboxRepositoryError("REFUND_DB_UNIQUE_CONFLICT")).toBe(
      "duplicate",
    );
    expect(classifyRefundInboxRepositoryError("REFUND_DB_DIGEST_CONFLICT")).toBe(
      "manual_review",
    );
    expect(
      classifyRefundInboxRepositoryError("REFUND_DB_PROVIDER_REFUND_CONFLICT"),
    ).toBe("manual_review");
  });

  it("classifies retryable and terminal repository errors", () => {
    expect(classifyRefundInboxRepositoryError("REFUND_DB_LOCK_TIMEOUT")).toBe(
      "retryable",
    );
    expect(
      classifyRefundInboxRepositoryError("REFUND_DB_CONNECTION_INTERRUPTED"),
    ).toBe("retryable");
    expect(
      classifyRefundInboxRepositoryError("REFUND_DB_EVENT_LOG_WRITE_FAILED"),
    ).toBe("retryable");
    expect(
      classifyRefundInboxRepositoryError("REFUND_DB_INVALID_STATE_TRANSITION"),
    ).toBe("terminal");
    expect(
      classifyRefundInboxRepositoryError("REFUND_DB_METADATA_REDACTION_FAILED"),
    ).toBe("terminal");
  });

  it("keeps unknown repository errors out of success decisions by default", () => {
    expect(classifyRefundInboxRepositoryError("SOMETHING_NEW")).toBe("unknown");
  });

  it("keeps the repository error map explicit", () => {
    expect(Object.keys(refundInboxRepositoryErrorKinds).sort()).toEqual([
      "REFUND_DB_CONNECTION_INTERRUPTED",
      "REFUND_DB_DIGEST_CONFLICT",
      "REFUND_DB_EVENT_LOG_WRITE_FAILED",
      "REFUND_DB_INVALID_STATE_TRANSITION",
      "REFUND_DB_LOCK_TIMEOUT",
      "REFUND_DB_METADATA_REDACTION_FAILED",
      "REFUND_DB_PROVIDER_REFUND_CONFLICT",
      "REFUND_DB_UNIQUE_CONFLICT",
    ]);
  });

  it("documents receive results as non-executable inbox outcomes only", () => {
    const duplicateConflict: RefundInboxReceiveResult = {
      status: "duplicate_digest_conflict",
      record: {
        id: "refund_inbox_001",
        provider: "mock_china_pay",
        eventId: "evt_refund_fake_succeeded_001",
        eventType: "refund.succeeded",
        idempotencyKey:
          "refund_notify:mock_china_pay:evt_refund_fake_succeeded_001",
        providerRefundId: "refund_fake_001",
        merchantOrderRef: "pay_mock_001",
        paymentSessionId: "payses_001",
        amountMinor: 128560,
        currency: "CNY",
        signatureStatus: "verified",
        rawPayloadDigest: "sha256:fake_digest",
        processingStatus: "digest_conflict_manual_review",
        retryCount: 0,
        createdAt: "2026-05-10T00:01:00.000Z",
        updatedAt: "2026-05-10T00:01:00.000Z",
      },
      fixtureOnly: true,
      executable: false,
    };
    const serialized = JSON.stringify(duplicateConflict);

    expect(duplicateConflict).toMatchObject({
      status: "duplicate_digest_conflict",
      fixtureOnly: true,
      executable: false,
    });
    expect(serialized).not.toContain("providerRefundRequest");
    expect(serialized).not.toContain("workflowCommand");
    expect(serialized).not.toContain("refundStateMutation");
    expect(serialized).not.toContain("refund_state_mutated");
    expect(serialized).not.toContain("provider_refund_request_sent");
    expect(serialized).not.toContain("refund_workflow_executed");
  });

  it("defines an interface without a DB adapter, route, provider API, or workflow implementation", () => {
    const methodNames: Array<keyof RefundInboxRepositoryContract> = [
      "receiveNotification",
      "appendEvent",
      "markSignatureVerified",
      "markNormalized",
      "markGuardChecked",
      "markManualReviewRequired",
      "markRuntimeMutationBlocked",
      "markProcessedForAuditOnly",
      "markTerminalRejected",
      "getByIdempotencyKey",
      "getByProviderRefundId",
    ];

    expect(methodNames).toEqual([
      "receiveNotification",
      "appendEvent",
      "markSignatureVerified",
      "markNormalized",
      "markGuardChecked",
      "markManualReviewRequired",
      "markRuntimeMutationBlocked",
      "markProcessedForAuditOnly",
      "markTerminalRejected",
      "getByIdempotencyKey",
      "getByProviderRefundId",
    ]);
  });
});
