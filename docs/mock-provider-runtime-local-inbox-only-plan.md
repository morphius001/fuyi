# Mock Provider Runtime Local Inbox Only Plan

更新时间：2026-05-08 15:55 Asia/Shanghai

## 目标

规划 mock provider runtime 的 local disposable DB inbox-only 阶段。

本轮只写计划，不写 runtime code。

## 适用范围

只允许本地 disposable DB：

```text
NODE_ENV=development|test
CHINA_PAYMENT_NOTIFICATION_RUNTIME_ENABLED=true
CHINA_PAYMENT_NOTIFICATION_WEBHOOK_MODE=mock_inbox_only
CHINA_PAYMENT_NOTIFICATION_PROVIDER=mock_china_pay
CHINA_PAYMENT_PROVIDER_REGISTRY_MODE=mock_contract_only
CHINA_PAYMENT_NOTIFICATION_LOCAL_DB=true
CHINA_PAYMENT_NOTIFICATION_LOCAL_DB_NAME=fuyi_payment_notification_route_dry_run_*
```

不得用于：

- production。
- shared preprod DB。
- 不可删除 DB。
- 真实支付宝 / 微信支付。
- 真实订单支付状态推进。

## Route 顺序

未来 local inbox-only route 应执行：

```text
POST /china/payment-providers/mock
  -> runtime config parse
  -> provider registry resolve
  -> runtime gate evaluate
  -> local disposable DB gate
  -> read raw body
  -> verify mock signature
  -> normalize envelope
  -> write inbox
  -> append received/verified/dedupe event log
  -> return accepted / duplicate / rejected
```

仍不得：

- state guard 改真实状态。
- command mapper 执行 workflow。
- 修改 order/payment/refund/settlement/commission/permission。

## Local DB Gate

必须全部满足：

- DB name 以 `fuyi_payment_notification_route_dry_run_` 开头。
- DB host 是 `127.0.0.1` 或 `localhost`。
- runtime route 只能使用 injected disposable DB client。
- 每次 smoke 后 drop DB 并复查无残留。
- 不读取 `.env` 中的生产 DB URL。

## Smoke 场景

下一阶段应扩展或复用 local smoke：

- disabled 默认返回 503。
- local inbox-only accepted 返回 202。
- duplicate 返回 200。
- missing signature 返回 400，且不写 inbox。
- invalid signature 返回 400，且不写 inbox。
- non-CNY 返回 400，且不写 inbox。
- production env 返回 disabled。
- cleanup 后 DB 无残留。

## 返回语义

Accepted：

```json
{
  "status": "accepted",
  "provider": "mock_china_pay",
  "runtime": "local_inbox_only"
}
```

Duplicate：

```json
{
  "status": "duplicate",
  "provider": "mock_china_pay"
}
```

Rejected：

```json
{
  "status": "rejected",
  "code": "SIGNATURE_INVALID"
}
```

不得返回：

- raw payload。
- signature。
- secret。
- full DB URL。
- workflow command。

## 后续 PR 拆分

### PR 1: mock-provider-runtime-local-inbox-only-plan

本文件。

### PR 2: mock-provider-runtime-local-inbox-only-skeleton

新增 local inbox-only skeleton。

要求：

- local-only。
- disposable DB-only。
- accepted/duplicate/rejected。
- 不执行 workflow。

### PR 3: mock-provider-runtime-local-inbox-only-smoke

新增 smoke wrapper。

要求：

- 创建 disposable DB。
- 执行 accepted/duplicate/rejected。
- drop DB。
- 复查无残留。

### PR 4: mock-provider-runtime-local-inbox-only-validation

记录合并后验证。

## 当前结论

下一步可以做 `mock-provider-runtime-local-inbox-only-skeleton`，但只能接 local disposable DB，仍不得进入 preprod/production 或 workflow execution。
