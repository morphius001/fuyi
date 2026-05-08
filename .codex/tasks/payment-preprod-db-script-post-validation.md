# Task: payment-preprod-db-script-post-validation

## 目标

记录 PR #171 和 PR #172 合并后的脚本安全验证结果。

本任务只写文档和 ledger，不连接外部数据库。

## 允许修改

- `.codex/tasks/payment-preprod-db-script-post-validation.md`
- `docs/payment-preprod-db-script-post-validation.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- 不修改 `apps/**`。
- 不修改 `packages/**`。
- 不修改 `.codex/scripts/**`。
- 不连接预发或生产数据库。
- 不注册 migration。
- 不执行 payment workflow。
- 不写真实密钥。

## 验证命令

```bash
.codex/scripts/payment-notification-preprod-disposable-db-smoke.sh --print-plan
.codex/scripts/payment-notification-preprod-disposable-db-smoke.sh --validate-inputs-only ...
git diff --check
git status --short --untracked-files=all
```

## 完成标准

- 文档记录脚本安全验证和子 AG 复核结论。
- 队列明确下一项外部 DB 执行为 blocked-external。
- 未纳入 `docs/visual-qa-artifacts/**`。
