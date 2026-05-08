# Mock Webhook DB-backed Route Runtime Gate Plan

更新时间：2026-05-08 12:50 Asia/Shanghai

## 背景

Neutral mock webhook route 目前已经完成 local-only disposable DB inbox smoke：

- `accepted`：写入 inbox，并记录 `verified`。
- `duplicate`：同一 idempotency key 返回 duplicate，并记录 `dedupe_hit`。
- `rejected`：missing signature、invalid signature、non-CNY payload 返回 400，不写 inbox/event log。

这证明 route、adapter、repository 和 migration skeleton 在本地 disposable DB 下可以形成最小闭环。

但它仍不是生产支付 runtime。

## Runtime Gate 目标

未来 runtime gate 的目标不是马上执行 payment workflow，而是先建立可审计的开关边界：

1. local smoke gate。
2. registered migration gate。
3. preprod disposable DB gate。
4. preprod mock provider gate。
5. production provider adapter gate。
6. workflow execution gate。

每一层必须能单独打开、单独验证、单独回滚。

## 当前已满足

- mock provider only。
- local disposable DB only。
- accepted / duplicate / rejected smoke。
- raw payload、signature、secret、DB URL 响应泄漏检查。
- event metadata allowlist。
- DB host/name local safety gate。
- production disabled。
- no workflow execution。
- no migration registration。

## 进入下一层前置条件

### 1. Migration Registration Gate

Go 条件：

- migration skeleton 已经通过本地 disposable DB up/down。
- migration SQL 和 dry-run 脚本同源。
- down SQL 已验证。
- preprod disposable DB 可用，并有备份与回滚确认。

No-Go：

- 只能连接本地 DB。
- 没有 preprod disposable DB。
- migration 仍需手工改 SQL 才能跑通。

### 2. Repository Runtime Gate

Go 条件：

- DB-backed repository 支持同一 transaction 内写 inbox/event log。
- duplicate、retryable、terminal failed 的错误映射明确。
- event metadata 不泄漏敏感字段。
- connection client 由 Medusa container 注入，不自己创建生产连接。

No-Go：

- 需要 hardcode DB URL。
- 需要真实 provider secret。
- 无法证明 repository rollback。

### 3. Mock Provider Preprod Gate

Go 条件：

- preprod mock secret 是临时测试 secret。
- provider mode 明确是 `mock_china_pay`。
- route 响应仍不泄漏 raw payload/signature/secret。
- operator 能从 inbox/event log 查到完整 audit trail。

No-Go：

- 使用支付宝/微信支付真实回调。
- 需要修改订单或 payment session 状态。

### 4. Workflow Execution Gate

这是高风险串行门，不能和 route smoke 混在一起。

Go 条件：

- state guard 已验证 payment session、provider、金额、币种、订单终态。
- command mapper 输出稳定 command DTO。
- workflow adapter 明确幂等 key 和 audit action。
- 前端 return URL 仍不作为支付成功依据。
- retry / manual review / failure path 有单独测试。

No-Go：

- state guard 缺失。
- duplicate 还会执行 workflow。
- amount mismatch 仍可能推进支付状态。
- 没有人工审查 / retry 记录。

## Feature Flags

建议未来拆分为多层 env：

```text
CHINA_PAYMENT_NOTIFICATION_RUNTIME_ENABLED=false
CHINA_PAYMENT_NOTIFICATION_WEBHOOK_MODE=disabled|mock_inbox_only|mock_prepare_command|mock_execute_workflow
CHINA_PAYMENT_NOTIFICATION_PROVIDER=mock_china_pay|alipay|wechat_pay
CHINA_PAYMENT_NOTIFICATION_DB_RUNTIME=false
CHINA_PAYMENT_NOTIFICATION_WORKFLOW_EXECUTION=false
```

原则：

- production 默认全部 false / disabled。
- `mock_execute_workflow` 必须显式打开 workflow execution gate。
- provider 不是 `mock_china_pay` 时，必须走真实 provider adapter 的验签合同。
- 任何 gate 不满足都返回 disabled 或 rejected，不进入 workflow。

## 回滚策略

1. 关闭 `CHINA_PAYMENT_NOTIFICATION_RUNTIME_ENABLED`。
2. 关闭 `CHINA_PAYMENT_NOTIFICATION_DB_RUNTIME`。
3. 关闭 `CHINA_PAYMENT_NOTIFICATION_WORKFLOW_EXECUTION`。
4. 保留 inbox/event log 只读查询，用于排查。
5. 不删除历史 event log。
6. 如 migration 未进入生产，不注册即可回滚。
7. 如 migration 已注册，必须用单独 DB migration rollback 任务处理，不在 route PR 中处理。

## 观测与审计

最低要求：

- inbox id。
- provider。
- provider event id。
- idempotency key。
- merchant order reference。
- payment session id。
- amount / currency。
- signature status。
- processing status。
- retry count。
- last error code。
- event log action。
- created / received / processed timestamps。

禁止：

- raw payload 明文。
- provider secret。
- signature 明文。
- DB URL。
- private key。
- 用户手机号完整明文，除非未来合规任务定义脱敏规则。

## PR 拆分建议

1. `mock-webhook-db-backed-route-runtime-gate-plan`
   - docs-only，本文件。
2. `payment-notification-runtime-gate-contract`
   - 纯函数 gate contract，默认 disabled。
3. `payment-notification-db-runtime-preflight`
   - 本地/preprod disposable DB preflight，不注册生产 migration。
4. `payment-notification-migration-registration-plan`
   - docs-only，规划 migration 注册前置条件。
5. `mock-provider-preprod-inbox-only`
   - 仅 preprod mock provider inbox-only。
6. `workflow-execution-gate-plan`
   - docs-only，规划 workflow execution。

支付宝、微信支付、退款、对账、商家结算、佣金和权限继续单独串行。

## 当前结论

现在可以继续做 runtime gate 的纯 contract，但不能直接执行 workflow，不能注册生产 migration，不能接真实支付宝或微信支付。
