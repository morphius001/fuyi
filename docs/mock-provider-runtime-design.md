# Mock Provider Runtime Design

更新时间：2026-05-08 15:15 Asia/Shanghai

## 目标

设计 mock China PaymentProvider runtime wiring，为后续 disabled skeleton 和 local inbox-only runtime 做准备。

本轮只写设计，不写 runtime code。

## Runtime 入口边界

未来 runtime 应只接 neutral provider callback route：

```text
POST /china/payment-webhooks/mock
```

不得使用 `/admin/**` 作为 provider callback。

默认行为：

- disabled。
- production disabled。
- 未满足 gate 时不读取 body。
- 未满足 gate 时不连接 DB。
- 未满足 gate 时不调用 provider adapter。
- 未满足 gate 时不执行 payment workflow。

## 调用顺序

```text
Request
  -> runtime config parse
  -> provider registry resolve
  -> runtime gate evaluate
  -> only if allowed inbox-only/prepare-command:
      -> read raw body
      -> verify notification
      -> normalize envelope
      -> write inbox/event log
      -> state guard
      -> command mapper
      -> audit command decision
  -> never execute workflow in this phase
```

关键点：

- Runtime config 是第一道门。
- Registry 是第二道门。
- Runtime gate 是第三道门。
- DB/inbox 写入必须在 gate 之后。
- Workflow execution 必须留给更高风险 PR。

## Config 建议

未来只允许显式环境变量：

```text
CHINA_PAYMENT_NOTIFICATION_RUNTIME_ENABLED=true
CHINA_PAYMENT_NOTIFICATION_WEBHOOK_MODE=mock_inbox_only
CHINA_PAYMENT_NOTIFICATION_PROVIDER=mock_china_pay
CHINA_PAYMENT_PROVIDER_REGISTRY_MODE=mock_contract_only
NODE_ENV=development|test|preprod
```

仍不得读取：

- 支付宝真实 app id。
- 微信支付真实 mch id。
- private key。
- certificate。
- provider secret。
- full DB URL。

## Gate 条件

要进入 `mock_inbox_only`：

- runtime enabled。
- provider registry resolved。
- non-production environment。
- DB runtime enabled。
- migration registration verified。
- preprod disposable DB verified。
- provider adapter verified。

要进入 `mock_prepare_command`：

- 满足 `mock_inbox_only` 所有条件。
- state guard 和 command mapper 单测通过。
- command audit mapping 通过。
- workflow execution 仍 disabled。

## Inbox / Event Log

Runtime 只能写：

- `payment_notification_inbox`
- `payment_notification_event_log`

不得写：

- order state。
- payment collection state。
- payment session state。
- refund state。
- settlement / payout / commission。
- permission / RBAC。

## Failure Mapping

Runtime 应只输出受控错误：

- `RUNTIME_DISABLED`
- `PROVIDER_REGISTRY_BLOCKED`
- `RUNTIME_GATE_BLOCKED`
- `SIGNATURE_INVALID`
- `PAYLOAD_INVALID`
- `IDEMPOTENCY_DUPLICATE`
- `INBOX_WRITE_FAILED`
- `COMMAND_BLOCKED`

不得把 provider raw error、signature、raw payload、secret 或 DB URL 打到日志。

## Rollback

Runtime 设计必须支持：

- feature flag 关闭。
- registry disabled。
- runtime mode 回到 `disabled`。
- route 返回 disabled response。
- DB migration down 仍可由独立 dry-run 验证。

## 后续 PR 拆分

### PR 1: mock-provider-runtime-design

本文件。只写设计。

### PR 2: mock-provider-runtime-disabled-skeleton

新增 route/runtime disabled skeleton：

- production disabled。
- 默认 disabled。
- 不读 body。
- 不连 DB。
- 不调用 adapter。

### PR 3: mock-provider-runtime-local-inbox-only-plan

规划 local disposable DB inbox-only runtime。

### PR 4: mock-provider-runtime-local-inbox-only-skeleton

只允许 local disposable DB。

仍不得执行 workflow。

### PR 5: mock-provider-runtime-preprod-readiness

blocked-external，等待 disposable preprod DB。

## 当前结论

下一步可以做 `mock-provider-runtime-disabled-skeleton-plan`，继续 docs-only，先规划 disabled skeleton，仍不写 runtime code。
