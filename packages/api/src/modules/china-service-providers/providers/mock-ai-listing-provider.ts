import {
  AiListingProvider,
  ListingDraft,
  ListingDraftInput,
  ListingDraftResult,
  ValidateListingDraftInput,
} from "../types";
import { nowIso, providerError, stableMockId } from "../utils";

export class MockAiListingProvider implements AiListingProvider {
  private readonly draftsById = new Map<string, ListingDraft>();
  private readonly resultsByIdempotencyKey = new Map<
    string,
    ListingDraftResult
  >();

  async createListingDraft(
    input: ListingDraftInput,
  ): Promise<ListingDraftResult> {
    const replayed = this.resultsByIdempotencyKey.get(input.idempotencyKey);

    if (replayed) {
      return { ...replayed, replayed: true };
    }

    if (input.source === "text" && !input.text?.trim()) {
      throw providerError(
        "INVALID_INPUT",
        "Text listing draft requires a prompt.",
        false,
      );
    }

    if ((input.source === "voice" || input.source === "image") && !input.objectKey) {
      throw providerError(
        "INVALID_INPUT",
        "Voice and image listing drafts require an object key reference.",
        false,
      );
    }

    const draftId = stableMockId("mock_listing_draft", [
      input.vendorId,
      input.marketId,
      input.source,
      input.idempotencyKey,
    ]);
    const lowConfidence = input.simulateLowConfidence === true;
    const draft: ListingDraft = {
      draftId,
      vendorId: input.vendorId,
      marketId: input.marketId,
      source: input.source,
      status: lowConfidence ? "needs_review" : "draft",
      title: this.inferTitle(input),
      category: input.text?.includes("冰袋") ? "市场物料" : "鲜活水产",
      unit: input.text?.includes("箱") ? "箱" : "斤",
      suggestedPriceText: this.inferPriceText(input),
      stockText: input.text?.includes("36") ? "今日到货 36 筐" : "库存待商户确认",
      fulfillmentNotes: [
        "market pickup or local delivery must be confirmed by merchant",
        "mock AI output cannot publish products directly",
      ],
      warnings: [
        "mock draft only",
        "merchant confirmation required before any future listing action",
        ...(lowConfidence ? ["low confidence mock review required"] : []),
      ],
      createdAt: nowIso(),
    };
    const result: ListingDraftResult = {
      draft,
      replayed: false,
    };

    this.draftsById.set(draftId, draft);
    this.resultsByIdempotencyKey.set(input.idempotencyKey, result);

    return result;
  }

  async validateDraftForMerchantConfirmation(
    input: ValidateListingDraftInput,
  ): Promise<{ draft: ListingDraft; warnings: string[] }> {
    const draft = this.draftsById.get(input.draftId);

    if (!draft) {
      throw providerError("NOT_FOUND", "Mock listing draft does not exist.", false, {
        draftId: input.draftId,
      });
    }

    return {
      draft,
      warnings: [
        ...draft.warnings,
        "validation is mock-only and does not check real food safety credentials",
      ],
    };
  }

  private inferTitle(input: ListingDraftInput): string {
    if (input.text?.includes("冰袋")) {
      return "市场物料冰袋草稿";
    }

    if (input.text?.includes("梭子蟹")) {
      return "三门梭子蟹草稿";
    }

    if (input.source === "voice") {
      return "语音识别商品草稿";
    }

    if (input.source === "image") {
      return "图片识别商品草稿";
    }

    return "一句话上架商品草稿";
  }

  private inferPriceText(input: ListingDraftInput): string {
    const match = input.text?.match(/(\d+(?:\.\d+)?)\s*元/);
    return match ? `建议价 ${match[1]} 元` : "价格待商户确认";
  }
}
