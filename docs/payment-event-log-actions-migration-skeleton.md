# 支付通知 Event Log Action Migration Skeleton 更新

## 目标

本轮把上一轮规划的 event log action 白名单扩展落到未注册 migration skeleton 和本地 dry-run 脚本里。

本轮不是运行时接入，不注册 migration，不连接预发或生产数据库，不改变任何交易状态。

## 新增 Action

`payment_notification_event_log.action` skeleton 白名单新增：

- `command_prepared`
- `command_skipped`
- `command_blocked`
- `workflow_execution_started`
- `workflow_execution_succeeded`
- `workflow_execution_failed`
- `manual_review_required`

这些 action 只用于未来 handler / command adapter / workflow execution audit 的审计表达。当前仓库仍不会执行 payment workflow。

## Dry-run 覆盖

`.codex/scripts/payment-notification-inbox-local-dry-run.sh` 现在从未注册 migration skeleton 提取 SQL 后，会：

- 插入 verified 和 invalid inbox fixture。
- 插入既有 `received`、`verified` event log。
- 插入新增 command / workflow / manual review action fixture。
- 继续验证未知 action `state_mutated` 会被 check constraint 拒绝。
- 执行 down SQL 并自动删除 disposable DB。

## 安全边界

- 未修改 `packages/api/medusa-config.ts`。
- 未新增 API route、workflow、subscriber、job 或 link。
- 未接真实支付宝、微信支付或 Mock PaymentProvider runtime。
- 未修改 checkout、cart、order、payment、refund、settlement、commission 或 permission 逻辑。
- dry-run metadata 只保存 mock audit 字段，不保存真实 payload、密钥、证书、手机号明文或 openid/unionid 明文。

## 后续

下一步可以做 `payment-command-mapper-audit-tests`：把 command mapper decision 映射到 audit action 的纯函数测试补齐，仍不写 DB、不接 runtime。
