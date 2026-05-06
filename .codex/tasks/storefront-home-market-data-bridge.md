# storefront-home-market-data-bridge

## 目标

让 Storefront 首页读取 `apps/storefront/src/lib/data/china-markets.ts` 中的只读 market client，作为首页市场名称、营业时间和市场切换数据的来源之一。

本任务只做数据桥接，不重做首页版式。

## 允许修改

- `apps/storefront/src/app/[locale]/(main)/page.tsx`
- `.codex/tasks/storefront-home-market-data-bridge.md`
- `.codex/queue.md`

## 禁止修改

- `packages/api/**`
- `apps/admin/**`
- `apps/vendor/**`
- checkout、cart、order、payment、refund、settlement、commission、permission、fulfillment 相关逻辑
- 真实搜索、客服、直播、物流、支付或 AI provider

## 实现要求

- 使用 `retrieveChinaMarkets()`。
- API 可用时，首页优先展示第一个开放市场的名称、城市/区域、营业时间、公告。
- API 不可用或返回空数组时，保留当前静态首页 fallback，不白屏。
- 保持消费者首页当前布局，不重新设计 UI。
- 提货卡仍为单独入口，不放回首页主链路。
- 市场物料、配送供应商、上游货源仍不得放到消费者首页前排。

## 验证命令

```bash
cd apps/storefront && bun run build
git diff --check
```

## 非目标

- 不改搜索结果页。
- 不改店铺页。
- 不改商品详情页。
- 不接真实商品库存、价格、checkout 配送方式或订单状态。

## 完成后

- 记录修改文件。
- 记录验证结果。
- 说明 fallback 和生产配置边界。
