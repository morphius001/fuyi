export type ChinaCapabilityAudience = "admin" | "storefront" | "vendor";

export type ChinaCapabilityStatus =
  | "enabled_baseline"
  | "read_only_baseline"
  | "disabled_until_backend"
  | "design_only"
  | "high_risk_serial";

export type ChinaCapability = {
  key: string;
  label: string;
  description: string;
  status: ChinaCapabilityStatus;
  audiences: ChinaCapabilityAudience[];
  owner: "platform" | "market" | "merchant" | "supplier" | "system";
  risk: "low" | "medium" | "high";
};

export type ChinaCapabilityGroup = {
  key: string;
  label: string;
  capabilities: ChinaCapability[];
};

const capabilityGroups: ChinaCapabilityGroup[] = [
  {
    key: "market",
    label: "市场与商户基础",
    capabilities: [
      {
        key: "market_switching",
        label: "多市场切换",
        description: "消费者、商户和运营后台都能围绕市场维度展示数据；后续由市场配置决定营业时间、公告和配送规则。",
        status: "read_only_baseline",
        audiences: ["admin", "storefront", "vendor"],
        owner: "market",
        risk: "low",
      },
      {
        key: "merchant_market_membership",
        label: "商户所属市场与档口",
        description: "商户可归属一个或多个市场，并记录档口号；本阶段只定义能力，不做真实入驻审核或权限变更。",
        status: "read_only_baseline",
        audiences: ["admin", "storefront", "vendor"],
        owner: "merchant",
        risk: "low",
      },
      {
        key: "merchant_type_switches",
        label: "商户类型开关",
        description: "支持海鲜档口、水果蔬菜、物料供应商、配送供应商、养殖户、种植户、种苗供应商和外地批发商等类型的后台开关。",
        status: "disabled_until_backend",
        audiences: ["admin", "vendor"],
        owner: "platform",
        risk: "medium",
      },
    ],
  },
  {
    key: "storefront",
    label: "消费者前台",
    capabilities: [
      {
        key: "shop_first_discovery",
        label: "先找店再看货",
        description: "前台首页和搜索优先表达市场、档口、商品之间的层级，避免把商户物料采购入口混入消费者前台。",
        status: "enabled_baseline",
        audiences: ["storefront", "admin"],
        owner: "system",
        risk: "low",
      },
      {
        key: "pickup_card_entry",
        label: "提货卡独立入口",
        description: "提货卡是消费者用实体卡号、卡密或二维码兑换商品/套餐并填写收货信息的独立流程，不是优惠券、满减券、储值卡或支付方式。",
        status: "design_only",
        audiences: ["storefront", "admin"],
        owner: "platform",
        risk: "medium",
      },
      {
        key: "shop_live_badge",
        label: "档口直播状态",
        description: "直播仅作为档口/单位的状态露出，不在首页做强运营入口；真实直播供应商后续通过 adapter 接入。",
        status: "disabled_until_backend",
        audiences: ["storefront", "admin", "vendor"],
        owner: "merchant",
        risk: "medium",
      },
    ],
  },
  {
    key: "merchant_operations",
    label: "商户经营",
    capabilities: [
      {
        key: "mobile_quick_listing",
        label: "移动端快速上架",
        description: "面向商户手机端的简化上架入口，后续只能生成草稿或待确认数据，不能绕过商品审核和规格约束。",
        status: "design_only",
        audiences: ["vendor", "admin"],
        owner: "merchant",
        risk: "medium",
      },
      {
        key: "ai_listing_draft",
        label: "AI 一句话上架草稿",
        description: "预留微信、IM 或其他入口触发的 AI 草稿能力；AI 结果必须由商户确认后才能进入真实商品流程。",
        status: "disabled_until_backend",
        audiences: ["vendor", "admin"],
        owner: "merchant",
        risk: "medium",
      },
      {
        key: "shop_decoration",
        label: "商家主页装修",
        description: "商家可维护店铺主页、公告、主推商品和营业信息；本阶段不写真实装修发布逻辑。",
        status: "design_only",
        audiences: ["vendor", "storefront", "admin"],
        owner: "merchant",
        risk: "low",
      },
    ],
  },
  {
    key: "fulfillment",
    label: "履约与配送",
    capabilities: [
      {
        key: "market_delivery_options",
        label: "统一配送与自行配送选项",
        description: "市场可提供统一配送能力，商户可选择统一配送或自行配送；前台应把配送能力放在档口/商家语境下表达。",
        status: "read_only_baseline",
        audiences: ["admin", "vendor", "storefront"],
        owner: "market",
        risk: "medium",
      },
      {
        key: "delivery_supplier_orders",
        label: "配送供应商接单",
        description: "配送供应商需要单独管理，未来可承接市场配送任务；本阶段不实现真实派单、揽收、签收或运费结算。",
        status: "disabled_until_backend",
        audiences: ["admin", "vendor"],
        owner: "supplier",
        risk: "high",
      },
      {
        key: "waybill_printing",
        label: "快递/面单打印",
        description: "预留电子面单、批量打印和打印机配置能力；真实快递服务、面单号和物流轨迹必须后续单独接入。",
        status: "design_only",
        audiences: ["admin", "vendor"],
        owner: "merchant",
        risk: "medium",
      },
    ],
  },
  {
    key: "merchant_procurement",
    label: "商户采购与上游供应",
    capabilities: [
      {
        key: "materials_procurement",
        label: "市场物料采购",
        description: "泡沫箱、包装箱、冰袋、冰块等物料面向商户采购，不放在消费者前台主路径。",
        status: "design_only",
        audiences: ["vendor", "admin"],
        owner: "supplier",
        risk: "medium",
      },
      {
        key: "source_supplier_connection",
        label: "养殖户/种植户对接商户",
        description: "养殖户、种植户作为上游供给侧角色对接商户，消费者前台不直接暴露为普通商品购物入口。",
        status: "design_only",
        audiences: ["admin", "vendor"],
        owner: "supplier",
        risk: "medium",
      },
      {
        key: "seedling_wholesale",
        label: "种苗批发对接",
        description: "种苗批发连接养殖户、种植户和商户，后续需要单独商品类目、报价和交易边界。",
        status: "design_only",
        audiences: ["admin", "vendor"],
        owner: "supplier",
        risk: "medium",
      },
      {
        key: "regional_wholesaler_connection",
        label: "外地批发商对接商户",
        description: "外地批发商直接对接商户，优先作为 B2B 供给能力，不混入消费者首页。",
        status: "design_only",
        audiences: ["admin", "vendor"],
        owner: "supplier",
        risk: "medium",
      },
    ],
  },
  {
    key: "payment_and_settlement",
    label: "支付与财务高风险边界",
    capabilities: [
      {
        key: "mock_china_payment",
        label: "Mock 中国支付",
        description: "只能用于本地开发和验收演示，不能作为真实支付成功依据。",
        status: "high_risk_serial",
        audiences: ["admin"],
        owner: "system",
        risk: "high",
      },
      {
        key: "wechat_pay_provider",
        label: "微信支付 Provider",
        description: "真实接入必须以后端异步通知为准，并完成验签、幂等、重试和审计。",
        status: "high_risk_serial",
        audiences: ["admin"],
        owner: "system",
        risk: "high",
      },
      {
        key: "alipay_provider",
        label: "支付宝 Provider",
        description: "真实接入必须以后端异步通知为准，并完成验签、幂等、重试和审计。",
        status: "high_risk_serial",
        audiences: ["admin"],
        owner: "system",
        risk: "high",
      },
      {
        key: "refund_reconciliation_settlement",
        label: "退款/对账/商家结算",
        description: "退款、对账、结算、分账、佣金和提现必须串行处理，不能和普通 UI 或配置 PR 混在一起。",
        status: "high_risk_serial",
        audiences: ["admin"],
        owner: "system",
        risk: "high",
      },
    ],
  },
];

export const getChinaCapabilities = (audience?: ChinaCapabilityAudience) => {
  const groups = capabilityGroups
    .map((group) => ({
      ...group,
      capabilities: audience
        ? group.capabilities.filter((capability) =>
            capability.audiences.includes(audience)
          )
        : group.capabilities,
    }))
    .filter((group) => group.capabilities.length > 0);

  return {
    mode: "read_only_contract",
    source: "static_baseline",
    locale: "zh-CN",
    currency: "CNY",
    timezone: "Asia/Shanghai",
    note: "This endpoint defines China localization capability boundaries only. It does not enable real payment, order, refund, settlement, commission, payout, fulfillment, permission, SMS, IM, live, logistics, or AI provider behavior.",
    groups,
  };
};
