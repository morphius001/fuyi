# refund-inbox-repository-plan

更新时间：2026-05-10 Asia/Shanghai

## 目标

规划退款通知 inbox DB-backed repository 的 owner、事务边界、幂等冲突、event log 一致性和后续 PR 顺序。

本任务只做 docs-only plan，不新增 repository runtime。

## 范围

允许修改：

- `.codex/tasks/refund-inbox-repository-plan.md`
- `docs/refund-inbox-repository-plan.md`
- `.codex/queue.md`
- `project-ledger/changelog.md`
- `project-ledger/status.md`
- `project-ledger/handoff.md`

禁止修改：

- `apps/**`
- `packages/**`
- route、DB repository runtime、migration 注册、provider API、workflow、checkout / order / payment / refund / settlement / commission / payout / permission / fulfillment / logistics runtime

## 必须覆盖

- repository owner 和 non-owner。
- 计划中的 method contract。
- transaction boundary。
- idempotency / duplicate replay / digest conflict。
- event log 一致性。
- error mapping。
- metadata redaction。
- manual review 和 settlement / commission / payout block。
- 后续 PR 顺序。

## 验证

至少执行：

```bash
git diff --check
git diff --name-only
git ls-files --others --exclude-standard
```

并安排子智能体只读复核。
