# Mock Webhook Neutral Route Smoke Validation

更新时间：2026-05-07 19:15 Asia/Shanghai

## 对象

- PR: [#145](https://github.com/morphius001/fuyi/pull/145)
- 标题：`test: add neutral mock webhook smoke script`
- Merge commit: `a9dc8d4975ca023a649810450444dd6a1e401342`

## 合并后验证

在 `origin/main` 基线上执行。

### Smoke Script Syntax And Disabled Mode

命令：

```bash
bash -n .codex/scripts/mock-webhook-neutral-route-smoke.sh
.codex/scripts/mock-webhook-neutral-route-smoke.sh disabled
```

结果：

```text
PASS disabled case
PASS neutral mock webhook route smoke completed in mode: disabled
```

说明：

- 当前本地 API 处于默认 disabled 状态。
- 本次未运行 `local-inmemory` 模式，因为脚本不会启动/停止服务或修改 API 进程 env。
- `local-inmemory` 模式需要 API 进程本身用 mock local env 启动后再执行。

### Payment Notification Harness

命令：

```bash
.codex/scripts/payment-notification-idempotency-harness.sh
```

结果：

- 14 个 test suites 通过。
- 83/83 tests 通过。
- 本地 disposable DB dry-run 通过。
- dry-run row count：`2|9`。
- 临时库 `fuyi_payment_notification_inbox_dry_run_20260507191019` 已删除。

### Disposable DB 残留检查

命令：

```bash
psql -h 127.0.0.1 -p 15432 -U "$USER" -d postgres -tAc "select datname from pg_database where datname like 'fuyi_payment_notification_repository_dry_run_%' or datname like 'fuyi_payment_notification_inbox_dry_run_%'"
```

结果：空。

## 当前状态

neutral smoke script 已可用于默认 disabled 验证。

后续要完整验证 accepted / missing signature / malformed payload，需要单独启动本地 API mock env：

```text
CHINA_PAYMENT_NOTIFICATION_RUNTIME_ENABLED=true
CHINA_PAYMENT_NOTIFICATION_WEBHOOK_MODE=mock_inbox_only
CHINA_PAYMENT_NOTIFICATION_PROVIDER=mock_china_pay
CHINA_PAYMENT_NOTIFICATION_LOCAL_INMEMORY=true
CHINA_PAYMENT_NOTIFICATION_MOCK_SECRET=<temporary mock secret>
NODE_ENV=development
```

## 风险结论

本轮是本地 smoke tooling，不接真实支付 Provider，不连接业务/预发/生产 DB，不执行 payment workflow。

下一步建议先规划如何以临时 dev server 方式运行 `local-inmemory` smoke，避免手工修改现有 API 进程环境。
