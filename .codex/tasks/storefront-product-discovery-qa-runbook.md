# storefront-product-discovery-qa-runbook

## Goal

新增 Storefront 商品发现只读绑定的人工 QA runbook，覆盖首页、搜索页和店铺页在 API 可用、fallback、无商品结果下的检查路径。

## Scope

- docs-only。
- 记录人工验证前置条件、检查矩阵、失败判定和回滚提示。
- 不修改 `apps/**` 或 `packages/**`。

## Non-goals

- 不新增自动化测试。
- 不启动或修改真实 provider。
- 不修改 `ProductCard`、Store API、cart、checkout、订单、支付、退款、结算、佣金、权限、履约或物流。

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
