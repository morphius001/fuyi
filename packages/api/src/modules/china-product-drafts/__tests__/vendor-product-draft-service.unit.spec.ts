import { VendorProductDraftService } from "..";

describe("VendorProductDraftService skeleton", () => {
  it("creates and updates drafts without allowing product creation", () => {
    const service = new VendorProductDraftService();
    const draft = service.createDraft({
      sellerId: "sel_1",
      marketId: "market_sanmen",
      actorId: "user_1",
      source: "mobile_form",
      title: "鲜活梭子蟹",
    });
    const updated = service.updateDraft({
      draftId: draft.id,
      actorId: "user_1",
      patch: {
        salesUnit: "斤",
        priceUnit: "斤",
        stockText: "剩36筐",
        specValues: {
          size: "3-5两/只",
        },
        pricePayload: {
          type: "range",
          min: 68,
          max: 82,
          unit: "斤",
        },
      },
    });

    expect(updated).toMatchObject({
      title: "鲜活梭子蟹",
      salesUnit: "斤",
      pricePayload: {
        min: 68,
        max: 82,
      },
    });
    expect(service.canCreateProduct(draft.id)).toBe(false);
    expect(service.listDraftsBySeller("sel_1")).toHaveLength(1);
  });

  it("stores AI suggestions separately from merchant-confirmed draft fields", () => {
    const service = new VendorProductDraftService();
    const draft = service.createDraft({
      sellerId: "sel_1",
      actorId: "user_1",
      source: "ai_text",
    });
    const suggestion = service.addSuggestion({
      draftId: draft.id,
      actorId: "user_1",
      suggestion: {
        provider: "mock_ai_listing",
        sourceType: "ai_text",
        sourceDigest: "sha256:demo",
        confidence: 0.82,
        warnings: [],
        suggestedFields: {
          title: "鲜活梭子蟹",
          stockText: "剩36筐",
        },
      },
    });
    const savedDraft = service.getDraft(draft.id);

    expect(suggestion).toMatchObject({
      provider: "mock_ai_listing",
      draftId: draft.id,
    });
    expect(savedDraft).toMatchObject({
      status: "ai_suggested",
      title: undefined,
    });
    expect(service.listSuggestions(draft.id)).toHaveLength(1);
  });

  it("requires review before marking a draft ready and still never creates products", () => {
    const service = new VendorProductDraftService();
    const draft = service.createDraft({
      sellerId: "sel_1",
      actorId: "user_1",
      source: "mobile_form",
    });

    expect(() =>
      service.markReadyForProductCreate(draft.id, "operator_1")
    ).toThrow("DRAFT_REVIEW_REQUIRED");

    service.submitForReview(draft.id, "user_1");
    const ready = service.markReadyForProductCreate(draft.id, "operator_1");

    expect(ready.status).toBe("ready_for_product_create");
    expect(service.canCreateProduct(draft.id)).toBe(false);
    expect(service.listAuditRecords(draft.id).map((record) => record.action)).toEqual([
      "create",
      "submit_review",
      "mark_ready",
    ]);
  });
});
