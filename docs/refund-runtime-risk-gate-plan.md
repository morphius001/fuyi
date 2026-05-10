# Refund Runtime Risk Gate Plan

更新时间：2026-05-10 Asia/Shanghai

## 结论

退款可以进入上线准备，但当前只能做风险门禁和合同规划，不能进入真实 runtime。

原因：

- 支付成功链路仍停留在 mock / fake notification、inbox-only rehearsal 和 disabled provider adapter 阶段。
- 当前仓库没有中国本地支付宝 / 微信支付真实 refund provider route。
- `ChinaPaymentNotificationEnvelope` 已预留 `refund.succeeded` / `refund.failed` 事件类型，但还没有退款命令、退款请求幂等、退款通知归一化、金额 invariant 或人工复核 runtime。
- 退款结果必须以后端 provider 异步通知 / 查询确认为准，不能以前端按钮、返回页或 Admin 操作成功页为准。

因此下一步只能按串行小 PR 推进 refund gate，不得与真实支付 provider、对账、结算、佣金、打款、履约或物流混在同一 PR。

## 当前状态

已有：

- `docs/payment-risk-register.md` 已登记 `REF-01` 和 `REF-02`。
- `packages/api/src/modules/china-payment-notification/types.ts` 已预留 `refund.succeeded` / `refund.failed`。
- payment notification inbox migration skeleton 已包含 `provider_refund_id` 字段和 refund event type。
- payment notification harness 已验证 inbox / event log 的本地 disposable DB dry-run。

未具备：

- refund command guard。
- refund request idempotency key。
- provider refund request adapter。
- refund notification verifier / normalizer。
- partial refund / repeated refund / over-refund amount invariant。
- refund manual review queue。
- refund audit event schema。
- order / payment / refund state transition owner。
- Admin / Vendor refund RBAC 和 seller ownership guard。
- reconciliation / settlement / commission 对退款的扣减 gate。

## Refund Gate 串行顺序

### 1. Refund Command Contract

只定义输入合同，不执行退款：

- order id / payment id / payment session id。
- requested amount minor units。
- currency must be CNY。
- refund reason code。
- actor type：Admin / Vendor / System job。
- actor id。
- seller / market ownership context。
- idempotency key seed。

禁止：

- 调 provider。
- 修改 order / payment / refund 状态。
- 写真实 DB。

### 2. Refund Amount Guard

纯函数校验：

- requested amount > 0。
- currency matches payment currency。
- requested amount + previous successful / pending refunds <= captured payment amount。
- repeated request with same idempotency key returns same decision。
- partial refund requires reason and audit note。
- unsupported payment state blocked。

禁止：

- 自动创建退款。
- 自动改订单状态。

### 3. Provider Refund Request Idempotency

只规划 / skeleton：

- provider refund request id。
- local refund request idempotency key。
- retry-safe request state。
- provider error code mapping。
- timeout / unknown state handling。
- no success until provider confirms.

禁止：

- 接真实支付宝 / 微信支付 refund API。
- 写真实 secret。

### 4. Refund Notification Inbox

退款通知必须沿用后端异步通知原则：

- signature verified before any state transition。
- idempotency key unique。
- event log append-only。
- duplicate-safe。
- retry-safe。
- raw payload digest only；日志不记录 raw secret。

禁止：

- 前端返回页决定退款成功。
- Admin 点击后直接标记 refunded。

### 5. Manual Review Gate

需要人工复核的情况：

- amount mismatch。
- duplicate but payload differs。
- provider unknown / processing。
- order ownership mismatch。
- seller ownership mismatch。
- over-refund attempt。
- reconciliation mismatch。

### 6. Settlement / Commission / Payout Block

退款 runtime 稳定前：

- 不生成 settlement batch。
- 不计算可打款金额。
- 不自动调整佣金。
- 不自动打款。

后续 settlement gate 必须读取 refund final state、dispute state 和 reconciliation passed 状态。

### 7. Permission And Audit Gate

每个退款写入口必须先有：

- Admin RBAC。
- Vendor role。
- seller ownership。
- market ownership。
- resource ownership。
- negative tests。
- audit event：actor、reason、before / after state、amount、currency、provider reference、request idempotency key。

## 后续 PR 拆分

推荐顺序：

1. `refund-command-contract-plan`：docs-only 定义退款命令合同和状态机。
2. `refund-amount-guard-contract`：纯函数 + tests，校验金额和状态，不写 DB。
3. `refund-request-idempotency-plan`：docs-only / skeleton，定义 provider request idempotency。
4. `refund-notification-contract-plan`：docs-only 定义退款通知 verifier / normalizer。
5. `refund-manual-review-audit-plan`：docs-only 定义人工复核和审计字段。
6. `refund-runtime-validation`：汇总以上 gate，仍不接真实 provider。

## Go / No-Go

Go to next planning PR:

- 只做 docs-only 或纯函数合同。
- 不接 provider。
- 不写真实退款状态。
- 不写真实 secret。
- 不连接外部 / 生产 DB。
- 不进入 settlement / commission / payout。

No-Go to real refund runtime:

- 支付成功链路未进入真实 provider sandbox。
- refund command guard 未完成。
- refund amount invariant 未完成。
- refund notification inbox 未完成。
- RBAC / seller ownership 未完成。
- audit schema 未完成。
- manual review queue 未完成。
- reconciliation / settlement 扣减 gate 未完成。

## 验证记录

本轮为 docs-only risk gate；验证：

- `git diff --check`。
- `git status --short`、`git diff --name-only` 和 `git ls-files --others --exclude-standard` 确认只改 task / docs / ledger / queue。
