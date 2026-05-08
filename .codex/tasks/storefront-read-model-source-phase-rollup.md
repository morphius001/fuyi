# storefront-read-model-source-phase-rollup

## 目标

汇总 Storefront read model source 阶段从 PR #267 到 PR #274 的结果，确认当前阶段已经完成：

- 首页 adapter 输入收束到 markets API + discovery API + static fallback。
- 搜索 adapter 输入合同与 discovery source binding。
- 店铺 adapter membership 输入合同与 source binding。
- 商品发现输入共享只读合同。

本任务只做 docs / ledger 阶段收口，不修改 `apps/**` 或 `packages/**` 业务代码。

## 范围

允许修改：

- `.codex/tasks/storefront-read-model-source-phase-rollup.md`
- `docs/storefront-read-model-source-phase-rollup.md`
- `.codex/queue.md`
- `project-ledger/changelog.md`
- `project-ledger/handoff.md`
- `project-ledger/status.md`

不允许修改：

- `apps/**`
- `packages/**`
- `ProductCard`
- cart / checkout / order / payment / refund / settlement / commission / payout / permission / fulfillment / logistics
- 真实搜索、广告、竞价、推荐、支付、短信、IM、物流或直播 provider

## 验证

- `cd apps/storefront && /home/codex/.bun/bin/bun run build`
- `git diff --check`
- 子智能体只读复核。

## 下一步边界

阶段收口后，不能继续把交易、履约、权限、结算或 provider runtime 混入普通 Storefront adapter 任务。后续若继续，应拆成新的低风险只读任务，或进入单独高风险串行任务。
