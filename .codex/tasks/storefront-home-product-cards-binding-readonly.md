# storefront-home-product-cards-binding-readonly

## 目标

把 Storefront 首页“今日鲜货 / 商品卡展示”小范围绑定到 `buildChinaHomeViewModel()` 输出。

本任务只做只读展示绑定，不改真实商品详情、购物车、订单、结算、支付、库存占用或履约入口。

## 允许修改

- `apps/storefront/src/app/[locale]/(main)/page.tsx`
- `docs/storefront-home-product-cards-binding-readonly.md`
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

- 首页商品卡标题、规格、价格文案、库存提示、所属店铺 / 市场 / 档口读取 home view model。
- 商品卡入口继续走原搜索页或原只读展示路径，不新增真实加购动作。
- 不展示 `fallback`、`mock`、`metadata`、`API failed`、`source`、`highRisk` 等内部字段。
- 不把物料供应商、配送供应商、上游供给、种苗批发或外地批发混入消费者首页商品卡。

## 验证

- `cd apps/storefront && bun run build`
- 首页桌面截图
- 首页移动端截图
- 商品卡字段对齐检查
- `git diff --check`
