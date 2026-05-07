# Mock Webhook Admin Route Deprecation Plan

更新时间：2026-05-07 19:45 Asia/Shanghai

## 目标

规划旧 Admin mock webhook route 的后续策略。

当前旧 route：

```text
packages/api/src/api/admin/china/mock-payment-webhooks/route.ts
```

当前 neutral route：

```text
packages/api/src/api/china/payment-webhooks/mock/route.ts
```

## 当前结论

Admin route 不能作为 provider callback。

原因：

- 它位于 `/admin/**` 命名空间。
- 真实支付宝/微信支付异步通知不应依赖 Admin session。
- 为 provider callback 放开 Admin auth 会扩大后台攻击面。
- neutral route 已经完成 disabled、local-only in-memory 和本地 smoke 验证。

## 可选策略

### 方案 A：保留为后台本地调试入口

保留当前 Admin route，但文档和响应明确：

- 仅本地调试。
- 不是 provider callback。
- 不用于 smoke script。
- 不连接 DB。
- 不执行 payment workflow。

优点：

- 不破坏已有本地调试入口。
- 低风险。

缺点：

- 容易和 neutral route 混淆。

### 方案 B：降级为 disabled-only

删除 Admin route 的 local in-memory 分支，只保留 disabled response。

优点：

- 明确切断 Admin route 的 runtime 能力。
- 避免后续误用。

缺点：

- 需要改 route 和测试。

### 方案 C：删除 Admin route

删除：

```text
packages/api/src/api/admin/china/mock-payment-webhooks/route.ts
packages/api/src/api/admin/china/mock-payment-webhooks/__tests__/route.unit.spec.ts
```

优点：

- 最清晰。

缺点：

- 删除 API route 仍是行为变化，需要确认没有本地脚本或文档依赖。

## 推荐

推荐先走方案 B：降级为 disabled-only。

理由：

- neutral route 已经承担 provider callback mock 验证。
- Admin route 保留 disabled response 可以作为误调用保护和迁移提示。
- 比直接删除更容易回滚。
- 不会连接 DB，不会执行 workflow。

## 后续 PR 拆分

1. `mock-webhook-admin-route-disabled-only`
   - 删除 Admin route local in-memory 分支。
   - Admin route 永远 disabled。
   - 测试覆盖默认、env requested、local env requested、production 都 disabled 且不读 body。

2. `mock-webhook-admin-route-deprecation-validation`
   - 记录 harness、runtime grep 和 DB 无残留。

3. `mock-webhook-db-backed-route-plan`
   - 再规划 neutral route DB-backed inbox，不碰 Admin route。

4. `mock-webhook-alipay-provider-plan`
   - 等 DB-backed inbox 和状态推进边界明确后再规划。

## 当前禁止

- 不删除 route。
- 不改 route。
- 不接 DB-backed repository。
- 不执行 payment workflow。
- 不接支付宝或微信支付。
- 不改退款、对账、商家结算、佣金或权限。

## 验证计划

本轮 docs-only：

```bash
git diff --check
git diff --name-only
```

后续 disabled-only PR：

```bash
.codex/scripts/payment-notification-idempotency-harness.sh
cd packages/api && bunx tsc --noEmit -p tsconfig.json
grep -R -n 'china-payment-notification' packages/api/medusa-config.ts packages/api/src/api packages/api/src/workflows packages/api/src/subscribers packages/api/src/jobs packages/api/src/links 2>/dev/null || true
psql -h 127.0.0.1 -p 15432 -U "$USER" -d postgres -tAc "select datname from pg_database where datname like 'fuyi_payment_notification_repository_dry_run_%' or datname like 'fuyi_payment_notification_inbox_dry_run_%'"
```

## 结论

Admin route 应降级为 disabled-only，neutral route 才是 mock provider callback 的唯一演进路径。

DB-backed inbox、支付宝、微信支付、退款、对账和商家结算仍然继续串行拆分。
