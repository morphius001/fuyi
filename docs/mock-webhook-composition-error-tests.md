# Mock Webhook Composition Error Tests

更新时间：2026-05-07 23:20 Asia/Shanghai

## 范围

本轮补齐 mock webhook composition helper 的 repository error mapping。

## 新增行为

- `DB_UNIQUE_CONFLICT` 映射为 duplicate response。
- `DB_LOCK_TIMEOUT`、`DB_CONNECTION_INTERRUPTED` 和未知 repository error 映射为 `INBOX_RETRYABLE`。
- terminal repository error 映射为 `INBOX_UNAVAILABLE`。
- audit append failure 会返回 retryable rejected response，保留 command DTO / audit event 供排查，但仍不执行 workflow。

## 新增测试

- response mapper 覆盖 `INBOX_RETRYABLE` 的 503 rejected response。
- composition helper 覆盖 receive unique conflict。
- composition helper 覆盖 receive retryable failure。
- composition helper 覆盖 appendEvent retryable failure。

## 验证结果

```text
Test Suites: 11 passed, 11 total
Tests:       69 passed, 69 total
CHECK row counts
2|9
```

API typecheck 通过。runtime grep 无匹配。disposable DB 残留复查为空。

## 边界

- 未新增 API route。
- 未注册 module 或 migration。
- 未连接数据库。
- 未执行 payment workflow。
- 未改变 checkout、order、payment、refund、settlement、commission、payout 或 permission 行为。

## 后续

下一步建议先做 `mock-webhook-composition-post-validation`，记录 #124 和本轮合并后的完整验证，再考虑未注册 handler skeleton 计划。
