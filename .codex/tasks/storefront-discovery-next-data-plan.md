# storefront-discovery-next-data-plan

## Goal

规划 Storefront discovery 下一轮只读数据质量和数据源要求，覆盖 market、seller membership、category 和 product discovery 的最小字段。

## Scope

- docs-only。
- 定义下一阶段 read model 数据质量、字段缺口、验收顺序和安全边界。
- 不新增 migration、API route、写接口或 runtime。
- 不修改 `apps/**` 或 `packages/**`。

## Non-goals

- 不实现真实数据模型。
- 不修改 Storefront 页面。
- 不修改 `ProductCard`。
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
