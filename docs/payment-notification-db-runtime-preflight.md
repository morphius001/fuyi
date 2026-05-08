# Payment Notification DB Runtime Preflight

更新时间：2026-05-08 13:00 Asia/Shanghai

## 目标

本文件规划 payment notification DB runtime gate 前的 preflight。它不是 runtime 实现，不注册 migration，不连接预发或生产数据库，不执行 payment workflow。

目标是把“可以进入 DB runtime rehearsal”的条件变成可检查清单。

## 当前基础

已经完成：

- inbox / event log migration skeleton。
- local disposable DB up/down dry-run。
- local DB adapter contract。
- neutral mock webhook accepted / duplicate / rejected smoke。
- runtime gate 纯函数 contract。

仍未完成：

- migration 注册。
- preprod disposable DB rehearsal。
- provider adapter 真实验签。
- workflow execution。

## Local DB Preflight

进入下一层前，本地必须持续通过：

```bash
.codex/scripts/payment-notification-idempotency-harness.sh
.codex/scripts/mock-webhook-db-backed-route-local-smoke.sh accepted
.codex/scripts/mock-webhook-db-backed-route-local-smoke.sh duplicate
.codex/scripts/mock-webhook-db-backed-route-local-smoke.sh rejected
cd packages/api && bunx tsc --noEmit -p tsconfig.json
```

必须确认：

- local DB host 只允许 `127.0.0.1` / `localhost`。
- disposable DB name 只允许 dry-run 前缀。
- 临时 API 固定 9110。
- accepted 写入 inbox + verified event。
- duplicate 不新增 inbox，并记录 dedupe。
- rejected 不写 inbox/event log。
- raw payload / signature / secret / DB URL 不进入响应和 event metadata。
- 结束后无 disposable DB 和 9110 残留。

## Preprod Disposable DB Preflight

只有在用户提供明确 disposable preprod DB 后才可执行。

Go 条件：

- DB 明确标记 disposable / 可删除。
- 有备份或快照。
- 有 rollback 负责人。
- 有连接窗口。
- 有执行日志路径。
- DB name / host 明确不能是 production。
- route/runtime 仍使用 mock provider。

No-Go：

- DB 可能是生产库。
- 没有回滚确认。
- 需要真实支付宝/微信支付凭据。
- 需要修改订单、支付、退款、结算、佣金或权限状态。
- 无法创建独立 schema / 临时库。

## Migration Registration Readiness

注册 migration 前必须满足：

- migration skeleton SQL 和 dry-run 提取 SQL 同源。
- up/down 都在 disposable DB 验证通过。
- unique constraint、check constraint、foreign key 和 indexes 均有验证。
- rollback 不删除未知表。
- event log action 白名单已覆盖当前 contract。
- migration 不依赖 app runtime 状态。

不允许在同一个 PR 中同时：

- 注册 migration。
- 接 route runtime。
- 执行 workflow。
- 接真实 provider。

## Transaction Checks

Preflight 必须覆盖：

- insert inbox + insert event log 同 transaction。
- event log insert failed 时 rollback inbox。
- duplicate replay 不创建第二条 inbox。
- DB connection failure 映射为 retryable。
- unique conflict 映射为 duplicate。
- metadata allowlist 生效。

## Observability Checks

最低审计字段：

- provider。
- provider event id。
- idempotency key。
- merchant order ref。
- payment session id。
- amount / currency。
- signature status。
- processing status。
- retry count。
- last error code。
- event log action。
- timestamps。

禁止字段：

- raw payload 明文。
- signature 明文。
- provider secret。
- DB URL。
- private key。

## 后续 PR 拆分

1. `payment-notification-db-runtime-preflight`
   - docs-only，本文件。
2. `payment-notification-preprod-disposable-db-checklist`
   - docs-only，准备外部 DB 执行清单。
3. `payment-notification-migration-registration-plan`
   - docs-only，规划 migration 注册 PR。
4. `payment-notification-runtime-gate-route-proposal`
   - docs-only，规划 route 如何读取 runtime gate。
5. `payment-notification-db-runtime-rehearsal`
   - 仅 disposable DB rehearsal，不执行 workflow。

真实支付宝、微信支付、退款、对账、商家结算、佣金、权限和 workflow execution 继续串行后置。

## 当前结论

可以继续准备 preprod disposable DB checklist，但不能自动注册 migration，不能接 route runtime，不能执行 workflow。
