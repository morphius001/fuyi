import {
  VendorMobileDraftContractBoundaryKey,
  VendorMobileDraftContractBoundaryView,
  VendorMobileDraftContractFieldView,
  VendorMobileDraftContractStageView,
  VendorMobileDraftProductContractView,
} from "./types";

const fields: VendorMobileDraftContractFieldView[] = [
  {
    key: "title",
    label: "商品名",
    requiredForMobileSave: true,
    source: "merchant_input",
    merchantConfirmRequired: true,
  },
  {
    key: "category_id",
    label: "类目",
    requiredForMobileSave: true,
    source: "spec_template_readonly",
    merchantConfirmRequired: true,
  },
  {
    key: "spec_template_id",
    label: "规格模板",
    requiredForMobileSave: true,
    source: "spec_template_readonly",
    merchantConfirmRequired: true,
  },
  {
    key: "price_payload",
    label: "价格",
    requiredForMobileSave: true,
    source: "merchant_input",
    merchantConfirmRequired: true,
  },
  {
    key: "sales_unit",
    label: "销售单位",
    requiredForMobileSave: true,
    source: "spec_template_readonly",
    merchantConfirmRequired: true,
  },
  {
    key: "stock_text",
    label: "库存说明",
    requiredForMobileSave: false,
    source: "merchant_input",
    merchantConfirmRequired: true,
  },
  {
    key: "image_refs",
    label: "图片引用",
    requiredForMobileSave: false,
    source: "merchant_input",
    merchantConfirmRequired: true,
  },
  {
    key: "fulfillment_hints",
    label: "履约提示",
    requiredForMobileSave: false,
    source: "market_context_readonly",
    merchantConfirmRequired: false,
  },
];

const stages: VendorMobileDraftContractStageView[] = [
  {
    key: "mobile_capture",
    label: "手机快速录入",
    createsProduct: false,
    createsInventory: false,
    requiresAudit: false,
  },
  {
    key: "draft_saved",
    label: "草稿已保存",
    createsProduct: false,
    createsInventory: false,
    requiresAudit: true,
  },
  {
    key: "ai_suggested",
    label: "AI 建议已生成",
    createsProduct: false,
    createsInventory: false,
    requiresAudit: true,
  },
  {
    key: "merchant_reviewing",
    label: "商户确认中",
    createsProduct: false,
    createsInventory: false,
    requiresAudit: true,
  },
  {
    key: "pending_platform_review",
    label: "待平台审核",
    createsProduct: false,
    createsInventory: false,
    requiresAudit: true,
  },
  {
    key: "ready_for_product_create",
    label: "可进入商品创建候选",
    createsProduct: false,
    createsInventory: false,
    requiresAudit: true,
  },
];

const highRiskReasons: Record<VendorMobileDraftContractBoundaryKey, string> = {
  real_product_creation:
    "手机草稿合同不创建 Medusa product，真实商品创建必须单独 workflow。",
  inventory_initialization: "手机草稿不初始化库存。",
  product_publish: "手机草稿不发布商品，也不改变商品可见性。",
  real_ai_provider: "AI 只允许 mock suggestion，不接真实 AI Provider 或密钥。",
  wechat_integration: "当前不接真实微信消息、语音、图片或小程序入口。",
  order: "草稿不影响订单。",
  payment: "草稿不影响支付。",
  refund: "草稿不影响退款。",
  settlement: "草稿不影响结算。",
  commission: "草稿不影响佣金。",
  permission: "草稿不改变权限。",
  fulfillment: "草稿不创建履约单或配送单。",
};

const buildBoundaryViews = (): VendorMobileDraftContractBoundaryView[] =>
  Object.entries(highRiskReasons).map(([key, reason]) => ({
    key: key as VendorMobileDraftContractBoundaryKey,
    status: "blocked_serial_work",
    reason,
  }));

export const buildVendorMobileDraftProductContract =
  (): VendorMobileDraftProductContractView => ({
    mode: "vendor_mobile_draft_product_contract_read_only",
    source: "china_product_drafts",
    locale: "zh-CN",
    currency: "CNY",
    timezone: "Asia/Shanghai",
    fields,
    stages,
    highRiskBoundaries: buildBoundaryViews(),
    readOnly: true,
    runtimeEnabled: false,
    note: "Vendor mobile draft product contract is read-only and does not create products, inventory, orders, payments, refunds, settlements, commissions, permissions, or fulfillment.",
  });
