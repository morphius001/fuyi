# Mock Webhook Admin Route Disabled Validation

更新时间：2026-05-07 22:35 Asia/Shanghai

## 范围

本报告记录 PR #151 合并后，旧 Admin mock webhook route 降级为 disabled-only 的验证结果。

已合并变更：

```text
POST /admin/china/mock-payment-webhooks
```

该 route 现在只返回 disabled response，不再读取 body、不处理 signature/header、不构造 in-memory repository、不调用 mock webhook handler。

## 验证命令与结果

### Payment notification harness

命令：

```bash
.codex/scripts/payment-notification-idempotency-harness.sh
```

结果：

- 通过。
- Payment notification unit tests：14 suites passed，83 tests passed。
- Admin route disabled-only 单测已覆盖默认、runtime requested、local in-memory requested、production 都 disabled 且不读取 body。
- Disposable inbox migration skeleton dry-run 通过。
- Dry-run row count：`2|9`。
- Temporary database：`fuyi_payment_notification_inbox_dry_run_20260507194541`，脚本结束后已 drop。

### API typecheck

命令：

```bash
cd packages/api && bunx tsc --noEmit -p tsconfig.json
```

结果：通过。

### Runtime grep

命令：

```bash
grep -R -n 'china-payment-notification' packages/api/medusa-config.ts packages/api/src/api packages/api/src/workflows packages/api/src/subscribers packages/api/src/jobs packages/api/src/links 2>/dev/null || true
```

结果只命中：

```text
packages/api/src/api/admin/china/mock-payment-webhooks/route.ts
packages/api/src/api/china/payment-webhooks/mock/route.ts
packages/api/src/api/china/payment-webhooks/mock/__tests__/route.unit.spec.ts
```

未命中：

- `packages/api/medusa-config.ts`
- workflows
- subscribers
- jobs
- links

### Disposable DB residual check

命令：

```bash
psql -h 127.0.0.1 -p 15432 -U "$USER" -d postgres -tAc "select datname from pg_database where datname like 'fuyi_payment_notification_repository_dry_run_%' or datname like 'fuyi_payment_notification_inbox_dry_run_%'"
```

结果：空，未发现残留 disposable DB。

### Diff whitespace check

命令：

```bash
git diff --check
```

结果：通过。

## 安全结论

- Admin route 已从本地 runtime 调试入口降级为 disabled-only。
- neutral route `POST /china/payment-webhooks/mock` 继续作为唯一 mock provider callback 演进路径。
- 本轮没有接真实支付宝或微信支付。
- 本轮没有连接 DB-backed repository。
- 本轮没有注册 migration。
- 本轮没有调用 payment workflow。
- 本轮没有改变 checkout、order、payment、refund、settlement、payout、commission 或 permission 行为。

## 后续建议

下一步进入 `mock-webhook-db-backed-route-plan`，只规划 neutral route 如何接 DB-backed inbox skeleton。

DB-backed inbox、真实支付宝、微信支付、退款、对账、商家结算和佣金仍继续串行拆分。
