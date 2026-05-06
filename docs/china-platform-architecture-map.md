# 中国本地化平台架构图

本文档记录当前 MercurJS 中国大陆本地化方向，帮助主 agent 和并行 AG 在同一张图上工作。

## 总目标

把 MercurJS 改造成可切换市场的本地生鲜供应链与多商户经营平台。平台以市场、店铺/档口、角色工作台和模块开关为核心，先做 mock 与 UI 骨架，再逐步接入真实后端能力。

## 思维导图

```mermaid
mindmap
  root((Fuyi 本地生鲜平台))
    消费者前台
      市场切换
      搜索找货
      类目导航
      店铺/档口主页
      今日鲜货
      订单与提货进度
      提货卡独立入口
      店铺直播状态标签
    平台运营后台
      市场管理
        配送规则
        营业时间
        公告
      商户管理
        普通商户
        物料供应商
        配送供应商
        养殖户
        种植户
        种苗供应商
        外地批发商
      模块开关
        市场级开关
        商户级开关
        角色级开关
      风控与审核
      财务与对账
    商家后台
      首页经营指标
      商品管理
      手机快速上架
      AI 上架草稿
      店铺装修
      订单履约
      快递打印占位
      售后客服
      结算查看
    B 端供应链
      市场物料采购
        泡沫箱
        包装箱
        冰袋
        冰块
      配送供应商接单
      养殖户/种植户对接
      种苗批发对接
      外地批发商对接
    Provider 层
      MockChatProvider
      MockSmsProvider
      MockLogisticsProvider
      MockLiveProvider
      MockAiListingProvider
      MockPaymentProvider
    安全边界
      不接真实密钥
      不把前端状态当支付成功
      支付以后端异步通知为准
      通知验签幂等可重试
      不改 Medusa/Mercur core
```

## 核心边界

- 消费者首页不做物料采购主链路；物料采购属于商户端或供应链模块。
- 提货卡不是支付、优惠券、满减券、折扣券、储值卡或购物车抵扣；消费者通过独立入口提交提货申请。
- 直播不是首页主模块；只在店铺/档口卡上显示状态，后续由独立 Provider 和审核策略控制。
- AI 上架只能生成草稿，必须商户确认后才允许进入正式上架流程。
- 所有真实支付、退款、对账、结算、佣金、权限改造必须串行推进。

## 平台开关模型草案

```mermaid
flowchart LR
  Platform["平台默认能力"] --> Market["市场配置"]
  Market --> Merchant["商户/供应商配置"]
  Merchant --> Role["角色权限视图"]
  Role --> UI["前台/后台/商家端显示"]

  Market --> Delivery["配送规则"]
  Market --> Hours["营业时间"]
  Market --> Notice["市场公告"]
  Merchant --> Type["商户类型"]
  Merchant --> Booth["档口号/跨市场关系"]
  Merchant --> Modules["可用模块"]
```

第一阶段只做 UI、文档、mock 和 task 文件。后续接后端时，模块开关应由后端配置、审计日志和权限系统共同决定，不能只靠前端隐藏入口。

## 当前实现位置

- Admin 运营后台：`apps/admin`
- Vendor 商家后台：`apps/vendor`
- Storefront 消费者前台：`apps/storefront`
- Provider 边界文档：`docs/mock-service-providers.md`
- 提货卡架构：`docs/pickup-card-architecture.md`
- 后端数据契约地图：`docs/china-backend-data-contract-map.md`
- 任务队列：`.codex/queue.md`

## 当前推进图

```mermaid
flowchart TD
  Root["MercurJS 中国大陆本地鲜货平台"] --> Storefront["消费者前台"]
  Root --> Admin["平台运营后台"]
  Root --> Vendor["商家/供应商后台"]
  Root --> Providers["Mock Provider 边界"]
  Root --> Risk["高风险串行区"]

  Storefront --> SF1["已完成: 中文首页/搜索/店铺页/商品详情/购物车文案"]
  Storefront --> SF2["进行中: 首页找货找店信息密度 polish"]
  Storefront --> SF3["待后续: 真实移动端视觉确认"]

  Admin --> AD1["已完成: 中国运营菜单/首页/提货卡/市场配置骨架"]
  Admin --> AD2["已完成: 订单/售后/支付对账/结算/营销/客服/风控/系统配置只读运营壳"]
  Admin --> AD3["待后续: 后端 feature flag + 审计实现 + 真实 Provider 串行接入"]

  Vendor --> VD1["已完成: 商户后台壳/手机快速上架/AI 草稿/移动端首屏"]
  Vendor --> VD2["进行中: 店铺/档口主页装修壳"]
  Vendor --> VD3["待后续: 草稿商品 API 和真实保存流程"]

  Providers --> P1["已完成: Chat/SMS/Logistics/Live/AI Listing mock skeleton"]
  Providers --> P2["保持未注册: 不接真实服务、不写真实密钥"]

  Risk --> R1["支付/退款/对账/结算/佣金/权限"]
  Risk --> R2["必须串行: 后端异步通知、验签、幂等、可重试"]
```

## 第七轮并行分工

| AG | 任务 | 范围 | 状态 |
| --- | --- | --- | --- |
| Fermat | `storefront-home-market-density-polish` | `apps/storefront/**` | done |
| Galileo | `vendor-shop-decoration-shell` | `apps/vendor/**` | done |
| Averroes | `admin-module-open-control-polish` | `apps/admin/**` | done |

主 agent 负责汇总、验证、风险判断和队列状态更新；并行 AG 不 commit、不 push。

## Admin 模块覆盖图

```mermaid
flowchart TD
  Admin["平台运营后台 Admin"] --> Home["运营首页"]
  Admin --> Ops["平台设置 / 模块开关 / 市场能力"]
  Admin --> Merchant["商家管理"]
  Admin --> Product["商品管理 / 规格模板"]
  Admin --> Order["订单管理"]
  Admin --> AfterSales["售后管理"]
  Admin --> Pickup["提货卡管理"]
  Admin --> Payment["支付与对账"]
  Admin --> Settlement["结算管理"]
  Admin --> Marketing["营销中心"]
  Admin --> Message["客服与消息"]
  Admin --> Risk["风控管理"]
  Admin --> System["系统配置"]

  Order --> O1["只读: 待付款/待发货/待收货/异常订单"]
  Payment --> P1["只读: 支付流水/退款流水/对账单/异常账单"]
  Settlement --> S1["只读: 待结算/佣金规则/提现申请"]
  Pickup --> C1["独立模块: 不是优惠券/支付/储值卡"]
  System --> X1["配置模板: 不写真实密钥"]
```

Admin 当前只做运营视图和 mock 边界。任何真实审核、冻结、退款、打款、发券、发送消息、接入 Provider 或权限改造，都需要后续独立任务和后端审计设计。

## 端到端分层图

```mermaid
flowchart LR
  Consumer["消费者"] --> Storefront["Storefront 消费者前台"]
  Operator["平台运营"] --> Admin["Admin 平台运营后台"]
  MerchantUser["商户 / 供应商"] --> Vendor["Vendor 商家后台"]

  Storefront --> UXMock["当前: 中文化找店找货、店铺页、商品详情、购物车和提货卡独立入口"]
  Admin --> OpsMock["当前: 运营首页、模块开关、市场配置、商户/商品/订单/提货卡等只读运营壳"]
  Vendor --> VendorMock["当前: 商户首页、手机快速上架、AI 草稿、店铺装修、供应链工作台"]

  UXMock --> FutureAPI["后续真实 API"]
  OpsMock --> FutureAPI
  VendorMock --> FutureAPI

  FutureAPI --> Capability["能力控制层"]
  FutureAPI --> Commerce["交易与商品层"]
  FutureAPI --> ProviderBoundary["Provider / Adapter 层"]

  Capability --> Market["市场、档口、多市场、营业时间、公告、配送规则"]
  Capability --> Modules["模块开关、商户类型、角色视图、审计日志"]
  Commerce --> Product["商品、规格、库存、草稿、审核"]
  Commerce --> Order["订单、履约、提货、售后"]
  ProviderBoundary --> MockProviders["当前: Mock Chat / SMS / Logistics / Live / AI"]
  ProviderBoundary --> RealProviders["后续串行: 支付、短信、IM、物流、直播、AI"]

  Order --> HighRisk["高风险串行区: 支付、退款、对账、结算、佣金、权限"]
```

这张图的含义是：当前三个端都可以继续 polish UI 和 mock 数据，但真实 API 接入必须先经过能力控制层与 Provider/Adapter 边界。高风险串行区不能被普通 UI 任务顺手改掉。

## 当前可追溯矩阵

| 模块 | 当前用户价值 | 当前实现形态 | 后续真实能力入口 | 风险等级 |
| --- | --- | --- | --- | --- |
| 消费者首页 | 找市场、找店、找鲜货 | Storefront 中文 UI + mock 展示 | 市场/店铺/商品搜索 API | 中 |
| 店铺/档口主页 | 看商户、档口、今日鲜货、配送能力和直播状态 | Storefront 店铺页 mock | 店铺装修、商户资质、配送配置、直播状态 API | 中 |
| 提货卡消费者入口 | 持实体卡在线提货 | Storefront 独立入口 UI | 提货卡验证、提货单、履约 API | 高 |
| 平台运营首页 | 看平台指标、待办、风险 | Admin mock 看板 | 运营聚合 API 和审计日志 | 中 |
| 模块开关/市场配置 | 控制市场和商户开放哪些能力 | Admin 只读/占位壳 | 后端 feature flag、权限和审计 | 高 |
| 商户管理 | 管理普通商户、供应商、档口、多市场 | Admin 只读表格 | 商户类型、市场关系、档口模型 | 中 |
| 商品规格模板 | 统一规格和上架字段 | Admin 只读规格模板 | 类目规格模型、审核和版本管理 | 中 |
| 商家首页 | 商户日常经营工作台 | Vendor 单页 mock 壳 | 商户指标、待办、风险 API | 中 |
| 手机快速上架 | 移动端简单上今日鲜货 | Vendor UI 壳 | 商品草稿、图片、规格、库存、审核 API | 中 |
| AI 草稿上架 | 一句话生成上架草稿 | Vendor mock 草稿 | AI provider + 安全校验 + 人工确认 | 高 |
| 店铺装修 | 商家维护自己的主页 | Vendor 装修壳 | 装修草稿、预览、发布、审核、回滚 | 中 |
| 物料供应 | 面向商户采购泡沫箱、冰袋等 | Vendor B 端入口 | 物料商品、供应商接单、B 端订单 | 中 |
| 配送供应商 | 统一配送或第三方配送接单 | Vendor B 端入口 | 配送服务、轨迹、异常、电子面单 | 高 |
| 上游供给 | 养殖户、种植户、外地批发商对接商户 | Vendor B 端入口 | 供需、报价、到货计划、冷链 | 中 |
| 支付/退款/结算/佣金 | 真实交易资金流 | 仅 Admin 只读说明和安全边界 | 独立串行后端任务 | 极高 |

## 接真实能力建议顺序

```mermaid
flowchart TD
  Step1["1. 固化现有 UI / mock 边界文档"] --> Step2["2. 后端能力开关和审计模型"]
  Step2 --> Step3["3. 市场、档口、商户类型、多市场关系"]
  Step3 --> Step4["4. 商品规格模板和商品草稿 API"]
  Step4 --> Step5["5. 店铺装修草稿 / 预览 / 发布"]
  Step5 --> Step6["6. 手机快速上架和 AI 草稿确认流"]
  Step6 --> Step7["7. B 端供应链: 物料、配送、上游、种苗、外地批发"]
  Step7 --> Step8["8. 提货卡验证、提货单、履约"]
  Step8 --> Step9["9. 真实 Provider 串行接入"]
  Step9 --> Step10["10. 支付、退款、对账、结算、佣金、权限串行验收"]
```

建议先把第 2 到第 6 步做稳。支付、退款、结算和佣金等资金链路放在最后串行推进，避免 UI 阶段的 mock 误触真实交易状态。

## 需要继续补的架构件

- `Admin`：模块开关后端模型、市场配置 API、商户类型 API、审计日志。
- `Vendor`：商品草稿 API、AI 草稿确认流、店铺装修草稿/发布 API。
- `Storefront`：店铺页真实数据契约、搜索/类目 API、提货卡独立入口的数据契约。
- `Provider`：Mock 到真实 Provider 的注册策略、环境变量模板、错误码和回滚策略。
- `QA`：每轮都保留桌面端、移动端和登录态后台的视觉验收记录。

其中第一轮数据对象、读写方向和高风险禁区已经汇总在 `docs/china-backend-data-contract-map.md`，后续 API 设计优先从这份契约地图拆 PR。
