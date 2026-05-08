# storefront-product-discovery-phase-rollup

## Goal

汇总 Storefront 商品发现 read model 阶段从 API builder 到页面绑定的完整状态，明确已完成、未完成和下一阶段安全边界。

## Scope

- docs-only 收口。
- 汇总 PR #277-#284：
  - product discovery read model builder
  - Store API readonly route
  - Storefront readonly client
  - readonly validation
  - home/search/shop source binding
  - binding validation
- 记录下一阶段只能继续做只读观测、QA 或拆分计划，不能自动进入交易/履约/权限高风险 runtime。

## Non-goals

- 不修改 `apps/**` 或 `packages/**`。
- 不新增 API route、migration、module registration、provider 或 UI runtime。
- 不修改 `ProductCard`。
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
