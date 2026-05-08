export type ChinaLogisticsFulfillmentModeKey =
  | "market_pickup"
  | "merchant_self_delivery"
  | "market_unified_delivery"
  | "delivery_supplier"
  | "cold_chain_express";

export type ChinaWaybillCapabilityKey =
  | "mock_tracking_id"
  | "mock_label_preview"
  | "provider_quote"
  | "cloud_print"
  | "cancel_waybill"
  | "reprint_waybill";

export type ChinaLogisticsBoundaryKey =
  | "checkout_shipping_options"
  | "cart_total"
  | "fulfillment_creation"
  | "shipment_confirmation"
  | "real_tracking_number"
  | "real_waybill_label"
  | "cloud_print"
  | "order_logistics_status"
  | "payment"
  | "refund"
  | "settlement"
  | "commission"
  | "permission";

export type ChinaLogisticsFulfillmentModeView = {
  key: ChinaLogisticsFulfillmentModeKey;
  label: string;
  visibleOnStorefront: boolean;
  configurableByVendor: boolean;
  requiresAdminEnablement: boolean;
  checkoutImpact: "none";
  runtimeEnabled: false;
};

export type ChinaWaybillCapabilityView = {
  key: ChinaWaybillCapabilityKey;
  label: string;
  status: "mock_only" | "blocked_serial_work";
  createsRealShipment: false;
  printsRealLabel: false;
};

export type ChinaLogisticsBoundaryView = {
  key: ChinaLogisticsBoundaryKey;
  status: "blocked_serial_work";
  reason: string;
};

export type ChinaLogisticsWaybillReadonlyView = {
  mode: "logistics_waybill_readonly_contract";
  source: "china_logistics_read_model";
  locale: "zh-CN";
  currency: "CNY";
  timezone: "Asia/Shanghai";
  fulfillmentModes: ChinaLogisticsFulfillmentModeView[];
  waybillCapabilities: ChinaWaybillCapabilityView[];
  highRiskBoundaries: ChinaLogisticsBoundaryView[];
  readOnly: true;
  runtimeEnabled: false;
  note: string;
};
