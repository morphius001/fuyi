# Mock Provider Runtime Disabled Skeleton

更新时间：2026-05-08 15:35 Asia/Shanghai

## 目标

新增 mock China PaymentProvider runtime disabled route skeleton。

当前 route 只返回 disabled，不接真实 runtime。

## 文件

- `packages/api/src/api/china/payment-providers/mock/route.ts`
- `packages/api/src/api/china/payment-providers/mock/__tests__/route.unit.spec.ts`
- `.codex/scripts/payment-notification-idempotency-harness.sh`

## 当前行为

`POST /china/payment-providers/mock` 默认返回 503：

```json
{
  "status": "disabled",
  "provider": "mock_china_pay",
  "runtime": "disabled",
  "reason": "Mock China payment provider runtime is disabled.",
  "runtimeRequested": false
}
```

Production 下返回：

```json
{
  "status": "disabled",
  "provider": "mock_china_pay",
  "runtime": "production_blocked"
}
```

## 安全边界

本轮没有：

- 读取 request body。
- 连接数据库。
- 调用 provider registry。
- 调用 runtime gate。
- 调用 provider adapter。
- 注册 Medusa payment provider。
- 执行 payment workflow。
- 改变 checkout、order、payment、refund、settlement、commission 或 permission 行为。

## 验证

```bash
.codex/scripts/payment-notification-idempotency-harness.sh
bunx tsc --noEmit -p packages/api/tsconfig.json
git diff --check
```

## 下一步

下一项建议为 `mock-provider-runtime-disabled-validation`：

- 合并后记录 harness/typecheck/runtime grep。
- 仍不进入 inbox-only。
