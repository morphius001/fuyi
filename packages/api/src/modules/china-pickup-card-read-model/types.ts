export type ChinaPickupCardConsumerStepKey =
  | "entry"
  | "credential_input"
  | "entitlement_preview"
  | "option_confirmation"
  | "contact_and_address"
  | "redemption_submit"
  | "fulfillment_tracking";

export type ChinaPickupCardEntitlementMode = "fixed" | "choice" | "bundle";

export type ChinaPickupCardFulfillmentMode =
  | "ship_to_address"
  | "market_pickup"
  | "seller_pickup";

export type ChinaPickupCardConsumerStatus =
  | "pending_confirmation"
  | "preparing"
  | "pending_shipment"
  | "shipped"
  | "pending_pickup"
  | "redeemed"
  | "signed"
  | "exception"
  | "closed";

export type ChinaPickupCardBoundaryKey =
  | "payment_provider"
  | "coupon_promotion"
  | "gift_card_store_credit"
  | "cart_total"
  | "order_paid_state"
  | "refund"
  | "settlement"
  | "commission"
  | "permission"
  | "fulfillment_creation"
  | "real_card_secret"
  | "real_qr_token";

export type ChinaPickupCardConsumerStepView = {
  key: ChinaPickupCardConsumerStepKey;
  label: string;
  description: string;
  createsPayment: false;
  createsOrder: false;
};

export type ChinaPickupCardEntitlementView = {
  mode: ChinaPickupCardEntitlementMode;
  label: string;
  allowsCatalogSubstitution: false;
  convertsToBalance: false;
  appliesToCartTotal: false;
};

export type ChinaPickupCardFulfillmentRequirementView = {
  mode: ChinaPickupCardFulfillmentMode;
  label: string;
  requiresContact: true;
  requiresMainlandMobile: true;
  requiresChinaAddress: boolean;
  requiresPickupTime: boolean;
};

export type ChinaPickupCardConsumerStatusView = {
  status: ChinaPickupCardConsumerStatus;
  label: string;
  paymentStatusImpact: "none";
};

export type ChinaPickupCardBoundaryView = {
  key: ChinaPickupCardBoundaryKey;
  status: "blocked_serial_work";
  reason: string;
};

export type ChinaPickupCardConsumerFlowView = {
  mode: "pickup_card_consumer_flow_contract";
  source: "china_pickup_card_read_model";
  locale: "zh-CN";
  currency: "CNY";
  timezone: "Asia/Shanghai";
  steps: ChinaPickupCardConsumerStepView[];
  entitlements: ChinaPickupCardEntitlementView[];
  fulfillmentRequirements: ChinaPickupCardFulfillmentRequirementView[];
  consumerStatuses: ChinaPickupCardConsumerStatusView[];
  highRiskBoundaries: ChinaPickupCardBoundaryView[];
  readOnly: true;
  runtimeEnabled: false;
  note: string;
};
