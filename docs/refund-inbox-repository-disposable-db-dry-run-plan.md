# Refund Inbox Repository Disposable DB Dry-run Plan

更新时间：2026-05-10 Asia/Shanghai

## 结论

可以继续做退款 inbox repository 的本地 disposable DB dry-run，但下一步仍只能是本机一次性数据库验证。它不是预发验证，不注册 migration，不接 route，不调用 provider refund API，不执行 workflow，也不改变 checkout、order、payment、refund、settlement、commission、payout、permission、fulfillment 或 logistics runtime。

dry-run 的目标是验证 repository 未来依赖的存储语义：唯一约束、幂等重放、digest 冲突、审计事件白名单、敏感 metadata 脱敏和回滚清理。它不能证明退款成功，也不能作为上线真实退款 runtime 的 Go 条件。

## 当前输入

- `RefundInboxRepositoryContract` 已定义 receive、append event、mark state 和查询方法边界。
- `DbRefundInboxRepository` 已作为 mocked DB adapter skeleton 存在，只依赖外部注入的 transaction / mock DB client。
- 现有 payment notification inbox migration skeleton 已包含 payment / refund event 类型、`provider_refund_id` 和 event log action 约束扩展。
- `china-payment-notification` module 仍未注册到 `packages/api/medusa-config.ts`。
- 最近验证基线为 focused refund DB adapter tests、API typecheck、payment notification harness 和 runtime grep；当前仍没有真实 refund route、provider API、workflow 或状态写入。

## Disposable DB 范围

后续 dry-run 脚本只能创建本地一次性数据库，例如：

```text
fuyi_refund_inbox_repository_dry_run_<timestamp>
```

允许：

- 仅连接 `localhost` 或 `127.0.0.1` 的 PostgreSQL。
- 使用临时数据库名，且必须带 `fuyi_refund_inbox_repository_dry_run_` 前缀。
- 应用已存在的未注册 migration skeleton SQL，或独立 dry-run SQL。
- 插入固定 fake-only refund notification fixtures。
- 在脚本退出时执行 rollback / down SQL，并 drop disposable DB。

禁止：

- 连接预发、生产、共享测试或任何非 disposable DB。
- 使用真实 provider payload、真实密钥、真实商户号、真实证书或真实 webhook token。
- 修改或注册 `packages/api/medusa-config.ts`。
- 修改 checkout、order、payment、refund、settlement、commission、payout、permission、fulfillment 或 logistics 状态。
- 启动真实退款 route、provider refund request、workflow、subscriber、job 或 scheduler。

## Schema 验证目标

dry-run 应至少验证以下字段和约束语义：

- refund notification inbox row 可以保存：
  - provider
  - event type: `refund.succeeded`
  - notification id
  - idempotency key
  - digest
  - provider refund id
  - merchant order reference
  - payment session id
  - amount minor units
  - currency `CNY`
  - non-executable metadata
- `provider + idempotency_key` 必须唯一。
- amount 必须为正数。
- currency 必须拒绝非 `CNY`。
- `provider_refund_id` 可被记录用于后续排查，但不能作为退款成功事实。
- event log action 必须只允许不可执行审计动作。

## Event Log Fixtures

dry-run 应插入并验证以下允许动作：

- `refund_notification_received`
- `refund_notification_verified`
- `refund_notification_normalized`
- `refund_notification_duplicate_seen`
- `refund_notification_digest_conflict`
- `refund_guard_manual_review_required`
- `refund_runtime_mutation_blocked`
- `refund_settlement_blocked`

dry-run 必须验证以下动作被拒绝：

- `refund_state_mutated`
- `refund_workflow_executed`
- `provider_refund_request_sent`
- `settlement_adjusted`
- `commission_adjusted`
- `payout_adjusted`

这些禁止动作即使出现在测试 fixture 中，也只能作为负断言，不能进入持久化事件日志。

## Idempotency 和 Digest 冲突

dry-run 应覆盖三类输入：

1. 首次收到 refund notification。
   - 插入 inbox row。
   - 写入 received / verified / normalized 等 audit event。
   - 输出只表示 inbox accepted，不表示 refund succeeded。

2. 同一 provider + idempotency key + same digest 重放。
   - 不新增第二条 inbox row。
   - 可以写 `refund_notification_duplicate_seen` audit event。
   - 结果必须为 no-op / duplicate replay。

3. 同一 provider + idempotency key + different digest。
   - 不覆盖原始 digest。
   - 写 `refund_notification_digest_conflict`。
   - 进入 manual review / conflict 语义。
   - 必须保持 runtime mutation blocked。

## Metadata 脱敏

dry-run fixture 必须包含会被拒绝或脱敏的字段，用来验证 SQL / repository 前置规则没有把可执行或敏感信息写入审计 metadata：

- raw payload
- private key
- APIv3 key
- certificate
- webhook token
- workflow command
- provider refund request
- refund state mutation
- settlement adjustment
- commission adjustment
- payout adjustment
- full phone number

允许保留的 metadata 应是不可执行、可排查、最小化的信息，例如 provider、event type、digest prefix、reason code、block code、fixture id。

## Script Guard

后续脚本建议命名：

```text
.codex/scripts/refund-inbox-repository-disposable-db-dry-run.sh
```

脚本在执行前必须检查：

- `psql` 可用。
- 目标 DB host 是 `localhost` 或 `127.0.0.1`。
- 目标 DB 名以 `fuyi_refund_inbox_repository_dry_run_` 开头。
- 环境变量未指向 production / preprod / staging。
- `packages/api/medusa-config.ts` 没有注册 `china-payment-notification` module。
- staged files 不包含：
  - `apps/**`
  - `packages/api/medusa-config.ts`
  - `package.json`
  - lockfile
  - `.env*`
  - provider secret templates 以外的密钥材料
- 输出日志不能打印完整 DB URL、password、secret、token、raw payload、完整手机号或证书内容。

脚本必须使用 `trap` 清理临时 DB，并在成功和失败路径都复查没有残留 disposable DB。

## Repository Rehearsal 分层

本 dry-run 阶段只验证本地 DB schema / SQL 语义。当前 `DbRefundInboxRepository` 仍是 mocked DB adapter skeleton，不应在这个阶段升级成真实连接器。

建议拆分：

1. `refund-inbox-repository-disposable-db-dry-run`
   - 创建脚本。
   - 使用 local disposable DB 验证 SQL / constraint / rollback。
   - 不接真实 repository runtime。

2. `refund-inbox-repository-real-db-adapter-rehearsal-plan`
   - 未来单独规划真实 DB adapter rehearsal。
   - 仍需本地 disposable DB、显式 config gate、未注册 module 和 no-runtime-mutation guard。

## Go / No-Go

Go：

- 编写本地 disposable DB dry-run 脚本。
- 使用 fake-only refund notification fixtures。
- 验证 unique、CNY、positive amount、digest conflict、event allowlist、metadata redaction 和 rollback。
- 验证没有 DB 残留。

No-Go：

- 连接预发或生产数据库。
- 注册 migration 或 module。
- 新增真实 refund route。
- 调用支付宝 / 微信支付 / mock provider 的真实 refund request。
- 执行 payment / refund workflow。
- 写 checkout、order、payment、refund、settlement、commission、payout、permission、fulfillment 或 logistics 状态。
- 把 `refund.succeeded`、inbox accepted、manual review resolved 或 audit-only processed 当成退款成功。

## 验证记录

本计划任务为 docs-only，验证要求：

```bash
git diff --check
git diff --name-only
git status --short --branch
git ls-files --others --exclude-standard
```

提交前还需要子智能体只读复核，重点确认：

- diff 是否只包含文档、任务和 ledger。
- 是否覆盖 local disposable DB guard、幂等、duplicate replay、digest conflict、event allowlist、redaction 和 rollback。
- 是否明确不连接 preprod / production。
- 是否明确不注册 migration / route / provider / workflow。
- 是否明确阻断 refund state mutation、settlement、commission、payout、permission、fulfillment 和 logistics。
