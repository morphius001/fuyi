export type ChinaShopDecorationStatus =
  | "empty"
  | "draft"
  | "pending_review"
  | "published"
  | "taken_down";

export type ChinaShopDecorationModuleKey =
  | "hero"
  | "announcement"
  | "today_fresh"
  | "product_group"
  | "credential_showcase"
  | "delivery_note"
  | "live_status";

export type ChinaShopDecorationBoundaryKey =
  | "product_publish"
  | "inventory"
  | "checkout_shipping_options"
  | "order"
  | "payment"
  | "refund"
  | "settlement"
  | "commission"
  | "permission"
  | "real_file_upload"
  | "real_live_provider"
  | "real_im_provider"
  | "fulfillment";

export type ChinaShopDecorationSellerView = {
  sellerId: string;
  sellerName: string;
  sellerHandle?: string;
};

export type ChinaShopDecorationMarketView = {
  marketId?: string;
  marketName?: string;
  boothNo?: string;
  businessHours?: string;
};

export type ChinaShopDecorationHeroView = {
  title: string;
  subtitle?: string;
  imageRef?: string;
};

export type ChinaShopDecorationModuleAvailabilityView = {
  key: ChinaShopDecorationModuleKey;
  label: string;
  visible: boolean;
  editable: false;
  reason: string;
};

export type ChinaShopDecorationReadonlyBoundaryView = {
  key: ChinaShopDecorationBoundaryKey;
  status: "blocked_serial_work";
  reason: string;
};

export type ChinaShopDecorationReadonlySeed = {
  seller: ChinaShopDecorationSellerView;
  market?: ChinaShopDecorationMarketView;
  status?: ChinaShopDecorationStatus;
  hero?: ChinaShopDecorationHeroView;
  announcements?: string[];
  productGroupTitles?: string[];
  credentialLabels?: string[];
  deliveryNotes?: string[];
  liveStatus?: "offline" | "scheduled" | "live" | "replay_available";
};

export type ChinaShopDecorationReadonlyView = {
  mode: "shop_decoration_readonly_contract";
  source: "china_shop_decoration_read_model";
  locale: "zh-CN";
  currency: "CNY";
  timezone: "Asia/Shanghai";
  seller: ChinaShopDecorationSellerView;
  market?: ChinaShopDecorationMarketView;
  status: ChinaShopDecorationStatus;
  hero: ChinaShopDecorationHeroView;
  announcements: string[];
  productGroupTitles: string[];
  credentialLabels: string[];
  deliveryNotes: string[];
  liveStatus: "offline" | "scheduled" | "live" | "replay_available";
  moduleAvailability: ChinaShopDecorationModuleAvailabilityView[];
  highRiskBoundaries: ChinaShopDecorationReadonlyBoundaryView[];
  readOnly: true;
  runtimeEnabled: false;
  note: string;
};
