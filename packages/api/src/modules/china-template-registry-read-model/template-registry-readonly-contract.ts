import {
  ChinaTemplateRegistryBoundaryKey,
  ChinaTemplateRegistryBoundaryView,
  ChinaTemplateRegistryReadonlyContractView,
  ChinaTemplateRegistrySurfaceView,
  ChinaTemplateRegistryTemplateView,
} from "./types";

type TemplateDefinition = Omit<
  ChinaTemplateRegistryTemplateView,
  "runtimeEnabled" | "canWriteBusinessState"
>;

const storefrontTemplates: TemplateDefinition[] = [
  {
    templateId: "storefront-home-market-shop-v1",
    surface: "storefront",
    scenario: "home",
    label: "消费者首页：市场和店铺优先",
    status: "preview",
    version: "v1",
    viewModelContract: "storefront_home_template_view",
    slots: [
      "market_context",
      "search",
      "category_groups",
      "shop_cards",
      "product_cards",
      "pickup_card_entry",
    ],
    visibility: "consumer_default_visible",
    consumerFacing: true,
    notes: ["物料、配送供应商和上游供给关系默认不进入消费者首页。"],
  },
  {
    templateId: "storefront-shop-stall-v1",
    surface: "storefront",
    scenario: "shop",
    label: "店铺/档口主页",
    status: "preview",
    version: "v1",
    viewModelContract: "storefront_shop_template_view",
    slots: [
      "shop_profile",
      "market_context",
      "fulfillment_hint",
      "live_status",
      "product_cards",
    ],
    visibility: "consumer_default_visible",
    consumerFacing: true,
    notes: ["直播只作为店铺状态或局部入口，不作为首页主入口。"],
  },
  {
    templateId: "storefront-pickup-card-independent-v1",
    surface: "storefront",
    scenario: "pickup_card",
    label: "提货卡独立入口",
    status: "preview",
    version: "v1",
    viewModelContract: "pickup_card_consumer_flow_view",
    slots: ["pickup_card_entry", "fulfillment_hint"],
    visibility: "independent_entry",
    consumerFacing: true,
    notes: ["提货卡不是优惠券、储值卡、支付方式或普通购物车抵扣。"],
  },
];

const adminTemplates: TemplateDefinition[] = [
  {
    templateId: "admin-dashboard-ops-v1",
    surface: "admin",
    scenario: "dashboard",
    label: "平台运营首页",
    status: "preview",
    version: "v1",
    viewModelContract: "admin_dashboard_template_view",
    slots: ["kpi_cards", "todos", "risk_alerts", "quick_actions", "data_source_notice"],
    visibility: "admin_default_visible",
    consumerFacing: false,
    notes: ["首页只呈现运营状态，不替代真实权限、审计或交易事实。"],
  },
  {
    templateId: "admin-market-merchant-product-v1",
    surface: "admin",
    scenario: "market",
    label: "市场/商户/商品运营模板",
    status: "preview",
    version: "v1",
    viewModelContract: "admin_market_operation_template_view",
    slots: ["market_context", "shop_cards", "product_cards", "risk_alerts"],
    visibility: "admin_default_visible",
    consumerFacing: false,
    notes: ["市场、商户和商品模板不改变 RBAC、审核、结算或履约状态。"],
  },
  {
    templateId: "admin-risk-system-config-v1",
    surface: "admin",
    scenario: "system_config",
    label: "风控和系统配置模板",
    status: "preview",
    version: "v1",
    viewModelContract: "admin_system_config_template_view",
    slots: ["risk_alerts", "data_source_notice"],
    visibility: "admin_default_visible",
    consumerFacing: false,
    notes: ["Provider 配置和真实密钥必须走后端配置、审计和回滚。"],
  },
];

const vendorTemplates: TemplateDefinition[] = [
  {
    templateId: "vendor-role-workspace-v1",
    surface: "vendor",
    scenario: "dashboard",
    label: "商户角色工作台",
    status: "preview",
    version: "v1",
    viewModelContract: "vendor_role_workspace_template_view",
    slots: ["role_context", "kpi_cards", "todos", "quick_actions", "risk_alerts"],
    visibility: "merchant_default_visible",
    consumerFacing: false,
    notes: ["角色工作台不改变权限、订单归属、结算主体或履约事实。"],
  },
  {
    templateId: "vendor-mobile-listing-ai-draft-v1",
    surface: "vendor",
    scenario: "mobile_listing",
    label: "手机快速上架和 AI 草稿",
    status: "preview",
    version: "v1",
    viewModelContract: "vendor_mobile_listing_template_view",
    slots: ["draft_form", "ai_suggestion", "product_cards"],
    visibility: "merchant_default_visible",
    consumerFacing: false,
    notes: ["快速上架和 AI 只能进入草稿/审核候选，不能直接发布商品。"],
  },
  {
    templateId: "vendor-supplier-workspace-v1",
    surface: "vendor",
    scenario: "materials_procurement",
    label: "物料/配送/上游供应方工作台",
    status: "preview",
    version: "v1",
    viewModelContract: "vendor_supplier_workspace_template_view",
    slots: [
      "materials_catalog",
      "delivery_service_area",
      "upstream_supply_batch",
      "risk_alerts",
    ],
    visibility: "role_gated_preview_only",
    consumerFacing: false,
    notes: ["物料采购面向商户，配送供应商接单和上游供给必须另走后端边界。"],
  },
];

const highRiskReasons: Record<ChinaTemplateRegistryBoundaryKey, string> = {
  rbac_permission: "模板注册表不决定 RBAC 或账号权限。",
  feature_flag_effective_state: "模板注册表不作为功能开关真实生效来源。",
  checkout_shipping_options:
    "配送展示只读提示，不写入 checkout shipping options。",
  payment_success: "模板注册表不决定支付成功，支付成功必须以后端异步通知为准。",
  order_status: "模板注册表不创建或修改订单状态。",
  refund_status: "模板注册表不创建或修改退款状态。",
  settlement: "模板注册表不改变结算主体、周期或规则。",
  commission: "模板注册表不改变佣金规则。",
  payout: "模板注册表不处理商家打款。",
  fulfillment: "模板注册表不创建履约单、配送单、运单或面单。",
  provider_configuration: "模板注册表不保存或启用真实 Provider 配置。",
  real_credentials: "模板注册表不保存真实密钥、商户号或 webhook token。",
  consumer_b_side_visibility:
    "物料供应商、配送供应商和上游供给关系默认不进入消费者首页。",
  pickup_card_checkout_discount:
    "提货卡保持独立入口，不作为优惠券、支付方式或购物车抵扣。",
  live_primary_home_entry: "直播只作为店铺状态，不作为消费者首页主入口。",
};

const withRuntimeFlags = (
  templates: TemplateDefinition[],
): ChinaTemplateRegistryTemplateView[] =>
  templates.map((template) => ({
    ...template,
    runtimeEnabled: false,
    canWriteBusinessState: false,
  }));

const buildSurface = (
  surface: ChinaTemplateRegistrySurfaceView["surface"],
  label: string,
  templates: TemplateDefinition[],
): ChinaTemplateRegistrySurfaceView => ({
  surface,
  label,
  templates: withRuntimeFlags(templates),
});

const buildBoundaryViews = (): ChinaTemplateRegistryBoundaryView[] =>
  Object.entries(highRiskReasons).map(([key, reason]) => ({
    key: key as ChinaTemplateRegistryBoundaryKey,
    status: "blocked_serial_work",
    reason,
  }));

export const buildChinaTemplateRegistryReadonlyContract =
  (): ChinaTemplateRegistryReadonlyContractView => ({
    mode: "china_template_registry_readonly_contract",
    source: "china_template_registry_read_model",
    locale: "zh-CN",
    currency: "CNY",
    timezone: "Asia/Shanghai",
    surfaces: [
      buildSurface("storefront", "消费者前台模板", storefrontTemplates),
      buildSurface("admin", "平台运营后台模板", adminTemplates),
      buildSurface("vendor", "商户后台模板", vendorTemplates),
    ],
    highRiskBoundaries: buildBoundaryViews(),
    readOnly: true,
    runtimeEnabled: false,
    note: "Template registry contract is read-only and does not affect permissions, feature flags, checkout, orders, payments, refunds, settlements, commissions, payouts, providers, credentials, or fulfillment.",
  });
