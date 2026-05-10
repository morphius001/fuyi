# refund-inbox-state-transition-plan

更新时间：2026-05-10 Asia/Shanghai

## 目标

规划退款通知 inbox 的状态机、owner 边界、幂等规则、审计动作映射和 Go / No-Go。

本任务只做 docs-only plan，不新增 runtime。

## 范围

允许修改：

- `.codex/tasks/refund-inbox-state-transition-plan.md`
- `docs/refund-inbox-state-transition-plan.md`
- `.codex/queue.md`
- `project-ledger/changelog.md`
- `project-ledger/status.md`
- `project-ledger/handoff.md`

禁止修改：

- `apps/**`
- `packages/**`
- `packages/api/medusa-config.ts`
- migration 注册、route、workflow、subscriber、provider runtime

## 必须覆盖

- refund inbox 状态清单。
- 允许状态流转。
- notification idempotency、duplicate replay、digest conflict。
- provider callback、inbox repository、refund guard、manual review、state transition owner、settlement / commission / payout owner 边界。
- audit action allowlist 映射。
- failure matrix。
- Go / No-Go。

## 安全边界

- inbox state 不代表退款成功。
- normalized refund envelope 不代表退款成功。
- manual review decision 不代表退款成功。
- 不接支付宝 / 微信支付 refund API。
- 不新增 refund route。
- 不写 DB。
- 不执行 workflow。
- 不改变 checkout、order、payment、refund、settlement、commission、payout、permission、fulfillment 或 logistics runtime。

## 验证

至少执行：

```bash
git diff --check
git diff --name-only
git ls-files --others --exclude-standard
```

并安排子智能体只读复核 docs-only 范围和高风险边界。
