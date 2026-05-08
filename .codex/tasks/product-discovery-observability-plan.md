# product-discovery-observability-plan

## Goal

规划商品发现只读链路的观测字段、排查流程和后续 PR 边界，帮助运营和开发判断 API 结果、fallback 和页面展示来源。

## Scope

- docs-only。
- 只规划未来 observability，不接真实日志 provider。
- 明确不得记录用户隐私、真实支付信息或敏感订单字段。
- 不修改 `apps/**` 或 `packages/**`。

## Non-goals

- 不新增日志 SDK、第三方埋点、metrics provider 或 tracing provider。
- 不修改 `/store/china/product-discovery` runtime。
- 不修改 Storefront 页面。
- 不改变 cart、checkout、订单、支付、退款、结算、佣金、权限、履约或物流。

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
