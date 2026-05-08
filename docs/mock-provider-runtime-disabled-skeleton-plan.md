# Mock Provider Runtime Disabled Skeleton Plan

更新时间：2026-05-08 15:25 Asia/Shanghai

## 目标

规划 mock China PaymentProvider runtime disabled skeleton。

本轮只写计划，不写 runtime code。

## 未来文件范围

下一步实现 disabled skeleton 时，只允许小范围文件：

```text
packages/api/src/api/china/payment-providers/mock/route.ts
packages/api/src/api/china/payment-providers/mock/__tests__/route.unit.spec.ts
docs/mock-provider-runtime-disabled-skeleton.md
.codex/scripts/payment-notification-idempotency-harness.sh
```

不允许：

- `packages/api/medusa-config.ts`
- `apps/**`
- `packages/api/package.json`
- `bun.lock`
- `.env*`

## Disabled 行为

默认 response：

```json
{
  "status": "disabled",
  "provider": "mock_china_pay",
  "runtime": "disabled",
  "reason": "Mock China payment provider runtime is disabled."
}
```

要求：

- 不读取 request body。
- 不验证 signature。
- 不 normalize payload。
- 不连接 DB。
- 不调用 provider registry。
- 不调用 runtime gate。
- 不写 inbox。
- 不执行 payment workflow。

## Production 行为

Production 必须继续 disabled：

```json
{
  "status": "disabled",
  "provider": "mock_china_pay",
  "runtime": "production_blocked"
}
```

即使传入任何 mock env，也必须 blocked。

## 测试清单

单元测试应覆盖：

- 默认 disabled 返回 503 或 501。
- production blocked。
- disabled 时不读取 body。
- disabled 时不调用 provider registry。
- disabled 时不调用 runtime gate。
- disabled 时不写 inbox。
- disabled 时响应不包含 raw payload、signature、secret。
- route 不暴露 `execute_workflow`。

## Status Code 建议

- `503 Service Unavailable`: runtime disabled / not ready。
- `405 Method Not Allowed`: 非 POST。

不要返回 `200`，避免误认为支付 runtime 已经可用。

## 后续拆分

### PR 1: mock-provider-runtime-disabled-skeleton-plan

本文件。

### PR 2: mock-provider-runtime-disabled-skeleton

新增 disabled route skeleton 和单测。

仍不读 body、不接 DB、不调用 adapter、不执行 workflow。

### PR 3: mock-provider-runtime-disabled-validation

记录合并后 harness/typecheck/runtime grep。

### PR 4: mock-provider-runtime-local-inbox-only-plan

规划 local disposable DB inbox-only runtime。

## 当前结论

下一步可以做 `mock-provider-runtime-disabled-skeleton`，但只能实现 disabled route，不能进入 inbox-only。
