# 支付通知幂等 Harness

## 目标

`payment-notification-idempotency-harness` 用于把当前支付通知安全链路的本地验证串起来：

- Payment notification 全量单元测试。
- Inbox migration skeleton 本地 disposable DB dry-run。
- `medusa-config.ts` 未注册检查。
- staged 文件禁止范围检查。

它不接真实支付宝、微信支付、退款、对账或商家结算。

## 命令

```bash
.codex/scripts/payment-notification-idempotency-harness.sh
```

## 检查内容

1. `packages/api/medusa-config.ts` 不包含 `china-payment-notification`。
2. staged 文件不包含：
   - `apps/**`
   - `packages/api/medusa-config.ts`
   - `packages/api/package.json`
   - `bun.lock`
   - `.env`
3. 运行 payment notification 全量单元测试。
4. 运行 payment notification inbox migration skeleton dry-run。

## 本地验证结果

执行时间：2026-05-07 13:52 Asia/Shanghai

命令：

```bash
.codex/scripts/payment-notification-idempotency-harness.sh
```

结果摘要：

```text
CHECK payment notification module is not registered in medusa-config.ts
CHECK staged files do not include forbidden runtime/config scope
RUN mock payment notification unit tests
PASS src/modules/china-payment-notification/__tests__/mock-payment-notification.unit.spec.ts
RUN payment notification inbox migration skeleton dry-run
CREATE disposable dry-run database: fuyi_payment_notification_inbox_dry_run_20260507135217
CHECK row counts
2|2
PASS payment notification inbox migration skeleton local dry-run completed and disposable database will be dropped.
PASS payment notification idempotency harness completed.
```

临时库 `fuyi_payment_notification_inbox_dry_run_20260507135217` 已删除，并复查无残留。

2026-05-07 14:16 Asia/Shanghai 后，harness 改为运行完整支付通知单测集合：

- `mock-payment-notification.unit.spec.ts`
- `payment-notification-inbox-repository.unit.spec.ts`
- `payment-notification-state-guard.unit.spec.ts`

验证结果：

```text
RUN payment notification unit tests
PASS src/modules/china-payment-notification/__tests__/payment-notification-state-guard.unit.spec.ts
PASS src/modules/china-payment-notification/__tests__/mock-payment-notification.unit.spec.ts
PASS src/modules/china-payment-notification/__tests__/payment-notification-inbox-repository.unit.spec.ts
Tests: 21 passed, 21 total
CREATE disposable dry-run database: fuyi_payment_notification_inbox_dry_run_20260507141523
PASS payment notification inbox migration skeleton local dry-run completed and disposable database will be dropped.
PASS payment notification idempotency harness completed.
```

临时库 `fuyi_payment_notification_inbox_dry_run_20260507141523` 已删除，并复查无残留。

## 安全边界

- 不注册 Provider。
- 不注册 migration。
- 不连接预发或生产数据库。
- 不改变 checkout、cart、order、payment、refund、settlement、commission 或 permission。
- 不写真实密钥、商户号、证书、app id 或 webhook token。
