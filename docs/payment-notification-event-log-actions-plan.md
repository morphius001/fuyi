# 支付通知 Event Log Action 扩展计划

## 目标

本文档规划 `payment_notification_event_log` action 白名单扩展。当前只做计划，不修改 migration，不连接数据库，不接 runtime。

## 当前 Action

当前 skeleton 支持：

- `received`
- `verified`
- `dedupe_hit`
- `handler_started`
- `processed`
- `retry_scheduled`
- `failed`

这些已经覆盖 inbox/repository 的最小审计路径，但不足以表达 command mapper 和未来 workflow execution。

## 建议新增 Action

| Action | 用途 | 当前阶段 |
| --- | --- | --- |
| `command_prepared` | guard allowed 后生成 command DTO | 后续 migration skeleton PR |
| `command_skipped` | duplicate / no_op，不执行 workflow | 后续 migration skeleton PR |
| `command_blocked` | guard blocked，写 audit-only decision | 后续 migration skeleton PR |
| `workflow_execution_started` | 未来开始调用 payment workflow | 高风险 runtime 前 |
| `workflow_execution_succeeded` | 未来 workflow 成功 | 高风险 runtime 前 |
| `workflow_execution_failed` | 未来 workflow 失败 | 高风险 runtime 前 |
| `manual_review_required` | 需要人工排查 | 后续 migration skeleton PR |

当前建议先只扩展 skeleton 和 dry-run，不实现 workflow execution。

## Metadata 规则

允许保存：

- provider
- event id
- idempotency key
- inbox id
- command type
- guard block type
- retryable
- error code
- sanitized reason

禁止保存：

- 真实密钥
- 证书
- 完整签名串
- 完整 raw payload
- 手机号明文
- 身份证、银行卡、卡密
- openid / unionid 明文，除非未来有明确脱敏策略

## Migration / Dry-run 拆分

后续 PR：

1. `payment-event-log-actions-migration-skeleton`
   - 修改未注册 `Migration20260507000200.ts` action check。
   - 不注册 migration。
   - 不接 runtime。

2. `payment-event-log-actions-dry-run`
   - 更新 local dry-run fixture。
   - 验证新增 action 可插入，未知 action 被拒绝。
   - 复查 disposable DB 无残留。

3. `payment-command-mapper-audit-tests`
   - 纯函数测试 command decision -> audit action。
   - 不写 DB。

4. `mock-payment-runtime-disabled-plan`
   - 默认 disabled，最多到 command DTO / audit action。
   - 不执行 workflow。

## 验收

当前文档任务：

- 只修改 docs、task 和 ledger。
- `git diff --check` 通过。
- 不修改 `apps/**` 或 `packages/**`。
- 明确不接 runtime，不调用 payment workflow。
