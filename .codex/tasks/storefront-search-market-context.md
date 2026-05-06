# storefront-search-market-context

## 目标

让 Storefront 搜索页读取 `retrieveChinaMarkets()`，把市场上下文用于移动端市场条和桌面端市场配置侧栏。

本任务不接真实搜索 provider，不改变商品搜索、购物车、结算或订单逻辑。

## 允许修改

- `apps/storefront/src/app/[locale]/(main)/search/page.tsx`
- `.codex/tasks/storefront-search-market-context.md`
- `.codex/queue.md`

## 禁止修改

- `packages/api/**`
- `apps/admin/**`
- `apps/vendor/**`
- Algolia、真实搜索 provider、支付、订单、退款、结算、佣金、权限、履约逻辑

## 实现要求

- 使用 `retrieveChinaMarkets()`。
- 市场 API 有数据时，搜索页优先展示市场名称、城市/区域、营业时间、公告和展示配送说明。
- 市场 API 失败或空数据时，继续使用 discovery/fallback 数据，不白屏。
- 保持搜索页现有版式，不重做 UI。
- 明确市场配送信息仅展示，不影响 checkout shipping options。

## 验证命令

```bash
cd apps/storefront && bun run build
git diff --check
```

## 非目标

- 不接真实搜索 provider。
- 不改真实商品查询参数之外的行为。
- 不改商品详情、购物车、结算或订单。
