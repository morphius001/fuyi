# Refund Inbox Repository Disposable DB Dry-run

更新时间：2026-05-10 Asia/Shanghai

## 结论

已新增本地一次性 DB dry-run 脚本：

```bash
.codex/scripts/refund-inbox-repository-disposable-db-dry-run.sh
```

脚本只连接 `localhost` / `127.0.0.1` 的 disposable PostgreSQL DB，默认数据库名为：

```text
fuyi_refund_inbox_repository_dry_run_<timestamp>
```

脚本不连接预发或生产，不注册 migration / module，不新增 route，不调用 provider refund API，不执行 workflow，不改变 checkout、cart、order、payment、refund、settlement、commission、payout、permission、fulfillment 或 logistics runtime。

## 覆盖范围

脚本从未注册的 shared inbox migration skeleton 提取 up / down SQL，在 disposable DB 内应用，并额外添加 refund-only 本地验证约束：

- positive amount check
- refund event action allowlist
- metadata redaction check

这些 refund-only 约束只存在于 disposable DB 中，不修改真实 migration 文件。当前真实 migration skeleton 的 event log action 仍是 payment 通用动作；后续如果要把 refund actions 持久化到真实 migration，需要单独 PR 和 local dry-run 复验。

## 验证场景

脚本验证：

- `refund.succeeded` fake-only inbox row 可以记录 provider、event id、idempotency key、provider refund id、CNY、amount、digest 和 verified signature status。
- `provider + idempotency_key` 唯一约束生效。
- same digest duplicate 使用 `on conflict do nothing`，不会新增第二条 inbox row。
- different digest duplicate 不覆盖原始 digest，并写入 digest conflict / manual review audit event。
- 非 CNY 被拒绝。
- 0 amount 被拒绝。
- refund audit allowlist 允许：
  - `refund_notification_received`
  - `refund_notification_verified`
  - `refund_notification_normalized`
  - `refund_notification_duplicate_seen`
  - `refund_notification_digest_conflict`
  - `refund_guard_manual_review_required`
  - `refund_runtime_mutation_blocked`
  - `refund_settlement_blocked`
- forbidden actions 被拒绝：
  - `refund_state_mutated`
  - `refund_workflow_executed`
  - `provider_refund_request_sent`
  - `settlement_adjusted`
  - `commission_adjusted`
  - `payout_adjusted`
- metadata redaction constraint 会递归拒绝 raw provider payload、private key、workflow command、provider refund request 和完整手机号等顶层或嵌套字段。
- down SQL 移除 dry-run tables。
- disposable DB 被 drop，并复查无残留。

## Guard

脚本执行前会拒绝：

- DB host 不是 `localhost` 或 `127.0.0.1`
- DB name 不符合 `fuyi_refund_inbox_repository_dry_run_YYYYMMDDHHMMSS` 或 `fuyi_refund_inbox_repository_dry_run_local_<safe_suffix>`
- 环境变量大小写归一化后暗示 production / preprod / staging
- `packages/api/medusa-config.ts` 已出现 `china-payment-notification`
- staged files 包含 `apps/**`、`packages/**`、package / lock / env 等高风险路径
- 本地缺少 `psql`、`createdb`、`dropdb` 或 `node`
- PostgreSQL 未就绪

脚本输出不打印完整 DB URL、password、secret、token、raw payload、证书或完整手机号。

## 本轮非目标

- 不实现真实 DB adapter connection。
- 不注册 module / migration。
- 不新增 refund route。
- 不调用支付宝、微信支付或 mock provider refund API。
- 不执行 payment / refund workflow。
- 不写退款成功状态。
- 不联动结算、佣金、打款、权限、履约或物流。

## 下一步

可继续：

1. `refund-inbox-route-plan`：docs-only 规划 refund inbox route gate。
2. `refund-inbox-repository-real-db-adapter-rehearsal-plan`：规划真实 DB adapter rehearsal，但仍必须保持本地 disposable DB、未注册 module 和 no-runtime-mutation guard。

仍然 No-Go：

- 真实退款 runtime
- provider refund request
- settlement / commission / payout adjustment
- fulfillment / logistics state mutation
