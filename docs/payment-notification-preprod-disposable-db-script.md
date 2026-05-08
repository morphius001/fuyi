# Payment Notification Preprod Disposable DB Script

更新时间：2026-05-08 13:25 Asia/Shanghai

## 目标

新增 `.codex/scripts/payment-notification-preprod-disposable-db-smoke.sh` skeleton，先固定未来外部 disposable preprod DB smoke 的安全入口。

本轮脚本只支持：

- `--print-plan`
- `--validate-inputs-only`

它不会连接任何外部数据库，不会执行 SQL，不会注册 migration，不会调用 payment workflow。

## 当前行为

查看计划：

```bash
.codex/scripts/payment-notification-preprod-disposable-db-smoke.sh --print-plan
```

校验输入：

```bash
.codex/scripts/payment-notification-preprod-disposable-db-smoke.sh \
  --validate-inputs-only \
  --host preprod-db.example.internal \
  --port 5432 \
  --database fuyi_payment_notification_preprod_disposable_demo \
  --user smoke_runner \
  --sslmode require \
  --confirm-disposable fuyi_payment_notification_preprod_disposable_demo \
  --commit-sha "$(git rev-parse HEAD)"
```

校验通过时输出 JSON，但只展示 masked host，不展示完整 DB URL。

## 安全门禁

脚本当前已经拒绝：

- production-like database name。
- 不以 `fuyi_payment_notification_preprod_disposable_` 开头的 database name。
- `--confirm-disposable` 和 `--database` 不一致。
- full connection string。
- password CLI 参数。
- provider secret、signature、raw payload 参数。
- `--commit-sha` 和当前 HEAD 不一致。

## 仍然阻塞

以下能力仍未实现，必须拆到单独任务：

- 连接外部 disposable preprod DB。
- 执行 migration up/down。
- 写入 inbox / event log。
- duplicate replay。
- rejected path。
- cleanup / rollback。
- 生成正式执行报告。

这些能力需要用户明确提供 disposable preprod DB，并完成 Go/No-Go 后才能执行。

## 非目标

- 不接支付宝或微信支付。
- 不读取真实 provider secret。
- 不写真实 payment/order/refund/settlement/commission/permission 状态。
- 不执行 payment workflow。
- 不注册 production migration。

## 验证

本轮验证脚本 skeleton 本身：

```bash
.codex/scripts/payment-notification-preprod-disposable-db-smoke.sh --print-plan
.codex/scripts/payment-notification-preprod-disposable-db-smoke.sh \
  --validate-inputs-only \
  --host preprod-db.example.internal \
  --port 5432 \
  --database fuyi_payment_notification_preprod_disposable_demo \
  --user smoke_runner \
  --sslmode require \
  --confirm-disposable fuyi_payment_notification_preprod_disposable_demo \
  --commit-sha "$(git rev-parse HEAD)"
git diff --check
```

## 下一步

下一项应标记为 `blocked-external`：`payment-notification-preprod-disposable-db-execution`。

没有 disposable preprod DB、备份/回滚 owner 和明确授权前，不能继续执行外部 DB smoke。
