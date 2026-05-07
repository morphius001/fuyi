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
  | "command_prepared"
  | "command_skipped"
  | "command_blocked"
  | "workflow_execution_started"
  | "workflow_execution_succeeded"
  | "workflow_execution_failed"
  | "manual_review_required"
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

export type PaymentNotificationPaymentSessionSnapshot = {
  id: string;
  provider: string;
  amount: ChinaPaymentNotificationMoney;
  status: "pending" | "authorized" | "captured" | "failed" | "canceled";
  fetchedAt: string;
};

export type PaymentNotificationOrderSnapshot = {
  id: string;
  status:
    | "pending"
    | "completed"
    | "canceled"
    | "requires_action"
    | "refund_pending"
    | "refunded";
  fetchedAt: string;
};

export type PaymentNotificationStateGuardInput = {
  envelope: ChinaPaymentNotificationEnvelope;
  inboxRecord: PaymentNotificationInboxRecord;
  paymentSession?: PaymentNotificationPaymentSessionSnapshot;
  order?: PaymentNotificationOrderSnapshot;
};

export type PaymentNotificationStateGuardCommandType =
  | "capture_payment"
  | "close_payment"
  | "mark_failed"
  | "no_op";

export type PaymentNotificationStateGuardBlockType =
  | "invalid_signature"
  | "duplicate"
  | "amount_mismatch"
  | "currency_mismatch"
  | "provider_mismatch"
  | "state_conflict"
  | "unknown_reference"
  | "out_of_order"
  | "manual_review";

export type PaymentNotificationStateGuardResult =
  | {
      allowed: true;
      commandType: PaymentNotificationStateGuardCommandType;
      reason: string;
      auditMetadata: Record<string, unknown>;
    }
  | {
      allowed: false;
      blockType: PaymentNotificationStateGuardBlockType;
      retryable: boolean;
      reason: string;
      auditMetadata: Record<string, unknown>;
    };

export type PaymentWorkflowCommand =
  | {
      type: "no_op";
      reason: string;
      idempotencyKey: string;
      inboxId: string;
      auditMetadata: Record<string, unknown>;
    }
  | {
      type: "capture_payment";
      paymentSessionId: string;
      orderId: string;
      amount: ChinaPaymentNotificationMoney;
      idempotencyKey: string;
      inboxId: string;
      auditMetadata: Record<string, unknown>;
    }
  | {
      type: "close_payment";
      paymentSessionId: string;
      orderId: string;
      idempotencyKey: string;
      inboxId: string;
      auditMetadata: Record<string, unknown>;
    }
  | {
      type: "mark_failed";
      paymentSessionId: string;
      orderId: string;
      errorCode: string;
      idempotencyKey: string;
      inboxId: string;
      auditMetadata: Record<string, unknown>;
    };

export type PaymentWorkflowCommandDecision =
  | {
      executable: true;
      command: PaymentWorkflowCommand;
    }
  | {
      executable: false;
      reason: string;
      blockType: PaymentNotificationStateGuardBlockType;
      retryable: boolean;
      idempotencyKey: string;
      inboxId: string;
      auditMetadata: Record<string, unknown>;
    };

export type PaymentWorkflowCommandAuditEvent = {
  action: PaymentNotificationEventLogAction;
  actorType: "system";
  message: string;
  metadata: Record<string, unknown>;
};
