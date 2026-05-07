# Task: mock-webhook-admin-route-disabled-only

## 目标

将旧 Admin mock payment webhook route 降级为 disabled-only。

旧 route：

```text
packages/api/src/api/admin/china/mock-payment-webhooks/route.ts
```

该 route 只保留误调用保护和迁移提示，不再承担 provider callback、本地 in-memory smoke 或 runtime 调试入口。

## 背景

neutral route 已经作为 mock provider callback 的唯一演进路径：

```text
packages/api/src/api/china/payment-webhooks/mock/route.ts
```

Admin route 位于 `/admin/**` 命名空间，不适合作为真实支付宝、微信支付或任何 provider 异步通知入口。

## 允许修改

- `packages/api/src/api/admin/china/mock-payment-webhooks/route.ts`
- `packages/api/src/api/admin/china/mock-payment-webhooks/__tests__/route.unit.spec.ts`
- `.codex/tasks/mock-webhook-admin-route-disabled-only.md`
- `docs/mock-webhook-admin-route-disabled-only.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- 不修改 neutral route，除非测试证明存在回归。
- 不修改 `apps/**`。
- 不接支付宝、微信支付或真实支付 Provider。
- 不连接 DB-backed repository。
- 不注册 migration。
- 不调用 payment workflow。
- 不修改 order、refund、settlement、payout、commission 或 permission 逻辑。

## 实施要求

- 删除 Admin route 的 local in-memory 分支。
- 删除 Admin route 的 request body 读取。
- 删除 Admin route 的 signature/header 处理。
- 删除 Admin route 的 in-memory repository 构造。
- Admin route 在默认、runtime requested、local in-memory requested、production 下都返回 disabled。
- 响应里可保留 `runtimeRequested`，但不得泄漏 secret、signature、raw body 或 provider payload。

## 验证命令

```bash
.codex/scripts/payment-notification-idempotency-harness.sh
cd packages/api && bunx tsc --noEmit -p tsconfig.json
grep -R -n 'china-payment-notification' packages/api/medusa-config.ts packages/api/src/api packages/api/src/workflows packages/api/src/subscribers packages/api/src/jobs packages/api/src/links 2>/dev/null || true
psql -h 127.0.0.1 -p 15432 -U "$USER" -d postgres -tAc "select datname from pg_database where datname like 'fuyi_payment_notification_repository_dry_run_%' or datname like 'fuyi_payment_notification_inbox_dry_run_%'"
git diff --check
```

## 完成标准

- Admin route 单测确认所有环境都 disabled 且不读取 body。
- Harness 全量通过。
- API typecheck 通过。
- Runtime grep 不出现 medusa config、workflow、subscriber、job、link 注册。
- Disposable DB 无残留。
- 不自动 commit，不自动 push，除非用户当前指令明确授权。
