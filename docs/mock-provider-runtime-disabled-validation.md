# Mock Provider Runtime Disabled Validation

更新时间：2026-05-08 15:45 Asia/Shanghai

## 范围

本报告记录 PR #184 `mock-provider-runtime-disabled-skeleton` 合并后的验证。

## 验证命令

```bash
.codex/scripts/payment-notification-idempotency-harness.sh
bunx tsc --noEmit -p packages/api/tsconfig.json
grep -R "china-payment-notification" packages/api/medusa-config.ts || true
psql -h 127.0.0.1 -p 15432 -U codex -d postgres -tAc \
  "select datname from pg_database where datname like 'fuyi_payment_notification_inbox_dry_run_%' order by datname"
git diff --check
```

## 结果

- Payment notification harness 通过。
- 单元测试：21 suites / 137 tests passed。
- Local disposable DB dry-run 通过，fixture row count 为 `2|9`。
- API typecheck 通过。
- `packages/api/medusa-config.ts` 未命中 `china-payment-notification`，模块仍未注册。
- 未发现 `fuyi_payment_notification_inbox_dry_run_%` 残留库。
- `git diff --check` 通过。

## 安全结论

当前 `POST /china/payment-providers/mock` 仍只是 disabled skeleton：

- 默认返回 503。
- production 返回 `production_blocked`。
- 不读取 request body。
- 不连接 DB。
- 不调用 provider registry。
- 不调用 runtime gate。
- 不调用 provider adapter。
- 不执行 payment workflow。

本轮没有改变：

- checkout。
- order。
- payment state。
- refund。
- settlement。
- commission。
- permission。

## 下一步

下一项建议为 `mock-provider-runtime-local-inbox-only-plan`：

- 只规划 local disposable DB inbox-only runtime。
- 不写 runtime code。
- 仍不执行 payment workflow。
