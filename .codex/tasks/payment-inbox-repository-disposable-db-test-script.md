# payment-inbox-repository-disposable-db-test-script

## 目标

新增 payment notification repository 本地 disposable DB 验证脚本。

## 允许修改

- `.codex/scripts/payment-inbox-repository-disposable-db-test.sh`
- `.codex/tasks/payment-inbox-repository-disposable-db-test-script.md`
- `docs/payment-inbox-repository-disposable-db-test-plan.md`
- `docs/payment-inbox-repository-disposable-db-test-script.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- `apps/**`
- `packages/**`
- `bun.lock`
- `package.json`
- `.env`

## 安全边界

- 只允许本地 disposable DB。
- 不连接预发或生产数据库。
- 不注册 migration。
- 不新增 webhook route。
- 不调用 payment workflow。
- 不改变交易状态。

## 验证命令

```bash
.codex/scripts/payment-inbox-repository-disposable-db-test.sh
```
