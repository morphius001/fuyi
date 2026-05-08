import {
  ChinaMarketDomainContractBoundaryKey,
  ChinaMarketDomainContractBoundaryView,
  ChinaMarketDomainContractEntityKey,
  ChinaMarketDomainContractEntityView,
  ChinaMarketDomainContractRoleView,
  ChinaMarketDomainContractView,
  ChinaMarketReadModelSeed,
  ChinaSellerRoleKey,
} from "./types";

const entityLabels: Record<ChinaMarketDomainContractEntityKey, string> = {
  market: "市场",
  market_business_hours: "营业时间",
  market_announcement: "市场公告",
  stall: "档口",
  seller_market_membership: "商户市场关系",
  seller_role: "商户角色",
  market_delivery_profile: "配送能力",
};

const roleLabels: Record<ChinaSellerRoleKey, string> = {
  seafood_stall: "海鲜档口",
  frozen_goods: "冻品商户",
  dry_goods: "干货商户",
  fruit_vegetable: "水果蔬菜商户",
  materials_supplier: "物料供应商",
  delivery_supplier: "配送供应商",
  farmer: "种植户",
  grower: "养殖户",
  seedling_supplier: "种苗供应商",
  regional_wholesaler: "外地批发商",
};

const consumerFacingRoles = new Set<ChinaSellerRoleKey>([
  "seafood_stall",
  "frozen_goods",
  "dry_goods",
  "fruit_vegetable",
]);

const merchantFacingRoles = new Set<ChinaSellerRoleKey>([
  "materials_supplier",
  "delivery_supplier",
  "farmer",
  "grower",
  "seedling_supplier",
  "regional_wholesaler",
]);

const highRiskReasons: Record<ChinaMarketDomainContractBoundaryKey, string> = {
  checkout_shipping_options:
    "配送 profile 只读展示，不影响 cart total 或 checkout shipping options。",
  order_fulfillment: "市场和档口状态不创建履约单，也不推进订单履约。",
  payment: "市场域不决定支付成功，支付成功必须以后端异步通知为准。",
  refund: "市场域不处理退款。",
  settlement: "商户市场关系不改变结算主体或结算规则。",
  commission: "商户角色不改变佣金规则。",
  payout: "市场域不处理商家打款。",
  permission: "商户角色只读展示，不改变 RBAC 或权限。",
};

const countEntities = (
  seed: ChinaMarketReadModelSeed,
): Record<ChinaMarketDomainContractEntityKey, number> => ({
  market: seed.markets?.length ?? 0,
  market_business_hours: seed.businessHours?.length ?? 0,
  market_announcement: seed.announcements?.length ?? 0,
  stall: seed.memberships?.filter((membership) => Boolean(membership.boothNo))
    .length ?? 0,
  seller_market_membership: seed.memberships?.length ?? 0,
  seller_role: seed.roles?.length ?? 0,
  market_delivery_profile: seed.deliveryProfiles?.length ?? 0,
});

const buildEntityViews = (
  seed: ChinaMarketReadModelSeed,
): ChinaMarketDomainContractEntityView[] => {
  const counts = countEntities(seed);

  return Object.entries(entityLabels).map(([key, label]) => ({
    key: key as ChinaMarketDomainContractEntityKey,
    label,
    source: "read_model_seed" as const,
    currentCount: counts[key as ChinaMarketDomainContractEntityKey],
    writeEnabled: false as const,
    runtimeImpact: "none" as const,
  }));
};

const buildRoleViews = (): ChinaMarketDomainContractRoleView[] =>
  Object.entries(roleLabels).map(([roleKey, label]) => {
    const key = roleKey as ChinaSellerRoleKey;

    return {
      roleKey: key,
      label,
      consumerFacingByDefault: consumerFacingRoles.has(key),
      merchantFacingByDefault: merchantFacingRoles.has(key),
      requiresPlatformApproval: true,
      permissionImpact: "none" as const,
    };
  });

const buildBoundaryViews = (): ChinaMarketDomainContractBoundaryView[] =>
  Object.entries(highRiskReasons).map(([key, reason]) => ({
    key: key as ChinaMarketDomainContractBoundaryKey,
    status: "blocked_serial_work" as const,
    reason,
  }));

export const buildChinaMarketDomainContractView = (
  seed: ChinaMarketReadModelSeed = {},
): ChinaMarketDomainContractView => ({
  mode: "market_domain_contract_read_only",
  source: "china_market_read_model",
  locale: "zh-CN",
  currency: "CNY",
  timezone: "Asia/Shanghai",
  entities: buildEntityViews(seed),
  roles: buildRoleViews(),
  highRiskBoundaries: buildBoundaryViews(),
  readOnly: true,
  runtimeEnabled: false,
  note: "Market domain contract is read-only and does not affect checkout, order, payment, refund, settlement, commission, payout, or permissions.",
});
