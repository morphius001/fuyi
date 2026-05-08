export type VendorProductDraftSource =
  | "mobile_form"
  | "pc_form"
  | "ai_text"
  | "ai_voice"
  | "ai_image"
  | "template_copy";

export type VendorProductDraftStatus =
  | "draft_created"
  | "ai_suggested"
  | "merchant_reviewing"
  | "pending_platform_review"
  | "ready_for_product_create"
  | "rejected"
  | "cancelled";

export type VendorProductDraftSpecValues = Record<
  string,
  string | number | boolean | null
>;

export type VendorProductDraftPricePayload = {
  type?: "fixed" | "range" | "market" | "ladder" | "weighed";
  min?: number;
  max?: number;
  amount?: number;
  unit?: string;
  note?: string;
};

export type VendorProductDraft = {
  id: string;
  sellerId: string;
  marketId?: string;
  membershipId?: string;
  source: VendorProductDraftSource;
  status: VendorProductDraftStatus;
  title?: string;
  categoryId?: string;
  specTemplateId?: string;
  specValues: VendorProductDraftSpecValues;
  pricePayload: VendorProductDraftPricePayload;
  salesUnit?: string;
  priceUnit?: string;
  stockUnit?: string;
  packageUnit?: string;
  stockText?: string;
  fulfillmentHints: string[];
  imageRefs: string[];
  aiTraceId?: string;
  riskWarnings: string[];
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
};

export type VendorProductDraftSuggestion = {
  id: string;
  draftId: string;
  provider: "mock_ai_listing";
  sourceType: VendorProductDraftSource;
  sourceDigest: string;
  suggestedFields: Partial<
    Pick<
      VendorProductDraft,
      | "title"
      | "categoryId"
      | "specTemplateId"
      | "specValues"
      | "pricePayload"
      | "salesUnit"
      | "priceUnit"
      | "stockUnit"
      | "stockText"
      | "fulfillmentHints"
      | "riskWarnings"
    >
  >;
  confidence: number;
  warnings: string[];
  createdAt: string;
};

export type VendorProductDraftAuditAction =
  | "create"
  | "update"
  | "suggest"
  | "submit_review"
  | "mark_ready"
  | "reject"
  | "cancel";

export type VendorProductDraftAuditRecord = {
  id: string;
  draftId: string;
  actorId: string;
  action: VendorProductDraftAuditAction;
  beforeStatus?: VendorProductDraftStatus;
  afterStatus: VendorProductDraftStatus;
  reason?: string;
  createdAt: string;
};

export type CreateVendorProductDraftInput = {
  sellerId: string;
  actorId: string;
  source: VendorProductDraftSource;
  marketId?: string;
  membershipId?: string;
  title?: string;
};

export type UpdateVendorProductDraftInput = {
  draftId: string;
  actorId: string;
  patch: Partial<
    Pick<
      VendorProductDraft,
      | "title"
      | "categoryId"
      | "specTemplateId"
      | "specValues"
      | "pricePayload"
      | "salesUnit"
      | "priceUnit"
      | "stockUnit"
      | "packageUnit"
      | "stockText"
      | "fulfillmentHints"
      | "imageRefs"
      | "riskWarnings"
    >
  >;
};

export type AddVendorProductDraftSuggestionInput = {
  draftId: string;
  actorId: string;
  suggestion: Omit<VendorProductDraftSuggestion, "id" | "draftId" | "createdAt">;
};

export type VendorMobileDraftFieldKey =
  | "title"
  | "category_id"
  | "spec_template_id"
  | "price_payload"
  | "sales_unit"
  | "stock_text"
  | "image_refs"
  | "fulfillment_hints";

export type VendorMobileDraftFieldSource =
  | "merchant_input"
  | "spec_template_readonly"
  | "ai_suggestion"
  | "market_context_readonly";

export type VendorMobileDraftContractFieldView = {
  key: VendorMobileDraftFieldKey;
  label: string;
  requiredForMobileSave: boolean;
  source: VendorMobileDraftFieldSource;
  merchantConfirmRequired: boolean;
};

export type VendorMobileDraftContractStageKey =
  | "mobile_capture"
  | "draft_saved"
  | "ai_suggested"
  | "merchant_reviewing"
  | "pending_platform_review"
  | "ready_for_product_create";

export type VendorMobileDraftContractStageView = {
  key: VendorMobileDraftContractStageKey;
  label: string;
  createsProduct: false;
  createsInventory: false;
  requiresAudit: boolean;
};

export type VendorMobileDraftContractBoundaryKey =
  | "real_product_creation"
  | "inventory_initialization"
  | "product_publish"
  | "real_ai_provider"
  | "wechat_integration"
  | "order"
  | "payment"
  | "refund"
  | "settlement"
  | "commission"
  | "permission"
  | "fulfillment";

export type VendorMobileDraftContractBoundaryView = {
  key: VendorMobileDraftContractBoundaryKey;
  status: "blocked_serial_work";
  reason: string;
};

export type VendorMobileDraftProductContractView = {
  mode: "vendor_mobile_draft_product_contract_read_only";
  source: "china_product_drafts";
  locale: "zh-CN";
  currency: "CNY";
  timezone: "Asia/Shanghai";
  fields: VendorMobileDraftContractFieldView[];
  stages: VendorMobileDraftContractStageView[];
  highRiskBoundaries: VendorMobileDraftContractBoundaryView[];
  readOnly: true;
  runtimeEnabled: false;
  note: string;
};
