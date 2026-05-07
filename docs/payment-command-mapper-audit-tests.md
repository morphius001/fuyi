# 支付通知 Command Mapper Audit Tests

## 目标

本轮新增 `mapWorkflowCommandDecisionToAuditEvent()` 纯函数，把 payment workflow command decision 映射为 event log audit action。

这一步只让后续 handler 知道“应该写什么审计动作”，不会写数据库、不会执行 payment workflow、不会修改交易状态。

## 映射规则

| Decision | Audit action |
| --- | --- |
| 可执行 command，且不是 `no_op` | `command_prepared` |
| 可执行 `no_op` | `command_skipped` |
| 不可执行，普通阻断 | `command_blocked` |
| 不可执行，`manual_review` | `manual_review_required` |

## Metadata 边界

允许记录：

- command type
- block type
- retryable
- idempotency key
- inbox id
- payment session id
- order id
- sanitized reason
- guard / command audit metadata

禁止记录：

- raw provider payload
- 完整签名串
- 密钥、证书、商户私钥
- 手机号明文
- openid / unionid 明文
- 卡密、银行卡、身份证等敏感字段

## 验证

- 新增单元测试覆盖 `command_prepared`、`command_skipped`、`command_blocked` 和 `manual_review_required`。
- 本地 idempotency harness 覆盖该测试文件。
- API typecheck 通过。
- runtime grep 确认未注册到 API route、workflow、subscriber、job 或 link。
