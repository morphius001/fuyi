# payment-inbox-repository-disposable-db-test-plan

## 目标

规划 payment notification inbox repository 的本地 disposable DB integration test，不写测试实现。

## 允许修改

- `docs/payment-inbox-repository-disposable-db-test-plan.md`
- `.codex/tasks/payment-inbox-repository-disposable-db-test-plan.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- `apps/**`
- `packages/**`
- `bun.lock`
- `package.json`
- `.env`

## 必须覆盖

- disposable DB 命名和本地 host 限制。
- setup / rollback / cleanup。
- migration skeleton up/down。
- adapter integration test cases。
- no residual DB check。
- preprod/production 禁止边界。

## 禁止行为

- 不写 integration test。
- 不连接数据库。
- 不注册 migration。
- 不新增 webhook route。
- 不调用 payment workflow。

## 验证命令

```bash
git diff --check -- \
  docs/payment-inbox-repository-disposable-db-test-plan.md \
  .codex/tasks/payment-inbox-repository-disposable-db-test-plan.md \
  .codex/queue.md \
  project-ledger
```
