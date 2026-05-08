# storefront-discovery-data-inventory

## Goal

盘点当前 Storefront discovery 只读链路已具备的数据字段和缺口，为下一轮 source tags / QA / validation 做准备。

## Scope

- docs-only。
- 基于现有 Storefront clients、Store API route 和 read model types 做字段 inventory。
- 不新增脚本、不读写数据库、不修改 `apps/**` 或 `packages/**`。

## Non-goals

- 不新增 migration、API route、写接口或 runtime。
- 不修改 Storefront 页面或 `ProductCard`。
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
