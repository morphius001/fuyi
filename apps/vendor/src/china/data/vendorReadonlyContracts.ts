import type { Metric, Tone } from "./vendorMockData";

export type VendorReadonlyContractStatus =
  | "enabled_baseline"
  | "read_only_baseline"
  | "disabled_until_backend"
  | "design_only"
  | "high_risk_serial";

export type VendorReadonlyContract = {
  title: string;
  description: string;
  status: VendorReadonlyContractStatus;
  visibleReason: string;
  blockedReason: string;
  nextStep: string;
};

export type VendorReadonlyContractGroup = {
  title: string;
  description: string;
  contracts: VendorReadonlyContract[];
};

export const vendorReadonlyStatusLabels: Record<
  VendorReadonlyContractStatus,
  string
> = {
  enabled_baseline: "基础可见",
  read_only_baseline: "只读基础版",
  disabled_until_backend: "待平台开通",
  design_only: "设计占位",
  high_risk_serial: "高风险串行",
};

export const vendorReadonlySummary: Metric[] = [
  {
    label: "当前角色",
    value: "海鲜档口",
    helper: "普通商品商户 · 只读",
    tone: "blue",
  },
  {
    label: "所属市场",
    value: "2",
    helper: "三门海鲜市场为当前示例",
    tone: "green",
  },
  {
    label: "档口号",
    value: "A18",
    helper: "档口归属不在商户端修改",
    tone: "slate",
  },
  {
    label: "可见能力",
    value: "8",
    helper: "只影响页面展示认知",
    tone: "blue",
  },
  {
    label: "待平台开通",
    value: "4",
    helper: "不得自行开通真实业务",
    tone: "amber",
  },
  {
    label: "高风险阻塞",
    value: "7",
    helper: "支付/订单/结算等串行",
    tone: "red",
  },
];

export const vendorReadonlyProfileCards: Array<{
  title: string;
  value: string;
  detail: string;
}> = [
  {
    title: "消费者默认可见",
    value: "店铺 / 商品 / 配送提示",
    detail: "普通消费者只看与买东西相关的店铺信息，不展示物料采购、供应商接单或后台工具。",
  },
  {
    title: "商户可操作边界",
    value: "查看 / 草稿 / 预览",
    detail: "本页不发布商品、不初始化库存、不确认发货、不打印面单、不创建直播间。",
  },
  {
    title: "平台控制来源",
    value: "后续 Admin 配置",
    detail: "真实开放状态必须由平台配置、审核和后端只读 view 驱动，不能靠前端按钮生效。",
  },
];

export const vendorReadonlyContractGroups: VendorReadonlyContractGroup[] = [
  {
    title: "商户角色与市场归属",
    description: "让商户理解自己属于哪个市场、档口和角色，但不允许在这里修改归属或权限。",
    contracts: [
      {
        title: "当前商户角色",
        description: "海鲜档口 / 普通商品商户基础可见。",
        status: "read_only_baseline",
        visibleReason: "平台已展示商户类型和当前市场上下文。",
        blockedReason: "不改变 RBAC、菜单真实可见性、结算或打款权限。",
        nextStep: "接入按登录商户过滤的角色只读 view。",
      },
      {
        title: "多市场与档口号",
        description: "商户可以跨多个市场，当前示例为三门海鲜市场 A18。",
        status: "read_only_baseline",
        visibleReason: "用于商户理解经营上下文。",
        blockedReason: "不改变订单、库存、配送或结算归属。",
        nextStep: "接入市场 membership read model。",
      },
      {
        title: "物料 / 配送供应商身份",
        description: "部分商户可被平台开通为物料供应商或配送供应商。",
        status: "disabled_until_backend",
        visibleReason: "先展示开通边界，避免和普通商品商户混淆。",
        blockedReason: "不允许自助接真实物料订单或配送服务单。",
        nextStep: "后台审核和角色能力配置后再显示真实入口。",
      },
    ],
  },
  {
    title: "快速上架与 AI 草稿",
    description: "手机快速上架和一句话 AI 上架只产生草稿，真实发布必须经过商户确认和平台规则。",
    contracts: [
      {
        title: "手机快速上架",
        description: "面向今日鲜货和高频商品的简化录入。",
        status: "enabled_baseline",
        visibleReason: "商户移动端需要快速录入标题、规格、价格、库存和图片。",
        blockedReason: "不直接创建真实商品、不写库存、不绕过审核。",
        nextStep: "草稿 API 与规格模板读取。",
      },
      {
        title: "规格模板",
        description: "规格以后从后台模板读取，不在前端写死。",
        status: "read_only_baseline",
        visibleReason: "用于提示商户按平台模板补齐规格。",
        blockedReason: "不生成真实 SKU，不修改商品模型。",
        nextStep: "Admin 规格模板只读 API 接入 Vendor。",
      },
      {
        title: "AI 一句话上架",
        description: "AI 只能生成结构化草稿和风险提示。",
        status: "design_only",
        visibleReason: "保留微信或其他入口的未来接口位置。",
        blockedReason: "不自动发布、不替商户确认、不写商品。",
        nextStep: "Mock AI suggestion provider 和草稿确认页。",
      },
    ],
  },
  {
    title: "店铺装修、履约与提货卡",
    description: "店铺主页、配送说明、面单和提货卡履约只表达流程认知，不执行真实履约动作。",
    contracts: [
      {
        title: "店铺主页装修",
        description: "头图、公告、今日鲜货、资质和配送说明的公开快照。",
        status: "read_only_baseline",
        visibleReason: "消费者店铺页可读取公开快照。",
        blockedReason: "不保存、不发布、不审核、不回滚装修版本。",
        nextStep: "店铺装修 snapshot read model。",
      },
      {
        title: "自提 / 自配送 / 市场统一配送",
        description: "商家可理解不同履约方式，但真实结算页配送仍由后端决定。",
        status: "read_only_baseline",
        visibleReason: "商户需要知道当前市场和档口支持哪些配送方式。",
        blockedReason: "不修改 checkout shipping options、不确认发货。",
        nextStep: "Vendor 履约配置只读 view。",
      },
      {
        title: "快递打印 / 电子面单",
        description: "保留待打印和面单预览入口。",
        status: "design_only",
        visibleReason: "商户需要知道后续会有面单工具。",
        blockedReason: "不生成真实运单号、不调用云打印、不回写物流。",
        nextStep: "面单 adapter mock 和本地打印边界。",
      },
      {
        title: "提货卡履约认知",
        description: "提货卡是消费者权益凭证，不是普通已支付订单。",
        status: "read_only_baseline",
        visibleReason: "商户后续只处理归属自己的提货履约单。",
        blockedReason: "不查看卡密、不兑换、不创建 payment 或 ordinary order。",
        nextStep: "提货单 read model 和商户履约列表。",
      },
    ],
  },
  {
    title: "直播与高风险串行边界",
    description: "直播状态可展示在店铺，不触发真实推流、IM、礼物、交易、支付或结算。",
    contracts: [
      {
        title: "店铺直播状态",
        description: "仅作为店铺 / 档口状态或预告展示。",
        status: "design_only",
        visibleReason: "消费者可在店铺卡片或店铺页看到状态。",
        blockedReason: "不接真实推流、IM、聊天室、打赏、直播交易。",
        nextStep: "直播只读 Provider 边界。",
      },
      {
        title: "支付 / 订单 / 退款 / 结算",
        description: "资金流和交易状态仍由后端真实链路负责。",
        status: "high_risk_serial",
        visibleReason: "这里只提醒商户哪些事情不能在本页操作。",
        blockedReason: "不修改支付成功来源、订单状态、退款、结算、佣金、打款或权限。",
        nextStep: "高风险任务单独串行评审。",
      },
    ],
  },
];

export const toneByVendorReadonlyStatus: Record<
  VendorReadonlyContractStatus,
  Tone
> = {
  enabled_baseline: "green",
  read_only_baseline: "blue",
  disabled_until_backend: "amber",
  design_only: "amber",
  high_risk_serial: "red",
};
