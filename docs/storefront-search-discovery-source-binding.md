# Storefront 搜索 Discovery 数据源绑定

更新时间：2026-05-09 Asia/Shanghai

## 目标

本轮把 Storefront 搜索页 adapter 输入构造收束为 discovery / markets / products + static fallback。搜索页仍是只读展示绑定，不接真实搜索排序、广告、竞价、推荐或搜索 provider。

## 修改范围

```text
apps/storefront/src/app/[locale]/(main)/search/page.tsx
```

## 变化

搜索页现在并行读取：

- `retrieveChinaDiscovery()`
- `retrieveChinaMarkets()`
- `listProducts()`

并把数据传给 `buildChinaSearchViewModel()`：

- `markets`：优先 markets API，其次 discovery markets。
- `categories`：来自 discovery categories。
- `sellers`：来自 discovery sellers。
- `products`：仍使用搜索页市场样例商品作为 adapter 静态展示输入。
- `fallback.discovery`：集中保存静态市场、类目和店铺 fallback。

新增支持：

- `market` query param 可传入 `buildChinaSearchViewModel()` 的 `marketName`，只作为展示筛选，不影响配送、履约或 checkout shipping options。

## 未改变内容

- Store API 真实商品结果仍通过 `listProducts()` 和 `ProductCard` 展示。
- 不改变商品详情、加购、购物车、结算、订单、支付、退款、结算、佣金、打款、权限、履约或物流。
- 不接 Algolia 或任何真实搜索 provider。
- 不做广告、竞价、推荐、距离排序或库存聚合。

## 验证结果

已运行：

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn/apps/storefront
/home/codex/.bun/bin/bun run build
```

- Storefront build 通过。
- `git diff --check` 通过。
- 仅保留既有 React Hook dependency warnings。

## 回滚方式

如搜索页展示异常，可回滚 `page.tsx` 中本轮新增的 `buildStaticSearchDiscovery()`、`Promise.all()` 数据读取和 `fallback` 输入构造，恢复为上一轮页面先合并 discovery / fallback 后再传入 adapter 的方式。

回滚不会影响 Store API 真实商品卡、cart、checkout、订单、支付、退款、结算、佣金、权限、履约或物流。
