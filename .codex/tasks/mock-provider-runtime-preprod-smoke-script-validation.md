# Task: mock-provider-runtime-preprod-smoke-script-validation

## 目标

记录 `mock-provider-runtime-preprod-smoke-script` 合并后的主线验证结果。

## 允许修改

- `.codex/tasks/mock-provider-runtime-preprod-smoke-script-validation.md`
- `docs/mock-provider-runtime-preprod-smoke-script-validation.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- 不修改 `apps/**`。
- 不修改 `packages/**`。
- 不修改 `.codex/scripts/**`。
- 不连接预发或生产数据库。
- 不注册 Provider。
- 不执行 payment workflow。

## 验证命令

```bash
.codex/scripts/mock-provider-runtime-preprod-smoke.sh --print-plan
MOCK_PROVIDER_PREPROD_DB_HOST=preprod-disposable.local \
MOCK_PROVIDER_PREPROD_DB_PORT=5432 \
MOCK_PROVIDER_PREPROD_DB_USER=codex \
MOCK_PROVIDER_PREPROD_DB_NAME=fuyi_codex_disposable_payment_provider_smoke \
MOCK_PROVIDER_PREPROD_COMMIT_SHA="$(git rev-parse HEAD)" \
MOCK_PROVIDER_PREPROD_OPERATOR=codex \
MOCK_PROVIDER_PREPROD_ROLLBACK_OWNER=codex \
.codex/scripts/mock-provider-runtime-preprod-smoke.sh --validate-inputs-only
.codex/scripts/mock-provider-runtime-preprod-smoke.sh --validate-inputs-only password=bad
git diff --check
```

## 完成标准

- print-plan 通过。
- 安全示例 validate-only 通过。
- forbidden CLI arg 按预期失败。
- 只记录验证，不改 runtime 或脚本。
