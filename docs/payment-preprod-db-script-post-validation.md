# Payment Preprod DB Script Post Validation

更新时间：2026-05-08 13:35 Asia/Shanghai

## 范围

本验证覆盖：

- PR #171 `payment-preprod-db-script-plan`
- PR #172 `payment-preprod-db-script-skeleton`

目标是确认 disposable preprod DB 脚本目前仍停留在安全 skeleton 阶段。

## 合并后结果

- PR #171 已合并到 `main`：`327f54e`。
- PR #172 已合并到 `main`：`8a4028f`。
- 当前 `origin/main` 已包含 `.codex/scripts/payment-notification-preprod-disposable-db-smoke.sh`。
- 脚本当前只支持 `--print-plan` 和 `--validate-inputs-only`。

## 验证命令

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
  --commit-sha 8a4028fdc06249f88a711063f98151f993a4404f
.codex/scripts/payment-notification-preprod-disposable-db-smoke.sh --password secret
.codex/scripts/payment-notification-preprod-disposable-db-smoke.sh \
  --validate-inputs-only \
  --host postgres://db.example \
  --port 5432 \
  --database fuyi_payment_notification_preprod_disposable_demo \
  --user smoke_runner \
  --sslmode require \
  --confirm-disposable fuyi_payment_notification_preprod_disposable_demo \
  --commit-sha 8a4028fdc06249f88a711063f98151f993a4404f
git diff --check
git status --short --untracked-files=all
```

## 验证结论

- `--print-plan` 通过，输出 `externalExecution: "blocked"`。
- `--validate-inputs-only` 通过，host 被 mask 为 `***.internal`。
- `--password` 被拒绝。
- full connection string host `postgres://db.example` 被拒绝。
- `git diff --check` 通过。
- 当前任务文件范围未包含 `apps/**` 或 `packages/**`。

## 子 AG 复核

子 AG 复核结论：

- 未发现外部 DB 连接、SQL 执行、migration 注册或 payment workflow 调用。
- 未发现支付、订单、退款、结算、佣金、权限业务逻辑混入。
- 敏感参数拒绝符合预期。
- 唯一提醒是不要把旧的 `docs/visual-qa-artifacts/**` 未跟踪截图产物纳入 PR。

本轮提交已排除 `docs/visual-qa-artifacts/**`。

## 当前边界

下一项 `payment-notification-preprod-disposable-db-execution` 必须保持 `blocked-external`。

没有以下条件前不能继续：

- 用户明确提供 disposable preprod DB。
- 确认目标 DB 可删除、可回滚。
- 有备份/回滚 owner。
- 用户明确授权连接。
- 不需要真实支付 provider secret。
- 不需要执行 payment workflow。

## 非目标

- 不连接任何外部数据库。
- 不注册 production migration。
- 不接支付宝或微信支付。
- 不执行 payment workflow。
- 不改变 checkout、order、payment、refund、settlement、commission 或 permission 行为。
