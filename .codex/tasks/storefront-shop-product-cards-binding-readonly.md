# storefront-shop-product-cards-binding-readonly

## 目标

把 Storefront 店铺页“档口今日参考 / 常卖鲜货”商品卡展示小范围绑定到 `buildChinaShopViewModel()` 输出。

本任务只做只读展示绑定，不改真实商品详情、购物车、订单、结算、支付、库存占用或履约入口。

## 允许修改

- `apps/storefront/src/app/[locale]/(main)/sellers/[handle]/page.tsx`
- `docs/storefront-shop-product-cards-binding-readonly.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- `packages/api/**`
- DB / migration / seed
- 商品库存占用
- cart mutation
- order mutation
- checkout shipping options
- payment、refund、settlement、commission、payout
- permission / RBAC
- fulfillment / logistics / waybill
- 真实排序、广告、竞价或推荐 runtime

## 绑定要求

- 店铺页样例商品卡标题、规格、价格文案、库存提示和商品提示读取 shop view model。
- Store API 真实商品卡继续走 `listProducts()` 和 `ProductCard`，不改加购链路。
- 不展示 `fallback`、`mock`、`metadata`、`API failed`、`source`、`highRisk` 等内部字段。
- 不把跨店商品、物料供应商、配送供应商、上游供给、种苗批发或外地批发混入消费者店铺商品卡。

## 验证

- `cd apps/storefront && bun run build`
- 店铺页桌面截图
- 店铺页移动端截图
- 商品卡字段对齐检查
- `git diff --check`
