# Mock Webhook DB-backed Route Resolver Contract

更新时间：2026-05-07 23:05 Asia/Shanghai

## 目标

新增 mock webhook repository resolver contract。

文件：

```text
packages/api/src/modules/china-payment-notification/mock-webhook-repository-resolver.ts
```

该 resolver 是纯 helper，不接 API route，不创建 DB connection，不调用 payment workflow。

## 行为

`resolveMockWebhookInboxRepository()` 输出三类结果：

- `disabled`：runtime、production、mode 或 local DB gate 不允许。
- `unavailable`：local DB gate 允许，但 transaction client 或 repository factory 未注入。
- `available`：仅 local disposable DB 输入完整时返回 repository contract。

## 安全边界

- 默认 disabled。
- production disabled。
- 非 `mock_china_pay` provider disabled。
- 非 `mock_inbox_only` mode disabled。
- local DB flag 缺失 disabled。
- transaction client 缺失 unavailable。
- repository factory 缺失 unavailable。
- 不读取 production database URL。
- 不 import Medusa container。
- 不 import production DB client。
- 不写 payment、order、refund、settlement、payout、commission 或 permission 表。
- 不调用 payment workflow。

## 测试覆盖

新增：

```text
packages/api/src/modules/china-payment-notification/__tests__/mock-webhook-repository-resolver.unit.spec.ts
```

覆盖：

- 默认 disabled。
- production disabled，且不调用 factory。
- real provider disabled，且不调用 factory。
- prepare-command mode disabled。
- local DB flag 缺失 disabled。
- transaction client 缺失 unavailable。
- repository factory 缺失 unavailable。
- local disposable input available。
- disabled response 不泄漏 database URL 或 secret。

## Harness

`.codex/scripts/payment-notification-idempotency-harness.sh` 已纳入 resolver 单测。

## 本轮不做

- 不修改 neutral route。
- 不接 DB-backed repository runtime。
- 不新增 local disposable DB route smoke。
- 不注册 migration。
- 不执行 payment workflow。
- 不接真实支付宝或微信支付。

## 后续

下一步建议：

```text
mock-webhook-db-backed-route-local-script-plan
```

先规划 local disposable DB smoke wrapper，再考虑 route skeleton。
