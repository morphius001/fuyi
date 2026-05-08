# Payment Notification Runtime Gate Contract

更新时间：2026-05-08 12:55 Asia/Shanghai

## 本轮目标

本轮新增 `evaluatePaymentNotificationRuntimeGate()` 纯函数，用于未来 webhook route 在进入 DB runtime 或 workflow execution 前做统一 gate 判断。

它目前不接 route，不执行 workflow，不注册 migration，不连接任何数据库。

## 合同输入

```text
runtimeConfig
nodeEnv
dbRuntimeEnabled
workflowExecutionEnabled
migrationRegistered
preprodDisposableDbVerified
providerAdapterVerified
```

## 当前决策规则

Blocked：

- runtime config disabled。
- `nodeEnv = production`。
- DB runtime 未显式启用。
- migration registration 未验证。
- preprod disposable DB 未验证。
- provider adapter 未验证。

Allowed：

- `mock_inbox_only`：所有非 workflow gate 满足。
- `mock_prepare_command`：所有非 workflow gate 满足。

Workflow execution：

- 当前 runtime config 尚未开放 execute-workflow mode。
- 即使未来开放，也必须额外满足 `workflowExecutionEnabled=true`。

## 验证结果

已执行：

```bash
.codex/scripts/payment-notification-idempotency-harness.sh
cd packages/api && bunx tsc --noEmit -p tsconfig.json
git diff --check
```

结果：

- harness 已纳入 `payment-runtime-gate.unit.spec.ts`。
- payment notification harness 通过。
- API typecheck 通过。
- `git diff --check` 通过。

## 安全边界

未修改：

- route runtime。
- `packages/api/medusa-config.ts`。
- `apps/**`。
- payment/order/refund/settlement/commission/permission。

未执行：

- payment workflow。
- migration registration。
- preprod/production DB connection。
- Alipay / WeChat Pay provider。

## 下一步

下一步建议做 `payment-notification-db-runtime-preflight`，继续以本地或 preprod disposable DB 为边界验证 runtime prerequisites，不直接接 workflow。
