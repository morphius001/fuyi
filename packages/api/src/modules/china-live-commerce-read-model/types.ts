export type ChinaLiveCommerceStatus =
  | "offline"
  | "scheduled"
  | "review_pending"
  | "previewing"
  | "live"
  | "replay_available"
  | "paused"
  | "suspended"
  | "ended";

export type ChinaLiveCommercePlacementKey =
  | "shop_card_badge"
  | "shop_home_status"
  | "vendor_preview"
  | "admin_review_queue"
  | "home_primary_entry";

export type ChinaLiveCommerceBoundaryKey =
  | "real_streaming"
  | "real_im"
  | "chatroom"
  | "gift_tipping"
  | "live_order"
  | "payment"
  | "refund"
  | "settlement"
  | "commission"
  | "permission"
  | "push_notification"
  | "fulfillment";

export type ChinaLiveCommerceSessionView = {
  sessionId?: string;
  sellerId: string;
  sellerName: string;
  marketId?: string;
  boothNo?: string;
  title?: string;
  status: ChinaLiveCommerceStatus;
  scheduledAt?: string;
  productRefs: string[];
  provider: "mock_live" | "none";
};

export type ChinaLiveCommercePlacementView = {
  key: ChinaLiveCommercePlacementKey;
  label: string;
  visible: boolean;
  reason: string;
};

export type ChinaLiveCommerceBoundaryView = {
  key: ChinaLiveCommerceBoundaryKey;
  status: "blocked_serial_work";
  reason: string;
};

export type ChinaLiveCommerceReadonlyView = {
  mode: "live_commerce_readonly_contract";
  source: "china_live_commerce_read_model";
  locale: "zh-CN";
  currency: "CNY";
  timezone: "Asia/Shanghai";
  session: ChinaLiveCommerceSessionView;
  placements: ChinaLiveCommercePlacementView[];
  highRiskBoundaries: ChinaLiveCommerceBoundaryView[];
  readOnly: true;
  runtimeEnabled: false;
  note: string;
};
