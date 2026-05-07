export type ChinaPaymentNotificationProvider =
  | "mock_china_pay"
  | "alipay"
  | "wechat_pay"
  | string;

export type ChinaPaymentNotificationEventType =
  | "payment.succeeded"
  | "payment.closed"
  | "payment.failed"
  | "refund.succeeded"
  | "refund.failed"
  | "reconciliation.adjusted";

export type ChinaPaymentNotificationSignatureStatus =
  | "verified"
  | "invalid"
  | "missing"
  | "unsupported";

export type ChinaPaymentNotificationSignatureResult = {
  status: ChinaPaymentNotificationSignatureStatus;
  algorithm?: string;
  keyId?: string;
  verifiedAt?: string;
  failureCode?: string;
  failureMessage?: string;
};

export type ChinaPaymentNotificationMoney = {
  value: number;
  currency: "CNY";
};

export type ChinaPaymentNotificationEnvelope = {
  provider: ChinaPaymentNotificationProvider;
  eventId: string;
  eventType: ChinaPaymentNotificationEventType;
  providerTransactionId?: string;
  providerRefundId?: string;
  merchantOrderRef: string;
  paymentSessionId?: string;
  amount: ChinaPaymentNotificationMoney;
  occurredAt?: string;
  receivedAt: string;
  idempotencyKey: string;
  signature: ChinaPaymentNotificationSignatureResult;
  rawPayloadDigest: string;
  riskFlags: string[];
};

export type MockChinaPaymentNotificationPayload = {
  event_id?: string;
  event_type: ChinaPaymentNotificationEventType;
  merchant_order_ref?: string;
  payment_session_id?: string;
  provider_transaction_id?: string;
  provider_refund_id?: string;
  amount: number;
  currency: "CNY";
  occurred_at?: string;
};

export type MockSignatureHeaders = {
  signature?: string;
  eventId?: string;
  timestamp?: string;
  keyId?: string;
};

export type VerifyMockPaymentSignatureInput = {
  rawBody: string;
  headers: MockSignatureHeaders;
  secret: string;
  receivedAt?: string;
};

export type NormalizeMockPaymentNotificationInput = {
  rawBody: string;
  headers: MockSignatureHeaders;
  secret: string;
  receivedAt?: string;
  expectedAmount?: ChinaPaymentNotificationMoney;
};

export type PaymentNotificationProcessingStatus =
  | "received"
  | "verified"
  | "processing"
  | "processed"
  | "retryable_failed"
  | "terminal_failed"
  | "ignored_duplicate";

export type PaymentNotificationInboxRecord = {
  id: string;
  envelope: ChinaPaymentNotificationEnvelope;
  processingStatus: PaymentNotificationProcessingStatus;
  retryCount: number;
  lastErrorCode?: string;
  lastErrorMessage?: string;
  createdAt: string;
  updatedAt: string;
  processedAt?: string;
};

export type PaymentNotificationEventLogAction =
  | "received"
  | "verified"
  | "dedupe_hit"
  | "handler_started"
  | "processed"
  | "retry_scheduled"
  | "failed";

export type PaymentNotificationEventLogRecord = {
  id: string;
  inboxId: string;
  action: PaymentNotificationEventLogAction;
  actorType: "system" | "provider" | "operator";
  message: string;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type ReceivePaymentNotificationResult = {
  record: PaymentNotificationInboxRecord;
  replayed: boolean;
};
