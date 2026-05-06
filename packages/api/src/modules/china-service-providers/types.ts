export type MockProviderErrorCode =
  | "INVALID_INPUT"
  | "IDEMPOTENT_REPLAY"
  | "RATE_LIMITED"
  | "PROVIDER_UNAVAILABLE"
  | "NOT_FOUND"
  | "CANCELED"
  | "REVIEW_REQUIRED"
  | "LOW_CONFIDENCE";

export type MockProviderError = {
  code: MockProviderErrorCode;
  message: string;
  retryable: boolean;
  details?: Record<string, unknown>;
};

export type ProviderResultStatus = "queued" | "sent" | "failed";

export type AttachmentReference = {
  objectKey: string;
  contentType?: string;
  fileName?: string;
};

export type ConversationParticipant = {
  id: string;
  type: "customer" | "seller" | "operator";
  displayName?: string;
};

export type CreateConversationInput = {
  participants: ConversationParticipant[];
  contextKey: string;
  idempotencyKey?: string;
};

export type CreateConversationResult = {
  conversationId: string;
  replayed: boolean;
};

export type SendMessageInput = {
  conversationId: string;
  senderId: string;
  body: string;
  attachments?: AttachmentReference[];
  idempotencyKey?: string;
  simulateFailure?: boolean;
};

export type SendMessageResult = {
  messageId: string;
  status: "sent" | "failed";
  reason?: MockProviderError;
  replayed: boolean;
};

export type ChatMessage = {
  messageId: string;
  conversationId: string;
  senderId: string;
  body: string;
  attachments: AttachmentReference[];
  createdAt: string;
};

export type ListMessagesInput = {
  conversationId: string;
};

export type UnreadCountInput = {
  conversationId: string;
  participantId: string;
};

export type ChatProvider = {
  createOrGetConversation(
    input: CreateConversationInput,
  ): Promise<CreateConversationResult>;
  sendMessage(input: SendMessageInput): Promise<SendMessageResult>;
  listMessages(input: ListMessagesInput): Promise<{ messages: ChatMessage[] }>;
  getUnreadCount(input: UnreadCountInput): Promise<{ count: number }>;
};

export type SendSmsInput = {
  mobile: string;
  templateId: string;
  scene: "verification" | "order_notice" | "after_sales" | "marketing";
  variables?: Record<string, string>;
  businessKey: string;
  idempotencyKey: string;
  simulateFailure?: boolean;
};

export type SendSmsResult = {
  providerMessageId: string;
  status: ProviderResultStatus;
  reason?: MockProviderError;
  replayed: boolean;
};

export type DeliveryStatusInput = {
  providerMessageId: string;
};

export type SmsAuditRecord = {
  providerMessageId: string;
  maskedMobile: string;
  templateId: string;
  scene: SendSmsInput["scene"];
  businessKey: string;
  idempotencyKey: string;
  status: ProviderResultStatus;
  reason?: MockProviderError;
  createdAt: string;
};

export type SmsProvider = {
  sendSms(input: SendSmsInput): Promise<SendSmsResult>;
  getDeliveryStatus(
    input: DeliveryStatusInput,
  ): Promise<{ status: ProviderResultStatus; reason?: MockProviderError }>;
  listAuditRecords(): SmsAuditRecord[];
};

export type CarrierCode = "SF" | "ZTO" | "YTO" | "STO" | "YUNDA";

export type CreateShipmentInput = {
  orderId: string;
  fulfillmentId: string;
  carrierCode: CarrierCode;
  recipientMobile: string;
  recipientAddressDigest: string;
  idempotencyKey: string;
  simulateFailure?: boolean;
};

export type CreateShipmentResult = {
  shipmentId: string;
  trackingNo: string;
  carrierCode: CarrierCode;
  labelObjectKey: string;
  replayed: boolean;
};

export type TrackingStatus =
  | "created"
  | "picked_up"
  | "in_transit"
  | "exception"
  | "delivered"
  | "canceled";

export type TrackingEvent = {
  status: TrackingStatus;
  occurredAt: string;
  description: string;
  proofObjectKey?: string;
};

export type TrackingInput = {
  trackingNo: string;
};

export type CancelShipmentInput = {
  shipmentId: string;
  idempotencyKey: string;
};

export type CancelShipmentResult = {
  canceled: boolean;
  replayed: boolean;
  reason?: MockProviderError;
};

export type LogisticsProvider = {
  createShipment(input: CreateShipmentInput): Promise<CreateShipmentResult>;
  getTracking(input: TrackingInput): Promise<{ events: TrackingEvent[] }>;
  cancelShipment(input: CancelShipmentInput): Promise<CancelShipmentResult>;
};

export type LiveSessionStatus =
  | "draft"
  | "review_pending"
  | "scheduled"
  | "previewing"
  | "live"
  | "ended"
  | "rejected";

export type CreateLiveSessionInput = {
  marketId: string;
  vendorId: string;
  stallNo?: string;
  title: string;
  productRefs?: string[];
  idempotencyKey: string;
  simulateReviewReject?: boolean;
};

export type CreateLiveSessionResult = {
  sessionId: string;
  status: LiveSessionStatus;
  replayed: boolean;
};

export type StartLivePreviewInput = {
  sessionId: string;
};

export type StartLivePreviewResult = {
  sessionId: string;
  status: "previewing";
  previewObjectKey: string;
  warnings: string[];
};

export type EndLiveSessionInput = {
  sessionId: string;
  idempotencyKey: string;
};

export type EndLiveSessionResult = {
  sessionId: string;
  status: "ended";
  replayed: boolean;
};

export type LiveSessionRecord = {
  sessionId: string;
  marketId: string;
  vendorId: string;
  stallNo?: string;
  title: string;
  productRefs: string[];
  status: LiveSessionStatus;
  createdAt: string;
  updatedAt: string;
};

export type ListLiveSessionsInput = {
  marketId?: string;
  vendorId?: string;
  status?: LiveSessionStatus;
};

export type LiveProvider = {
  createLiveSession(
    input: CreateLiveSessionInput,
  ): Promise<CreateLiveSessionResult>;
  startLivePreview(
    input: StartLivePreviewInput,
  ): Promise<StartLivePreviewResult>;
  endLiveSession(input: EndLiveSessionInput): Promise<EndLiveSessionResult>;
  listLiveSessions(
    input?: ListLiveSessionsInput,
  ): Promise<{ sessions: LiveSessionRecord[] }>;
};

export type ListingDraftSource = "text" | "voice" | "image";

export type ListingDraftStatus = "draft" | "needs_review";

export type ListingDraftInput = {
  vendorId: string;
  marketId: string;
  source: ListingDraftSource;
  text?: string;
  objectKey?: string;
  idempotencyKey: string;
  simulateLowConfidence?: boolean;
};

export type ListingDraft = {
  draftId: string;
  vendorId: string;
  marketId: string;
  source: ListingDraftSource;
  status: ListingDraftStatus;
  title: string;
  category: string;
  unit: string;
  suggestedPriceText: string;
  stockText: string;
  fulfillmentNotes: string[];
  warnings: string[];
  createdAt: string;
};

export type ListingDraftResult = {
  draft: ListingDraft;
  replayed: boolean;
};

export type ValidateListingDraftInput = {
  draftId: string;
};

export type AiListingProvider = {
  createListingDraft(input: ListingDraftInput): Promise<ListingDraftResult>;
  validateDraftForMerchantConfirmation(
    input: ValidateListingDraftInput,
  ): Promise<{ draft: ListingDraft; warnings: string[] }>;
};
