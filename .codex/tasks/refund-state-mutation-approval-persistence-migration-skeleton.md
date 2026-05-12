# refund-state-mutation-approval-persistence-migration-skeleton

## 目标

在 `china-payment-notification` 模块下新增未注册的 approval persistence migration skeleton 与本地 disposable DB dry-run 脚本，验证 approval 主表 / event 表、关键约束、up/down rollback 和生产未注册边界。

## 允许修改

- `packages/api/src/modules/china-payment-notification/migrations/Migration20260512000300.ts`
- `.codex/scripts/refund-state-mutation-approval-persistence-local-dry-run.sh`
- `docs/refund-state-mutation-approval-persistence-migration-skeleton.md`
- `.codex/queue.md`
- `project-ledger/changelog.md`
- `project-ledger/handoff.md`
- `project-ledger/status.md`

## 禁止修改

- `packages/api/medusa-config.ts`
- `packages/api/src/api/**`
- `packages/api/src/workflows/**`
- `apps/**`
- 任何 payment / refund / settlement / commission / payout / permission / fulfillment / logistics runtime

## 约束

- migration 必须保持未注册。
- dry-run 只能连接本地 disposable PostgreSQL。
- 不新增 repository、route、job、subscriber、workflow execution。
- 不写 production refund success state。
- 不触发财务、权限、履约或物流副作用。

## 验证

1. `bash .codex/scripts/refund-state-mutation-approval-persistence-local-dry-run.sh`
2. `bunx tsc --noEmit -p packages/api/tsconfig.json`
3. `git diff --check`
4. `git status --short --branch`
5. 子智能体只读复核文件范围和 No-Go 边界
