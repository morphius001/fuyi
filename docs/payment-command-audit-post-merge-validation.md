# 支付通知 Command Audit 合并后验证

## 范围

本报告记录 PR #102-#104 合并后的验证结果：

- PR #102：event log action 白名单扩展计划。
- PR #103：未注册 migration skeleton 和 dry-run 覆盖新增 action。
- PR #104：command decision -> event log audit action 纯函数和单元测试。

## 验证结果

执行时间：2026-05-07 18:15 Asia/Shanghai

### Idempotency Harness

命令：

```bash
.codex/scripts/payment-notification-idempotency-harness.sh
```

结果：

```text
Test Suites: 5 passed, 5 total
Tests:       31 passed, 31 total
CHECK row counts
2|9
PASS payment notification inbox migration skeleton local dry-run completed and disposable database will be dropped.
PASS payment notification idempotency harness completed.
```

### API Typecheck

命令：

```bash
cd packages/api
bunx tsc --noEmit -p tsconfig.json
```

结果：通过，无输出错误。

### Runtime 未注册检查

命令：

```bash
git grep -n -e 'china-payment-notification' -- \
  packages/api/medusa-config.ts \
  packages/api/src/api \
  packages/api/src/workflows \
  packages/api/src/subscribers \
  packages/api/src/jobs \
  packages/api/src/links
```

结果：无匹配，说明仍未注册到 Medusa config、API route、workflow、subscriber、job 或 link。

### Disposable DB 无残留

命令：

```bash
psql -h 127.0.0.1 -p 15432 -U "$USER" -d postgres -tAc \
  "select datname from pg_database where datname like 'fuyi_payment_notification_inbox_dry_run_%'"
```

结果：为空，说明 dry-run 临时库已删除。

## 风险边界

- 当前 payment notification 模块仍是未注册 skeleton。
- 当前 command audit mapper 只返回 audit event DTO，不写 DB。
- 当前 event log action 只是 migration skeleton check constraint，不是生产 migration。
- 当前没有 webhook runtime、payment workflow 调用、真实支付宝/微信支付 Provider、退款、对账、结算、佣金或权限变更。

## 下一步

安全下一步可以继续做 docs-only runtime disabled plan，或者继续补纯函数级审计映射测试。

真正接 webhook runtime、注册 migration、调用 payment workflow、退款、对账和商家结算仍必须进入高风险串行任务。
