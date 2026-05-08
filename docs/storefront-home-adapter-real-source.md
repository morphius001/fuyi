# Storefront 首页 Adapter 真实只读数据源收束

更新时间：2026-05-09 Asia/Shanghai

## 目标

本轮执行 `docs/storefront-read-model-data-source-plan.md` 中的 PR JF，把 Storefront 首页 `buildChinaHomeViewModel()` 的输入从“markets API + 静态类目/档口”收束为“markets API + discovery API + 静态 fallback”。

本轮不改页面视觉布局，不修改 API，不新增 route，不新增 migration，不改变商品详情、购物车、订单、结算、支付、退款、结算、佣金、打款、权限、库存占用、履约、物流、真实排序、广告、竞价、推荐或 Provider runtime。

## 修改范围

```text
apps/storefront/src/app/[locale]/(main)/page.tsx
```

## 绑定变化

首页服务端页面现在并行读取：

- `retrieveChinaMarkets()`
- `retrieveChinaDiscovery()`

并把输入传给 `buildChinaHomeViewModel()`：

- `markets`：优先使用 `/store/china/markets`，失败或为空时使用 discovery markets，再为空时使用静态 fallback。
- `categories`：优先使用 `/store/china/discovery` categories，失败或为空时使用静态 fallback。
- `sellers`：优先使用 `/store/china/discovery` sellers，失败或为空时使用静态 fallback。
- `products`：仍使用当前首页本地鲜货展示数据作为只读商品卡输入，不改变商品详情或加购链路。

静态 `home-market` 数据被集中到 `buildStaticHomeDiscovery()`，作为 adapter fallback，而不是直接散落在页面输入构造里。

## 未改变内容

本轮没有改变：

- 首页视觉布局
- 商品详情入口
- `ProductCard`
- cart mutation
- checkout shipping options
- order mutation
- payment / refund / settlement / commission / payout
- permission / RBAC
- fulfillment / logistics / waybill
- real provider config
- real credentials

## 降级策略

首页 adapter 输入按以下顺序降级：

```text
markets API + discovery API -> discovery API -> static home-market fallback
```

页面继续展示消费者可理解的市场、类目、档口和今日鲜货文案，不展示 `fallback`、`mock`、`metadata`、`API failed`、`source`、`highRisk` 等内部字段。

## 验证结果

已运行：

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn/apps/storefront
/home/codex/.bun/bin/bun run build
```

- Storefront build 通过。
- 仅保留既有 React Hook dependency warnings。

- `git diff --check` 通过。
- 首页 HTTP smoke：`http://127.0.0.1:3101/cn` 返回 200。

视觉 QA：

- 已生成首页 desktop 截图：`docs/visual-qa-artifacts/storefront-home-adapter-real-source-desktop.png`。
- 已生成首页 mobile 截图：`docs/visual-qa-artifacts/storefront-home-adapter-real-source-mobile.png`。
- 截图只放 `docs/visual-qa-artifacts/` 本地目录，不提交。

## 回滚方式

如首页展示异常，可回滚 `apps/storefront/src/app/[locale]/(main)/page.tsx` 中本轮新增的 `retrieveChinaDiscovery()` 读取和 `fallback` 输入构造，恢复为上一轮仅使用 markets API + 静态类目/档口输入。

回滚不影响 `buildChinaHomeViewModel()` 本身，也不影响 cart、checkout、订单、支付、退款、结算、佣金、权限、履约或物流状态。
