# Storefront 首页 Adapter 只读绑定

更新时间：2026-05-08 Asia/Shanghai

## 目标

本轮把消费者首页首屏的市场、类目和推荐档口展示接到 `buildChinaHomeViewModel()` 输出。绑定仍是只读展示，不改变购物车、库存、结算、订单、支付、退款、结算、佣金、打款、权限、履约、物流或真实 Provider。

## 修改范围

```text
apps/storefront/src/app/[locale]/(main)/page.tsx
```

## 绑定内容

首页现在在服务端页面里构造 `homeViewModel`：

- `marketSelector` 用于 active market、右侧市场卡和首屏市场上下文。
- `categoryNav` 用于桌面左侧市场类目。
- `featuredSellers` 用于移动端推荐档口。
- static fallback 继续保留，避免市场 read-only API 不可用时页面空白。

## 未绑定内容

本轮没有绑定：

- 今日鲜货商品卡
- 商品详情页
- 搜索结果页
- 店铺页
- 购物车按钮
- checkout
- order
- payment
- fulfillment

这些内容会按 `docs/storefront-adapter-binding-sequence-plan.md` 后续拆 PR。

## 安全边界

本轮没有修改：

- `packages/api/**`
- API route
- DB / migration / seed
- cart mutation
- checkout shipping options
- order mutation
- payment / refund / settlement / commission / payout
- permission / RBAC
- fulfillment / logistics / waybill
- real provider config
- real credentials

## 消费者路径规则

- 首页主路径仍是：选市场、看类目、找店 / 档口、再进入店铺。
- 物料供应商、配送供应商、上游供给、种苗批发和外地批发仍不进入消费者首页主路径。
- 页面不展示 `fallback`、`mock`、`metadata`、`API failed` 等内部字段。

## 验证

本轮应验证：

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn/apps/storefront
bun run build

cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn
git diff --check
```

视觉 QA：

- desktop 1440 x 1000 首页截图
- mobile 390 x 844 首页截图

截图只放 `docs/visual-qa-artifacts/` 本地 QA 目录，不提交。

## 回滚方式

如出现首页展示异常，可在 `apps/storefront/src/app/[locale]/(main)/page.tsx` 恢复为直接读取 `marketSwitches`、`marketCategories` 和 `stalls` 的静态展示数据。Adapter 文件保留，不影响后续重新绑定。
