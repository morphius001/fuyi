import {
  ChinaMerchantRoleCapabilityBoundaryKey,
  ChinaMerchantRoleCapabilityBoundaryView,
  ChinaMerchantRoleCapabilityContractRoleView,
  ChinaMerchantRoleCapabilityContractView,
  ChinaMerchantRoleCapabilityKey,
  ChinaMerchantRoleGroup,
  ChinaMerchantRoleVisibility,
  ChinaSellerRoleKey,
} from "./types";

type RoleDefinition = {
  label: string;
  group: ChinaMerchantRoleGroup;
  consumerVisibility: ChinaMerchantRoleVisibility;
  merchantVisibility: ChinaMerchantRoleVisibility;
  defaultCapabilities: ChinaMerchantRoleCapabilityKey[];
  blockedCapabilities: ChinaMerchantRoleCapabilityKey[];
};

const commonConsumerMerchantCapabilities: ChinaMerchantRoleCapabilityKey[] = [
  "consumer_product_flow",
  "shop_homepage",
  "mobile_quick_listing_draft",
  "product_review_candidate",
  "shop_decoration_readonly",
  "live_status_readonly",
];

const supplierConsumerBlockedCapabilities: ChinaMerchantRoleCapabilityKey[] = [
  "consumer_product_flow",
  "shop_homepage",
  "live_status_readonly",
];

const roleDefinitions: Record<ChinaSellerRoleKey, RoleDefinition> = {
  seafood_stall: {
    label: "海鲜档口",
    group: "consumer_merchant",
    consumerVisibility: "default_visible",
    merchantVisibility: "default_visible",
    defaultCapabilities: commonConsumerMerchantCapabilities,
    blockedCapabilities: [
      "materials_supplier_self_order",
      "delivery_supplier_service",
      "upstream_supply_match",
      "seedling_trade_match",
      "regional_wholesale_match",
    ],
  },
  frozen_goods: {
    label: "冻品商户",
    group: "consumer_merchant",
    consumerVisibility: "default_visible",
    merchantVisibility: "default_visible",
    defaultCapabilities: commonConsumerMerchantCapabilities,
    blockedCapabilities: [
      "materials_supplier_self_order",
      "delivery_supplier_service",
      "upstream_supply_match",
      "seedling_trade_match",
      "regional_wholesale_match",
    ],
  },
  dry_goods: {
    label: "干货商户",
    group: "consumer_merchant",
    consumerVisibility: "default_visible",
    merchantVisibility: "default_visible",
    defaultCapabilities: commonConsumerMerchantCapabilities,
    blockedCapabilities: [
      "materials_supplier_self_order",
      "delivery_supplier_service",
      "upstream_supply_match",
      "seedling_trade_match",
      "regional_wholesale_match",
    ],
  },
  fruit_vegetable: {
    label: "水果蔬菜商户",
    group: "consumer_merchant",
    consumerVisibility: "default_visible",
    merchantVisibility: "default_visible",
    defaultCapabilities: commonConsumerMerchantCapabilities,
    blockedCapabilities: [
      "materials_supplier_self_order",
      "delivery_supplier_service",
      "upstream_supply_match",
      "seedling_trade_match",
      "regional_wholesale_match",
    ],
  },
  materials_supplier: {
    label: "物料供应商",
    group: "merchant_service",
    consumerVisibility: "hidden_by_default",
    merchantVisibility: "default_visible",
    defaultCapabilities: ["merchant_materials_procurement"],
    blockedCapabilities: [
      ...supplierConsumerBlockedCapabilities,
      "materials_supplier_self_order",
      "delivery_supplier_service",
    ],
  },
  delivery_supplier: {
    label: "配送供应商",
    group: "merchant_service",
    consumerVisibility: "hidden_by_default",
    merchantVisibility: "default_visible",
    defaultCapabilities: [
      "delivery_supplier_service",
      "market_unified_delivery_display",
    ],
    blockedCapabilities: [
      ...supplierConsumerBlockedCapabilities,
      "materials_supplier_self_order",
    ],
  },
  farmer: {
    label: "种植户",
    group: "upstream_supply",
    consumerVisibility: "requires_additional_consumer_role",
    merchantVisibility: "default_visible",
    defaultCapabilities: ["upstream_supply_match"],
    blockedCapabilities: supplierConsumerBlockedCapabilities,
  },
  grower: {
    label: "养殖户",
    group: "upstream_supply",
    consumerVisibility: "requires_additional_consumer_role",
    merchantVisibility: "default_visible",
    defaultCapabilities: ["upstream_supply_match"],
    blockedCapabilities: supplierConsumerBlockedCapabilities,
  },
  seedling_supplier: {
    label: "种苗供应商",
    group: "upstream_supply",
    consumerVisibility: "hidden_by_default",
    merchantVisibility: "default_visible",
    defaultCapabilities: ["seedling_trade_match"],
    blockedCapabilities: supplierConsumerBlockedCapabilities,
  },
  regional_wholesaler: {
    label: "外地批发商",
    group: "regional_supply",
    consumerVisibility: "hidden_by_default",
    merchantVisibility: "default_visible",
    defaultCapabilities: ["regional_wholesale_match"],
    blockedCapabilities: supplierConsumerBlockedCapabilities,
  },
};

const highRiskReasons: Record<ChinaMerchantRoleCapabilityBoundaryKey, string> = {
  rbac_permission: "角色能力合同只读展示，不改变 RBAC 或权限。",
  order_ownership: "角色不改变订单归属、商户归属或售后归属。",
  checkout_shipping_options:
    "配送能力只作为只读提示，不写入 checkout shipping options。",
  payment: "角色不决定支付成功，支付成功仍以后端异步通知为准。",
  refund: "角色不处理退款。",
  settlement: "角色不改变结算主体、结算周期或结算规则。",
  commission: "角色不改变佣金规则。",
  payout: "角色不处理商家打款。",
  real_logistics_provider: "角色不接入真实物流 Provider。",
  waybill_printing: "角色不启用真实快递面单打印。",
};

const buildRoleViews = (): ChinaMerchantRoleCapabilityContractRoleView[] =>
  Object.entries(roleDefinitions).map(([roleKey, definition]) => ({
    roleKey: roleKey as ChinaSellerRoleKey,
    label: definition.label,
    group: definition.group,
    consumerVisibility: definition.consumerVisibility,
    merchantVisibility: definition.merchantVisibility,
    adminEnablement: "platform_market_seller_approval_required",
    defaultCapabilities: definition.defaultCapabilities,
    blockedCapabilities: definition.blockedCapabilities,
    permissionImpact: "none",
    orderOwnershipImpact: "none",
    settlementImpact: "none",
    runtimeEnabled: false,
  }));

const buildBoundaryViews = (): ChinaMerchantRoleCapabilityBoundaryView[] =>
  Object.entries(highRiskReasons).map(([key, reason]) => ({
    key: key as ChinaMerchantRoleCapabilityBoundaryKey,
    status: "blocked_serial_work",
    reason,
  }));

export const buildChinaMerchantRoleCapabilityContract =
  (): ChinaMerchantRoleCapabilityContractView => ({
    mode: "merchant_role_capability_contract_read_only",
    source: "china_market_read_model",
    locale: "zh-CN",
    currency: "CNY",
    timezone: "Asia/Shanghai",
    roles: buildRoleViews(),
    highRiskBoundaries: buildBoundaryViews(),
    readOnly: true,
    runtimeEnabled: false,
    note: "Merchant role capability contract is read-only and does not affect permissions, order ownership, checkout, payment, refund, settlement, commission, payout, logistics, or waybill printing.",
  });
