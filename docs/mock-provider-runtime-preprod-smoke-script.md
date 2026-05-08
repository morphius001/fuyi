# Mock Provider Runtime Preprod Smoke Script

更新时间：2026-05-08 16:16 Asia/Shanghai

## 结论

新增脚本 skeleton：

```bash
.codex/scripts/mock-provider-runtime-preprod-smoke.sh --print-plan
.codex/scripts/mock-provider-runtime-preprod-smoke.sh --validate-inputs-only
```

脚本当前不会连接任何预发或生产数据库，只做计划输出和输入校验。

## 支持模式

- `--print-plan`: 输出计划，不连接数据库。
- `--validate-inputs-only`: 校验环境变量，不连接数据库。

以下阶段仍未启用：

- `--preflight`
- `--smoke`

这两个阶段必须等用户明确提供 disposable preprod DB、备份/回滚 owner 和连接授权后，单独 PR 实现。

## 输入规则

安全示例：

```bash
MOCK_PROVIDER_PREPROD_DB_HOST=preprod-disposable.local
MOCK_PROVIDER_PREPROD_DB_PORT=5432
MOCK_PROVIDER_PREPROD_DB_USER=codex
MOCK_PROVIDER_PREPROD_DB_NAME=fuyi_codex_disposable_payment_provider_smoke
MOCK_PROVIDER_PREPROD_COMMIT_SHA="$(git rev-parse HEAD)"
MOCK_PROVIDER_PREPROD_OPERATOR=codex
MOCK_PROVIDER_PREPROD_ROLLBACK_OWNER=codex
```

脚本拒绝：

- full connection string。
- password CLI 参数。
- provider secret CLI 参数。
- raw payload CLI 参数。
- signature CLI 参数。
- production-like DB host/name。
- 没有 disposable / dry-run / codex 语义的 DB name。
- commit sha 与当前 HEAD 不一致。

## 验证结果

通过：

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

其中 `password=bad` 按预期失败，用于验证禁止敏感 CLI 参数。

## 仍未进入范围

- 不连接 disposable preprod DB。
- 不连接生产 DB。
- 不注册 Medusa payment provider。
- 不接支付宝或微信支付。
- 不执行 payment workflow。
- 不修改 checkout、order、payment、refund、settlement、commission、payout 或 permission 状态。
