# Mock Provider Runtime Preprod Smoke Script Validation

更新时间：2026-05-08 16:23 Asia/Shanghai

## 结论

PR #193 `mock-provider-preprod-smoke-script` 已合并到 `main`，merge commit:

```text
49a6f8e93f654ff48030fe0a61503068b15c73c6
```

合并后在最新 `origin/main` 派生分支上复验通过。脚本仍只支持 `--print-plan` 和 `--validate-inputs-only`，没有连接任何预发或生产数据库。

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
git diff --check
```

负向验证：

```bash
.codex/scripts/mock-provider-runtime-preprod-smoke.sh --validate-inputs-only password=bad
```

结果：按预期失败，证明敏感 CLI 参数会被拒绝。

## 安全边界

本轮未做：

- 不连接 disposable preprod DB。
- 不连接生产 DB。
- 不修改 `apps/**` 或 `packages/**`。
- 不注册 Medusa payment provider。
- 不接支付宝或微信支付。
- 不执行 payment workflow。
- 不改变 checkout、order、payment、refund、settlement、commission、payout 或 permission 状态。

## 下一步

自动队列现在应停在外部阻塞边界。真正的 `--preflight` 或 `--smoke` 必须等用户明确提供 disposable preprod DB、备份/回滚 owner 和连接授权后才允许继续。
