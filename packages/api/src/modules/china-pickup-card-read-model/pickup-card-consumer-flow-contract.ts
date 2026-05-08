import {
  ChinaPickupCardBoundaryKey,
  ChinaPickupCardBoundaryView,
  ChinaPickupCardConsumerFlowView,
  ChinaPickupCardConsumerStatusView,
  ChinaPickupCardConsumerStepView,
  ChinaPickupCardEntitlementView,
  ChinaPickupCardFulfillmentRequirementView,
} from "./types";

const steps: ChinaPickupCardConsumerStepView[] = [
  {
    key: "entry",
    label: "进入提货入口",
    description: "消费者进入独立提货页或扫码落地页。",
    createsPayment: false,
    createsOrder: false,
  },
  {
    key: "credential_input",
    label: "输入卡号/卡密或扫码",
    description: "只识别提货权益凭证，不进入 checkout。",
    createsPayment: false,
    createsOrder: false,
  },
  {
    key: "entitlement_preview",
    label: "查看可提权益",
    description: "展示卡种、有效期、固定或可选提货内容。",
    createsPayment: false,
    createsOrder: false,
  },
  {
    key: "option_confirmation",
    label: "确认规格/套餐",
    description: "用户在权益允许范围内选择规格、套餐或自提门店。",
    createsPayment: false,
    createsOrder: false,
  },
  {
    key: "contact_and_address",
    label: "补齐联系人和地址",
    description: "填写大陆手机号、中国大陆地址或自提时间。",
    createsPayment: false,
    createsOrder: false,
  },
  {
    key: "redemption_submit",
    label: "提交提货申请",
    description: "后续真实实现必须幂等，当前合同不生成真实兑换记录。",
    createsPayment: false,
    createsOrder: false,
  },
  {
    key: "fulfillment_tracking",
    label: "查看提货进度",
    description: "展示提货单状态，不等同支付状态。",
    createsPayment: false,
    createsOrder: false,
  },
];

const entitlements: ChinaPickupCardEntitlementView[] = [
  {
    mode: "fixed",
    label: "固定权益",
    allowsCatalogSubstitution: false,
    convertsToBalance: false,
    appliesToCartTotal: false,
  },
  {
    mode: "choice",
    label: "可选权益",
    allowsCatalogSubstitution: false,
    convertsToBalance: false,
    appliesToCartTotal: false,
  },
  {
    mode: "bundle",
    label: "组合权益",
    allowsCatalogSubstitution: false,
    convertsToBalance: false,
    appliesToCartTotal: false,
  },
];

const fulfillmentRequirements: ChinaPickupCardFulfillmentRequirementView[] = [
  {
    mode: "ship_to_address",
    label: "配送到家",
    requiresContact: true,
    requiresMainlandMobile: true,
    requiresChinaAddress: true,
    requiresPickupTime: false,
  },
  {
    mode: "market_pickup",
    label: "市场自提",
    requiresContact: true,
    requiresMainlandMobile: true,
    requiresChinaAddress: false,
    requiresPickupTime: true,
  },
  {
    mode: "seller_pickup",
    label: "档口自提",
    requiresContact: true,
    requiresMainlandMobile: true,
    requiresChinaAddress: false,
    requiresPickupTime: true,
  },
];

const consumerStatuses: ChinaPickupCardConsumerStatusView[] = [
  { status: "pending_confirmation", label: "待确认", paymentStatusImpact: "none" },
  { status: "preparing", label: "备货中", paymentStatusImpact: "none" },
  { status: "pending_shipment", label: "待发货", paymentStatusImpact: "none" },
  { status: "shipped", label: "已发货", paymentStatusImpact: "none" },
  { status: "pending_pickup", label: "待自提", paymentStatusImpact: "none" },
  { status: "redeemed", label: "已核销", paymentStatusImpact: "none" },
  { status: "signed", label: "已签收", paymentStatusImpact: "none" },
  { status: "exception", label: "异常处理中", paymentStatusImpact: "none" },
  { status: "closed", label: "已关闭", paymentStatusImpact: "none" },
];

const boundaryReasons: Record<ChinaPickupCardBoundaryKey, string> = {
  payment_provider: "提货卡不是支付方式，不接 payment provider。",
  coupon_promotion: "提货卡不是优惠券、满减券、折扣券或营销抵扣。",
  gift_card_store_credit: "提货卡不是储值卡、余额或 store credit。",
  cart_total: "提货卡不抵扣购物车金额。",
  order_paid_state: "提货申请不标记普通订单已支付。",
  refund: "提货卡流程不处理退款。",
  settlement: "提货卡流程不改变结算。",
  commission: "提货卡流程不改变佣金。",
  permission: "提货卡流程不改变权限。",
  fulfillment_creation: "当前合同不创建真实提货履约单。",
  real_card_secret: "当前合同不生成或读取真实卡密。",
  real_qr_token: "当前合同不生成或读取真实二维码 token。",
};

const buildBoundaryViews = (): ChinaPickupCardBoundaryView[] =>
  Object.entries(boundaryReasons).map(([key, reason]) => ({
    key: key as ChinaPickupCardBoundaryKey,
    status: "blocked_serial_work",
    reason,
  }));

export const buildChinaPickupCardConsumerFlowView =
  (): ChinaPickupCardConsumerFlowView => ({
    mode: "pickup_card_consumer_flow_contract",
    source: "china_pickup_card_read_model",
    locale: "zh-CN",
    currency: "CNY",
    timezone: "Asia/Shanghai",
    steps,
    entitlements,
    fulfillmentRequirements,
    consumerStatuses,
    highRiskBoundaries: buildBoundaryViews(),
    readOnly: true,
    runtimeEnabled: false,
    note: "Pickup card consumer flow is an entitlement redemption flow, not checkout, payment, coupon, gift card, store credit, cart discount, or ordinary paid order flow.",
  });
