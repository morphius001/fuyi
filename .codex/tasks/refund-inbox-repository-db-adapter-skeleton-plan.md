# refund-inbox-repository-db-adapter-skeleton-plan

更新时间：2026-05-10 Asia/Shanghai

## 目标

规划未来退款 inbox DB adapter skeleton 的文件边界、mocked DB client 测试边界、事务要求和风险门禁。

本任务只做 docs-only plan，不写 DB adapter。

## 范围

允许修改：

- `.codex/tasks/refund-inbox-repository-db-adapter-skeleton-plan.md`
- `docs/refund-inbox-repository-db-adapter-skeleton-plan.md`
- `.codex/queue.md`
- `project-ledger/changelog.md`
- `project-ledger/status.md`
- `project-ledger/handoff.md`

禁止修改：

- `apps/**`
- `packages/**`
- route、DB adapter/runtime、migration 注册、provider API、workflow、checkout / order / payment / refund / settlement / commission / payout / permission / fulfillment / logistics runtime

## 必须覆盖

- 未来 skeleton 文件边界。
- adapter 职责 / 非职责。
- mocked DB client 测试清单。
- transaction requirements。
- error mapping。
- metadata redaction。
- staged guard / runtime grep。
- 后续 PR 顺序。

## 验证

至少执行：

```bash
git diff --check
git diff --name-only
git ls-files --others --exclude-standard
```

并安排子智能体只读复核。
