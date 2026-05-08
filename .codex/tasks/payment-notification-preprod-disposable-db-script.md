# Task: payment-notification-preprod-disposable-db-script

## 目标

新增 disposable preprod DB smoke 脚本 skeleton，先固化参数、安全门禁和输出格式。

本任务不执行外部数据库，不连接预发或生产 DB，不注册 migration，不执行 payment workflow。

## 允许修改

- `.codex/tasks/payment-notification-preprod-disposable-db-script.md`
- `.codex/scripts/payment-notification-preprod-disposable-db-smoke.sh`
- `docs/payment-notification-preprod-disposable-db-script.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- 不修改 `apps/**`。
- 不修改 `packages/**`。
- 不修改 `packages/api/medusa-config.ts`。
- 不新增依赖。
- 不连接外部数据库。
- 不写真实 DB password、provider secret、signature 或 raw payload。
- 不注册 migration。
- 不调用 payment workflow。
- 不改变 checkout、order、payment、refund、settlement、commission 或 permission 行为。

## 脚本要求

- 默认只输出计划或做输入校验。
- 必须拒绝 production-like database name。
- 必须拒绝 full connection string。
- 必须要求 `--confirm-disposable` 等于 `--database`。
- 必须拒绝 password CLI 参数。
- 输出不得包含 password、secret、signature、raw payload 或完整 DB URL。
- 外部 DB 执行能力必须保持 blocked，留给单独任务。

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
  --commit-sha "$(git rev-parse HEAD)"
git diff --check
```

## 完成标准

- 脚本存在且可执行。
- 脚本默认不连接外部 DB。
- 安全参数校验可本地运行。
- queue 和 ledger 更新。
