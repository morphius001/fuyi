# Storefront Read Model 数据源接入计划

更新时间：2026-05-09 Asia/Shanghai

## 目标

Storefront home / shop / search 三个页面已经完成 adapter 只读绑定。下一阶段不要继续把静态展示数据散写在页面里，而是把 adapter 输入逐步收束到真实只读 read model 数据源。

本计划只做拆分设计，不修改 `apps/**` 或 `packages/**`，不新增 route，不新增 migration，不改变 cart、checkout、订单、支付、退款、结算、佣金、打款、权限、履约、物流、真实排序、广告、竞价、推荐或 Provider runtime。

## 当前状态

已完成：

- 首页构造 `buildChinaHomeViewModel(...)`，首屏市场、类目、推荐档口和商品卡展示已读 home view model。
- 店铺页构造 `buildChinaShopViewModel(...)`，店铺头部、履约提示、直播状态 badge 和样例商品卡已读 shop view model。
- 搜索页构造 `buildChinaSearchViewModel(...)`，query、市场、类目、店铺和静态商品样例结果已读 search view model。
- 真实商品卡仍走 Store API 和 `ProductCard`。

仍然存在：

- adapter 输入仍混合静态 `home-market` 数据、`/store/china/discovery`、`/store/china/markets*`、seller metadata、seller products API 和本地样例商品。
- 市场、商户市场关系、档口和角色还没有作为统一 Storefront read model 输入被页面稳定消费。
- 商品发现仍缺少明确的 market / seller / category 关系口径；不能把样例商品当成真实库存或价格承诺。

## 数据源分层

### Market Read Model

用途：

- 市场列表和当前市场。
- 市场名称、slug、地址、营业提示、公告摘要。
- 市场统一配送、自提和服务范围的展示提示。

来源候选：

- `GET /store/china/markets`
- `GET /store/china/markets/:slug`
- 后续真实 `china_market` read model。

边界：

- 只展示，不影响 checkout shipping options。
- 市场营业状态不自动阻止下单。
- 市场配送 profile 不改变 cart total 或运费。

### Seller Membership Read Model

用途：

- 商户属于哪个市场。
- 档口号、经营区、主营类目。
- 商户角色：普通商品商户、物料供应商、配送供应商、养殖户、种植户、种苗供应商、外地批发商。
- 消费者页面默认只展示适合消费者购买的普通商品商户。

来源候选：

- `GET /store/china/markets/:slug/sellers`
- `GET /store/china/sellers/:handle/products`
- seller metadata 短期过渡。
- 后续真实 seller-market membership read model。

边界：

- membership 只用于展示和消费者发现筛选。
- 不改变权限、订单归属、结算主体或商户后台菜单。
- 物料供应商、配送供应商、上游供给和种苗批发默认不进入消费者首页主路径。

### Product Discovery Read Model

用途：

- 首页今日鲜货。
- 搜索商品结果。
- 店铺页商品列表。
- 商品卡展示字段：商品名、规格摘要、价格文案、计价单位、市场、档口、提示标签。

来源候选：

- Store API `/store/products`
- `GET /store/china/sellers/:handle/products`
- 后续 `GET /store/china/discovery/home`
- 后续 `GET /store/china/discovery/search`
- 后续 product discovery read model。

边界：

- 商品卡只展示，不占库存。
- 商品价格和真实可售性仍以后续商品详情、cart 和 checkout 既有链路为准。
- 不接真实搜索排序、广告、竞价、推荐或库存聚合。

## 页面接入策略

### 首页

目标：消费者先选市场、看类目、找档口、看今日鲜货。

下一步输入顺序：

1. `retrieveChinaMarkets()` 提供市场列表和 active market。
2. `/store/china/discovery` 或后续 `/store/china/discovery/home` 提供 categories、featured sellers、fresh products。
3. `home-market` 静态数据只作为 fallback 和视觉样例。

禁止：

- 不把物料采购、配送供应商、上游供给、种苗批发、外地批发商放到消费者首页主入口。
- 不让市场配送 profile 改变 checkout shipping options。

### 搜索页

目标：先找店 / 档口，再看商品，保持商品和店铺结果分区。

下一步输入顺序：

1. query、market slug、category id 作为只读搜索上下文。
2. `/store/china/discovery` 或后续 `/store/china/discovery/search` 提供 matched sellers、categories 和 market context。
3. Store API `/store/products` 提供真实商品卡。
4. 静态商品样例只保留为无数据时的展示辅助。

禁止：

- 不接 Algolia 或真实搜索 provider。
- 不做广告、竞价、推荐、距离排序或库存聚合。
- 不把 B 端供应商结果混入消费者商品流。

### 店铺页

目标：一个商户 / 档口自己的消费者主页。

下一步输入顺序：

1. `GET /store/china/sellers/:handle/products` 提供 seller、product ids 和短期 metadata。
2. `GET /store/china/markets/:slug` 提供市场上下文。
3. 后续 seller membership read model 提供档口、角色、经营状态和 market relation。
4. 静态档口数据只作为 fallback。

禁止：

- 店铺页不决定真实运费。
- 店铺页不创建订单、不扣库存、不确认发货。
- 直播只作为状态 badge，不接真实推流、IM 或直播交易。

## 后续 PR 拆分

### PR JF: Home Adapter Real Source Plan To Code

范围：

- 收束首页 adapter 输入构造。
- 优先读取 markets + discovery。
- 保留 `home-market` fallback。
- 不改视觉布局。

验证：

- Storefront build。
- 首页 desktop / mobile smoke 或截图。
- `git diff --check`。

### PR JG: Search Read Model Input Contract

范围：

- 明确搜索 adapter 的 query / market / category / product 输入合同。
- 可以先做纯函数或 docs + tests。
- 不接真实搜索 provider。

验证：

- focused TypeScript check 或 Storefront build。
- `git diff --check`。

### PR JH: Shop Membership Source Plan To Code

范围：

- 店铺 adapter 输入从 seller metadata 过渡到 seller membership read model 形状。
- 保留 seller products API 和静态 fallback。
- 不改变 `ProductCard` 或加购链路。

验证：

- Storefront build。
- 店铺页 desktop / mobile smoke 或截图。
- `git diff --check`。

### PR JI: Storefront Read Model Source Validation

范围：

- 汇总 home / search / shop 输入源接入结果。
- 确认没有 `apps/**` 之外的高风险链路混入。
- 记录 fallback、known warnings 和回滚方式。

验证：

- Storefront build。
- `git diff --check`。
- diff 范围检查。

## Fallback 和文案规则

页面降级时可以说：

- “展示数据待后台更新”
- “当前展示为市场样例”
- “店铺信息以商家后台维护为准”

页面不要展示：

- `fallback`
- `metadata`
- `mock`
- `API failed`
- `source`
- `highRisk`
- stack trace 或接口错误详情

## 高风险边界

本计划不允许触碰：

- cart total
- checkout shipping options
- payment session
- payment success
- order status
- refund status
- settlement / commission / payout
- permission / RBAC
- fulfillment / logistics / waybill
- real provider config
- real credentials

这些仍必须作为高风险串行任务单独处理。

## 验证结果

本轮已运行：

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn
git diff --check
git diff --name-only
```

- `git diff --check` 通过。
- 本轮 diff 仅包含任务文件、规划文档、队列和 ledger 文件。
- 本轮没有修改 `apps/**` 或 `packages/**` 业务代码。
- `docs/visual-qa-artifacts/` 仍是本地截图产物目录，不纳入本 PR。

## 回滚方式

后续每个接入 PR 都应保留静态 fallback。若某个真实只读数据源异常，页面应回滚到上一层输入：

```text
real read model -> existing Store API / discovery -> seller metadata -> static fallback
```

只要 adapter 仍保持只读，回滚不应影响 cart、checkout、订单、支付、退款、结算、佣金、权限或履约状态。
