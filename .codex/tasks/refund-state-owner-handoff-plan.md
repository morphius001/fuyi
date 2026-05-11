# Refund State Owner Handoff Plan

## 任务

规划后续 `refund-state-owner-handoff` 阶段：明确 provider refund inbox、manual review、platform refund state owner 和 workflow command 的交接边界。

## 范围

- 新增 `docs/refund-state-owner-handoff-plan.md`。
- 更新 `.codex/queue.md`、`project-ledger/changelog.md`、`project-ledger/status.md`、`project-ledger/handoff.md`。
- 只做 docs-only planning，不改 runtime。

## 非目标

- 不修改 `apps/**`。
- 不修改 `packages/**` runtime。
- 不连接 DB。
- 不注册 module。
- 不接 SDK 或真实密钥。
- 不调用 provider refund API。
- 不调用 refund query API。
- 不执行 workflow。
- 不写 refund success state。
- 不改变 settlement、commission、payout、permission、fulfillment 或 logistics。

## 必须覆盖

- State owner 分层：provider notification inbox、manual review、platform refund state、workflow command、reconciliation。
- Handoff command 输入：verified envelope、inbox record、amount/currency check、ownership check、permission check、idempotency key、manual review decision。
- Non-executable / shadow-first 原则：计划阶段不得让 route 直接写退款成功。
- Manual review、retry、terminal conflict、late event、digest conflict 和 unknown refund id 的处理。
- Settlement / commission / payout / fulfillment / logistics block。
- 后续 PR 拆分和验证矩阵。

## 验证

- `git diff --check`
- `git status --short --branch`
- 子智能体只读复核。
