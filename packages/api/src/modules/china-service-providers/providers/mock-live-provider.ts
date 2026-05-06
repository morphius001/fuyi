import {
  CreateLiveSessionInput,
  CreateLiveSessionResult,
  EndLiveSessionInput,
  EndLiveSessionResult,
  ListLiveSessionsInput,
  LiveProvider,
  LiveSessionRecord,
  StartLivePreviewInput,
  StartLivePreviewResult,
} from "../types";
import { nowIso, providerError, stableMockId } from "../utils";

export class MockLiveProvider implements LiveProvider {
  private readonly sessionsById = new Map<string, LiveSessionRecord>();
  private readonly createResultsByIdempotencyKey = new Map<
    string,
    CreateLiveSessionResult
  >();
  private readonly endResultsByIdempotencyKey = new Map<
    string,
    EndLiveSessionResult
  >();

  async createLiveSession(
    input: CreateLiveSessionInput,
  ): Promise<CreateLiveSessionResult> {
    const replayed = this.createResultsByIdempotencyKey.get(
      input.idempotencyKey,
    );

    if (replayed) {
      return { ...replayed, replayed: true };
    }

    if (input.simulateReviewReject) {
      const rejected: CreateLiveSessionResult = {
        sessionId: stableMockId("mock_live", [input.idempotencyKey]),
        status: "rejected",
        replayed: false,
      };
      this.createResultsByIdempotencyKey.set(input.idempotencyKey, rejected);
      return rejected;
    }

    const sessionId = stableMockId("mock_live", [
      input.marketId,
      input.vendorId,
      input.title,
      input.idempotencyKey,
    ]);
    const timestamp = nowIso();
    const session: LiveSessionRecord = {
      sessionId,
      marketId: input.marketId,
      vendorId: input.vendorId,
      ...(input.stallNo ? { stallNo: input.stallNo } : {}),
      title: input.title,
      productRefs: input.productRefs ?? [],
      status: "review_pending",
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    const result: CreateLiveSessionResult = {
      sessionId,
      status: session.status,
      replayed: false,
    };

    this.sessionsById.set(sessionId, session);
    this.createResultsByIdempotencyKey.set(input.idempotencyKey, result);

    return result;
  }

  async startLivePreview(
    input: StartLivePreviewInput,
  ): Promise<StartLivePreviewResult> {
    const session = this.sessionsById.get(input.sessionId);

    if (!session) {
      throw providerError("NOT_FOUND", "Mock live session does not exist.", false, {
        sessionId: input.sessionId,
      });
    }

    if (session.status === "ended" || session.status === "rejected") {
      throw providerError(
        "INVALID_INPUT",
        "Mock live session cannot enter preview from its current status.",
        false,
        {
          status: session.status,
        },
      );
    }

    session.status = "previewing";
    session.updatedAt = nowIso();

    return {
      sessionId: session.sessionId,
      status: "previewing",
      previewObjectKey: `mock-live/previews/${session.sessionId}.html`,
      warnings: [
        "mock live preview only",
        "no real stream, IM, payment, or settlement behavior",
      ],
    };
  }

  async endLiveSession(
    input: EndLiveSessionInput,
  ): Promise<EndLiveSessionResult> {
    const replayed = this.endResultsByIdempotencyKey.get(input.idempotencyKey);

    if (replayed) {
      return { ...replayed, replayed: true };
    }

    const session = this.sessionsById.get(input.sessionId);

    if (!session) {
      throw providerError("NOT_FOUND", "Mock live session does not exist.", false, {
        sessionId: input.sessionId,
      });
    }

    session.status = "ended";
    session.updatedAt = nowIso();
    const result: EndLiveSessionResult = {
      sessionId: session.sessionId,
      status: "ended",
      replayed: false,
    };
    this.endResultsByIdempotencyKey.set(input.idempotencyKey, result);

    return result;
  }

  async listLiveSessions(
    input: ListLiveSessionsInput = {},
  ): Promise<{ sessions: LiveSessionRecord[] }> {
    const sessions = [...this.sessionsById.values()].filter((session) => {
      return (
        (!input.marketId || session.marketId === input.marketId) &&
        (!input.vendorId || session.vendorId === input.vendorId) &&
        (!input.status || session.status === input.status)
      );
    });

    return {
      sessions,
    };
  }
}
