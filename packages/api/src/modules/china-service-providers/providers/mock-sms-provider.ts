import {
  SendSmsInput,
  SendSmsResult,
  SmsAuditRecord,
  SmsProvider,
  ProviderResultStatus,
} from "../types";
import {
  maskMainlandMobile,
  nowIso,
  providerError,
  stableMockId,
} from "../utils";

type MockSmsProviderOptions = {
  maxAttemptsPerMobileScene?: number;
  defaultStatus?: ProviderResultStatus;
};

export class MockSmsProvider implements SmsProvider {
  private readonly maxAttemptsPerMobileScene: number;
  private readonly defaultStatus: ProviderResultStatus;
  private readonly auditRecords: SmsAuditRecord[] = [];
  private readonly resultsByIdempotencyKey = new Map<string, SendSmsResult>();
  private readonly deliveryStatusByMessageId = new Map<string, SendSmsResult>();
  private readonly attemptsByMobileScene = new Map<string, number>();

  constructor(options: MockSmsProviderOptions = {}) {
    this.maxAttemptsPerMobileScene = options.maxAttemptsPerMobileScene ?? 5;
    this.defaultStatus = options.defaultStatus ?? "queued";
  }

  async sendSms(input: SendSmsInput): Promise<SendSmsResult> {
    const replayed = this.resultsByIdempotencyKey.get(input.idempotencyKey);

    if (replayed) {
      return { ...replayed, replayed: true };
    }

    const maskedMobile = maskMainlandMobile(input.mobile);
    const attemptKey = `${maskedMobile}:${input.scene}`;
    const attempts = (this.attemptsByMobileScene.get(attemptKey) ?? 0) + 1;
    this.attemptsByMobileScene.set(attemptKey, attempts);

    const providerMessageId = stableMockId("mock_sms", [
      input.idempotencyKey,
      input.businessKey,
    ]);
    const limited = attempts > this.maxAttemptsPerMobileScene;
    const status: ProviderResultStatus =
      input.simulateFailure || limited ? "failed" : this.defaultStatus;
    const reason = input.simulateFailure
      ? providerError(
          "PROVIDER_UNAVAILABLE",
          "Mock SMS provider simulated a send failure.",
          true,
        )
      : limited
        ? providerError(
            "RATE_LIMITED",
            "Mock SMS provider rate limit exceeded.",
            true,
            {
              maxAttemptsPerMobileScene: this.maxAttemptsPerMobileScene,
            },
          )
        : undefined;
    const result: SendSmsResult = {
      providerMessageId,
      status,
      ...(reason ? { reason } : {}),
      replayed: false,
    };

    this.resultsByIdempotencyKey.set(input.idempotencyKey, result);
    this.deliveryStatusByMessageId.set(providerMessageId, result);
    this.auditRecords.push({
      providerMessageId,
      maskedMobile,
      templateId: input.templateId,
      scene: input.scene,
      businessKey: input.businessKey,
      idempotencyKey: input.idempotencyKey,
      status,
      ...(reason ? { reason } : {}),
      createdAt: nowIso(),
    });

    return result;
  }

  async getDeliveryStatus(input: { providerMessageId: string }): Promise<{
    status: ProviderResultStatus;
    reason?: SendSmsResult["reason"];
  }> {
    const result = this.deliveryStatusByMessageId.get(input.providerMessageId);

    if (!result) {
      return {
        status: "failed",
        reason: providerError(
          "NOT_FOUND",
          "Mock SMS message does not exist.",
          false,
          {
            providerMessageId: input.providerMessageId,
          },
        ),
      };
    }

    return {
      status: result.status,
      ...(result.reason ? { reason: result.reason } : {}),
    };
  }

  listAuditRecords(): SmsAuditRecord[] {
    return [...this.auditRecords];
  }
}
