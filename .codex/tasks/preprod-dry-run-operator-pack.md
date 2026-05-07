# preprod-dry-run-operator-pack

## 目标

在仍然不连接预发数据库的前提下，整理 `preprod-disposable-db-dry-run-execution` 的执行包。

本任务只生成 docs-only 操作包，帮助后续拿到可丢弃预发 DB 后按步骤执行、记录和回滚。

## 允许修改

- `docs/preprod-dry-run-operator-pack.md`
- `.codex/tasks/preprod-dry-run-operator-pack.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- `apps/**`
- `packages/**`
- migration SQL
- production seed
- `package.json`
- `bun.lock`
- `.env*`
- 支付、订单、退款、结算、佣金、权限、真实履约逻辑
- 真实短信、IM、物流、直播、AI、支付 provider

## 验证命令

```bash
git diff --check -- docs/preprod-dry-run-operator-pack.md .codex/tasks/preprod-dry-run-operator-pack.md .codex/queue.md project-ledger
```

## 完成边界

- 不执行 DB 命令。
- 不读取或写入真实凭据。
- 不把任何真实 DB URL 写入仓库。
- 保持 `preprod-disposable-db-dry-run-execution` 为 `blocked-external`。
