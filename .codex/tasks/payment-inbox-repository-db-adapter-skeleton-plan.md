# payment-inbox-repository-db-adapter-skeleton-plan

## 目标

规划 payment notification inbox DB adapter skeleton，不实现 adapter。

## 允许修改

- `docs/payment-inbox-repository-db-adapter-skeleton-plan.md`
- `.codex/tasks/payment-inbox-repository-db-adapter-skeleton-plan.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- `apps/**`
- `packages/**`
- `bun.lock`
- `package.json`
- `.env`

## 必须覆盖

- adapter 文件边界。
- mocked ORM/transaction 测试边界。
- 幂等冲突处理。
- event log 同事务要求。
- retryable / terminal error mapping。
- metadata 脱敏要求。
- 后续 disposable DB integration test 拆分。

## 禁止行为

- 不写 adapter 实现。
- 不连接数据库。
- 不注册 migration。
- 不新增 webhook route。
- 不调用 payment workflow。

## 验证命令

```bash
git diff --check -- \
  docs/payment-inbox-repository-db-adapter-skeleton-plan.md \
  .codex/tasks/payment-inbox-repository-db-adapter-skeleton-plan.md \
  .codex/queue.md \
  project-ledger
```
