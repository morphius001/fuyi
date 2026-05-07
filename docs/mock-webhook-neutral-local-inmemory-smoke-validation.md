# Mock Webhook Neutral Local In-Memory Smoke Validation

更新时间：2026-05-07 19:35 Asia/Shanghai

## 对象

- PR: [#148](https://github.com/morphius001/fuyi/pull/148)
- 标题：`test: add neutral mock webhook local devserver smoke`
- Merge commit: `a5662f9f6e001803484ed60e182d974bb4e4a9c2`

## 合并后验证

在 `origin/main` 基线上执行。

### Local In-Memory Devserver Smoke

命令：

```bash
bash -n .codex/scripts/mock-webhook-neutral-route-smoke.sh
bash -n .codex/scripts/mock-webhook-neutral-local-inmemory-devserver-smoke.sh
.codex/scripts/mock-webhook-neutral-local-inmemory-devserver-smoke.sh
```

结果：

```text
START temporary neutral mock webhook API on http://127.0.0.1:9100
PASS local in-memory accepted case
PASS missing signature case
PASS malformed payload case
PASS neutral mock webhook route smoke completed in mode: local-inmemory
PASS temporary neutral mock webhook local-inmemory devserver smoke completed.
```

验证覆盖：

- fake signed CNY payload accepted。
- missing signature rejected。
- malformed payload rejected。
- response 不泄漏 raw payload、signature、mock secret 或 workflow result。
- 临时 API 使用 9100 端口。
- 脚本结束后只关闭自己启动的临时 API。

### Payment Notification Harness

命令：

```bash
.codex/scripts/payment-notification-idempotency-harness.sh
```

结果：

- 14 个 test suites 通过。
- 84/84 tests 通过。
- 本地 disposable DB dry-run 通过。
- dry-run row count：`2|9`。
- 临时库 `fuyi_payment_notification_inbox_dry_run_20260507192758` 已删除。

### 端口清理复查

命令：

```bash
ss -ltn '( sport = :9100 )' || true
```

结果：无监听进程。

### Disposable DB 残留检查

命令：

```bash
psql -h 127.0.0.1 -p 15432 -U "$USER" -d postgres -tAc "select datname from pg_database where datname like 'fuyi_payment_notification_repository_dry_run_%' or datname like 'fuyi_payment_notification_inbox_dry_run_%'"
```

结果：空。

## 当前状态

neutral mock webhook 本地验证链路已经覆盖：

- 默认 disabled route。
- neutral route local-only in-memory accepted / rejected。
- 临时 devserver wrapper。
- 不泄漏 raw payload、signature、mock secret 或 workflow result。

仍未做：

- DB-backed inbox route。
- 真实支付宝 Provider。
- 真实微信支付 Provider。
- payment workflow 执行。
- 退款、对账、商家结算、佣金或权限。

## 风险结论

本轮风险可控。

下一步建议先做 `mock-webhook-admin-route-deprecation-plan`，明确旧 Admin mock route 是保留为后台调试入口、降级为 disabled-only，还是后续删除；不要直接跳到 DB-backed route 或真实 Provider。
