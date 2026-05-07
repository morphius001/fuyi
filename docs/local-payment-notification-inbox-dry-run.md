# 本地支付通知 Inbox Dry-run 记录

## 目标

记录 `payment-notification-inbox-local-dry-run` 的本地 disposable DB 验证方式。本任务不新增真实 migration，不连接预发或生产数据库，不改变任何支付、订单、退款、结算、佣金或权限逻辑。

## 脚本

```bash
.codex/scripts/payment-notification-inbox-local-dry-run.sh
```

默认连接：

- Host: `127.0.0.1`
- Port: `15432`
- User: 当前 WSL 用户
- DB name: `fuyi_payment_notification_inbox_dry_run_<timestamp>`

脚本会在退出时自动 drop 临时库。

## 验证内容

- 创建 disposable dry-run database。
- 应用 inbox / event log up SQL。
- 验证 `payment_notification_inbox` 和 `payment_notification_event_log` 表存在。
- 插入 verified 和 invalid fixture。
- 验证 `(provider, idempotency_key)` 唯一约束拒绝重复通知。
- 验证 `currency = CNY` 约束。
- 验证 event log action 白名单。
- 验证 row counts。
- 执行 down SQL。
- 验证表已删除。
- 自动 drop 临时库。

## 本地验证结果

执行时间：2026-05-07 13:37 Asia/Shanghai

命令：

```bash
.codex/scripts/payment-notification-inbox-local-dry-run.sh
```

结果摘要：

```text
CREATE disposable dry-run database: fuyi_payment_notification_inbox_dry_run_20260507133751
APPLY inbox model up SQL
CHECK tables and fixtures
CHECK row counts
2|2
APPLY inbox model down SQL
CHECK rollback removed dry-run tables
PASS payment notification inbox local dry-run completed and disposable database will be dropped.
```

无残留复查：

```bash
psql -h 127.0.0.1 -p 15432 -U "$USER" -d postgres -tAc \
  "select datname from pg_database where datname like 'fuyi_payment_notification_inbox_dry_run_%'"
```

结果为空，表示临时库已删除。

## 安全边界

- 不注册生产 migration。
- 不写 `packages/api/src/**`。
- 不连接预发或生产数据库。
- 不保存真实 provider payload。
- 不写真实密钥、商户号、证书、app id 或 webhook token。
- 不修改 checkout、cart、order、payment、refund、settlement、commission 或 permission 行为。

## 后续

下一步若继续，只能进入单独 PR：

1. `payment-notification-inbox-migration-skeleton`
   - 把已验证 SQL 转为 migration skeleton。
   - 仍不注册生产 migration。

2. `payment-notification-inbox-repository`
   - 只读/写 repository interface 和本地测试。
   - 不接 webhook runtime。

3. `payment-notification-idempotency-test-harness`
   - fake signed payload 测试 duplicate、invalid signature、amount mismatch、unknown reference。

真实支付宝、微信支付、退款、对账、商家结算、佣金和权限继续保持高风险串行。
