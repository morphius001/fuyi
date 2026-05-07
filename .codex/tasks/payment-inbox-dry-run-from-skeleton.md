# payment-inbox-dry-run-from-skeleton

## 目标

让本地 payment notification inbox dry-run 脚本从未注册 migration skeleton 提取 up/down SQL，避免脚本 SQL 与 skeleton SQL 分叉。

## 允许修改

- `.codex/scripts/payment-notification-inbox-local-dry-run.sh`
- `docs/local-payment-notification-inbox-dry-run.md`
- `.codex/tasks/payment-inbox-dry-run-from-skeleton.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- `apps/**`
- `packages/api/medusa-config.ts`
- `packages/api/package.json`
- `bun.lock`
- `.env`

## 验证命令

```bash
.codex/scripts/payment-notification-inbox-local-dry-run.sh
```

并确认 staged 文件不包含禁止范围：

```bash
git diff --cached --name-only | grep -E '^(apps|packages/api/medusa-config.ts|packages/api/package.json|bun.lock|\.env)' && exit 1 || true
```
