import {
  ChinaLogisticsBoundaryKey,
  ChinaLogisticsBoundaryView,
  ChinaLogisticsFulfillmentModeView,
  ChinaLogisticsWaybillReadonlyView,
  ChinaWaybillCapabilityView,
} from "./types";

const fulfillmentModes: ChinaLogisticsFulfillmentModeView[] = [
  {
    key: "market_pickup",
    label: "到档自提",
    visibleOnStorefront: true,
    configurableByVendor: true,
    requiresAdminEnablement: true,
    checkoutImpact: "none",
    runtimeEnabled: false,
  },
  {
    key: "merchant_self_delivery",
    label: "商家自行配送",
    visibleOnStorefront: true,
    configurableByVendor: true,
    requiresAdminEnablement: true,
    checkoutImpact: "none",
    runtimeEnabled: false,
  },
  {
    key: "market_unified_delivery",
    label: "市场统一配送",
    visibleOnStorefront: true,
    configurableByVendor: true,
    requiresAdminEnablement: true,
    checkoutImpact: "none",
    runtimeEnabled: false,
  },
  {
    key: "delivery_supplier",
    label: "配送供应商",
    visibleOnStorefront: false,
    configurableByVendor: false,
    requiresAdminEnablement: true,
    checkoutImpact: "none",
    runtimeEnabled: false,
  },
  {
    key: "cold_chain_express",
    label: "冷链/快递",
    visibleOnStorefront: true,
    configurableByVendor: false,
    requiresAdminEnablement: true,
    checkoutImpact: "none",
    runtimeEnabled: false,
  },
];

const waybillCapabilities: ChinaWaybillCapabilityView[] = [
  {
    key: "mock_tracking_id",
    label: "mock 运单号",
    status: "mock_only",
    createsRealShipment: false,
    printsRealLabel: false,
  },
  {
    key: "mock_label_preview",
    label: "mock 面单预览",
    status: "mock_only",
    createsRealShipment: false,
    printsRealLabel: false,
  },
  {
    key: "provider_quote",
    label: "真实报价",
    status: "blocked_serial_work",
    createsRealShipment: false,
    printsRealLabel: false,
  },
  {
    key: "cloud_print",
    label: "云打印",
    status: "blocked_serial_work",
    createsRealShipment: false,
    printsRealLabel: false,
  },
  {
    key: "cancel_waybill",
    label: "取消面单",
    status: "blocked_serial_work",
    createsRealShipment: false,
    printsRealLabel: false,
  },
  {
    key: "reprint_waybill",
    label: "重打面单",
    status: "blocked_serial_work",
    createsRealShipment: false,
    printsRealLabel: false,
  },
];

const highRiskReasons: Record<ChinaLogisticsBoundaryKey, string> = {
  checkout_shipping_options:
    "只读履约能力不写入 checkout shipping options。",
  cart_total: "只读履约能力不改变 cart total。",
  fulfillment_creation: "不创建 fulfillment。",
  shipment_confirmation: "不确认发货。",
  real_tracking_number: "不生成真实运单号。",
  real_waybill_label: "不生成真实面单。",
  cloud_print: "不调用云打印。",
  order_logistics_status: "不回写订单物流状态。",
  payment: "不影响支付。",
  refund: "不影响退款。",
  settlement: "不影响结算。",
  commission: "不影响佣金。",
  permission: "不改变权限。",
};

const buildBoundaryViews = (): ChinaLogisticsBoundaryView[] =>
  Object.entries(highRiskReasons).map(([key, reason]) => ({
    key: key as ChinaLogisticsBoundaryKey,
    status: "blocked_serial_work",
    reason,
  }));

export const buildChinaLogisticsWaybillReadonlyView =
  (): ChinaLogisticsWaybillReadonlyView => ({
    mode: "logistics_waybill_readonly_contract",
    source: "china_logistics_read_model",
    locale: "zh-CN",
    currency: "CNY",
    timezone: "Asia/Shanghai",
    fulfillmentModes,
    waybillCapabilities,
    highRiskBoundaries: buildBoundaryViews(),
    readOnly: true,
    runtimeEnabled: false,
    note: "Logistics and waybill readonly view is display/configuration-only and does not change checkout, cart totals, fulfillment, shipment, tracking, labels, payment, refund, settlement, commission, or permissions.",
  });
