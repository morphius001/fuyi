import {
  ChinaShopDecorationBoundaryKey,
  ChinaShopDecorationModuleAvailabilityView,
  ChinaShopDecorationReadonlyBoundaryView,
  ChinaShopDecorationReadonlySeed,
  ChinaShopDecorationReadonlyView,
} from "./types";

const moduleLabels: Record<
  ChinaShopDecorationModuleAvailabilityView["key"],
  string
> = {
  hero: "店铺头图",
  announcement: "商家公告",
  today_fresh: "今日鲜货",
  product_group: "商品分组",
  credential_showcase: "资质展示",
  delivery_note: "配送/自提说明",
  live_status: "直播状态",
};

const highRiskReasons: Record<ChinaShopDecorationBoundaryKey, string> = {
  product_publish: "店铺装修不发布商品，也不改变商品可见性。",
  inventory: "店铺装修不改变库存。",
  checkout_shipping_options:
    "配送说明只读展示，不写入 checkout shipping options。",
  order: "店铺装修不创建或修改订单。",
  payment: "店铺装修不影响支付。",
  refund: "店铺装修不影响退款。",
  settlement: "店铺装修不影响结算。",
  commission: "店铺装修不影响佣金。",
  permission: "店铺装修不改变权限。",
  real_file_upload: "当前不接真实文件上传、对象存储或 CDN。",
  real_live_provider: "直播状态只读展示，不接真实直播 Provider。",
  real_im_provider: "店铺装修不接真实 IM。",
  fulfillment: "店铺装修不创建履约单或配送单。",
};

const buildModuleAvailability =
  (): ChinaShopDecorationModuleAvailabilityView[] =>
    Object.entries(moduleLabels).map(([key, label]) => ({
      key: key as ChinaShopDecorationModuleAvailabilityView["key"],
      label,
      visible: true,
      editable: false,
      reason: "readonly_contract_only",
    }));

const buildBoundaryViews = (): ChinaShopDecorationReadonlyBoundaryView[] =>
  Object.entries(highRiskReasons).map(([key, reason]) => ({
    key: key as ChinaShopDecorationBoundaryKey,
    status: "blocked_serial_work",
    reason,
  }));

export const buildChinaShopDecorationReadonlyView = (
  seed: ChinaShopDecorationReadonlySeed,
): ChinaShopDecorationReadonlyView => ({
  mode: "shop_decoration_readonly_contract",
  source: "china_shop_decoration_read_model",
  locale: "zh-CN",
  currency: "CNY",
  timezone: "Asia/Shanghai",
  seller: seed.seller,
  market: seed.market,
  status: seed.status ?? "empty",
  hero: seed.hero ?? {
    title: seed.seller.sellerName,
    subtitle: seed.market?.boothNo,
  },
  announcements: seed.announcements ?? [],
  productGroupTitles: seed.productGroupTitles ?? [],
  credentialLabels: seed.credentialLabels ?? [],
  deliveryNotes: seed.deliveryNotes ?? [],
  liveStatus: seed.liveStatus ?? "offline",
  moduleAvailability: buildModuleAvailability(),
  highRiskBoundaries: buildBoundaryViews(),
  readOnly: true,
  runtimeEnabled: false,
  note: "Shop decoration readonly view is display-only and does not affect products, inventory, checkout, orders, payments, refunds, settlements, commissions, permissions, or fulfillment.",
});
