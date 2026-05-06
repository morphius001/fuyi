import {
  AddVendorProductDraftSuggestionInput,
  CreateVendorProductDraftInput,
  UpdateVendorProductDraftInput,
  VendorProductDraft,
  VendorProductDraftAuditAction,
  VendorProductDraftAuditRecord,
  VendorProductDraftStatus,
  VendorProductDraftSuggestion,
} from "./types";

const now = () => new Date().toISOString();

export class VendorProductDraftService {
  private readonly drafts = new Map<string, VendorProductDraft>();
  private readonly suggestions = new Map<string, VendorProductDraftSuggestion[]>();
  private readonly auditRecords: VendorProductDraftAuditRecord[] = [];
  private sequence = 0;

  createDraft(input: CreateVendorProductDraftInput) {
    const createdAt = now();
    const draft: VendorProductDraft = {
      id: this.nextId("draft"),
      sellerId: input.sellerId,
      marketId: input.marketId,
      membershipId: input.membershipId,
      source: input.source,
      status: "draft_created",
      title: input.title,
      specValues: {},
      pricePayload: {},
      fulfillmentHints: [],
      imageRefs: [],
      riskWarnings: [],
      createdBy: input.actorId,
      updatedBy: input.actorId,
      createdAt,
      updatedAt: createdAt,
    };

    this.drafts.set(draft.id, draft);
    this.audit(draft.id, input.actorId, "create", undefined, draft.status);

    return draft;
  }

  getDraft(draftId: string) {
    return this.drafts.get(draftId);
  }

  listDraftsBySeller(sellerId: string) {
    return Array.from(this.drafts.values()).filter(
      (draft) => draft.sellerId === sellerId
    );
  }

  updateDraft(input: UpdateVendorProductDraftInput) {
    const draft = this.requireDraft(input.draftId);

    if (draft.status === "cancelled") {
      throw new Error("CANCELLED_DRAFT_CANNOT_BE_UPDATED");
    }

    const updated: VendorProductDraft = {
      ...draft,
      ...input.patch,
      updatedBy: input.actorId,
      updatedAt: now(),
    };

    this.drafts.set(updated.id, updated);
    this.audit(updated.id, input.actorId, "update", draft.status, updated.status);

    return updated;
  }

  addSuggestion(input: AddVendorProductDraftSuggestionInput) {
    const draft = this.requireDraft(input.draftId);
    const suggestion: VendorProductDraftSuggestion = {
      ...input.suggestion,
      id: this.nextId("suggestion"),
      draftId: draft.id,
      createdAt: now(),
    };
    const suggestions = this.suggestions.get(draft.id) ?? [];

    this.suggestions.set(draft.id, [...suggestions, suggestion]);
    this.transition(draft.id, input.actorId, "ai_suggested", "suggest");

    return suggestion;
  }

  submitForReview(draftId: string, actorId: string) {
    return this.transition(
      draftId,
      actorId,
      "pending_platform_review",
      "submit_review"
    );
  }

  markReadyForProductCreate(draftId: string, actorId: string) {
    const draft = this.requireDraft(draftId);

    if (draft.status !== "pending_platform_review") {
      throw new Error("DRAFT_REVIEW_REQUIRED");
    }

    return this.transition(
      draftId,
      actorId,
      "ready_for_product_create",
      "mark_ready"
    );
  }

  cancelDraft(draftId: string, actorId: string, reason?: string) {
    return this.transition(draftId, actorId, "cancelled", "cancel", reason);
  }

  listSuggestions(draftId: string) {
    return this.suggestions.get(draftId) ?? [];
  }

  listAuditRecords(draftId?: string) {
    if (!draftId) {
      return [...this.auditRecords];
    }

    return this.auditRecords.filter((record) => record.draftId === draftId);
  }

  canCreateProduct(_draftId: string) {
    return false;
  }

  private transition(
    draftId: string,
    actorId: string,
    status: VendorProductDraftStatus,
    action: VendorProductDraftAuditAction,
    reason?: string
  ) {
    const draft = this.requireDraft(draftId);
    const updated: VendorProductDraft = {
      ...draft,
      status,
      updatedBy: actorId,
      updatedAt: now(),
    };

    this.drafts.set(draftId, updated);
    this.audit(draftId, actorId, action, draft.status, status, reason);

    return updated;
  }

  private requireDraft(draftId: string) {
    const draft = this.drafts.get(draftId);

    if (!draft) {
      throw new Error("DRAFT_NOT_FOUND");
    }

    return draft;
  }

  private audit(
    draftId: string,
    actorId: string,
    action: VendorProductDraftAuditAction,
    beforeStatus: VendorProductDraftStatus | undefined,
    afterStatus: VendorProductDraftStatus,
    reason?: string
  ) {
    this.auditRecords.push({
      id: this.nextId("audit"),
      draftId,
      actorId,
      action,
      beforeStatus,
      afterStatus,
      reason,
      createdAt: now(),
    });
  }

  private nextId(prefix: string) {
    this.sequence += 1;
    return `${prefix}_${this.sequence}`;
  }
}
