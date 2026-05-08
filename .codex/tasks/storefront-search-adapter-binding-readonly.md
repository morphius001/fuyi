# storefront-search-adapter-binding-readonly

## 目标

把 Storefront 搜索页结果展示小范围绑定到 `buildChinaSearchViewModel()` 输出。

本任务只做只读展示绑定，不接真实排序、广告、竞价或推荐系统，不改购物车、订单、结算、支付或履约入口。

## 允许修改

- `apps/storefront/src/app/[locale]/(main)/search/page.tsx`
- `docs/storefront-search-adapter-binding-readonly.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- `packages/api/**`
- DB / migration / seed
- 搜索排序、广告、竞价、推荐 runtime
- 自动询价、自动补货、自动客服
- checkout shipping options
- cart mutation
- order mutation
- payment、refund、settlement、commission、payout
- permission / RBAC
- fulfillment / logistics / waybill

## 绑定要求

- 搜索 query、市场 / 类目 / 店铺 / 商品展示分组读取 search view model。
- 真实商品卡继续走 Store API，不改加购链路。
- 静态市场样例只做展示，不进入真实商品详情。
- 不展示 `fallback`、`mock`、`metadata`、`API failed`、`source`、`highRisk` 等内部字段。

## 验证

- `cd apps/storefront && bun run build`
- 搜索有结果桌面截图
- 搜索无结果或低结果移动端截图
- `git diff --check`
