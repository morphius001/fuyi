export type PageId =
  | "home"
  | "capabilityBoundary"
  | "market"
  | "merchantTypes"
  | "mobileListing"
  | "aiListingDraft"
  | "products"
  | "orders"
  | "pickupCards"
  | "logistics"
  | "waybillPrinting"
  | "afterSales"
  | "service"
  | "marketing"
  | "liveOps"
  | "finance"
  | "supplierWorkspace"
  | "materialPurchase"
  | "materialSupplier"
  | "materialOrders"
  | "supplyProducts"
  | "deliveryServices"
  | "deliveryOrders"
  | "deliveryExceptions"
  | "deliveryCoverage"
  | "upstreamSources"
  | "farmSuppliers"
  | "supplyQuotes"
  | "purchaseNeeds"
  | "arrivalPlans"
  | "seedWholesale"
  | "seedSuppliers"
  | "seedNeeds"
  | "seedQuotes"
  | "seedPartners"
  | "seedArrivalPlans"
  | "externalWholesalers"
  | "regionalSources"
  | "regionalQuotes"
  | "regionalArrivalPlans"
  | "coldChainArrivals"
  | "wholesalePartners"
  | "shopDecoration"
  | "store"
  | "data"
  | "accounts";

export type Tone = "blue" | "green" | "amber" | "red" | "slate";

export type Metric = {
  label: string;
  value: string;
  helper: string;
  tone: Tone;
};

export type ListItem = {
  title: string;
  detail: string;
  meta: string;
  tone?: Tone;
  target?: PageId;
};

export type TableColumn = {
  key: string;
  label: string;
};

export type TableRow = {
  id: string;
  status: string;
  cells: Record<string, string>;
};

export type DashboardPage = {
  id: Exclude<PageId, "home">;
  title: string;
  description: string;
  owner: string;
  todo: string;
  primaryAction: string;
  secondaryAction: string;
  filters: [string, string, string];
  stats: Metric[];
  statuses: Array<{ key: string; label: string }>;
  columns: TableColumn[];
  rows: TableRow[];
  emptyTitle: string;
  emptyDescription: string;
};

export const menuItems: Array<{ id: PageId; label: string; group: string }> = [
  { id: "home", label: "店铺首页", group: "市场经营" },
  { id: "capabilityBoundary", label: "我的能力边界", group: "市场经营" },
  { id: "market", label: "市场选择", group: "市场经营" },
  { id: "merchantTypes", label: "商户类型", group: "市场经营" },
  { id: "mobileListing", label: "手机快速上架", group: "普通商户" },
  { id: "aiListingDraft", label: "AI 草稿上架", group: "普通商户" },
  { id: "products", label: "商品管理", group: "普通商户" },
  { id: "orders", label: "订单管理", group: "普通商户" },
  { id: "pickupCards", label: "提货卡履约", group: "普通商户" },
  { id: "logistics", label: "物流管理", group: "普通商户" },
  { id: "waybillPrinting", label: "快递打印", group: "普通商户" },
  { id: "afterSales", label: "售后管理", group: "普通商户" },
  { id: "service", label: "客服管理", group: "普通商户" },
  { id: "marketing", label: "营销管理", group: "普通商户" },
  { id: "liveOps", label: "直播管理", group: "普通商户" },
  { id: "materialPurchase", label: "市场物料采购", group: "商户 B 端物料" },
  { id: "supplierWorkspace", label: "供应方工作台", group: "供应方工作台" },
  { id: "materialSupplier", label: "物料供应商工作台", group: "物料供应商" },
  { id: "materialOrders", label: "物料订单", group: "物料供应商" },
  { id: "supplyProducts", label: "供货商品", group: "物料供应商" },
  { id: "deliveryServices", label: "配送服务", group: "配送供应商" },
  { id: "deliveryOrders", label: "配送订单", group: "配送供应商" },
  { id: "deliveryExceptions", label: "异常处理", group: "配送供应商" },
  { id: "deliveryCoverage", label: "服务范围", group: "配送供应商" },
  { id: "upstreamSources", label: "上游货源", group: "上游供给" },
  { id: "farmSuppliers", label: "养殖户 / 种植户", group: "上游供给" },
  { id: "supplyQuotes", label: "供应报价", group: "上游供给" },
  { id: "purchaseNeeds", label: "采购需求", group: "上游供给" },
  { id: "arrivalPlans", label: "到货计划", group: "上游供给" },
  { id: "seedWholesale", label: "种苗批发", group: "种苗供给" },
  { id: "seedSuppliers", label: "苗种供应商", group: "种苗供给" },
  { id: "seedNeeds", label: "种苗采购需求", group: "种苗供给" },
  { id: "seedQuotes", label: "种苗报价单", group: "种苗供给" },
  { id: "seedPartners", label: "合作对象", group: "种苗供给" },
  { id: "seedArrivalPlans", label: "到苗计划", group: "种苗供给" },
  { id: "externalWholesalers", label: "外地批发商", group: "跨区供给" },
  { id: "regionalSources", label: "跨区货源", group: "跨区供给" },
  { id: "regionalQuotes", label: "跨区报价单", group: "跨区供给" },
  { id: "regionalArrivalPlans", label: "跨区到货计划", group: "跨区供给" },
  { id: "coldChainArrivals", label: "冷链到货", group: "跨区供给" },
  { id: "wholesalePartners", label: "合作批发商", group: "跨区供给" },
  { id: "shopDecoration", label: "店铺装修", group: "设置与数据" },
  { id: "finance", label: "财务结算", group: "设置与数据" },
  { id: "store", label: "店铺资料", group: "设置与数据" },
  { id: "data", label: "数据中心", group: "设置与数据" },
  { id: "accounts", label: "账号权限", group: "设置与数据" },
];

export const homeMetrics: Metric[] = [
  {
    label: "今日成交额",
    value: "¥48,260.00",
    helper: "CNY · mock 静态数据",
    tone: "blue",
  },
  {
    label: "今日订单",
    value: "128",
    helper: "mock 较昨日 +12 单",
    tone: "green",
  },
  {
    label: "待发货",
    value: "36",
    helper: "mock 最早下单 09:18",
    tone: "amber",
  },
  {
    label: "售后待处理",
    value: "7",
    helper: "mock 2 单即将超时",
    tone: "red",
  },
  {
    label: "库存预警",
    value: "12",
    helper: "低于安全库存",
    tone: "amber",
  },
  {
    label: "店铺评分 / 差评风险",
    value: "4.8 / 2",
    helper: "近 30 天 mock 评分",
    tone: "slate",
  },
  {
    label: "AI 上架草稿",
    value: "4",
    helper: "需商户确认后才可上架",
    tone: "blue",
  },
  {
    label: "物料库存预警",
    value: "6",
    helper: "泡沫箱/冰袋等 mock",
    tone: "amber",
  },
  {
    label: "上游报价待确认",
    value: "25",
    helper: "货源/种苗/跨区报价",
    tone: "red",
  },
];

export const storeTasks: ListItem[] = [
  {
    title: "处理待发货订单",
    detail: "36 个订单等待出库，华东仓优先级最高。",
    meta: "履约",
    tone: "amber",
    target: "orders",
  },
  {
    title: "回复售后申请",
    detail: "7 个售后单待商家处理，2 个接近平台时限。",
    meta: "售后",
    tone: "red",
    target: "afterSales",
  },
  {
    title: "补充商品资质",
    detail: "5 个商品因图片或资质信息被驳回。",
    meta: "商品",
    tone: "blue",
    target: "products",
  },
  {
    title: "手机快速补货/改价",
    detail: "今日鲜货、常卖商品模板和批量今日价适合手机端简化处理。",
    meta: "上架",
    tone: "blue",
    target: "mobileListing",
  },
  {
    title: "确认 AI 上架草稿",
    detail: "4 个 AI 一句话上架草稿等待商户确认，当前不自动正式上架。",
    meta: "AI 草稿",
    tone: "blue",
    target: "aiListingDraft",
  },
  {
    title: "查看客服未读",
    detail: "19 条买家咨询未读，主要集中在催发货。",
    meta: "客服",
    tone: "green",
    target: "service",
  },
];

export const riskItems: ListItem[] = [
  {
    title: "物流异常预警",
    detail: "圆通 2 单派送异常，建议人工跟进买家预期。",
    meta: "中风险",
    tone: "amber",
    target: "logistics",
  },
  {
    title: "低分评价",
    detail: "近 24 小时新增 2 条低分评价，涉及杯盖划痕。",
    meta: "高风险",
    tone: "red",
    target: "data",
  },
  {
    title: "库存不足",
    detail: "12 个 SKU 低于安全库存，活动商品需提前补货。",
    meta: "中风险",
    tone: "amber",
    target: "products",
  },
];

export const quickEntries: Array<{ label: string; detail: string; target: PageId }> = [
  { label: "切换市场", detail: "三门海鲜市场 / 其他市场", target: "market" },
  { label: "手机快速上架", detail: "拍照、模板、今日价", target: "mobileListing" },
  { label: "AI 草稿上架", detail: "一句话生成草稿", target: "aiListingDraft" },
  { label: "店铺装修", detail: "头图、公告、分组、预览", target: "shopDecoration" },
  { label: "商品上架", detail: "SPU/SKU、价格、库存", target: "products" },
  { label: "订单履约", detail: "待发货、异常订单", target: "orders" },
  { label: "提货卡履约", detail: "权益核验、提货请求", target: "pickupCards" },
  { label: "快递打印", detail: "待打印、面单预览、记录", target: "waybillPrinting" },
  { label: "鲜货直播", detail: "开播、选品、公告、回放", target: "liveOps" },
  { label: "物料采购", detail: "泡沫箱、冰袋、标签", target: "materialPurchase" },
  { label: "供应方工作台", detail: "按开通角色进入", target: "supplierWorkspace" },
  { label: "物料接单", detail: "供应商订单占位", target: "materialOrders" },
  { label: "配送服务", detail: "配送供应商独立入口", target: "deliveryServices" },
  { label: "上游货源", detail: "养殖户/种植户对接", target: "upstreamSources" },
  { label: "种苗批发", detail: "苗种供应商与到苗计划", target: "seedWholesale" },
  { label: "外地批发商", detail: "跨区货源与冷链到货", target: "externalWholesalers" },
];

export const focusModules = [
  ["市场切换能力", "市场选择", "当前默认示例为三门海鲜市场，后续应支持平台下多个市场切换。"],
  ["手机快速上架", "手机快速上架", "保留电脑端完整商品编辑；手机端只做高频简化流占位。"],
  ["AI 草稿上架", "AI 草稿上架", "AI 一句话只能生成草稿/预览，后续真实上架必须由商户确认。"],
  ["档口主页装修", "店铺装修", "预留头图、公告、今日鲜货、资质、配送说明和店铺预览。"],
  ["提货卡履约", "提货卡履约", "提货卡是消费者履约凭证，不是支付、优惠券或钱包余额。"],
  ["电子面单占位", "快递打印", "预留待打印订单、面单预览、打印机设置、打印记录和批量打印按钮。"],
  ["今日鲜货直播", "直播管理", "预留店铺/档口直播、开播、直播选品、公告、回放和咨询订单占位。"],
  ["交易单据边界", "供应方工作台", "消费者订单、提货单、物料订单、配送服务单、货源采购单、种苗采购单分开表达。"],
  ["物料 B 端采购", "市场物料采购", "物料采购面向入驻商户，不面向普通消费者，先做 mock 入口。"],
  ["供应商分离", "物料/配送供应商", "物料供应商和配送供应商作为独立角色，不混入普通商品商户。"],
  ["上游货源对接", "上游供给", "养殖户、种植户为上游供给方，用于对接商户采购需求。"],
  ["种苗批发预留", "种苗供给", "种苗供应商更上游，主要对接养殖户、种植户，也可对接部分商户。"],
  ["跨区供给预留", "外地批发商", "外地批发商直接对接本地市场商户，重点关注到货周期和冷链协同。"],
  ["本周大促准备", "营销管理", "检查活动库存、价格和发货承诺，当前仅为 mock 提醒。"],
];

export const responsibilityRows = [
  ["市场选择", "支持按市场切换经营视角", "平台开通后可见"],
  ["商户类型", "海鲜档口、冻品、干货、果蔬", "平台配置"],
  ["手机快速上架", "今日鲜货、常卖模板、批量今日价", "普通商户"],
  ["AI 草稿上架", "一句话解析、草稿预览、确认占位", "普通商户"],
  ["店铺装修", "头图、公告、商品分组、资质、配送说明", "店铺负责人"],
  ["商品管理", "上新、审核、库存、价格", "商品运营"],
  ["订单管理", "订单查询、履约准备、异常跟进", "订单运营"],
  ["提货卡履约", "提货权益核验、提货请求、自提/配送安排", "订单运营"],
  ["快递打印", "待打印订单、面单预览、打印机设置、打印记录", "仓配运营"],
  ["直播管理", "今日鲜货直播、档口直播、直播商品、公告、回放", "商家运营"],
  ["供应方工作台", "按平台开通角色进入物料、配送、上游、种苗、跨区供给", "供应方负责人"],
  ["交易概念边界", "消费者订单、提货单、物料订单、配送服务单、货源采购单、种苗采购单分离", "平台规则"],
  ["市场物料采购", "泡沫箱、包装箱、冰袋等 B 端采购", "入驻商户"],
  ["物料供应商", "供货商品、物料订单、接单能力", "物料供应商"],
  ["配送供应商", "配送服务、配送订单、异常、范围", "配送供应商"],
  ["上游货源", "养殖户/种植户、报价、采购需求、到货计划", "供给对接"],
  ["种苗批发", "苗种供应商、采购需求、报价、到苗计划", "种苗供给"],
  ["外地批发商", "跨区货源、报价、到货、冷链异常", "跨区供给"],
  ["售后管理", "退款退货、换货、平台介入", "售后客服"],
  ["财务结算", "账期、待结算、对账异常", "财务人员"],
];

export const marketCards = [
  ["当前市场上下文", "三门海鲜市场", "当前市场只是经营视图上下文；平台支持后续切换到其他本地市场。"],
  ["档口号 / 市场位置", "A 区 18 号档口", "普通生鲜、海鲜、冻品、干货、果蔬商户都可展示市场档口号。"],
  ["多市场经营", "已关联 2 个市场", "商户至少归属一个市场，也可以跨多个市场经营并切换市场视图。"],
  ["可入驻普通商户", "海鲜档口 / 冻品 / 干货 / 果蔬", "普通商品商户按类型经营，不与供应商角色混用。"],
  ["独立供应商角色", "物料供应商 / 配送供应商", "用于平台引进个别供货或配送合作方，拥有独立 mock 入口。"],
  ["模块开通提示", "平台开通后可见", "Vendor UI 仅展示提示，不实现真实权限或模块开关逻辑。"],
];

export const marketSummary = [
  ["市场公告", "三门海鲜市场 05 月 04 日凌晨 05:30 开市；活鲜区临时检查称重台。"],
  ["营业时间", "当前市场营业时间 05:30-18:00；夜配商户需按市场单独规则履约。"],
  ["配送规则", "三门市场同城冷链 2 小时达；跨市场配送和偏远区域规则后续由平台配置。"],
  ["市场归属", "当前商户关联三门海鲜市场、沿海冷链市场；本页展示当前市场视图。"],
];

export const moduleCards = [
  ["普通商品经营", "已开通示例", "适用于海鲜档口、冻品商户、干货商户、水果蔬菜商户。"],
  ["手机快速上架", "已开通示例", "适合每日价格/库存变化快的鲜货，保留电脑端完整编辑。"],
  ["AI 草稿上架", "平台开通后可见", "AI 只生成草稿/预览，早期不允许直接自动正式上架。"],
  ["店铺装修", "已开通示例", "档口主页装修包含头图、公告、今日鲜货、资质和配送说明。"],
  ["今日鲜货直播", "平台开通后可见", "直播只做开播、选品、公告、回放、咨询和订单占位，不接推流/IM/支付。"],
  ["提货卡履约", "平台开通后可见", "提货卡只作为权益核验和履约请求，不作为支付或优惠券能力。"],
  ["市场物料采购", "平台开通后可见", "面向入驻商户采购泡沫箱、包装箱、冰袋、冰块、周转筐、胶带、标签等。"],
  ["物料供应商接单", "平台开通后可见", "供应商可维护供货商品和物料订单；当前不接支付/结算。"],
  ["配送供应商服务", "平台开通后可见", "预留配送服务、配送订单、异常处理、服务范围入口。"],
  ["上游供给对接", "平台开通后可见", "养殖户/种植户对接商户，当前不接采购、库存、支付或结算。"],
  ["种苗批发供给", "平台开通后可见", "苗种供应商对接养殖户、种植户和部分商户，不实现合同或订单。"],
  ["外地批发商供给", "平台开通后可见", "外地批发商直接对接本地市场商户，当前不接采购、支付、结算。"],
];

export const supplySummary = [
  ["今日到货", "8 批", "来自养殖户和种植户的 mock 到货计划，仅做商户备货参考。"],
  ["待确认报价", "12 条", "上游供给方向海鲜档口、果蔬商户等提供报价，占位不成交。"],
  ["合作供给方", "26 家", "包含养殖户、种植户和部分冻品/干货源头供给方。"],
  ["待确认种苗报价", "7 条", "苗种供应商向养殖户、种植户或部分商户提供报价，占位不成交。"],
  ["到苗计划", "5 批", "种苗批发到苗计划仅做上游排期展示，不写入库存。"],
  ["合作苗种供应商", "9 家", "种苗供应商作为独立上游供给方类型预留。"],
  ["待确认跨区报价", "6 条", "外地批发商给本地市场商户的报价，占位不成交。"],
  ["预计跨区到货", "4 车", "跨区域货源到货计划，仅做冷链协同提示。"],
  ["冷链异常提醒", "2 条", "冷链延迟或温控异常提示，不写入真实物流状态。"],
];

export const supplierRoleAccessMatrix = [
  ["普通商品商户", "已开通示例", "商品、订单、售后、店铺装修和市场物料采购；不能直接进入供应商接单。"],
  ["物料供应商", "平台单独开通", "维护泡沫箱、包装箱、冰袋、冰块等 B 端物料目录和物料订单占位。"],
  ["配送供应商", "平台单独开通", "维护配送服务、服务范围和配送订单占位，不改变真实物流/运费。"],
  ["养殖户 / 种植户", "平台邀请接入", "作为上游供给方对接商户采购需求，不等同市场档口。"],
  ["种苗供应商", "平台邀请接入", "对接养殖户、种植户和部分商户，当前不创建真实合同或采购单。"],
  ["外地批发商", "平台邀请接入", "跨区货源直接对接本地商户，当前不触发支付、结算或库存。"],
];

export const fastListingCategories = [
  ["海鲜鲜货", "小黄鱼、梭子蟹、带鱼", "按规格模板录入今日价、起售量和库存筐数"],
  ["冻品干货", "冻虾仁、鱼干、干贝", "适合常卖模板改价补货，保留箱规/袋规"],
  ["水果蔬菜", "青菜、番茄、本地水果", "突出产地、等级、箱规、采摘日和库存批次"],
  ["市场物料", "泡沫箱、包装箱、冰袋、冰块", "仅物料供应商/商户采购可见，不放普通消费者前台"],
];

export const fastListingFields = [
  ["商品名称", "例：三门小黄鱼 今日鲜货"],
  ["类目", "海鲜鲜货 / 冻品 / 干货 / 果蔬 / 市场物料"],
  ["规格模板", "例：鲜活水产 · 公母/单只重量/起售量"],
  ["规格 / 等级", "例：公母混装 · 3-5两/只"],
  ["价格类型", "固定价 / 区间价 / 时价 / 阶梯价"],
  ["今日价", "例：68-82 元/斤，价格不是规格"],
  ["库存", "例：剩 36 筐，约 20 斤/筐"],
  ["商品提示", "建议自提 / 今日可送 / 冷链可送"],
];

export const quickSpecFields = [
  ["销售单位", "斤", "买家下单选择的单位"],
  ["计价单位", "斤", "价格展示和结算口径"],
  ["库存单位", "筐", "商户盘点库存口径"],
  ["包装单位", "约 20 斤/筐", "用于库存折算和履约提示"],
  ["起售数量", "1 斤起", "消费者必须能看懂"],
  ["履约方式", "市场自提 / 档口自送 / 统一配送", "档口能力，不写成商品属性"],
];

export const productSpecTemplates = [
  ["鲜活水产", "公母/单只重量/起售量", "例：梭子蟹 · 公母混装 · 3-5两/只 · 1斤起"],
  ["水果蔬菜", "产地/等级/箱规/采摘日", "例：本地番茄 · 一级果 · 5斤/箱 · 今日采摘"],
  ["市场物料", "尺寸/容量/件数/起订量", "例：泡沫箱 · 60x40x30cm · 10个/组"],
  ["种苗批发", "品种/苗龄/起订量/运输", "例：南美白对虾苗 · P5-P7 · 10万尾起"],
  ["外地批发", "供应地/箱规/到货时效", "例：舟山带鱼 · 10kg/箱 · 明晨冷链到货"],
];

export const photoPlaceholders = ["主图", "细节图", "资质/检疫", "规格标签"];

export const aiDraftPreview = [
  ["商品名称", "鲜活梭子蟹"],
  ["类目", "鲜活水产 / 蟹类"],
  ["规格", "公母混装 · 3-5两/只 · 1斤起"],
  ["价格", "区间价 ¥68-82 / 斤"],
  ["库存", "剩 36 筐 · 约20斤/筐"],
  ["缺失项", "商品图片、规格标签、实称说明"],
];

export const aiStructuredDraftRows = [
  ["规格名称", "公母混装"],
  ["等级/尺寸", "3-5两/只"],
  ["销售单位", "斤"],
  ["计价单位", "斤"],
  ["库存单位", "筐"],
  ["包装单位", "约20斤/筐"],
  ["起售数量", "1斤起"],
  ["商品提示", "建议自提"],
];

export const aiDraftWarnings = [
  "AI 草稿不能直接发布，必须商户人工确认。",
  "区间价、时价和实称商品需要后端结算规则支持。",
  "市场统一配送/档口自送是档口能力，发布时应从商户配置读取。",
];

export const aiChannelHints = [
  ["微信语音/文字", "后续可接微信渠道输入，但当前不接真实微信、IM 或语音识别。"],
  ["商家确认", "AI 只生成草稿，发布按钮必须等商家人工确认后才可进入后续真实任务。"],
  ["物料供应商", "支持泡沫箱、包装箱、冰袋、冰块等物料口径生成草稿。"],
];

export const shopDecorationHero = {
  market: "三门海鲜市场",
  booth: "A 区 18 号档口",
  shopName: "阿海今日鲜档",
  headline: "凌晨到港 · 今日鲜活海产",
  subline: "小黄鱼、梭子蟹、带鱼现货；支持市场自提和同城冷链配送。",
  status: "草稿预览",
};

export const shopAnnouncements = [
  ["今日公告", "2026 年 05 月 04 日 05:30 开市，活鲜称重后可自提；雨天配送可能延迟 20 分钟。"],
  ["档口承诺", "明码标价、足斤足两，鲜活商品签收前可联系档口复核。"],
  ["售后提示", "生鲜易损，收货后请尽快验货并保留图片；当前只做前端文案占位。"],
];

export const todayFreshItems = [
  ["三门小黄鱼", "¥35.00 / 斤", "80 斤", "今日 04:40 到港"],
  ["本港梭子蟹", "¥68.00 / 斤", "45 斤", "活鲜暂养"],
  ["舟山带鱼", "¥22.00 / 斤", "120 斤", "跨区冷链到货"],
  ["冻虾仁 500g", "¥39.90 / 袋", "96 袋", "冷冻仓现货"],
];

export const productGroups = [
  ["今日鲜货", "小黄鱼、梭子蟹、带鱼", "首页优先展示，用于高频改价补货。"],
  ["活鲜专区", "青蟹、蛏子、皮皮虾", "突出暂养、称重和自提说明。"],
  ["冻品干货", "冻虾仁、鱼干、干贝", "适合稳定库存和常卖模板。"],
  ["市场物料", "泡沫箱、冰袋、标签", "仅商户 B 端可见，消费者前台不展示。"],
];

export const credentialCards = [
  ["营业执照", "已上传占位", "统一社会信用代码已脱敏展示。"],
  ["食品经营许可", "有效期占位", "后续需接真实资质到期提醒。"],
  ["产地证明", "待补充", "今日鲜货建议按批次补充。"],
  ["检测报告", "待补充", "当前只展示缺失提醒，不上传文件。"],
];

export const deliveryNotes = [
  ["市场自提", "三门海鲜市场 A 区 18 号，建议 06:30-17:30 到档口核验提货。"],
  ["同城冷链", "市场周边 8km 内 2 小时达；超范围规则后续由市场配置。"],
  ["跨区配送", "需按冷链到货计划确认，不以前端预览作为履约承诺。"],
];

export const liveDecorationStatus = [
  ["直播状态", "正在直播占位", "可在店铺主页显示状态标签，但不接推流、IM 或直播订单。"],
  ["直播公告", "今日 06:00 看档口鲜货", "文案仅为 mock，后续需要平台审核和违规处理。"],
  ["直播商品", "小黄鱼、梭子蟹、带鱼", "仅用于预览选品，不锁库存、不创建订单。"],
  ["回放入口", "回放管理占位", "当前不存储真实视频或回放地址。"],
];

export const decorationPreviewChecklist = [
  "头图和档口信息在消费者首屏可识别",
  "公告、配送、自提和售后说明不与真实履约承诺混淆",
  "今日鲜货价格库存来自未来商品草稿或商品 API",
  "资质展示需要后端文件、审核和到期提醒支持",
  "直播状态只作为占位，不作为真实直播间入口",
];

export const commonStatuses = [
  { key: "all", label: "全部" },
  { key: "pending", label: "待处理" },
  { key: "normal", label: "正常" },
  { key: "risk", label: "风险" },
  { key: "empty", label: "空状态" },
];

export const pages: DashboardPage[] = [
  {
    id: "capabilityBoundary",
    title: "我的能力边界",
    description: "只读查看当前商户角色、市场、档口、快速上架、装修、履约、提货卡、直播和高风险串行边界。",
    owner: "平台开通后可见",
    todo: "TODO: 后续接入按登录商户过滤的 capability readonly view，不把本页当权限开关。",
    primaryAction: "申请开通占位",
    secondaryAction: "查看规则占位",
    filters: ["能力名称", "开通状态", "后续 PR"],
    stats: [
      { label: "可见能力", value: "8", helper: "只读展示", tone: "blue" },
      { label: "待平台开通", value: "4", helper: "后台配置", tone: "amber" },
      { label: "高风险阻塞", value: "7", helper: "串行任务", tone: "red" },
    ],
    statuses: commonStatuses,
    columns: [
      { key: "capability", label: "能力" },
      { key: "statusText", label: "状态" },
      { key: "boundary", label: "边界" },
      { key: "next", label: "后续" },
    ],
    rows: [],
    emptyTitle: "暂无能力记录",
    emptyDescription: "能力边界页使用专用只读面板展示，不通过本表执行任何操作。",
  },
  {
    id: "market",
    title: "市场选择",
    description: "支持平台下多个本地市场切换；当前市场是经营上下文，不假设一店一市场。",
    owner: "平台开通后可见",
    todo: "TODO: 后续接入市场列表和当前市场只读查询 API，不实现真实市场切换权限。",
    primaryAction: "切换市场占位",
    secondaryAction: "查看市场规则占位",
    filters: ["市场名称", "城市 / 区县", "开通状态"],
    stats: [
      { label: "当前市场", value: "三门", helper: "海鲜市场示例", tone: "blue" },
      { label: "已关联市场", value: "2", helper: "支持多市场经营", tone: "green" },
      { label: "待开通模块", value: "2", helper: "平台配置", tone: "amber" },
    ],
    statuses: commonStatuses,
    columns: [
      { key: "market", label: "市场" },
      { key: "region", label: "区域" },
      { key: "business", label: "主营" },
      { key: "booth", label: "档口号 / 位置" },
      { key: "statusText", label: "状态" },
      { key: "modules", label: "已开通模块" },
    ],
    rows: [
      {
        id: "MK-01",
        status: "normal",
        cells: {
          market: "三门海鲜市场",
          region: "浙江 台州 三门县",
          business: "本地生鲜 / 海鲜",
          booth: "A 区 18 号档口",
          statusText: "当前示例",
          modules: "普通商品、物料采购",
        },
      },
      {
        id: "MK-02",
        status: "pending",
        cells: {
          market: "沿海冷链市场",
          region: "浙江 宁波",
          business: "冻品 / 海产",
          booth: "冷链仓 03",
          statusText: "平台开通后可见",
          modules: "待配置",
        },
      },
    ],
    emptyTitle: "暂无可切换市场",
    emptyDescription: "市场切换仅为 mock UI，不改变真实商户归属、档口或权限。",
  },
  {
    id: "merchantTypes",
    title: "商户类型",
    description: "区分普通商品商户和独立供应商角色，避免物料/配送供应商混入普通商户。",
    owner: "平台配置",
    todo: "TODO: 后续接入商户类型只读配置，不实现真实角色或权限开关。",
    primaryAction: "申请类型占位",
    secondaryAction: "查看规则占位",
    filters: ["商户类型", "经营范围", "开通状态"],
    stats: [
      { label: "普通商户类型", value: "4", helper: "海鲜/冻品/干货/果蔬", tone: "blue" },
      { label: "独立供应商类型", value: "2", helper: "物料/配送", tone: "amber" },
      { label: "已开通模块", value: "1", helper: "mock", tone: "green" },
    ],
    statuses: commonStatuses,
    columns: [
      { key: "type", label: "类型" },
      { key: "role", label: "角色归属" },
      { key: "scope", label: "经营范围" },
      { key: "visibility", label: "可见性" },
      { key: "note", label: "说明" },
    ],
    rows: [
      {
        id: "MT-01",
        status: "normal",
        cells: {
          type: "海鲜档口",
          role: "普通商品商户",
          scope: "鲜活海鲜、当日水产",
          visibility: "已开通示例",
          note: "使用商品/订单/售后主链路",
        },
      },
      {
        id: "MT-02",
        status: "normal",
        cells: {
          type: "冻品商户",
          role: "普通商品商户",
          scope: "冻虾、冻鱼、预制海产",
          visibility: "平台开通后可见",
          note: "使用商品/订单/售后主链路",
        },
      },
      {
        id: "MT-03",
        status: "normal",
        cells: {
          type: "干货商户",
          role: "普通商品商户",
          scope: "海产干货、调味干货",
          visibility: "平台开通后可见",
          note: "使用商品/订单/售后主链路",
        },
      },
      {
        id: "MT-04",
        status: "normal",
        cells: {
          type: "水果蔬菜商户",
          role: "普通商品商户",
          scope: "本地果蔬、生鲜配菜",
          visibility: "平台开通后可见",
          note: "使用商品/订单/售后主链路",
        },
      },
      {
        id: "MT-05",
        status: "pending",
        cells: {
          type: "物料供应商",
          role: "独立供应商",
          scope: "泡沫箱、冰袋、标签等",
          visibility: "平台开通后可见",
          note: "可预留接单工作台",
        },
      },
      {
        id: "MT-06",
        status: "pending",
        cells: {
          type: "配送供应商",
          role: "独立供应商",
          scope: "市场配送服务",
          visibility: "平台开通后可见",
          note: "预留配送服务和异常处理",
        },
      },
    ],
    emptyTitle: "暂无商户类型",
    emptyDescription: "商户类型仅为静态 mock，不写入真实角色或权限。",
  },
  {
    id: "mobileListing",
    title: "手机快速上架",
    description: "面向海鲜档口、冻品、干货、果蔬等高频改价补货商户的手机端简化上架入口。",
    owner: "普通商户",
    todo: "TODO: 后续接入移动端快速上架只读配置；真实扫码、拍照识别、保存上架需单独任务。",
    primaryAction: "生成二维码占位",
    secondaryAction: "查看手机流程占位",
    filters: ["商品模板", "今日价状态", "库存状态"],
    stats: [
      { label: "今日待补商品", value: "18", helper: "鲜货高频 mock", tone: "amber" },
      { label: "常卖模板", value: "42", helper: "一键补货/改价", tone: "blue" },
      { label: "拍照识别", value: "占位", helper: "不接真实识别", tone: "slate" },
    ],
    statuses: [
      { key: "all", label: "全部" },
      { key: "pending", label: "待补今日价" },
      { key: "normal", label: "可一键补货" },
      { key: "risk", label: "库存预警" },
      { key: "empty", label: "空状态" },
    ],
    columns: [
      { key: "template", label: "常卖商品模板" },
      { key: "type", label: "适用商户" },
      { key: "price", label: "今日价" },
      { key: "stock", label: "库存" },
      { key: "flow", label: "手机端简化流程" },
    ],
    rows: [
      {
        id: "ML-01",
        status: "pending",
        cells: {
          template: "今日鲜货：小黄鱼",
          type: "海鲜档口",
          price: "待填今日价",
          stock: "待填库存",
          flow: "拍照/模板 -> 今日价 -> 库存 -> 配送或自提 -> 保存上架",
        },
      },
      {
        id: "ML-02",
        status: "normal",
        cells: {
          template: "冻虾仁 500g",
          type: "冻品商户",
          price: "¥39.90",
          stock: "一键补 50 件",
          flow: "常卖模板 -> 改今日价 -> 一键补货",
        },
      },
      {
        id: "ML-03",
        status: "risk",
        cells: {
          template: "本地青菜",
          type: "水果蔬菜商户",
          price: "批量今日价",
          stock: "库存不足",
          flow: "批量改今日价 -> 库存校验 -> 保存占位",
        },
      },
    ],
    emptyTitle: "暂无待快速上架商品",
    emptyDescription: "手机快速上架仅为桌面后台入口说明，不实现真实移动 App、扫码登录或拍照识别。",
  },
  {
    id: "aiListingDraft",
    title: "AI 草稿上架",
    description: "AI 一句话上架只生成草稿和风险提示，必须由商户确认后才可在未来真实上架。",
    owner: "普通商户",
    todo: "TODO: 后续接入 AI 解析草稿服务；真实保存/上架必须单独确认，不允许自动正式上架。",
    primaryAction: "生成草稿占位",
    secondaryAction: "查看风险提示占位",
    filters: ["草稿来源", "确认状态", "风险类型"],
    stats: [
      { label: "AI 草稿", value: "4", helper: "待商户确认", tone: "blue" },
      { label: "需补图片", value: "2", helper: "不自动上架", tone: "amber" },
      { label: "高风险词", value: "1", helper: "需人工复核", tone: "red" },
    ],
    statuses: [
      { key: "all", label: "全部" },
      { key: "pending", label: "待确认草稿" },
      { key: "normal", label: "可完善" },
      { key: "risk", label: "需复核" },
      { key: "empty", label: "空状态" },
    ],
    columns: [
      { key: "input", label: "一句话输入示例" },
      { key: "draft", label: "解析草稿" },
      { key: "missing", label: "待补信息" },
      { key: "risk", label: "风险提示" },
      { key: "confirm", label: "确认状态" },
    ],
    rows: [
      {
        id: "AI-01",
        status: "pending",
        cells: {
          input: "今天小黄鱼 35 一斤，库存 80 斤，可自提",
          draft: "小黄鱼 / 今日价 ¥35.00 / 斤 / 库存 80 斤",
          missing: "商品图片、规格标签",
          risk: "鲜活品需确认配送或自提",
          confirm: "待商户确认",
        },
      },
      {
        id: "AI-02",
        status: "risk",
        cells: {
          input: "舟山带鱼低价促销，今晚到货",
          draft: "舟山带鱼 / 到货预告 / 今日价待补",
          missing: "价格、库存、检测证明",
          risk: "产地/到货时间需复核",
          confirm: "需人工复核",
        },
      },
    ],
    emptyTitle: "暂无 AI 上架草稿",
    emptyDescription: "AI 草稿上架只展示草稿/预览，不执行真实保存、发布或正式上架。",
  },
  {
    id: "products",
    title: "商品管理",
    description: "面向国内商家日常上新、审核、库存、价格和整改的商品工作台。",
    owner: "商品运营",
    todo: "TODO: 后续接入商品、库存和审核状态只读查询 API。",
    primaryAction: "新建商品占位",
    secondaryAction: "批量导入占位",
    filters: ["商品名称 / SPU", "类目", "库存状态"],
    stats: [
      { label: "在售商品", value: "1,248", helper: "mock", tone: "blue" },
      { label: "审核失败", value: "5", helper: "待整改", tone: "red" },
      { label: "库存预警", value: "12", helper: "低于安全库存", tone: "amber" },
    ],
    statuses: [
      { key: "all", label: "全部" },
      { key: "normal", label: "销售中" },
      { key: "pending", label: "审核中" },
      { key: "risk", label: "审核失败" },
      { key: "empty", label: "无库存" },
    ],
    columns: [
      { key: "name", label: "商品" },
      { key: "category", label: "类目" },
      { key: "price", label: "售价" },
      { key: "stock", label: "库存" },
      { key: "updated", label: "更新时间" },
    ],
    rows: [
      {
        id: "P-10086",
        status: "normal",
        cells: {
          name: "三门小黄鱼 今日鲜货",
          category: "海鲜水产",
          price: "¥35.00 / 斤",
          stock: "80 斤",
          updated: "2026-05-03 10:24",
        },
      },
      {
        id: "P-10087",
        status: "risk",
        cells: {
          name: "本地青菜 当日采摘",
          category: "水果蔬菜",
          price: "¥3.20 / 斤",
          stock: "库存不足",
          updated: "2026-05-03 09:48",
        },
      },
    ],
    emptyTitle: "暂无符合条件的商品",
    emptyDescription: "当前仅展示商品管理骨架，不提交真实商品或库存变更。",
  },
  {
    id: "orders",
    title: "订单管理",
    description: "聚合订单查询、待发货、异常订单和履约备注的只读运营入口。",
    owner: "订单运营",
    todo: "TODO: 后续接入订单只读查询 API，发货动作仍需单独高风险任务。",
    primaryAction: "导出订单占位",
    secondaryAction: "批量备注占位",
    filters: ["订单号 / 手机号", "下单时间", "收货地区"],
    stats: [
      { label: "今日订单", value: "128", helper: "mock", tone: "green" },
      { label: "待发货", value: "36", helper: "不触发发货", tone: "amber" },
      { label: "异常订单", value: "4", helper: "人工跟进", tone: "red" },
    ],
    statuses: [
      { key: "all", label: "全部" },
      { key: "pending", label: "待发货" },
      { key: "normal", label: "已发货" },
      { key: "done", label: "已完成" },
      { key: "risk", label: "异常订单" },
    ],
    columns: [
      { key: "order", label: "订单号" },
      { key: "buyer", label: "买家" },
      { key: "amount", label: "金额" },
      { key: "region", label: "收货地区" },
      { key: "created", label: "下单时间" },
    ],
    rows: [
      {
        id: "O-202605030021",
        status: "pending",
        cells: {
          order: "O-202605030021",
          buyer: "周女士 138****8821",
          amount: "¥268.00",
          region: "浙江 杭州 西湖区",
          created: "2026-05-03 11:12",
        },
      },
      {
        id: "O-202605030019",
        status: "normal",
        cells: {
          order: "O-202605030019",
          buyer: "李先生 136****0198",
          amount: "¥99.90",
          region: "广东 深圳 南山区",
          created: "2026-05-03 10:37",
        },
      },
    ],
    emptyTitle: "暂无符合条件的订单",
    emptyDescription: "这里仅展示订单管理壳，不执行真实发货或订单状态变更。",
  },
  {
    id: "pickupCards",
    title: "提货卡履约",
    description:
      "提货卡是消费者履约凭证，用于权益核验、提货请求、自提或配送安排，不是支付、优惠券或钱包余额。",
    owner: "订单运营",
    todo: "TODO: 后续接入提货卡履约只读 API；不得把提货卡建模为支付、折扣、钱包余额或购物车抵扣。",
    primaryAction: "核验提货卡占位",
    secondaryAction: "导出提货单占位",
    filters: ["提货单 / 卡号", "履约方式", "核验状态"],
    stats: [
      { label: "待核验提货单", value: "14", helper: "mock", tone: "amber" },
      { label: "今日预约自提", value: "8", helper: "市场自提", tone: "green" },
      { label: "异常凭证", value: "1", helper: "需人工复核", tone: "red" },
    ],
    statuses: commonStatuses,
    columns: [
      { key: "ticket", label: "提货单" },
      { key: "card", label: "卡批次 / 权益" },
      { key: "goods", label: "权益商品" },
      { key: "method", label: "履约方式" },
      { key: "statusText", label: "状态" },
    ],
    rows: [
      {
        id: "PC-01",
        status: "pending",
        cells: {
          ticket: "PU20260503012",
          card: "端午海鲜礼盒卡 A 批",
          goods: "小黄鱼礼盒 x 1",
          method: "三门海鲜市场自提",
          statusText: "待消费者确认时间 mock",
        },
      },
      {
        id: "PC-02",
        status: "risk",
        cells: {
          ticket: "PU20260503009",
          card: "冷链鲜货权益卡 B 批",
          goods: "冻虾仁 500g x 2",
          method: "同城冷链配送",
          statusText: "凭证需复核 mock",
        },
      },
    ],
    emptyTitle: "暂无提货卡履约记录",
    emptyDescription:
      "提货卡履约与消费者订单分开展示；当前不创建真实支付、核销、发货或退款动作。",
  },
  {
    id: "logistics",
    title: "物流管理",
    description: "面向仓配运营的承运商占位、运费模板、轨迹异常和快递打印入口。",
    owner: "仓配运营",
    todo: "TODO: 后续接入物流轨迹和面单模板只读状态，不调用真实物流 API、云打印或发货接口。",
    primaryAction: "新建运费模板占位",
    secondaryAction: "进入快递打印占位",
    filters: ["物流单号 / 订单号", "承运商", "发货仓"],
    stats: [
      { label: "待打印订单", value: "18", helper: "仅 mock，不生成运单", tone: "amber" },
      { label: "运输中", value: "96", helper: "只读", tone: "blue" },
      { label: "物流异常", value: "2", helper: "不调用真实物流", tone: "red" },
    ],
    statuses: commonStatuses,
    columns: [
      { key: "tracking", label: "物流单号" },
      { key: "carrier", label: "承运商" },
      { key: "warehouse", label: "发货仓" },
      { key: "statusText", label: "状态" },
      { key: "updated", label: "更新时间" },
    ],
    rows: [
      {
        id: "L-01",
        status: "pending",
        cells: {
          tracking: "MOCK-EXPRESS-0001",
          carrier: "电子面单占位",
          warehouse: "三门市场档口 A18",
          statusText: "待打印 mock",
          updated: "2026-05-03 10:50",
        },
      },
      {
        id: "L-02",
        status: "risk",
        cells: {
          tracking: "MOCK-EXPRESS-0002",
          carrier: "承运商占位",
          warehouse: "沿海冷链市场",
          statusText: "面单预览异常 mock",
          updated: "2026-05-03 09:16",
        },
      },
    ],
    emptyTitle: "暂无物流记录",
    emptyDescription: "当前为 mock 展示，不调用真实物流、电子面单或轨迹接口。",
  },
  {
    id: "waybillPrinting",
    title: "快递打印 / 电子面单",
    description:
      "预留待打印订单、面单预览、打印机设置、打印记录、批量打印按钮和电子面单占位，不接真实物流或云打印。",
    owner: "仓配运营",
    todo: "TODO: 后续如需接快递100、菜鸟、顺丰、京东物流或云打印，必须单独实现 provider 边界、验权和幂等；当前不生成真实运单号、不确认发货、不修改订单状态。",
    primaryAction: "查看打印占位",
    secondaryAction: "打印机设置占位",
    filters: ["订单号 / 收件人", "打印状态", "配送方式"],
    stats: [
      { label: "待打印订单", value: "18", helper: "mock 待处理", tone: "amber" },
      { label: "面单预览", value: "12", helper: "仅前端占位", tone: "blue" },
      { label: "打印记录", value: "36", helper: "静态记录", tone: "green" },
    ],
    statuses: [
      { key: "all", label: "全部" },
      { key: "pending", label: "待打印" },
      { key: "normal", label: "已预览" },
      { key: "risk", label: "打印异常" },
      { key: "empty", label: "空状态" },
    ],
    columns: [
      { key: "order", label: "订单 / 提货单" },
      { key: "receiver", label: "收件人" },
      { key: "waybill", label: "电子面单" },
      { key: "printer", label: "打印机设置" },
      { key: "record", label: "打印记录" },
    ],
    rows: [
      {
        id: "WB-01",
        status: "pending",
        cells: {
          order: "O-202605030021",
          receiver: "周女士 138****8821",
          waybill: "面单预览占位，未生成真实运单号",
          printer: "热敏打印机 mock，未连接云打印",
          record: "待批量打印",
        },
      },
      {
        id: "WB-02",
        status: "normal",
        cells: {
          order: "PU20260503012",
          receiver: "自提转配送占位",
          waybill: "电子面单占位预览",
          printer: "A18 档口打印机 mock",
          record: "预览成功，未确认发货",
        },
      },
      {
        id: "WB-03",
        status: "risk",
        cells: {
          order: "O-202605030019",
          receiver: "李先生 136****0198",
          waybill: "模板字段缺失 mock",
          printer: "未选择打印机",
          record: "打印异常占位，不重试真实接口",
        },
      },
    ],
    emptyTitle: "暂无待打印订单",
    emptyDescription:
      "快递打印为纯 UI 占位，不接快递100、菜鸟、顺丰、京东物流或云打印，不生成真实运单号，不确认发货。",
  },
  {
    id: "afterSales",
    title: "售后管理",
    description: "集中展示退款、退货、换货、补寄和平台介入等售后事项。",
    owner: "售后客服",
    todo: "TODO: 后续接入售后单只读查询 API，退款/换货动作需独立任务。",
    primaryAction: "批量同意占位",
    secondaryAction: "导出售后单占位",
    filters: ["售后单号 / 订单号", "申请类型", "处理时效"],
    stats: [
      { label: "待处理", value: "7", helper: "不执行退款", tone: "red" },
      { label: "平台介入", value: "2", helper: "需关注", tone: "amber" },
      { label: "已完结", value: "42", helper: "mock", tone: "green" },
    ],
    statuses: commonStatuses,
    columns: [
      { key: "ticket", label: "售后单" },
      { key: "type", label: "类型" },
      { key: "buyer", label: "买家" },
      { key: "amount", label: "涉及金额" },
      { key: "deadline", label: "处理时限" },
    ],
    rows: [
      {
        id: "A-1001",
        status: "pending",
        cells: {
          ticket: "AS20260503007",
          type: "仅退款",
          buyer: "王女士 137****6200",
          amount: "¥59.90",
          deadline: "剩余 3 小时",
        },
      },
      {
        id: "A-1002",
        status: "risk",
        cells: {
          ticket: "AS20260502042",
          type: "退货退款",
          buyer: "赵先生 150****7741",
          amount: "¥268.00",
          deadline: "平台介入",
        },
      },
    ],
    emptyTitle: "暂无售后单",
    emptyDescription: "此页面只提供售后处理入口壳，不实现真实退款或换货流程。",
  },
  {
    id: "service",
    title: "客服管理",
    description: "用于跟进咨询、未读消息、会话标签和服务质量的客服台。",
    owner: "客服主管",
    todo: "TODO: 后续接入 IM 会话只读摘要，不接真实客服发送接口。",
    primaryAction: "分配会话占位",
    secondaryAction: "快捷回复占位",
    filters: ["买家昵称 / 手机号", "会话来源", "客服人员"],
    stats: [
      { label: "未读消息", value: "19", helper: "mock", tone: "amber" },
      { label: "待回复", value: "11", helper: "平均 2 分钟", tone: "blue" },
      { label: "投诉预警", value: "1", helper: "需主管跟进", tone: "red" },
    ],
    statuses: commonStatuses,
    columns: [
      { key: "conversation", label: "会话" },
      { key: "buyer", label: "买家" },
      { key: "topic", label: "咨询主题" },
      { key: "owner", label: "客服" },
      { key: "updated", label: "最近消息" },
    ],
    rows: [
      {
        id: "C-01",
        status: "pending",
        cells: {
          conversation: "IM-20260503-12",
          buyer: "小林 135****9022",
          topic: "催发货",
          owner: "客服 A",
          updated: "2 分钟前",
        },
      },
      {
        id: "C-03",
        status: "risk",
        cells: {
          conversation: "IM-20260502-88",
          buyer: "阿辰 186****4560",
          topic: "投诉预警",
          owner: "客服主管",
          updated: "40 分钟前",
        },
      },
    ],
    emptyTitle: "暂无客服会话",
    emptyDescription: "当前不接入真实 IM，仅保留中国商家常见客服工作台占位。",
  },
  {
    id: "marketing",
    title: "营销管理",
    description: "规划平台活动、优惠券、店铺活动和报名进度的增长入口。",
    owner: "营销运营",
    todo: "TODO: 后续接入活动和优惠券只读查询 API，不发布真实营销活动。",
    primaryAction: "创建活动占位",
    secondaryAction: "报名大促占位",
    filters: ["活动名称", "活动类型", "报名状态"],
    stats: [
      { label: "活动中", value: "3", helper: "mock", tone: "blue" },
      { label: "待报名", value: "2", helper: "截止 05-10", tone: "amber" },
      { label: "素材待补", value: "4", helper: "需运营处理", tone: "red" },
    ],
    statuses: commonStatuses,
    columns: [
      { key: "campaign", label: "活动" },
      { key: "type", label: "类型" },
      { key: "period", label: "周期" },
      { key: "statusText", label: "状态" },
      { key: "owner", label: "负责人" },
    ],
    rows: [
      {
        id: "M-01",
        status: "normal",
        cells: {
          campaign: "夏季上新满减",
          type: "店铺活动",
          period: "2026-05-01 至 2026-05-15",
          statusText: "进行中",
          owner: "王运营",
        },
      },
      {
        id: "M-02",
        status: "pending",
        cells: {
          campaign: "平台 618 预热",
          type: "平台招商",
          period: "报名截止 2026-05-10",
          statusText: "待报名",
          owner: "张经理",
        },
      },
    ],
    emptyTitle: "暂无营销活动",
    emptyDescription: "营销入口为只读/占位，不创建真实活动或优惠券。",
  },
  {
    id: "liveOps",
    title: "直播管理",
    description:
      "预留今日鲜货直播、店铺/档口直播、开播占位、直播商品选择、直播公告、回放管理和直播咨询/订单占位。",
    owner: "商家运营",
    todo: "TODO: 后续如需接真实直播、IM、推流、支付或直播订单，必须单独设计服务边界；当前不接任何真实直播能力。",
    primaryAction: "开播占位",
    secondaryAction: "选择直播商品占位",
    filters: ["直播主题", "直播状态", "市场 / 档口"],
    stats: [
      { label: "今日鲜货直播", value: "2", helper: "mock 排期", tone: "blue" },
      { label: "待选商品", value: "8", helper: "不锁库存", tone: "amber" },
      { label: "直播咨询", value: "16", helper: "不接真实 IM", tone: "green" },
    ],
    statuses: [
      { key: "all", label: "全部" },
      { key: "pending", label: "待开播" },
      { key: "normal", label: "回放可见" },
      { key: "risk", label: "需补信息" },
      { key: "empty", label: "空状态" },
    ],
    columns: [
      { key: "live", label: "直播场次" },
      { key: "booth", label: "店铺 / 档口" },
      { key: "goods", label: "直播商品选择" },
      { key: "notice", label: "直播公告" },
      { key: "record", label: "回放 / 咨询订单占位" },
    ],
    rows: [
      {
        id: "LV-01",
        status: "pending",
        cells: {
          live: "今日鲜货直播 05:30 场",
          booth: "三门海鲜市场 A18 档口",
          goods: "小黄鱼、梭子蟹、带鱼",
          notice: "今日到港鲜货，价格以页面确认为准",
          record: "待开播；咨询和订单仅占位",
        },
      },
      {
        id: "LV-02",
        status: "normal",
        cells: {
          live: "档口直播回放",
          booth: "沿海冷链市场 冷链仓 03",
          goods: "冻虾仁、冻带鱼",
          notice: "冷链发货说明 mock",
          record: "回放管理占位，不存真实视频",
        },
      },
      {
        id: "LV-03",
        status: "risk",
        cells: {
          live: "果蔬早市直播",
          booth: "三门海鲜市场 果蔬合作档",
          goods: "本地青菜、番茄",
          notice: "需补充直播公告",
          record: "直播咨询/订单占位，不创建真实订单",
        },
      },
    ],
    emptyTitle: "暂无直播场次",
    emptyDescription:
      "直播管理当前只做 UI 信息架构，不接真实直播、IM、推流、支付或直播订单。",
  },
  {
    id: "supplierWorkspace",
    title: "供应方工作台",
    description:
      "按平台开通角色聚合物料供应商、配送供应商、养殖户、种植户、种苗供应商和外地批发商入口。",
    owner: "供应方负责人",
    todo: "TODO: 后续接入供应方角色与模块开通只读配置；当前不实现真实权限、合同、采购、支付或结算。",
    primaryAction: "进入已开通模块占位",
    secondaryAction: "查看角色边界占位",
    filters: ["供应方类型", "服务市场", "开通状态"],
    stats: [
      { label: "独立供应方类型", value: "6", helper: "按角色分离", tone: "blue" },
      { label: "平台开通模块", value: "3", helper: "mock 可见", tone: "green" },
      { label: "待补资质", value: "4", helper: "资质占位", tone: "amber" },
    ],
    statuses: commonStatuses,
    columns: [
      { key: "workspace", label: "工作台" },
      { key: "role", label: "角色边界" },
      { key: "documents", label: "核心单据" },
      { key: "market", label: "服务 / 对接市场" },
      { key: "statusText", label: "状态" },
    ],
    rows: [
      {
        id: "SWK-01",
        status: "pending",
        cells: {
          workspace: "物料供应商工作台",
          role: "泡沫箱、冰袋、标签等物料供货",
          documents: "商户物料订单",
          market: "三门海鲜市场",
          statusText: "平台开通后可见 mock",
        },
      },
      {
        id: "SWK-02",
        status: "pending",
        cells: {
          workspace: "配送供应商工作台",
          role: "市场配送服务、异常处理、服务范围",
          documents: "配送服务单",
          market: "三门海鲜市场 / 沿海冷链市场",
          statusText: "平台开通后可见 mock",
        },
      },
      {
        id: "SWK-03",
        status: "normal",
        cells: {
          workspace: "上游货源工作台",
          role: "养殖户、种植户、外地批发商对接商户",
          documents: "货源采购单 / 报价单 / 到货计划",
          market: "本地市场商户",
          statusText: "只读占位 mock",
        },
      },
      {
        id: "SWK-04",
        status: "normal",
        cells: {
          workspace: "种苗供给工作台",
          role: "苗种供应商对接养殖户、种植户和部分商户",
          documents: "种苗采购单 / 到苗计划",
          market: "养殖户 / 种植户 / 商户",
          statusText: "只读占位 mock",
        },
      },
    ],
    emptyTitle: "暂无供应方模块",
    emptyDescription:
      "供应方工作台只做角色入口聚合，不把供应方混入普通商品商户，也不执行真实采购或结算。",
  },
  {
    id: "materialPurchase",
    title: "市场物料采购",
    description: "面向入驻商户的 B 端物料采购入口，不面向普通消费者。",
    owner: "入驻商户",
    todo: "TODO: 后续接入物料目录和采购单只读 API，不接真实支付、库存或结算。",
    primaryAction: "提交采购单占位",
    secondaryAction: "查看物料目录占位",
    filters: ["物料名称", "供应商", "采购状态"],
    stats: [
      { label: "可采购物料", value: "7", helper: "泡沫箱/冰袋等", tone: "blue" },
      { label: "待确认采购", value: "3", helper: "mock", tone: "amber" },
      { label: "平台开通提示", value: "可见", helper: "不做真实权限", tone: "slate" },
    ],
    statuses: commonStatuses,
    columns: [
      { key: "material", label: "物料" },
      { key: "supplier", label: "供应商" },
      { key: "spec", label: "规格" },
      { key: "price", label: "参考价" },
      { key: "statusText", label: "状态" },
    ],
    rows: [
      {
        id: "MP-01",
        status: "normal",
        cells: {
          material: "泡沫箱",
          supplier: "三门市场物料合作商",
          spec: "中号 5kg",
          price: "¥6.80 / 个",
          statusText: "可采购 mock",
        },
      },
      {
        id: "MP-02",
        status: "normal",
        cells: {
          material: "冰袋",
          supplier: "冷链物料供应商",
          spec: "500g",
          price: "¥1.20 / 包",
          statusText: "可采购 mock",
        },
      },
      {
        id: "MP-03",
        status: "pending",
        cells: {
          material: "标签",
          supplier: "包装耗材供应商",
          spec: "热敏 60x40",
          price: "¥18.00 / 卷",
          statusText: "平台开通后可见",
        },
      },
    ],
    emptyTitle: "暂无物料",
    emptyDescription: "市场物料采购是 B 端能力，当前不面向普通消费者且不创建真实采购单。",
  },
  {
    id: "materialSupplier",
    title: "物料供应商工作台",
    description: "预留给物料供应商的接单、履约和供货能力入口。",
    owner: "物料供应商",
    todo: "TODO: 后续接入物料供应商只读工作台，不接真实支付、结算或库存扣减。",
    primaryAction: "接单设置占位",
    secondaryAction: "供应商资料占位",
    filters: ["供应商名称", "开通模块", "服务市场"],
    stats: [
      { label: "待接物料单", value: "6", helper: "mock", tone: "amber" },
      { label: "供货商品", value: "18", helper: "泡沫箱/冰块等", tone: "blue" },
      { label: "服务市场", value: "1", helper: "三门示例", tone: "green" },
    ],
    statuses: commonStatuses,
    columns: [
      { key: "supplier", label: "供应商" },
      { key: "market", label: "服务市场" },
      { key: "materials", label: "供货范围" },
      { key: "statusText", label: "开通状态" },
      { key: "note", label: "说明" },
    ],
    rows: [
      {
        id: "MS-01",
        status: "pending",
        cells: {
          supplier: "三门市场物料合作商",
          market: "三门海鲜市场",
          materials: "泡沫箱、包装箱、胶带",
          statusText: "平台开通后可见",
          note: "供应商角色独立于普通商品商户",
        },
      },
    ],
    emptyTitle: "暂无物料供应商",
    emptyDescription: "物料供应商为独立角色 mock，不混入普通商品商户。",
  },
  {
    id: "materialOrders",
    title: "物料订单",
    description: "物料供应商可接收商户物料采购单；当前仅展示 mock 订单。",
    owner: "物料供应商",
    todo: "TODO: 后续接入物料订单只读查询 API，不接真实支付、结算或发货。",
    primaryAction: "查看接单占位",
    secondaryAction: "导出物料单占位",
    filters: ["物料订单号", "采购商户", "订单状态"],
    stats: [
      { label: "待接单", value: "6", helper: "mock", tone: "amber" },
      { label: "待备货", value: "4", helper: "不扣库存", tone: "blue" },
      { label: "异常订单", value: "1", helper: "需人工处理", tone: "red" },
    ],
    statuses: commonStatuses,
    columns: [
      { key: "order", label: "物料订单" },
      { key: "buyer", label: "采购商户" },
      { key: "items", label: "物料" },
      { key: "amount", label: "参考金额" },
      { key: "statusText", label: "状态" },
    ],
    rows: [
      {
        id: "MO-01",
        status: "pending",
        cells: {
          order: "MO20260503001",
          buyer: "海鲜档口 A",
          items: "泡沫箱 x 30、冰袋 x 60",
          amount: "¥276.00",
          statusText: "待接单 mock",
        },
      },
    ],
    emptyTitle: "暂无物料订单",
    emptyDescription: "物料订单当前不创建真实交易、支付、结算或履约。",
  },
  {
    id: "supplyProducts",
    title: "供货商品",
    description: "物料供应商维护泡沫箱、包装箱、冰袋、冰块、周转筐、胶带、标签等供货目录。",
    owner: "物料供应商",
    todo: "TODO: 后续接入供货商品只读 API，不写入真实商品或库存。",
    primaryAction: "新增供货商品占位",
    secondaryAction: "批量维护占位",
    filters: ["供货商品", "物料类型", "开售状态"],
    stats: [
      { label: "供货商品", value: "18", helper: "mock", tone: "blue" },
      { label: "待补规格", value: "3", helper: "需完善", tone: "amber" },
      { label: "已下架", value: "2", helper: "静态状态", tone: "slate" },
    ],
    statuses: commonStatuses,
    columns: [
      { key: "product", label: "供货商品" },
      { key: "type", label: "物料类型" },
      { key: "spec", label: "规格" },
      { key: "price", label: "参考价" },
      { key: "statusText", label: "状态" },
    ],
    rows: [
      {
        id: "SP-01",
        status: "normal",
        cells: {
          product: "泡沫箱",
          type: "包装容器",
          spec: "中号 5kg",
          price: "¥6.80 / 个",
          statusText: "可供货 mock",
        },
      },
    ],
    emptyTitle: "暂无供货商品",
    emptyDescription: "供货商品为物料供应商独立目录，不混入普通商品管理。",
  },
  {
    id: "deliveryServices",
    title: "配送服务",
    description: "配送供应商独立维护服务类型、时效和承运能力。",
    owner: "配送供应商",
    todo: "TODO: 后续接入配送服务只读 API，不创建真实配送产品或计费规则。",
    primaryAction: "新增配送服务占位",
    secondaryAction: "配置服务规则占位",
    filters: ["服务名称", "服务类型", "开通市场"],
    stats: [
      { label: "服务类型", value: "3", helper: "同城/冷链/干线", tone: "blue" },
      { label: "服务市场", value: "1", helper: "三门示例", tone: "green" },
      { label: "待审核", value: "1", helper: "平台开通后可见", tone: "amber" },
    ],
    statuses: commonStatuses,
    columns: [
      { key: "service", label: "配送服务" },
      { key: "type", label: "类型" },
      { key: "market", label: "服务市场" },
      { key: "sla", label: "时效" },
      { key: "statusText", label: "状态" },
    ],
    rows: [
      {
        id: "DS-01",
        status: "normal",
        cells: {
          service: "市场同城配送",
          type: "同城即时",
          market: "三门海鲜市场",
          sla: "2 小时内",
          statusText: "mock 已开通",
        },
      },
    ],
    emptyTitle: "暂无配送服务",
    emptyDescription: "配送服务为供应商独立 mock 入口，不改变真实物流配置。",
  },
  {
    id: "deliveryOrders",
    title: "配送订单",
    description: "配送供应商查看待揽收、配送中和签收状态的订单占位页。",
    owner: "配送供应商",
    todo: "TODO: 后续接入配送订单只读 API，不执行真实揽收、派送或签收。",
    primaryAction: "查看配送单占位",
    secondaryAction: "导出配送单占位",
    filters: ["配送单号", "服务市场", "配送状态"],
    stats: [
      { label: "待揽收", value: "9", helper: "mock", tone: "amber" },
      { label: "配送中", value: "24", helper: "只读", tone: "blue" },
      { label: "异常", value: "2", helper: "需处理", tone: "red" },
    ],
    statuses: commonStatuses,
    columns: [
      { key: "delivery", label: "配送单" },
      { key: "market", label: "市场" },
      { key: "merchant", label: "商户" },
      { key: "service", label: "服务" },
      { key: "statusText", label: "状态" },
    ],
    rows: [
      {
        id: "DO-01",
        status: "pending",
        cells: {
          delivery: "DO20260503008",
          market: "三门海鲜市场",
          merchant: "海鲜档口 A",
          service: "同城冷链",
          statusText: "待揽收 mock",
        },
      },
    ],
    emptyTitle: "暂无配送订单",
    emptyDescription: "配送订单不触发真实物流、订单归属或履约状态变更。",
  },
  {
    id: "deliveryExceptions",
    title: "配送异常处理",
    description: "配送供应商处理超时、拒收、地址异常等服务异常占位入口。",
    owner: "配送供应商",
    todo: "TODO: 后续接入配送异常只读 API，不写入真实订单或售后状态。",
    primaryAction: "处理异常占位",
    secondaryAction: "导出异常占位",
    filters: ["异常类型", "配送单号", "处理状态"],
    stats: [
      { label: "待处理异常", value: "2", helper: "mock", tone: "red" },
      { label: "超时预警", value: "3", helper: "只读", tone: "amber" },
      { label: "已完结", value: "18", helper: "静态", tone: "green" },
    ],
    statuses: commonStatuses,
    columns: [
      { key: "exception", label: "异常" },
      { key: "delivery", label: "配送单" },
      { key: "reason", label: "原因" },
      { key: "owner", label: "处理人" },
      { key: "statusText", label: "状态" },
    ],
    rows: [
      {
        id: "DE-01",
        status: "risk",
        cells: {
          exception: "地址异常",
          delivery: "DO20260503008",
          reason: "档口联系人电话未接通",
          owner: "配送调度",
          statusText: "待处理 mock",
        },
      },
    ],
    emptyTitle: "暂无配送异常",
    emptyDescription: "异常处理为 mock UI，不更新真实订单、售后或配送状态。",
  },
  {
    id: "deliveryCoverage",
    title: "服务范围",
    description: "配送供应商维护市场、街道、时段和服务半径等范围占位。",
    owner: "配送供应商",
    todo: "TODO: 后续接入服务范围只读 API，不改变真实配送规则。",
    primaryAction: "新增范围占位",
    secondaryAction: "批量配置占位",
    filters: ["市场", "行政区", "服务状态"],
    stats: [
      { label: "服务市场", value: "1", helper: "三门示例", tone: "blue" },
      { label: "覆盖街道", value: "8", helper: "mock", tone: "green" },
      { label: "待开通区域", value: "2", helper: "平台配置", tone: "amber" },
    ],
    statuses: commonStatuses,
    columns: [
      { key: "market", label: "市场" },
      { key: "area", label: "区域" },
      { key: "time", label: "服务时段" },
      { key: "range", label: "范围" },
      { key: "statusText", label: "状态" },
    ],
    rows: [
      {
        id: "DC-01",
        status: "normal",
        cells: {
          market: "三门海鲜市场",
          area: "海游街道",
          time: "06:00-18:00",
          range: "市场周边 8km",
          statusText: "mock 已开通",
        },
      },
    ],
    emptyTitle: "暂无服务范围",
    emptyDescription: "服务范围仅为配送供应商 mock 配置，不改变真实运费或履约规则。",
  },
  {
    id: "upstreamSources",
    title: "上游货源",
    description: "预留养殖户、种植户等上游供给方与市场商户的货源对接入口。",
    owner: "供给对接",
    todo: "TODO: 后续接入上游货源只读 API，不创建真实采购、库存、支付或结算。",
    primaryAction: "发布采购意向占位",
    secondaryAction: "查看供给地图占位",
    filters: ["货源品类", "供给方类型", "对接状态"],
    stats: [
      { label: "今日到货", value: "8 批", helper: "mock 到货计划", tone: "green" },
      { label: "待确认报价", value: "12", helper: "不成交", tone: "amber" },
      { label: "合作供给方", value: "26", helper: "养殖户/种植户", tone: "blue" },
    ],
    statuses: commonStatuses,
    columns: [
      { key: "source", label: "货源" },
      { key: "supplier", label: "供给方" },
      { key: "target", label: "对接商户" },
      { key: "quote", label: "参考报价" },
      { key: "statusText", label: "状态" },
    ],
    rows: [
      {
        id: "US-01",
        status: "pending",
        cells: {
          source: "梭子蟹",
          supplier: "沿海养殖户 A",
          target: "海鲜档口",
          quote: "¥68.00 / 斤",
          statusText: "待确认报价 mock",
        },
      },
      {
        id: "US-02",
        status: "normal",
        cells: {
          source: "本地番茄",
          supplier: "湾区种植户 B",
          target: "水果蔬菜商户",
          quote: "¥3.20 / 斤",
          statusText: "到货计划 mock",
        },
      },
    ],
    emptyTitle: "暂无上游货源",
    emptyDescription: "上游货源用于对接商户，不面向普通消费者购买。",
  },
  {
    id: "farmSuppliers",
    title: "养殖户 / 种植户",
    description: "管理上游供给方资料，区分养殖户、种植户及其可供品类。",
    owner: "供给对接",
    todo: "TODO: 后续接入供给方只读资料，不写入真实供应商或商户角色。",
    primaryAction: "新增供给方占位",
    secondaryAction: "导入资料占位",
    filters: ["供给方名称", "供给方类型", "服务市场"],
    stats: [
      { label: "养殖户", value: "14", helper: "海鲜/水产", tone: "blue" },
      { label: "种植户", value: "12", helper: "果蔬/配菜", tone: "green" },
      { label: "待审核", value: "3", helper: "平台开通后可见", tone: "amber" },
    ],
    statuses: commonStatuses,
    columns: [
      { key: "supplier", label: "供给方" },
      { key: "type", label: "类型" },
      { key: "scope", label: "可供品类" },
      { key: "market", label: "对接市场" },
      { key: "statusText", label: "状态" },
    ],
    rows: [
      {
        id: "FS-01",
        status: "normal",
        cells: {
          supplier: "沿海养殖户 A",
          type: "养殖户",
          scope: "梭子蟹、青蟹",
          market: "三门海鲜市场",
          statusText: "合作中 mock",
        },
      },
      {
        id: "FS-02",
        status: "normal",
        cells: {
          supplier: "湾区种植户 B",
          type: "种植户",
          scope: "番茄、青菜",
          market: "三门海鲜市场",
          statusText: "合作中 mock",
        },
      },
    ],
    emptyTitle: "暂无供给方",
    emptyDescription: "养殖户/种植户是上游供给方，不等同普通市场档口商户。",
  },
  {
    id: "supplyQuotes",
    title: "供应报价",
    description: "上游供给方向商户提供货源报价，当前仅做待确认报价 mock。",
    owner: "供给对接",
    todo: "TODO: 后续接入供应报价只读 API，不创建真实采购订单或结算。",
    primaryAction: "查看报价占位",
    secondaryAction: "询价占位",
    filters: ["报价单号", "供给方", "报价状态"],
    stats: [
      { label: "待确认报价", value: "12", helper: "mock", tone: "amber" },
      { label: "今日新增", value: "5", helper: "只读", tone: "blue" },
      { label: "即将过期", value: "2", helper: "需跟进", tone: "red" },
    ],
    statuses: commonStatuses,
    columns: [
      { key: "quote", label: "报价单" },
      { key: "supplier", label: "供给方" },
      { key: "target", label: "对接商户" },
      { key: "price", label: "报价" },
      { key: "valid", label: "有效期" },
    ],
    rows: [
      {
        id: "SQ-01",
        status: "pending",
        cells: {
          quote: "Q20260503006",
          supplier: "沿海养殖户 A",
          target: "海鲜档口 A",
          price: "梭子蟹 ¥68.00 / 斤",
          valid: "今日 16:00 前",
        },
      },
    ],
    emptyTitle: "暂无供应报价",
    emptyDescription: "供应报价不触发真实采购、库存、支付或结算。",
  },
  {
    id: "purchaseNeeds",
    title: "采购需求",
    description: "市场商户发布给上游供给方的采购需求占位页。",
    owner: "供给对接",
    todo: "TODO: 后续接入采购需求只读 API，不发布真实采购单。",
    primaryAction: "发布需求占位",
    secondaryAction: "匹配供给方占位",
    filters: ["需求品类", "目标商户", "匹配状态"],
    stats: [
      { label: "待匹配需求", value: "9", helper: "mock", tone: "amber" },
      { label: "已报价", value: "16", helper: "只读", tone: "green" },
      { label: "缺货风险", value: "3", helper: "需跟进", tone: "red" },
    ],
    statuses: commonStatuses,
    columns: [
      { key: "need", label: "采购需求" },
      { key: "merchant", label: "目标商户" },
      { key: "category", label: "品类" },
      { key: "quantity", label: "需求量" },
      { key: "statusText", label: "状态" },
    ],
    rows: [
      {
        id: "PN-01",
        status: "pending",
        cells: {
          need: "明日鲜活梭子蟹",
          merchant: "海鲜档口 A",
          category: "海鲜水产",
          quantity: "120 斤",
          statusText: "待供给方报价 mock",
        },
      },
    ],
    emptyTitle: "暂无采购需求",
    emptyDescription: "采购需求用于商户和上游供给方对接，不面向消费者。",
  },
  {
    id: "arrivalPlans",
    title: "到货计划",
    description: "展示上游供给方预计到货批次、时间和对接商户。",
    owner: "供给对接",
    todo: "TODO: 后续接入到货计划只读 API，不写入真实库存或履约状态。",
    primaryAction: "查看到货占位",
    secondaryAction: "导出计划占位",
    filters: ["到货批次", "供给方", "预计时间"],
    stats: [
      { label: "今日到货", value: "8 批", helper: "mock", tone: "green" },
      { label: "待确认", value: "4", helper: "不入库", tone: "amber" },
      { label: "延迟预警", value: "1", helper: "需跟进", tone: "red" },
    ],
    statuses: commonStatuses,
    columns: [
      { key: "batch", label: "到货批次" },
      { key: "supplier", label: "供给方" },
      { key: "merchant", label: "对接商户" },
      { key: "eta", label: "预计到货" },
      { key: "statusText", label: "状态" },
    ],
    rows: [
      {
        id: "AP-01",
        status: "normal",
        cells: {
          batch: "AP20260503003",
          supplier: "湾区种植户 B",
          merchant: "水果蔬菜商户 C",
          eta: "2026-05-03 14:30",
          statusText: "预计到货 mock",
        },
      },
    ],
    emptyTitle: "暂无到货计划",
    emptyDescription: "到货计划不写入真实库存、订单或结算。",
  },
  {
    id: "seedWholesale",
    title: "种苗批发",
    description: "预留更上游的种苗批发供给链入口，主要对接养殖户、种植户，也可对接部分商户。",
    owner: "种苗供给",
    todo: "TODO: 后续接入种苗批发只读 API，不创建真实采购、合同、库存、支付或结算。",
    primaryAction: "发布种苗需求占位",
    secondaryAction: "查看苗种行情占位",
    filters: ["苗种品类", "对接对象", "报价状态"],
    stats: [
      { label: "待确认种苗报价", value: "7", helper: "mock", tone: "amber" },
      { label: "到苗计划", value: "5 批", helper: "不入库", tone: "green" },
      { label: "合作苗种供应商", value: "9", helper: "独立供给方", tone: "blue" },
    ],
    statuses: commonStatuses,
    columns: [
      { key: "seed", label: "苗种" },
      { key: "supplier", label: "苗种供应商" },
      { key: "target", label: "对接对象" },
      { key: "quote", label: "参考报价" },
      { key: "statusText", label: "状态" },
    ],
    rows: [
      {
        id: "SW-01",
        status: "pending",
        cells: {
          seed: "青蟹苗",
          supplier: "沿海苗种供应商 A",
          target: "养殖户",
          quote: "¥0.68 / 尾",
          statusText: "待确认报价 mock",
        },
      },
      {
        id: "SW-02",
        status: "normal",
        cells: {
          seed: "番茄苗",
          supplier: "湾区育苗合作社 B",
          target: "种植户 / 果蔬商户",
          quote: "¥0.32 / 株",
          statusText: "到苗计划 mock",
        },
      },
    ],
    emptyTitle: "暂无种苗批发记录",
    emptyDescription: "种苗批发用于上游对接，不面向普通消费者，也不等同市场档口商户。",
  },
  {
    id: "seedSuppliers",
    title: "苗种供应商",
    description: "管理种苗供应商资料，作为独立上游供给方类型预留。",
    owner: "种苗供给",
    todo: "TODO: 后续接入苗种供应商只读资料，不写入真实供应商、合同或订单。",
    primaryAction: "新增苗种供应商占位",
    secondaryAction: "导入资料占位",
    filters: ["供应商名称", "苗种类型", "服务对象"],
    stats: [
      { label: "苗种供应商", value: "9", helper: "mock", tone: "blue" },
      { label: "服务养殖户", value: "14", helper: "对接对象", tone: "green" },
      { label: "待审核", value: "2", helper: "平台开通后可见", tone: "amber" },
    ],
    statuses: commonStatuses,
    columns: [
      { key: "supplier", label: "供应商" },
      { key: "seed", label: "苗种范围" },
      { key: "target", label: "主要对接对象" },
      { key: "market", label: "覆盖市场" },
      { key: "statusText", label: "状态" },
    ],
    rows: [
      {
        id: "SS-01",
        status: "normal",
        cells: {
          supplier: "沿海苗种供应商 A",
          seed: "青蟹苗、虾苗",
          target: "养殖户",
          market: "三门海鲜市场",
          statusText: "合作中 mock",
        },
      },
    ],
    emptyTitle: "暂无苗种供应商",
    emptyDescription: "苗种供应商不是普通消费者，也不等同市场档口商户。",
  },
  {
    id: "seedNeeds",
    title: "种苗采购需求",
    description: "养殖户、种植户或部分商户向苗种供应商发起的采购需求占位页。",
    owner: "种苗供给",
    todo: "TODO: 后续接入种苗采购需求只读 API，不发布真实采购单。",
    primaryAction: "发布需求占位",
    secondaryAction: "匹配苗种供应商占位",
    filters: ["苗种品类", "需求方", "匹配状态"],
    stats: [
      { label: "待匹配需求", value: "6", helper: "mock", tone: "amber" },
      { label: "已收到报价", value: "11", helper: "只读", tone: "green" },
      { label: "缺苗预警", value: "2", helper: "需跟进", tone: "red" },
    ],
    statuses: commonStatuses,
    columns: [
      { key: "need", label: "需求" },
      { key: "buyer", label: "需求方" },
      { key: "target", label: "对接对象类型" },
      { key: "quantity", label: "需求量" },
      { key: "statusText", label: "状态" },
    ],
    rows: [
      {
        id: "SN-01",
        status: "pending",
        cells: {
          need: "青蟹苗补苗",
          buyer: "养殖户 C",
          target: "养殖户",
          quantity: "20,000 尾",
          statusText: "待苗种供应商报价 mock",
        },
      },
    ],
    emptyTitle: "暂无种苗采购需求",
    emptyDescription: "种苗采购需求用于上游对接，不面向消费者前台购买。",
  },
  {
    id: "seedQuotes",
    title: "种苗报价单",
    description: "苗种供应商面向养殖户、种植户和部分商户提供报价的占位页。",
    owner: "种苗供给",
    todo: "TODO: 后续接入种苗报价只读 API，不创建真实合同、订单、支付或结算。",
    primaryAction: "查看报价占位",
    secondaryAction: "发起询价占位",
    filters: ["报价单号", "苗种供应商", "有效期"],
    stats: [
      { label: "待确认报价", value: "7", helper: "mock", tone: "amber" },
      { label: "今日新增", value: "3", helper: "只读", tone: "blue" },
      { label: "即将过期", value: "1", helper: "需跟进", tone: "red" },
    ],
    statuses: commonStatuses,
    columns: [
      { key: "quote", label: "报价单" },
      { key: "supplier", label: "苗种供应商" },
      { key: "buyer", label: "对接对象" },
      { key: "price", label: "报价" },
      { key: "valid", label: "有效期" },
    ],
    rows: [
      {
        id: "SQT-01",
        status: "pending",
        cells: {
          quote: "SQ20260503002",
          supplier: "沿海苗种供应商 A",
          buyer: "养殖户 C",
          price: "青蟹苗 ¥0.68 / 尾",
          valid: "今日 15:00 前",
        },
      },
    ],
    emptyTitle: "暂无种苗报价",
    emptyDescription: "种苗报价不触发真实合同、采购、库存、支付或结算。",
  },
  {
    id: "seedPartners",
    title: "合作对象",
    description: "展示苗种供应商对接的养殖户、种植户和部分商户关系占位。",
    owner: "种苗供给",
    todo: "TODO: 后续接入合作对象只读 API，不写入真实合同关系。",
    primaryAction: "新增合作对象占位",
    secondaryAction: "查看合作记录占位",
    filters: ["对象名称", "对象类型", "合作状态"],
    stats: [
      { label: "养殖户", value: "14", helper: "主要对象", tone: "blue" },
      { label: "种植户", value: "6", helper: "部分苗种", tone: "green" },
      { label: "商户", value: "4", helper: "部分对接", tone: "slate" },
    ],
    statuses: commonStatuses,
    columns: [
      { key: "partner", label: "合作对象" },
      { key: "type", label: "类型" },
      { key: "seed", label: "苗种" },
      { key: "market", label: "关联市场" },
      { key: "statusText", label: "状态" },
    ],
    rows: [
      {
        id: "SEP-01",
        status: "normal",
        cells: {
          partner: "养殖户 C",
          type: "养殖户",
          seed: "青蟹苗",
          market: "三门海鲜市场",
          statusText: "合作中 mock",
        },
      },
    ],
    emptyTitle: "暂无合作对象",
    emptyDescription: "合作对象仅展示对接关系，不实现真实合同或订单。",
  },
  {
    id: "seedArrivalPlans",
    title: "到苗计划",
    description: "展示苗种预计到达批次、时间和对接对象的排期占位。",
    owner: "种苗供给",
    todo: "TODO: 后续接入到苗计划只读 API，不写入真实库存、合同或订单。",
    primaryAction: "确认到苗占位",
    secondaryAction: "导出计划占位",
    filters: ["到苗批次", "苗种供应商", "预计时间"],
    stats: [
      { label: "今日到苗", value: "5 批", helper: "mock", tone: "green" },
      { label: "待确认", value: "3", helper: "不入库", tone: "amber" },
      { label: "延迟预警", value: "1", helper: "需跟进", tone: "red" },
    ],
    statuses: commonStatuses,
    columns: [
      { key: "batch", label: "到苗批次" },
      { key: "supplier", label: "苗种供应商" },
      { key: "buyer", label: "对接对象" },
      { key: "eta", label: "预计到苗" },
      { key: "statusText", label: "状态" },
    ],
    rows: [
      {
        id: "SAP-01",
        status: "normal",
        cells: {
          batch: "SAP20260503001",
          supplier: "沿海苗种供应商 A",
          buyer: "养殖户 C",
          eta: "2026-05-03 13:00",
          statusText: "预计到苗 mock",
        },
      },
    ],
    emptyTitle: "暂无到苗计划",
    emptyDescription: "到苗计划不写入真实采购、库存、合同或结算。",
  },
  {
    id: "externalWholesalers",
    title: "外地批发商",
    description: "预留跨区域上游供给方入口，外地批发商直接对接本地市场商户。",
    owner: "跨区供给",
    todo: "TODO: 后续接入外地批发商只读资料，不创建真实采购、合同、库存、支付或结算。",
    primaryAction: "新增批发商占位",
    secondaryAction: "查看跨区规则占位",
    filters: ["批发商名称", "供货区域", "冷链能力"],
    stats: [
      { label: "合作批发商", value: "11", helper: "跨区供给 mock", tone: "blue" },
      { label: "待确认跨区报价", value: "6", helper: "直接对接商户", tone: "amber" },
      { label: "冷链异常", value: "2", helper: "需协同", tone: "red" },
    ],
    statuses: commonStatuses,
    columns: [
      { key: "wholesaler", label: "外地批发商" },
      { key: "region", label: "供货区域" },
      { key: "goods", label: "主要货源" },
      { key: "target", label: "直接对接商户" },
      { key: "coldChain", label: "冷链能力" },
    ],
    rows: [
      {
        id: "EW-01",
        status: "normal",
        cells: {
          wholesaler: "舟山海产批发商 A",
          region: "浙江 舟山",
          goods: "带鱼、鲳鱼、冻品",
          target: "海鲜档口 / 冻品商户",
          coldChain: "冷链车次 mock",
        },
      },
    ],
    emptyTitle: "暂无外地批发商",
    emptyDescription: "外地批发商不同于本地养殖户/种植户，也不等同市场档口商户。",
  },
  {
    id: "regionalSources",
    title: "跨区货源",
    description: "展示外地批发商可供的跨区域货源，重点关注到货周期和冷链协同。",
    owner: "跨区供给",
    todo: "TODO: 后续接入跨区货源只读 API，不写入真实采购或库存。",
    primaryAction: "发布跨区需求占位",
    secondaryAction: "查看货源地图占位",
    filters: ["货源品类", "供货区域", "到货周期"],
    stats: [
      { label: "跨区货源", value: "24", helper: "mock", tone: "blue" },
      { label: "预计到货", value: "4 车", helper: "冷链协同", tone: "green" },
      { label: "周期风险", value: "3", helper: "需跟进", tone: "amber" },
    ],
    statuses: commonStatuses,
    columns: [
      { key: "source", label: "货源" },
      { key: "region", label: "来源地" },
      { key: "cycle", label: "到货周期" },
      { key: "target", label: "对接商户" },
      { key: "statusText", label: "状态" },
    ],
    rows: [
      {
        id: "RS-01",
        status: "pending",
        cells: {
          source: "舟山带鱼",
          region: "浙江 舟山",
          cycle: "次日冷链",
          target: "海鲜档口 A",
          statusText: "待确认跨区报价 mock",
        },
      },
    ],
    emptyTitle: "暂无跨区货源",
    emptyDescription: "跨区货源用于外地批发商直接对接本地市场商户，不面向消费者前台。",
  },
  {
    id: "regionalQuotes",
    title: "跨区报价单",
    description: "外地批发商向本地市场商户提供跨区货源报价的占位页。",
    owner: "跨区供给",
    todo: "TODO: 后续接入跨区报价只读 API，不创建真实合同、订单、支付或结算。",
    primaryAction: "查看报价占位",
    secondaryAction: "发起询价占位",
    filters: ["报价单号", "外地批发商", "有效期"],
    stats: [
      { label: "待确认跨区报价", value: "6", helper: "mock", tone: "amber" },
      { label: "今日新增", value: "4", helper: "只读", tone: "blue" },
      { label: "运费待确认", value: "2", helper: "冷链协同", tone: "red" },
    ],
    statuses: commonStatuses,
    columns: [
      { key: "quote", label: "报价单" },
      { key: "wholesaler", label: "外地批发商" },
      { key: "merchant", label: "本地市场商户" },
      { key: "price", label: "报价" },
      { key: "coldChain", label: "冷链说明" },
    ],
    rows: [
      {
        id: "RQ-01",
        status: "pending",
        cells: {
          quote: "RQ20260503005",
          wholesaler: "舟山海产批发商 A",
          merchant: "海鲜档口 A",
          price: "带鱼 ¥22.00 / 斤",
          coldChain: "次日冷链到货",
        },
      },
    ],
    emptyTitle: "暂无跨区报价",
    emptyDescription: "跨区报价不触发真实采购、合同、支付或结算。",
  },
  {
    id: "regionalArrivalPlans",
    title: "跨区到货计划",
    description: "展示外地批发商跨区域到货排期、车辆和对接商户。",
    owner: "跨区供给",
    todo: "TODO: 后续接入跨区到货计划只读 API，不写入真实库存或物流状态。",
    primaryAction: "查看到货占位",
    secondaryAction: "导出计划占位",
    filters: ["到货批次", "来源地", "预计到货"],
    stats: [
      { label: "预计到货", value: "4 车", helper: "mock", tone: "green" },
      { label: "待确认", value: "3", helper: "不入库", tone: "amber" },
      { label: "延迟预警", value: "1", helper: "需跟进", tone: "red" },
    ],
    statuses: commonStatuses,
    columns: [
      { key: "batch", label: "到货批次" },
      { key: "wholesaler", label: "外地批发商" },
      { key: "merchant", label: "对接商户" },
      { key: "eta", label: "预计到货" },
      { key: "statusText", label: "状态" },
    ],
    rows: [
      {
        id: "RAP-01",
        status: "normal",
        cells: {
          batch: "RA20260503004",
          wholesaler: "舟山海产批发商 A",
          merchant: "海鲜档口 A",
          eta: "2026-05-04 05:30",
          statusText: "预计到货 mock",
        },
      },
    ],
    emptyTitle: "暂无跨区到货计划",
    emptyDescription: "跨区到货计划仅展示排期，不写入真实库存、订单或结算。",
  },
  {
    id: "coldChainArrivals",
    title: "冷链到货",
    description: "关注外地批发商跨区冷链车辆、温控和异常提醒。",
    owner: "跨区供给",
    todo: "TODO: 后续接入冷链到货只读 API，不写入真实物流、库存或履约状态。",
    primaryAction: "处理冷链异常占位",
    secondaryAction: "查看温控记录占位",
    filters: ["车次", "温控状态", "到货状态"],
    stats: [
      { label: "在途冷链", value: "4 车", helper: "mock", tone: "blue" },
      { label: "温控异常", value: "2", helper: "提醒占位", tone: "red" },
      { label: "待卸货", value: "3", helper: "市场协同", tone: "amber" },
    ],
    statuses: commonStatuses,
    columns: [
      { key: "truck", label: "冷链车次" },
      { key: "wholesaler", label: "外地批发商" },
      { key: "temperature", label: "温控" },
      { key: "merchant", label: "对接商户" },
      { key: "statusText", label: "状态" },
    ],
    rows: [
      {
        id: "CA-01",
        status: "risk",
        cells: {
          truck: "冷链车 ZJ-0821",
          wholesaler: "舟山海产批发商 A",
          temperature: "温控波动 mock",
          merchant: "冻品商户 B",
          statusText: "需协同处理",
        },
      },
    ],
    emptyTitle: "暂无冷链到货",
    emptyDescription: "冷链到货只做异常提示，不更新真实物流、库存或订单。",
  },
  {
    id: "wholesalePartners",
    title: "合作批发商",
    description: "展示与本地市场商户直接对接的外地批发商合作关系。",
    owner: "跨区供给",
    todo: "TODO: 后续接入合作批发商只读 API，不写入真实合同或供应关系。",
    primaryAction: "新增合作批发商占位",
    secondaryAction: "查看合作记录占位",
    filters: ["批发商", "来源地", "合作状态"],
    stats: [
      { label: "合作批发商", value: "11", helper: "mock", tone: "blue" },
      { label: "覆盖区域", value: "5", helper: "跨区域", tone: "green" },
      { label: "待审核", value: "2", helper: "平台开通后可见", tone: "amber" },
    ],
    statuses: commonStatuses,
    columns: [
      { key: "wholesaler", label: "批发商" },
      { key: "region", label: "来源地" },
      { key: "goods", label: "供货范围" },
      { key: "merchant", label: "直接对接商户" },
      { key: "statusText", label: "状态" },
    ],
    rows: [
      {
        id: "WP-01",
        status: "normal",
        cells: {
          wholesaler: "舟山海产批发商 A",
          region: "浙江 舟山",
          goods: "海鲜、冻品",
          merchant: "海鲜档口 A / 冻品商户 B",
          statusText: "合作中 mock",
        },
      },
    ],
    emptyTitle: "暂无合作批发商",
    emptyDescription: "合作批发商关系不创建真实合同、采购订单或结算。",
  },
  {
    id: "shopDecoration",
    title: "店铺装修",
    description: "预留店铺/档口主页装修能力：头图、公告、今日鲜货、商品分组、资质、配送说明和预览。",
    owner: "店铺负责人",
    todo: "TODO: 后续接入店铺装修草稿 API；当前不保存真实装修、不发布店铺主页。",
    primaryAction: "预览店铺占位",
    secondaryAction: "保存装修草稿占位",
    filters: ["装修模块", "展示状态", "市场视图"],
    stats: [
      { label: "首页模块", value: "7", helper: "头图/公告/鲜货等", tone: "blue" },
      { label: "待补资质", value: "2", helper: "产地/检测报告", tone: "amber" },
      { label: "预览市场", value: "三门", helper: "可切换市场视图", tone: "green" },
    ],
    statuses: commonStatuses,
    columns: [
      { key: "module", label: "装修模块" },
      { key: "content", label: "内容" },
      { key: "market", label: "市场视图" },
      { key: "statusText", label: "状态" },
      { key: "note", label: "说明" },
    ],
    rows: [
      {
        id: "SD-01",
        status: "normal",
        cells: {
          module: "店铺头图",
          content: "三门海鲜市场 A18 档口",
          market: "三门海鲜市场",
          statusText: "预览占位",
          note: "支持多市场不同头图",
        },
      },
      {
        id: "SD-02",
        status: "pending",
        cells: {
          module: "今日鲜货",
          content: "小黄鱼、梭子蟹、带鱼",
          market: "当前市场",
          statusText: "待商户确认",
          note: "可联动手机快速上架草稿",
        },
      },
      {
        id: "SD-03",
        status: "risk",
        cells: {
          module: "资质展示",
          content: "营业执照、食品经营许可、检测报告",
          market: "全市场通用",
          statusText: "待补检测报告",
          note: "仅做资质展示占位",
        },
      },
    ],
    emptyTitle: "暂无装修模块",
    emptyDescription: "店铺装修当前只展示草稿和预览占位，不保存或发布真实店铺主页。",
  },
  {
    id: "finance",
    title: "财务结算",
    description: "展示待结算、账期、平台服务费和对账异常的财务入口。",
    owner: "财务人员",
    todo: "TODO: 后续接入结算账单只读查询 API，不修改结算/佣金/提现逻辑。",
    primaryAction: "导出账单占位",
    secondaryAction: "申请开票占位",
    filters: ["结算单号", "账期", "结算状态"],
    stats: [
      { label: "待结算金额", value: "¥126,540.32", helper: "CNY mock", tone: "blue" },
      { label: "结算中", value: "2", helper: "只读", tone: "amber" },
      { label: "对账异常", value: "1", helper: "需人工复核", tone: "red" },
    ],
    statuses: commonStatuses,
    columns: [
      { key: "bill", label: "结算单" },
      { key: "period", label: "账期" },
      { key: "amount", label: "待结算金额" },
      { key: "fee", label: "平台服务费" },
      { key: "date", label: "预计到账" },
    ],
    rows: [
      {
        id: "B-01",
        status: "pending",
        cells: {
          bill: "ST20260503-001",
          period: "2026-04-26 至 2026-05-02",
          amount: "¥82,340.12",
          fee: "¥1,646.80",
          date: "2026-05-08",
        },
      },
    ],
    emptyTitle: "暂无结算记录",
    emptyDescription: "此处不修改真实结算、佣金、提现或打款逻辑。",
  },
  {
    id: "store",
    title: "店铺管理",
    description: "管理店铺资料、市场归属、档口号、经营资质和平台审核状态。",
    owner: "店铺负责人",
    todo: "TODO: 后续接入店铺资料和资质审核只读查询 API。",
    primaryAction: "编辑资料占位",
    secondaryAction: "上传资质占位",
    filters: ["资料名称", "审核状态", "有效期"],
    stats: [
      { label: "关联市场", value: "2", helper: "支持多市场经营", tone: "blue" },
      { label: "当前档口", value: "A18", helper: "三门海鲜市场", tone: "green" },
      { label: "审核中", value: "1", helper: "平台审核", tone: "amber" },
    ],
    statuses: commonStatuses,
    columns: [
      { key: "item", label: "资料项" },
      { key: "owner", label: "负责人 / 市场" },
      { key: "statusText", label: "状态" },
      { key: "expires", label: "有效期 / 档口" },
      { key: "updated", label: "更新时间" },
    ],
    rows: [
      {
        id: "S-01",
        status: "normal",
        cells: {
          item: "营业执照",
          owner: "张经理 / 全市场通用",
          statusText: "已生效",
          expires: "2031-12-31",
          updated: "2026-04-28 14:20",
        },
      },
      {
        id: "S-02",
        status: "normal",
        cells: {
          item: "三门海鲜市场档口",
          owner: "三门海鲜市场",
          statusText: "当前市场",
          expires: "A 区 18 号档口",
          updated: "2026-05-03 11:30",
        },
      },
      {
        id: "S-03",
        status: "pending",
        cells: {
          item: "沿海冷链市场经营点",
          owner: "沿海冷链市场",
          statusText: "平台开通后可见",
          expires: "冷链仓 03",
          updated: "2026-05-02 16:10",
        },
      },
    ],
    emptyTitle: "暂无店铺资料",
    emptyDescription: "可通过编辑资料入口补充 mock 信息，不提交真实资质。",
  },
  {
    id: "data",
    title: "数据中心",
    description: "聚合经营概览、商品表现、评价风险和转化漏斗的分析入口。",
    owner: "店铺负责人",
    todo: "TODO: 后续接入经营分析只读 API，不作为结算或订单事实依据。",
    primaryAction: "导出报表占位",
    secondaryAction: "配置看板占位",
    filters: ["指标名称", "时间范围", "业务模块"],
    stats: [
      { label: "访客数", value: "8,420", helper: "mock", tone: "blue" },
      { label: "支付转化率", value: "6.8%", helper: "静态样例", tone: "green" },
      { label: "差评风险", value: "2", helper: "近 24 小时", tone: "red" },
    ],
    statuses: commonStatuses,
    columns: [
      { key: "metric", label: "指标" },
      { key: "module", label: "模块" },
      { key: "value", label: "数值" },
      { key: "trend", label: "趋势" },
      { key: "updated", label: "更新时间" },
    ],
    rows: [
      {
        id: "D-01",
        status: "normal",
        cells: {
          metric: "商品详情访问",
          module: "商品",
          value: "12,840",
          trend: "+8.2%",
          updated: "2026-05-03 11:00",
        },
      },
      {
        id: "D-02",
        status: "risk",
        cells: {
          metric: "低分评价",
          module: "评价",
          value: "2",
          trend: "需处理",
          updated: "2026-05-03 09:40",
        },
      },
    ],
    emptyTitle: "暂无指标记录",
    emptyDescription: "数据中心为 mock 分析壳，不连接真实 BI 或订单事实表。",
  },
  {
    id: "accounts",
    title: "账号权限",
    description: "面向商家团队的账号、角色、岗位和安全审计入口。",
    owner: "店铺管理员",
    todo: "TODO: 后续接入成员和角色只读查询 API，不改变真实 RBAC。",
    primaryAction: "邀请成员占位",
    secondaryAction: "配置角色占位",
    filters: ["姓名 / 手机号", "角色", "账号状态"],
    stats: [
      { label: "启用账号", value: "8", helper: "mock", tone: "green" },
      { label: "待接受邀请", value: "1", helper: "占位", tone: "amber" },
      { label: "锁定账号", value: "1", helper: "安全提醒", tone: "red" },
    ],
    statuses: commonStatuses,
    columns: [
      { key: "member", label: "成员" },
      { key: "role", label: "角色" },
      { key: "phone", label: "手机号" },
      { key: "lastLogin", label: "最近登录" },
      { key: "scope", label: "权限范围" },
    ],
    rows: [
      {
        id: "U-01",
        status: "normal",
        cells: {
          member: "张经理",
          role: "店铺管理员",
          phone: "138****6601",
          lastLogin: "2026-05-03 09:22",
          scope: "全部模块",
        },
      },
    ],
    emptyTitle: "暂无账号记录",
    emptyDescription: "账号权限仅为界面占位，不改变真实 RBAC 或权限校验。",
  },
];

export const pageMap = new Map(pages.map((page) => [page.id, page]));
