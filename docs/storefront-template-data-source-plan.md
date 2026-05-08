# Storefront Template Data Source Plan

更新时间：2026-05-08 Asia/Shanghai

## 目标

Storefront 首页和店铺页 v2 已经能看，但仍有一部分数据来自静态展示文件。下一步应该先规划数据源迁移，再写代码：把消费者首页、搜索、店铺页逐步接到真实只读 discovery / market / seller read model，同时保留静态 fallback。

本轮只写计划，不修改 `apps/**` 或 `packages/**`。

## 当前数据源

Storefront 侧：

- `apps/storefront/src/app/[locale]/(main)/data/home-market.ts`
- `apps/storefront/src/lib/data/china-discovery.ts`
- `apps/storefront/src/lib/data/china-markets.ts`
- `apps/storefront/src/lib/data/china-sellers.ts`
- `apps/storefront/src/app/[locale]/(main)/search/page.tsx`
- `apps/storefront/src/app/[locale]/(main)/sellers/[handle]/page.tsx`

API 侧只读路由：

- `GET /store/china/discovery`
- `GET /store/china/markets`
- `GET /store/china/markets/:slug`
- `GET /store/china/markets/:slug/sellers`
- `GET /store/china/sellers/:handle/products`

当前限制：

- 首页 v2 仍主要消费静态 `home-market` 数据。
- 市场仍是配置/静态 read model，不是完整运营数据库模型。
- 店铺页已能读取 seller product ids 和 metadata，但店铺装修、公告、配送说明仍混合静态展示和 metadata fallback。
- 搜索页已接 discovery，但没有统一 home/search/shop view model mapper。

## 迁移原则

1. 先新增 mapper / view model，后改页面。
2. 页面必须保留静态 fallback，API 失败不能白屏。
3. 所有数据仍是只读展示，不改变 cart、checkout、shipping options、payment、order 或 fulfillment。
4. 首页服务消费者找市场、找店、看今日鲜货；物料、配送供应商、上游供给默认不进入消费者首页主路径。
5. 店铺页展示配送/自提说明，但真实配送方式仍以后端 checkout shipping options 为准。

## 首页数据源目标

目标 view model：

```text
StorefrontHomeTemplateView
```

建议字段：

- `activeMarket`
- `marketSwitches`
- `categoryGroups`
- `featuredShops`
- `freshProducts`
- `marketAnnouncements`
- `serviceLinks`
- `fallbackNotice`

数据来源顺序：

1. `/store/china/markets` 读取市场列表和当前市场。
2. `/store/china/discovery` 读取类目、店铺和商品发现数据。
3. `home-market.ts` 作为静态 fallback 和视觉样例。

非目标：

- 不做真实库存聚合。
- 不做距离排序。
- 不接 Algolia 或搜索 provider。
- 不把物料采购、配送供应商、上游货源放到消费者首页主入口。

## 店铺页数据源目标

目标 view model：

```text
StorefrontShopTemplateView
```

建议字段：

- `shopProfile`
- `marketContext`
- `boothNo`
- `businessHours`
- `announcements`
- `decorationSnapshot`
- `liveStatus`
- `fulfillmentHint`
- `products`
- `fallbackNotice`

数据来源顺序：

1. `/store/china/sellers/:handle/products` 读取当前 seller 和 product ids。
2. `/store/china/markets/:slug` 读取市场上下文。
3. seller metadata 作为短期过渡。
4. 静态档口数据作为 fallback。

非目标：

- 店铺页不决定真实运费。
- 店铺页不创建订单、不扣库存、不确认发货。
- 直播只作为状态，不接真实推流或 IM。
- 提货卡提货单仍走独立消费者提货流程，不混入普通购物车支付。

## 搜索页和类目入口

搜索页目标：

- 先找店 / 档口，再看商品。
- 支持市场、类目、商品、店铺分区。
- 保持商品结果和店铺结果来源可解释。

建议 view model：

```text
StorefrontSearchTemplateView
```

数据来源：

- `/store/china/discovery`
- `/store/products`
- 后续 `/store/china/discovery/search`

类目入口应只作为消费者找货路径，不暴露后台类目、物料供应商目录或供应方采购目录。

## Fallback 策略

每个页面都应保留三层兜底：

1. 真实只读 API 成功：展示 API view model。
2. 只读 API 部分失败：展示可用 API 数据 + 静态 fallback。
3. 全部失败：展示静态页面，并用消费者可理解文案说明“展示数据待后台更新”，不要露 `fallback`、`metadata`、`API` 等工程词。

## 后续 PR 拆分

1. `storefront-home-view-model-mapper`：只新增 home mapper 和测试，不改页面。
2. `storefront-shop-view-model-mapper`：只新增 shop mapper 和测试，不改页面。
3. `storefront-search-view-model-mapper`：只新增 search mapper 和测试，不改页面。
4. `storefront-home-bind-view-model`：首页改读 mapper，保留静态 fallback。
5. `storefront-shop-bind-view-model`：店铺页改读 mapper，保留 seller metadata/static fallback。
6. `storefront-template-data-source-validation`：合并后跑 Storefront build/lint、HTTP smoke 和视觉 QA。

每个页面绑定 PR 必须单独做，避免首页、搜索、店铺页同时变动导致排查困难。

## 高风险边界

本数据源计划不允许触碰：

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

这些必须继续拆成后端串行高风险任务。

## 本轮结论

Storefront v2 页面可以继续保留视觉模板，但下一步要把数据读取收束为 home/search/shop view model mapper。先 mapper，后页面绑定；先只读，后真实运营模型；交易和履约链路继续不动。
