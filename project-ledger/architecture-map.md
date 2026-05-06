# 中国本地化系统地图

更新时间：2026-05-07 00:38 Asia/Shanghai

本文档记录当前 `china/integration-localization` worktree 的系统地图、已跑通链路、下一阶段任务边界和多 agent 分工原则。它是 `project-ledger/status.md` 的结构化补充。

## 当前总览

```mermaid
mindmap
  root(("Fuyi / MercurJS 中国大陆本地化"))
    "消费者前台 Storefront"
      "首页/搜索/店铺页"
        "本地鲜货 UI"
        "真实 Store API 商品优先"
        "只读 discovery: 店铺/类目/市场配置"
      "商品/购物车/结算"
        "CNY demo 商品"
        "购物车与配送 smoke 已通过"
        "无 cart 结算提前跳转"
      "地址 UI"
        "省/市/区县街道/详细地址"
        "大陆手机号 pattern"
        "不改 setAddresses/order/payment"
    "平台后台 Admin"
      "中国平台运营壳"
      "模块开关页"
        "只读 capability contract"
        "未登录仍 401"
        "真实配置/审计未落地"
      "提货卡/营销/风控 mock 页"
        "只读/占位"
        "不改真实卡密/兑换/库存/订单"
    "商户后台 Vendor"
      "中国商户后台壳"
      "供应方角色矩阵"
        "普通商户"
        "物料供应商"
        "配送供应商"
        "养殖户/种植户/种苗/外地批发商"
      "移动快速上架/AI 草稿"
        "mock-only"
        "需商户确认后才可进入真实上架"
    "API / Medusa / Mercur"
      "seed demo 数据"
        "中国 demo seller"
        "CNY 商品价格"
        "seller shipping options"
        "中文 demo 类目"
      "只读中国本地化接口"
        "/store/china/capabilities"
        "/store/china/vendor-capabilities"
        "/admin/china/capabilities"
        "/store/china/discovery"
        "/store/china/sellers/:handle/products"
      "禁止越界"
        "不改支付/订单/退款/结算/佣金/权限"
        "不接真实微信/支付宝/短信/物流/IM"
```

## 当前数据流

```mermaid
flowchart LR
  subgraph Storefront["Storefront 消费端"]
    Home["/cn 首页"]
    Search["/cn/search"]
    SellerPage["/cn/sellers/:handle"]
    Cart["/cn/cart"]
    Checkout["/cn/checkout"]
  end

  subgraph Vendor["Vendor 商户端"]
    VendorHome["首页能力矩阵"]
    QuickListing["移动快速上架 / AI 草稿 mock"]
  end

  subgraph Admin["Admin 平台端"]
    ModuleSwitches["模块开关页"]
    OpsPages["运营/提货卡/风控 mock 页"]
  end

  subgraph API["API / Medusa / Mercur"]
    Products["Store Products API"]
    Discovery["/store/china/discovery"]
    SellerProducts["/store/china/sellers/:handle/products"]
    StoreCapabilities["/store/china/capabilities"]
    VendorCapabilities["/store/china/vendor-capabilities"]
    AdminCapabilities["/admin/china/capabilities"]
    Seed["seed demo data"]
  end

  Seed --> Products
  Seed --> Discovery
  Seed --> SellerProducts
  Home --> Products
  Search --> Discovery
  Search --> Products
  SellerPage --> SellerProducts
  SellerPage --> Products
  Cart --> Products
  Checkout -. "无 cart 307 到 cart" .-> Cart
  VendorHome --> VendorCapabilities
  ModuleSwitches --> AdminCapabilities
  Home --> StoreCapabilities

  AdminCapabilities -. "Admin 登录态保护" .-> Admin
```

## 已完成节点

| 区域 | 当前状态 | 验证 |
| --- | --- | --- |
| API seed | 中国 demo seller、CNY 商品、配送选项、中文 demo 类目 | `seed-api.sh`、API tsc/build、Store API smoke |
| Storefront | 首页/搜索/店铺/商品/购物车/地址 UI 第一层收口 | Storefront build、HTTP smoke、cart/shipping smoke |
| Admin | 中国运营壳、只读模块开关、能力契约读取 | Admin lint/build、未登录 capability 401 |
| Vendor | 商户后台壳、供应方矩阵、只读能力契约 | Vendor lint/build、7001 smoke |
| Provider skeleton | Mock Chat/SMS/Logistics/Live/AI Listing skeleton | mock-only，不注册真实服务 |
| 文档/任务流 | queue、ledger、任务文件、地址任务编码修复 | diff check、全栈验证记录 |

## 下一阶段边界

### 仍可低风险继续

- 文档和任务拆分：市场模型、模块开关配置存储、商户类型、配送规则、供应商角色。
- UI 只读展示和 mock 数据抽离。
- 视觉 QA 和人工确认清单。
- seed/demo 数据继续本地化，但必须标明不是生产数据来源。
- Provider mock contract 补充测试，仍不注册真实服务、不接真实第三方。

### 进入中高风险，只能先设计

- 真实市场模型：市场、档口、商户跨市场、营业时间、公告、配送规则。
- Admin 模块开关真实存储与审计。
- 商户类型开关真正影响菜单、权限、接单、履约能力。
- 商家履约配置真正影响 checkout shipping options。
- 快递打印真实面单、物流轨迹、揽收、取消。
- AI 上架草稿进入真实商品创建 workflow。

### 必须串行的高风险

- Mock China Payment Provider 从 mock 到支付框架。
- 支付通知幂等框架。
- 支付宝 Provider。
- 微信支付 Provider。
- 退款。
- 对账。
- 商家结算、payout、commission。

这些任务不得和普通 UI PR 混合，不得并行随意推进。

## 多 Agent 分工规则

```mermaid
flowchart TD
  Main["主 agent: 总控/集成/最终提交"] --> Plan["读取 AGENTS.md + ledger + queue"]
  Plan --> Split{"任务是否可并行?"}
  Split -->|"低风险 UI/文档/只读审计"| Parallel["分配给子 agent 只读审计或独立文件改动"]
  Split -->|"支付/订单/退款/结算/佣金/权限"| Serial["主 agent 串行设计，不直接落业务代码"]
  Parallel --> Verify["主 agent 本地验证"]
  Serial --> DesignDoc["先产出设计文档和 PR 拆分"]
  Verify --> Commit["验证通过后精确 stage/commit"]
  DesignDoc --> Commit
  Commit --> Queue["更新 ledger / queue，继续下一任务"]
```

规则：

- 主 agent 对整体架构、边界和最终提交负责。
- 子 agent 优先做只读审计、风险复核、独立文档或不重叠文件改动。
- 子 agent 不直接 push，不直接改高风险业务逻辑。
- 每轮结束必须更新 `project-ledger/status.md` 或相关任务文档。
- 任务完成后继续队列，除非遇到安全边界、验证失败或需要人工视觉确认。

## 第十轮建议队列

1. `market-model-backend-design`
   - 只做文档设计：市场、档口、跨市场商户、营业时间、公告、配送规则、商户类型。
   - 不写业务代码。

2. `admin-module-config-contract-design`
   - 只做文档设计：模块开关真实存储、审计、回滚、只读能力视图到可配置能力视图的演进。
   - 不让开关真实生效。

3. `vendor-fulfillment-config-design`
   - 只做文档设计：统一配送/商家自配送/供应商配送配置如何表达，未来如何安全影响 checkout。
   - 不改 shipping option 逻辑。

4. `integration-release-readiness`
   - 检查当前 integration 分支哪些提交可以进入 PR，哪些还需要拆分。
   - 不 push，不创建 PR。

## 当前结论

本项目已经从“纯 UI mock 本地化”推进到“只读后端契约 + demo 数据链路 + 三端中国化壳”的阶段。下一步应先补齐真实市场/模块/履约配置的设计文档，再进入任何会影响权限、履约、订单或支付状态的实现。
