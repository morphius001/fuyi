# Refund State Mutation Implementation Chain Plan

更新时间：2026-05-14 Asia/Shanghai

## 结论

`launch readiness` 已经明确是 No-Go；如果还要继续推进，只能重新开启一条 implementation 级高风险串行任务链。目标不是承诺“今天能上”，而是把第一批真实代码任务压缩到最短、最清楚、最不自欺的顺序。

## Why A New Chain Is Needed

当前 `.codex/queue.md` 已经在 docs-only 阶段收口，不再存在自然的“下一个低风险任务”。如果继续推进，只能从新的实现链重新起步，否则会把文档收口和高风险代码落地混成一团。

## Serial-Only Rule

这条实现链默认必须串行推进，原因是它会逐步靠近：

- refund success state mutation
- workflow execution
- persistence write path
- operator review evidence
- rollback / kill switch

这些环节之间耦合很强，不能把真正的实现任务随意并行落地。

## Proposed Serial Chain

新的实现链建议拆成 8 步，而且必须先建 payment runtime 证据链，再进入 refund mutation：

1. `payment-notification-db-runtime-preflight-implementation`
2. `mock-webhook-db-backed-route-runtime`
3. `payment-runtime-inbox-only-route-disposable-db-rehearsal`
4. `payment-workflow-command-adapter-disabled-runtime`
5. `payment-refund-rbac-ownership-enforcement`
6. `refund-state-mutation-isolated-preprod-query-surface-implementation`
7. `refund-state-mutation-isolated-preprod-persistence-adapters`
8. `refund-state-mutation-rollback-kill-switch-rehearsal-and-go-no-go`

前 1-4 步属于 payment runtime 证据建立阶段，5-8 步才进入 refund mutation implementation 阶段。两段之间不要并行。

## Stage A: Payment Runtime Evidence First

### 1. `payment-notification-db-runtime-preflight-implementation`

目标：

- 把 runtime gate、DB 连接白名单、redaction、fail-closed 前置条件变成可执行代码

非目标：

- 不接真实支付宝 / 微信支付
- 不执行 workflow
- 不改 payment / order state

门禁：

- 现有 harness + typecheck + grep 必须继续证明仍是 disabled / mock-only

### 2. `mock-webhook-db-backed-route-runtime`

目标：

- 落地 mock / fake payload 到 inbox 的 DB-backed route

非目标：

- 不注册真实 provider
- 不接 checkout
- 不暴露 success 语义

门禁：

- route 必须仍是 inbox-only，默认关闭，只能在 local / disposable DB 下使用

### 3. `payment-runtime-inbox-only-route-disposable-db-rehearsal`

目标：

- 用 disposable DB 做一轮带证据的 rehearsal

非目标：

- 不接外部 DB
- 不跑真实订单支付闭环
- 不写 payment success

门禁：

- 必须覆盖 duplicate、invalid signature、rejected payload、response redaction
- 没有 rehearsal 证据不能进入下一步

### 4. `payment-workflow-command-adapter-disabled-runtime`

目标：

- 只实现 disabled command adapter / release gate

非目标：

- 不真正执行 payment workflow
- 不放开 real provider
- 不改 checkout 提交流程

门禁：

- 必须证明 route 即使拿到 command DTO，也不会自动推进 workflow

## Highest-Signal Code Entry Points

如果开始真实 implementation，最早会碰到的 `packages/api` 入口是：

1. [refund-inbox-state-transition.ts](/home/codex/code/fuyi-pr-bx-workflow-handoff-cn/packages/api/src/modules/china-payment-notification/refund-inbox-state-transition.ts)
2. [alipay refund inbox route](/home/codex/code/fuyi-pr-bx-workflow-handoff-cn/packages/api/src/api/china/refund-inbox/alipay/route.ts)
3. [wechat pay refund inbox route](/home/codex/code/fuyi-pr-bx-workflow-handoff-cn/packages/api/src/api/china/refund-inbox/wechat-pay/route.ts)
4. [refund-state-mutation-approval-persistence-repository.ts](/home/codex/code/fuyi-pr-bx-workflow-handoff-cn/packages/api/src/modules/china-payment-notification/refund-state-mutation-approval-persistence-repository.ts)
5. [refund-state-mutation-audit-persistence-repository.ts](/home/codex/code/fuyi-pr-bx-workflow-handoff-cn/packages/api/src/modules/china-payment-notification/refund-state-mutation-audit-persistence-repository.ts)
6. [refund-state-mutation-runtime-attempt-persistence-repository.ts](/home/codex/code/fuyi-pr-bx-workflow-handoff-cn/packages/api/src/modules/china-payment-notification/refund-state-mutation-runtime-attempt-persistence-repository.ts)
7. [refund-state-mutation-terminal-conflict-persistence-repository.ts](/home/codex/code/fuyi-pr-bx-workflow-handoff-cn/packages/api/src/modules/china-payment-notification/refund-state-mutation-terminal-conflict-persistence-repository.ts)
8. [packages/api/src/workflows/README.md](/home/codex/code/fuyi-pr-bx-workflow-handoff-cn/packages/api/src/workflows/README.md) 对应的未来真实 workflow 目录

目前这些入口里，route 仍明确停在 inbox / audit-only，四段 repository 仍只有 contract / intent mapper，没有真实实现类；workflow 目录也还没有真实 refund workflow。

## Stage B: Refund Mutation Implementation Only After Runtime Evidence

### 5. `payment-refund-rbac-ownership-enforcement`

目标：

- 先把 payment / refund 相关 ownership、RBAC、audit hooks 落到后端强校验

非目标：

- 不扩写 UI
- 不放开 Admin / Vendor 任意写操作
- 不碰 settlement / commission / payout

门禁：

- 没有这层，refund implementation 一律不进

### 6. `refund-state-mutation-isolated-preprod-query-surface-implementation`

目标：

- 先实现 operator review 查询面和聚合读模型

非目标：

- 不写 refund success state
- 不接 production DB
- 不做 provider refund request / query

门禁：

- 必须能稳定看到 approval / audit / runtime-attempt / terminal-conflict 证据

### 7. `refund-state-mutation-isolated-preprod-persistence-adapters`

目标：

- 在 isolated-preprod gate 下实现四段 adapter

非目标：

- 不进 production workflow
- 不改 settlement / commission / payout / permission / fulfillment / logistics

门禁：

- 任一 adapter 不能 fail-closed、不能 redacted、不能独立回滚，都不能继续

### 8. `refund-state-mutation-rollback-kill-switch-rehearsal-and-go-no-go`

目标：

- 完成真实 rollback drill、kill switch drill、operator sign-off 和副作用隔离证明

非目标：

- 不直接上线
- 不把 rehearsal 当 production 放行

门禁：

- 全部通过后，才允许单独开 production go / no-go 评审

## Explicit Non-Goals For This Chain

在新的 implementation 链前几步里，仍然不允许：

- production workflow execution
- production refund success state mutation
- production DB write
- settlement、commission、payout、permission、fulfillment、logistics side effect
- 真实 provider refund request / query

## Verification Strategy

每一步至少要带：

- focused tests
- API typecheck
- runtime grep / registration check（适用时）
- `git diff --check`

只有在这些都通过后，才允许进入下一步。

## Recommendation

如果真的要继续推进，现在最合理的第一步不是继续补文档，而是：

1. 先把本任务 `implementation-chain-plan` 合并
2. 紧接着开启 `payment-notification-db-runtime-preflight-implementation`
3. 然后再接 `mock-webhook-db-backed-route-runtime`

这仍然不是“今天上线”，但这是当前最快、也最诚实的推进路径。
