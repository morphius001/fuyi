# Mock Webhook DB Client Contract Validation

更新时间：2026-05-08 01:08 Asia/Shanghai

## 验证对象

PR #161：

```text
[china] Add mock webhook DB client contract
```

合并提交：

```text
3453ff373f20f56da44ab51f6c6b86cf372ee1bb
```

## 验证结果

### Payment notification harness

命令：

```bash
.codex/scripts/payment-notification-idempotency-harness.sh
```

结果：

```text
PASS
16 test suites passed
105 tests passed
disposable dry-run row count: 2|9
```

harness 覆盖：

- mock payment notification normalizer。
- inbox repository。
- state guard。
- workflow command mapper。
- workflow command audit mapper。
- inbox repository contract。
- runtime config。
- DB inbox repository skeleton。
- local Postgres DB client contract。
- mock webhook request / response / composition / handler。
- repository resolver。
- disabled Admin route。
- neutral mock webhook route。
- inbox migration skeleton local dry-run。

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

结果只命中既有入口：

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

### Disposable DB residuals

命令：

```bash
psql -h 127.0.0.1 -p 15432 -U "$USER" -d postgres -tAc "select datname from pg_database where datname like 'fuyi_payment_notification_route_dry_run_%' or datname like 'fuyi_payment_notification_inbox_dry_run_%'"
```

结果：空。

### Port residuals

命令：

```bash
ss -ltn '( sport = :9110 )' || true
```

结果：无监听进程。

## 安全结论

当前 local Postgres DB client contract 仍然是未接 route 的 skeleton：

- 不新增依赖。
- 不主动读取 `.env`。
- 不连接真实 DB。
- 不注册 migration。
- 不调用 payment workflow。
- 不改变 payment、order、refund、settlement、commission、payout 或 permission 状态。
- 生产环境 disabled。
- remote host 永远拒绝。
- event log metadata 使用白名单，避免 raw payload、signature、secret、token、authorization、password 或 database URL 落库。

## 下一步

建议继续：

```text
mock-webhook-db-backed-route-local-accepted-plan
```

先 docs-only 规划 route 如何注入 local adapter 和 accepted / duplicate smoke，再进入实现。

仍然禁止把 workflow execution、支付宝、微信支付、退款、对账、结算、佣金或权限混入下一轮。
