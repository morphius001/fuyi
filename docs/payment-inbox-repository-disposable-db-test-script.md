# 支付通知 Repository Disposable DB Test Script

## 目标

新增本地 disposable DB 验证脚本：

```bash
.codex/scripts/payment-inbox-repository-disposable-db-test.sh
```

该脚本验证 repository 合同所需的 DB schema 行为，但不新增 webhook route，不注册 migration，不连接预发或生产数据库。

## 覆盖内容

- 固定 dry-run 数据库名前缀：`fuyi_payment_notification_repository_dry_run_`。
- 默认只连接 `127.0.0.1:15432`。
- 从未注册 migration skeleton 提取 up/down SQL。
- 创建 disposable DB。
- 应用 payment notification inbox/event log schema。
- 验证 verified notification fixture。
- 验证 duplicate idempotency key。
- 验证 invalid signature terminal failed。
- 验证 retryable failed 和 retry count。
- 验证 terminal failed。
- 验证 unknown action 和 non-CNY 被 check constraint 拒绝。
- 验证 event log 写入失败时 inbox fixture 回滚。
- 验证 metadata 不包含 raw payload、signature、secret、phone、openid、unionid 等敏感 key。
- 执行 down SQL。
- drop disposable DB。
- 复查无残留。

## 安全边界

- 不修改 `packages/**`。
- 不新增 API route。
- 不接 runtime。
- 不调用 payment workflow。
- 不接支付宝、微信支付、退款、对账、结算、佣金或权限。

## 本地验证结果

执行时间：2026-05-07 21:15 Asia/Shanghai

命令：

```bash
.codex/scripts/payment-inbox-repository-disposable-db-test.sh
```

结果摘要：

```text
CREATE disposable dry-run database: fuyi_payment_notification_repository_dry_run_20260507164714
APPLY payment notification schema
RUN repository integration test
CHECK repository row counts
3|6
APPLY rollback
CHECK rollback removed dry-run tables
DROP disposable dry-run database
CHECK no residual disposable database
PASS payment notification repository disposable DB test completed.
```

补充验证：

- `.codex/scripts/payment-notification-idempotency-harness.sh` 通过，payment notification 单测 46/46。
- `bunx tsc --noEmit -p packages/api/tsconfig.json` 通过。
- runtime grep 对 `medusa-config.ts`、API route、workflow、subscriber、job、link 无匹配。
- dry-run 数据库前缀残留复查为空。
