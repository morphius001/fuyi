# Refund Inbox Repository Disposable DB Dry-run Plan

更新时间：2026-05-10 Asia/Shanghai

## 任务目标

为退款 inbox repository 的本地 disposable DB dry-run 编写计划，验证未来脚本应该覆盖的 SQL 约束、幂等、digest 冲突、事件白名单、metadata 脱敏和回滚清理边界。

本任务只做文档和 ledger 更新，不写脚本、不连接数据库、不注册 migration、不新增 route、不接 provider refund API、不执行 workflow。

## 允许范围

- 新增 `docs/refund-inbox-repository-disposable-db-dry-run-plan.md`
- 更新 `.codex/queue.md`
- 更新 `project-ledger/changelog.md`
- 更新 `project-ledger/status.md`
- 更新 `project-ledger/handoff.md`
- 记录后续本地 disposable DB dry-run 的 Go / No-Go 和验证命令

## 禁止范围

- 不修改 `apps/**`
- 不修改 `packages/**`
- 不新增或注册真实 migration
- 不连接预发或生产数据库
- 不读取或输出真实数据库凭证、支付密钥、商户号、证书或 webhook token
- 不新增退款 route、provider refund API、workflow、subscriber、job 或 scheduler
- 不改变 checkout、cart、order、payment、refund、settlement、commission、payout、permission、fulfillment 或 logistics runtime
- 不把 `refund.succeeded`、inbox state、manual review decision 或 audit event 当成退款成功事实

## 计划必须覆盖

- 本地 disposable DB 命名和 host guard
- schema 来源：只能使用已存在未注册 migration skeleton 的 SQL 或 isolated dry-run SQL
- refund notification row 插入：`refund.succeeded`、`provider_refund_id`、CNY、positive amount
- event log action fixture：
  - `refund_notification_received`
  - `refund_notification_verified`
  - `refund_notification_normalized`
  - `refund_notification_duplicate_seen`
  - `refund_notification_digest_conflict`
  - `refund_guard_manual_review_required`
  - `refund_runtime_mutation_blocked`
  - `refund_settlement_blocked`
- 唯一约束：`provider + idempotency_key`
- duplicate same digest no-op
- same key different digest manual review / conflict
- 禁止动作 rejection：
  - `refund_state_mutated`
  - `refund_workflow_executed`
  - `provider_refund_request_sent`
  - `settlement_adjusted`
  - `commission_adjusted`
  - `payout_adjusted`
- metadata redaction fixture：不得保存 raw payload、private key、workflow command、provider refund request、完整手机号等敏感或可执行字段
- rollback / down SQL / drop disposable DB / no residual DB
- 脚本前 guard：禁止非本机 DB、禁止 production/preprod、禁止 staged 高风险文件、禁止 `medusa-config.ts` 注册

## 验证要求

- `git diff --check`
- `git diff --name-only`
- `git status --short --branch`
- `git ls-files --others --exclude-standard`
- 子智能体只读复核

## 完成输出

完成后说明：

- 修改文件
- 验证结果
- 风险点
- 下一步建议：`refund-inbox-repository-disposable-db-dry-run` 或 `refund-inbox-route-plan`
