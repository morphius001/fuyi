# Mock Provider Runtime Local Inbox-only Validation

更新时间：2026-05-08 Asia/Shanghai

## 结论

PR #187 `mock-provider-local-inbox-skeleton` 已合并到 `main`。

合并提交：`528b26868b2096a413f3e448f15ea4d3fff6ae45`

本轮验证通过。当前 `POST /china/payment-providers/mock` 仍只是本地 mock provider runtime 的 local disposable DB inbox-only skeleton，不是可上线支付 runtime。

## 验证结果

- `.codex/scripts/payment-notification-idempotency-harness.sh` 通过。
- Payment notification harness: 21 suites / 143 tests passed。
- 本地 disposable DB dry-run row count: `2|9`。
- `bunx tsc --noEmit -p packages/api/tsconfig.json` 通过。
- `git diff --check` 通过。
- `git grep -n "china-payment-notification" -- packages/api/medusa-config.ts || true` 无输出，说明未注册 runtime module。
- disposable DB 残留复查无输出，未发现 `fuyi_payment_notification_*dry_run_*` 临时库。

## 子 AG 风险复核

子 AG 审查指出两个问题，已在 PR #187 内修复：

- 实际写入连接必须校验 Medusa `PG_CONNECTION` 的 server host / port，不能只相信 env 里的 local DB URL。
- route 响应不能返回 request header name，避免暴露 `x-mock-payment-signature` 或 authorization 等敏感头名。

最终实现已补充：

- remote actual PG connection disabled 单测。
- missing DB scope disabled 单测。
- safeDebug 只返回 `receivedAt`、`hasRawBody` 和 `runtimeRequested`。

## 仍未做

- 未注册 Medusa payment provider。
- 未接支付宝或微信支付。
- 未读取真实密钥。
- 未执行 payment workflow。
- 未改变 checkout、order、payment、refund、settlement、commission 或 permission 状态。
- 未连接预发或生产数据库。

## 下一步建议

下一项只适合做 provider route local disposable DB smoke wrapper 的计划或脚本 skeleton。真实支付宝、微信支付、退款、对账、商家结算、佣金和权限仍保持高风险串行任务。
