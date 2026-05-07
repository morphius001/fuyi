# 支付通知 Repository Disposable DB Test 计划

## 目标

规划 `DbPaymentNotificationInboxRepository` 的本地 disposable DB integration test。当前只写计划，不实现测试，不连接任何数据库。

## DB 命名和连接限制

测试库名必须以固定前缀开头：

```text
fuyi_payment_notification_repository_dry_run_<timestamp>
```

默认连接：

- host: `127.0.0.1`
- port: `15432`
- user: 当前 WSL 用户

非本地 host 必须拒绝，除非未来明确设置：

```text
CODEX_ALLOW_REMOTE_DRY_RUN=1
```

并且只能用于已批准的 disposable preprod DB。

## 测试流程

1. 检查 `psql` / `createdb` / `dropdb`。
2. 创建 disposable DB。
3. 从 `Migration20260507000200.ts` 提取 up SQL。
4. 应用 inbox / event log schema。
5. 运行 repository integration test。
6. 应用 down SQL。
7. drop disposable DB。
8. 查询 `pg_database` 确认无残留。

## Integration Test Cases

必须覆盖：

- verified notification 首次写入 inbox 和 event log。
- duplicate idempotency key 返回 duplicate，并写 `dedupe_hit`。
- invalid signature 写 terminal failed 和 `failed` event。
- retryable failure 更新 retry count 并写 `retry_scheduled`。
- terminal failure 写 `failed` event。
- unknown action 被 DB check constraint 拒绝。
- non-CNY 被 DB check constraint 拒绝。
- event log 和 inbox 在同一事务中失败回滚。

## 禁止保存的 Metadata

Integration test 必须断言 event log metadata 不包含：

- raw provider payload
- 完整签名串
- secret / private key / certificate
- 手机号明文
- openid / unionid 明文
- 身份证、银行卡、卡密

## 输出要求

测试脚本输出必须包含：

```text
CREATE disposable dry-run database
APPLY payment notification schema
RUN repository integration test
APPLY rollback
CHECK no residual disposable database
PASS
```

## 安全边界

- 不注册 production migration。
- 不连接预发或生产数据库。
- 不新增 webhook route。
- 不接 payment workflow。
- 不改变 checkout、cart、order、payment、refund、settlement、commission 或 permission。

## 后续 PR

1. `payment-inbox-repository-disposable-db-test-script`
   - 新增本地脚本。
   - 仍不写 route。
   - 脚本路径：`.codex/scripts/payment-inbox-repository-disposable-db-test.sh`。

2. `payment-inbox-repository-disposable-db-test`
   - 新增 integration test。
   - 只连接本地 disposable DB。

3. `mock-webhook-inbox-only-route-readiness`
   - route 前 readiness。
   - 不新增 route。
