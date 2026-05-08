# Payment Notification Preprod Disposable DB Checklist

更新时间：2026-05-08 13:05 Asia/Shanghai

## 目标

本清单用于未来人工提供 disposable preprod DB 后，安全执行 payment notification DB preflight。

当前没有连接任何预发或生产数据库，没有写入真实密钥，没有执行 migration registration，也没有执行 payment workflow。

## Go 条件

执行前必须全部满足：

- 目标 DB 明确是 disposable preprod DB。
- 目标 DB 不是 production。
- 目标 DB 可随时删除或恢复。
- 已有快照 / 备份 / 回滚方案。
- 用户明确授权连接该 DB。
- DB owner / rollback owner 已确认。
- 执行窗口已确认。
- 网络连接方式已确认。
- 使用 mock provider。
- 不使用支付宝、微信支付真实凭据。
- 不推进订单、支付、退款、结算、佣金或权限状态。

## No-Go 条件

任一命中则停止：

- DB 名称或连接信息看起来像 production。
- 不能确认 disposable。
- 没有备份 / 快照 / rollback owner。
- 需要真实支付商户号、私钥、app secret 或 webhook secret。
- 需要在同一轮注册 production migration。
- 需要执行 payment workflow。
- 需要修改 `packages/api/medusa-config.ts`。
- 需要修改订单、退款、对账、结算、佣金或权限逻辑。

## 变量模板

只允许使用占位值，不在仓库写真实值：

```bash
export PREPROD_PAYMENT_DB_HOST="<preprod-disposable-host>"
export PREPROD_PAYMENT_DB_PORT="<port>"
export PREPROD_PAYMENT_DB_USER="<user>"
export PREPROD_PAYMENT_DB_NAME="<disposable-db-name>"
export PREPROD_PAYMENT_DB_SSLMODE="<require|disable>"
export CHINA_PAYMENT_NOTIFICATION_PROVIDER="mock_china_pay"
export CHINA_PAYMENT_NOTIFICATION_WEBHOOK_MODE="mock_inbox_only"
```

禁止写入：

- password。
- private key。
- app secret。
- real merchant id。
- real webhook token。

## 执行前检查

1. 确认本地 main 已包含最新合并：
   - runtime gate plan。
   - runtime gate contract。
   - DB runtime preflight plan。
2. 确认本地验证仍通过：

```bash
.codex/scripts/payment-notification-idempotency-harness.sh
.codex/scripts/mock-webhook-db-backed-route-local-smoke.sh accepted
.codex/scripts/mock-webhook-db-backed-route-local-smoke.sh duplicate
.codex/scripts/mock-webhook-db-backed-route-local-smoke.sh rejected
```

3. 确认无本地 dry-run DB 残留：

```bash
psql -h 127.0.0.1 -p 15432 -U "$USER" -d postgres -tAc "select datname from pg_database where datname like 'fuyi_payment_notification_route_dry_run_%' or datname like 'fuyi_payment_notification_inbox_dry_run_%'"
```

4. 确认没有 9110 残留监听：

```bash
ss -ltnp | grep ':9110' || true
```

## 执行中检查

未来执行脚本必须输出：

- target host masked。
- target database name。
- migration up result。
- insert / duplicate / rejected result。
- event log action counts。
- leak checks。
- rollback / cleanup result。

不得输出：

- password。
- raw payload。
- signature。
- private key。
- DB URL 完整明文。

## 执行后检查

必须记录：

- executed_at。
- operator。
- target DB name。
- commit sha。
- migration hash。
- accepted result。
- duplicate result。
- rejected result。
- cleanup result。
- rollback readiness。

必须确认：

- disposable DB 已删除，或保留原因被记录。
- 没有写入真实 payment/order/refund/settlement/commission/permission 状态。
- 没有真实 provider callback。

## 失败处理

如果失败：

1. 停止继续执行。
2. 保留日志。
3. 不重试真实 provider。
4. 不切换到 production DB。
5. 不手工修改 payment/order 状态。
6. 记录失败点和 DB cleanup 状态。
7. 需要时从快照恢复 disposable DB。

## 后续 PR

建议顺序：

1. `payment-notification-preprod-disposable-db-checklist`
   - docs-only，本文件。
2. `payment-notification-preprod-disposable-db-script-plan`
   - docs-only，规划脚本输入和输出。
3. `payment-notification-preprod-disposable-db-script`
   - 只实现脚本，不执行外部 DB。
4. `payment-notification-preprod-disposable-db-execution`
   - blocked-external，等待用户明确授权和 DB。

## 当前结论

没有外部 disposable preprod DB 前，自动队列不能执行 preprod DB。可以继续准备脚本计划，但不能连接数据库。
