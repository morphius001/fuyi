# Mock Provider Runtime Local Smoke Validation

更新时间：2026-05-08 16:01 Asia/Shanghai

## 结论

PR #190 `mock-provider-local-smoke-script` 已合并到 `main`，merge commit:

```text
dd936fe0e58cd846079920e318a871b754be7038
```

合并后在最新 `origin/main` 派生分支上复验通过。当前 `POST /china/payment-providers/mock` 仍保持 mock-only、local disposable DB inbox-only，不注册 Medusa payment provider，不执行 payment workflow。

## 验证结果

通过：

```bash
.codex/scripts/mock-provider-runtime-local-smoke.sh disabled
.codex/scripts/mock-provider-runtime-local-smoke.sh accepted
.codex/scripts/mock-provider-runtime-local-smoke.sh duplicate
.codex/scripts/mock-provider-runtime-local-smoke.sh rejected
.codex/scripts/payment-notification-idempotency-harness.sh
bunx tsc --noEmit -p packages/api/tsconfig.json
git diff --check
```

Harness 结果：

```text
Test Suites: 21 passed, 21 total
Tests:       143 passed, 143 total
```

额外复查：

- `medusa-config.ts` 未出现 `china-payment-notification` 注册。
- disposable DB 复查无 `fuyi_payment_notification_route_dry_run_*` 或 `fuyi_payment_notification_inbox_dry_run_*` 残留。
- 9120 端口复查无监听残留。
- `packages/api/.mercur/index.d.ts` 已在 typecheck 后恢复，未纳入本验证 PR。
- `docs/visual-qa-artifacts/**` 仍为未跟踪本地视觉产物，未纳入本验证 PR。

## 安全边界

本轮未做：

- 支付宝 Provider。
- 微信支付 Provider。
- 真实 payment workflow execution。
- checkout、order、payment、refund、settlement、commission、payout 或 permission 状态变更。
- 预发或生产数据库连接。

## 下一步

可以进入 `mock-provider-runtime-preprod-smoke-plan` docs-only 任务，规划未来 disposable preprod DB smoke 的门禁和执行清单。没有外部 disposable preprod DB 前，不执行外部数据库连接。
