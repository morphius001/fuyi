# Task: mock-provider-runtime-preprod-smoke-script

## 目标

新增 mock provider runtime disposable preprod smoke 脚本 skeleton。脚本默认不连接外部数据库，只允许输出计划和校验输入。

## 允许修改

- `.codex/scripts/mock-provider-runtime-preprod-smoke.sh`
- `.codex/tasks/mock-provider-runtime-preprod-smoke-script.md`
- `docs/mock-provider-runtime-preprod-smoke-script.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- 不修改 `apps/**`。
- 不修改 `packages/**`。
- 不修改 `package.json`、`bun.lock`、`.env` 或真实密钥。
- 不连接预发或生产数据库。
- 不注册 Medusa payment provider。
- 不接支付宝或微信支付。
- 不执行 payment workflow。

## 脚本要求

- 只支持 `--print-plan` 和 `--validate-inputs-only`。
- 默认不连接任何数据库。
- 拒绝 full connection string、password、provider secret、signature 和 raw payload CLI 参数。
- 拒绝 production-like DB host/name。
- 要求 DB name 明确包含 disposable / dry-run / codex 语义。
- 校验 commit sha 必须等于当前 HEAD。
- 失败输出不得打印敏感值。

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
- validate-inputs-only 在安全示例输入下通过。
- forbidden CLI argument 被拒绝。
- 未连接任何外部数据库。
