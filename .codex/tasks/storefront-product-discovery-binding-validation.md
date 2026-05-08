# storefront-product-discovery-binding-validation

## Goal

汇总 Storefront 商品发现只读页面绑定阶段，确认首页、搜索页和店铺页均只消费展示字段，没有改变交易或履约链路。

## Scope

- docs-only 收口。
- 汇总 PR #281、#282、#283。
- 记录验证、非目标、风险和回滚方式。
- 不修改 `apps/**` 或 `packages/**`。

## Non-goals

- 不新增页面绑定。
- 不修改 `ProductCard`。
- 不修改 Store API、API route、builder、client 或 adapter runtime。
- 不改变 cart、checkout、订单、支付、退款、结算、佣金、打款、权限、履约、物流或真实 Provider。

## Verification

已完成：

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn/apps/storefront
/home/codex/.bun/bin/bun run build
```

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn
git diff --check
```

子智能体 docs-only 只读复核通过。Storefront build 仅保留既有 React Hook dependency warnings。
