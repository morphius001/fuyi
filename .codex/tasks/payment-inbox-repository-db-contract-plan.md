# payment-inbox-repository-db-contract-plan

## 目标

设计 payment notification inbox DB repository contract，不写 repository 实现。

## 允许修改

- `docs/payment-inbox-repository-db-contract-plan.md`
- `.codex/tasks/payment-inbox-repository-db-contract-plan.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- `apps/**`
- `packages/**`
- `bun.lock`
- `package.json`
- `.env`

## 必须覆盖

- repository method contract。
- transaction 边界。
- idempotency unique handling。
- event log 事务一致性。
- retryable / terminal error mapping。
- metadata 安全规则。
- 后续 PR 拆分。

## 禁止行为

- 不写 repository 实现。
- 不连接数据库。
- 不注册 migration。
- 不接 runtime。
- 不调用 payment workflow。

## 验证命令

```bash
git diff --check -- \
  docs/payment-inbox-repository-db-contract-plan.md \
  .codex/tasks/payment-inbox-repository-db-contract-plan.md \
  .codex/queue.md \
  project-ledger
```
