export type ChinaTemplateSurface = "storefront" | "admin" | "vendor";

export type ChinaTemplateScenario =
  | "home"
  | "search"
  | "shop"
  | "product"
  | "pickup_card"
  | "dashboard"
  | "market"
  | "merchant"
  | "product_review"
  | "marketing"
  | "risk"
  | "system_config"
  | "mobile_listing"
  | "ai_draft"
  | "shop_decoration"
  | "materials_procurement"
  | "delivery_supplier"
  | "upstream_supply";

export type ChinaTemplateVisibility =
  | "consumer_default_visible"
  | "merchant_default_visible"
  | "admin_default_visible"
  | "hidden_by_default"
  | "role_gated_preview_only"
  | "independent_entry";

export type ChinaTemplateStatus = "draft" | "preview" | "active" | "paused";

export type ChinaTemplateRegistryBoundaryKey =
  | "rbac_permission"
  | "feature_flag_effective_state"
  | "checkout_shipping_options"
  | "payment_success"
  | "order_status"
  | "refund_status"
  | "settlement"
  | "commission"
  | "payout"
  | "fulfillment"
  | "provider_configuration"
  | "real_credentials"
  | "consumer_b_side_visibility"
  | "pickup_card_checkout_discount"
  | "live_primary_home_entry";

export type ChinaTemplateRegistrySlotKey =
  | "market_context"
  | "search"
  | "category_groups"
  | "shop_cards"
  | "product_cards"
  | "shop_profile"
  | "fulfillment_hint"
  | "pickup_card_entry"
  | "live_status"
  | "kpi_cards"
  | "todos"
  | "risk_alerts"
  | "data_source_notice"
  | "role_context"
  | "quick_actions"
  | "draft_form"
  | "ai_suggestion"
  | "decoration_preview"
  | "materials_catalog"
  | "delivery_service_area"
  | "upstream_supply_batch";

export type ChinaTemplateRegistryTemplateView = {
  templateId: string;
  surface: ChinaTemplateSurface;
  scenario: ChinaTemplateScenario;
  label: string;
  status: ChinaTemplateStatus;
  version: string;
  viewModelContract: string;
  slots: ChinaTemplateRegistrySlotKey[];
  visibility: ChinaTemplateVisibility;
  consumerFacing: boolean;
  runtimeEnabled: false;
  canWriteBusinessState: false;
  notes: string[];
};

export type ChinaTemplateRegistrySurfaceView = {
  surface: ChinaTemplateSurface;
  label: string;
  templates: ChinaTemplateRegistryTemplateView[];
};

export type ChinaTemplateRegistryBoundaryView = {
  key: ChinaTemplateRegistryBoundaryKey;
  status: "blocked_serial_work";
  reason: string;
};

export type ChinaTemplateRegistryReadonlyContractView = {
  mode: "china_template_registry_readonly_contract";
  source: "china_template_registry_read_model";
  locale: "zh-CN";
  currency: "CNY";
  timezone: "Asia/Shanghai";
  surfaces: ChinaTemplateRegistrySurfaceView[];
  highRiskBoundaries: ChinaTemplateRegistryBoundaryView[];
  readOnly: true;
  runtimeEnabled: false;
  note: string;
};
