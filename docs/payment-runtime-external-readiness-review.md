# Payment Runtime External Readiness Review

更新时间：2026-05-10 Asia/Shanghai

## 结论

当前 payment runtime 仍然处于 `blocked-external`。不能连接外部 DB、不能执行 preprod smoke、不能注册 migration、不能接真实支付宝 / 微信支付 provider、不能执行 payment workflow。

可以继续做：

- 本地 mock / dry-run 验证。
- `--print-plan`。
- `--validate-inputs-only`。
- docs-only readiness review。
- provider sandbox contract 设计。

不能继续做：

- 外部 DB `--preflight`。
- 外部 DB `--smoke`。
- production migration registration。
- 真实 provider callback。
- checkout/order/payment 状态推进。

## 当前脚本状态

脚本：

```text
.codex/scripts/payment-notification-preprod-disposable-db-smoke.sh
```

当前只支持：

- `--print-plan`
- `--validate-inputs-only`

它明确声明不会连接任何外部数据库，外部执行必须等待单独任务授权 disposable preprod DB。

已内置拒绝：

- production-like database name。
- 不以 `fuyi_payment_notification_preprod_disposable_` 开头的 database name。
- `--confirm-disposable` 与 `--database` 不一致。
- full connection string。
- password CLI 参数。
- provider secret。
- signature。
- raw payload。
- `--commit-sha` 与当前 HEAD 不一致。

## 仍缺外部条件

进入真实 preprod disposable DB smoke 前必须由用户明确提供：

- disposable preprod DB host。
- disposable preprod DB port。
- disposable preprod DB user。
- disposable preprod DB name。
- sslmode。
- 备份 owner。
- 回滚 owner。
- 操作 owner。
- 明确连接授权。
- 明确该 DB 可丢弃或可回滚。
- 执行窗口。
- 日志保存位置。

当前未提供上述条件，因此自动队列不能继续执行外部连接。

## Go / No-Go

### Go

仅当全部满足才可进入下一步：

- DB 名称符合 disposable 前缀。
- DB 明确不是 production / prod / main / primary / live / master。
- 用户明确授权连接。
- 有备份或快照。
- 有 rollback owner。
- 使用 mock provider。
- 不需要真实支付宝 / 微信支付凭据。
- 不执行 payment workflow。
- 不修改订单、支付、退款、结算、佣金或权限状态。

### No-Go

任一命中则停止：

- 目标库可能是 production。
- 无法确认 disposable。
- 需要 password CLI 参数或完整 DB URL。
- 需要真实 provider secret。
- 需要注册 production migration。
- 需要修改 `packages/api/medusa-config.ts`。
- 需要执行 payment workflow。
- 需要修改 order/payment/refund/settlement/commission/permission 状态。

## 本轮执行的安全验证

命令：

```bash
.codex/scripts/payment-notification-preprod-disposable-db-smoke.sh --print-plan
git diff --check
```

预期：

- `--print-plan` 只输出计划 JSON。
- `externalExecution` 为 `blocked`。
- 不连接 DB。
- 不输出 secret。
- `git diff --check` 无输出。

## 下一步

推荐继续：

1. `alipay-provider-sandbox-contract`
   - docs-only 或 contract-only。
   - 不接 checkout，不接 real provider。

2. `wechat-pay-provider-sandbox-contract`
   - docs-only 或 contract-only。
   - 不接 checkout，不接 real provider。

3. `provider-secret-config-template`
   - 只写 env key 名，不写值。

4. `payment-notification-preprod-disposable-db-execution`
   - 状态必须保持 `blocked-external`，直到用户提供 DB 授权。

## 回滚

本 PR 为 docs-only。回滚会移除此 readiness review，不影响脚本、runtime、checkout、订单、支付、退款、结算、佣金或权限状态。

