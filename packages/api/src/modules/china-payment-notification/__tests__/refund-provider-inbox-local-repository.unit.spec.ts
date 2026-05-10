import { InMemoryRefundProviderInboxRouteRepository } from "../refund-provider-inbox-local-repository";
import { ChinaPaymentNotificationEnvelope } from "../types";

const envelope = (
  idempotencyKey = "refund_notify:wechat_pay:evt_local_repo_001",
  rawPayloadDigest = "digest_001",
): ChinaPaymentNotificationEnvelope => ({
  provider: "wechat_pay",
  eventId: "evt_local_repo_001",
  eventType: "refund.succeeded",
  providerTransactionId: "txn_001",
  providerRefundId: "refund_provider_001",
  merchantOrderRef: "pay_order_001",
  amount: {
    value: 128560,
    currency: "CNY",
  },
  receivedAt: "2026-05-10T00:00:00.000Z",
  idempotencyKey,
  signature: {
    status: "verified",
    verifiedAt: "2026-05-10T00:00:00.000Z",
  },
  rawPayloadDigest,
  riskFlags: [],
});

describe("InMemoryRefundProviderInboxRouteRepository", () => {
  it("receives and marks local inbox records without executable semantics", async () => {
    const repository = new InMemoryRefundProviderInboxRouteRepository();
    const received = await repository.receiveNotification({
      envelope: envelope(),
      receivedAt: "2026-05-10T00:00:00.000Z",
      sanitizedMetadata: {
        localWiring: true,
      },
    });

    expect(received).toMatchObject({
      status: "received",
      fixtureOnly: true,
      executable: false,
    });

    await repository.markSignatureVerified(received.record.idempotencyKey);
    await repository.markNormalized(received.record.idempotencyKey);
    const blocked = await repository.markRuntimeMutationBlocked({
      idempotencyKey: received.record.idempotencyKey,
      reason: "local wiring only",
    });

    expect(blocked).toMatchObject({
      processingStatus: "runtime_mutation_blocked",
      provider: "wechat_pay",
      eventType: "refund.succeeded",
    });
  });

  it("classifies same digest replay and different digest conflict", async () => {
    const repository = new InMemoryRefundProviderInboxRouteRepository();

    await repository.receiveNotification({
      envelope: envelope(),
      receivedAt: "2026-05-10T00:00:00.000Z",
      sanitizedMetadata: {},
    });

    await expect(
      repository.receiveNotification({
        envelope: envelope(),
        receivedAt: "2026-05-10T00:00:00.000Z",
        sanitizedMetadata: {},
      }),
    ).resolves.toMatchObject({
      status: "duplicate_same_digest",
      fixtureOnly: true,
      executable: false,
    });

    await expect(
      repository.receiveNotification({
        envelope: envelope(
          "refund_notify:wechat_pay:evt_local_repo_001",
          "digest_conflict",
        ),
        receivedAt: "2026-05-10T00:00:00.000Z",
        sanitizedMetadata: {},
      }),
    ).resolves.toMatchObject({
      status: "duplicate_digest_conflict",
      fixtureOnly: true,
      executable: false,
    });
  });
});
