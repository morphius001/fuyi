# storefront-discovery-status-sync

## Goal

同步 Storefront discovery / product discovery 当前主线状态，明确 PR #277-#291 已完成后的安全下一步和阻断项。

## Scope

- docs-only。
- 汇总商品发现 read model、页面绑定、QA runbook、observability、data inventory、sourceTags 和 validation 状态。
- 不修改 `apps/**` 或 `packages/**`。

## Non-goals

- 不新增 dev-only debug banner。
- 不新增 source tags runtime。
- 不修改页面、API、`ProductCard`、cart、checkout、订单、支付、退款、结算、佣金、权限、履约或物流。

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
