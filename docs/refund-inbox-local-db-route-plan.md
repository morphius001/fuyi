# Refund Inbox Local DB Route Plan

更新时间：2026-05-10 Asia/Shanghai

## 结论

可以规划 `/china/refund-inbox/mock` 的 local disposable DB-backed inbox-only route，但下一步仍不能接真实退款 runtime。local DB route 的成功标准只是 fake refund notification 被写入本地 disposable DB 的 inbox / event log，并且 duplicate / digest conflict / rejected 场景保持安全响应。

它仍不能代表退款成功，不能调用 provider refund API，不能执行 payment / refund workflow，不能写 checkout、order、payment、refund、settlement、commission、payout、permission、fulfillment 或 logistics 状态。

## 当前基线

已存在：

- `/china/refund-inbox/mock` fake/local in-memory inbox-only route。
- `DbRefundInboxRepository` mocked DB adapter skeleton。
- `.codex/scripts/refund-inbox-repository-disposable-db-dry-run.sh`
- Refund verifier / normalizer / repository contract。
- Payment local postgres client / route-local DB guard pattern。

当前尚未启用：

- local DB route wiring。
- real DB adapter rehearsal。
- migration / module registration。
- provider refund API。
- workflow execution。

## Local DB Gate

未来 local DB route 必须同时满足：

```text
NODE_ENV=development
CHINA_REFUND_INBOX_ROUTE_ENABLED=true
CHINA_REFUND_INBOX_ROUTE_MODE=mock_local_db_inbox_only
CHINA_REFUND_INBOX_PROVIDER=mock_china_pay
CHINA_REFUND_INBOX_LOCAL_DB=true
CHINA_REFUND_INBOX_LOCAL_INMEMORY=false 或未设置
CHINA_REFUND_INBOX_LOCAL_DB_URL=<local disposable db url>
CHINA_REFUND_INBOX_LOCAL_DB_NAME=fuyi_refund_inbox_route_dry_run_<timestamp>
CHINA_REFUND_INBOX_MOCK_SECRET=<fake local secret>
```

必须拒绝：

- production / prod / preprod / staging。
- 非 `mock_china_pay` provider。
- 缺少 fake local secret。
- DB host 非 `localhost` / `127.0.0.1` / local socket。
- actual `current_database()` 与 env DB name 不一致。
- actual `inet_server_addr()` / port 与 env URL 不一致。
- DB name 不带 `fuyi_refund_inbox_route_dry_run_` disposable 前缀。
- `packages/api/medusa-config.ts` 已注册 `china-payment-notification`。
- staged files 包含 `apps/**`、`packages/api/medusa-config.ts`、package / lock / env。

Production blocked 分支必须在读取 body 或连接 DB 前返回。

## Route DB Wiring 范围

未来 implementation 只允许：

- 复用 payment route 的 local PG driver pattern，或抽一个 refund-only minimal local PG driver。
- 只从 local-only env 或测试 scope 读取 disposable DB connection，不能读取全局生产 DB URL。
- 将 query / transaction 包装成 `RefundInboxDbClient`。
- 使用 `DbRefundInboxRepository` 写 inbox / event log。
- 在 route response 中只返回安全 record 摘要。

禁止：

- 不注册 module。
- 不运行 migration。
- 不自动创建表。
- 不连接预发 / 生产。
- 不执行 workflow。
- 不调用 provider refund API。
- 不写 refund success state。
- 不联动 settlement / commission / payout。

## Schema 前置条件

local DB route implementation 前必须满足：

- 本地 disposable DB 已应用 inbox schema。
- refund event types 可写入 inbox。
- event log action allowlist 支持 refund actions，或 route PR 同步提供 local-only action mapping 验证。
- amount positive / CNY / idempotency unique / digest conflict 约束已通过 dry-run。
- metadata redaction 递归验证已通过。

如果 schema 仍只支持 payment 通用 action，local DB route implementation 不能写 refund-specific event log，必须先完成 local DB schema rehearsal / migration skeleton update plan。

## Response Contract

| 场景 | HTTP | Body |
| --- | --- | --- |
| disabled | 503 | `{"status":"disabled","runtimeMutationBlocked":true}` |
| production blocked | 503 | `{"status":"disabled","code":"PRODUCTION_BLOCKED","runtimeMutationBlocked":true}` |
| local DB missing / invalid | 503 | `{"status":"disabled","code":"LOCAL_DB_REQUIRED","runtimeMutationBlocked":true}` |
| accepted into local DB inbox | 202 | `{"status":"accepted","mode":"mock_local_inbox_only","storage":"local_disposable_db","runtimeMutationBlocked":true}` |
| duplicate same digest | 200 | `{"status":"duplicate","storage":"local_disposable_db","runtimeMutationBlocked":true}` |
| digest conflict | 409 | `{"status":"manual_review_required","code":"DIGEST_CONFLICT","runtimeMutationBlocked":true}` |
| rejected | 400 | `{"status":"rejected","code":"...","runtimeMutationBlocked":true}` |

Response 不得包含：

- raw body / raw payload
- signature / fake secret
- DB URL
- provider credential
- provider refund request
- workflow command
- refund state mutation command
- settlement / commission / payout adjustment
- full phone / identity / bank card / full address

## Test Matrix

未来 local DB route implementation 必须覆盖：

1. 默认 disabled，不读 body、不连接 DB。
2. production blocked，不读 body、不连接 DB。
3. local DB env missing，blocked。
4. DB host 非 local，blocked。
5. actual DB name mismatch，blocked。
6. actual DB port mismatch，blocked。
7. schema missing，blocked / rejected，不吞异常。
8. signed fake refund notification，accepted into local DB inbox。
9. duplicate same digest，duplicate no-op。
10. duplicate different digest，manual review required。
11. missing / invalid signature，rejected，不写 inbox。
12. non-CNY / zero amount，rejected。
13. response redaction。
14. runtime grep 不命中 provider refund request、workflow execution、refund state mutation、settlement / commission / payout adjustment。

## Verification

未来 implementation PR 必须跑：

```bash
cd packages/api
source "$HOME/.nvm/nvm.sh" && nvm use 24
bun run test:unit --runTestsByPath src/api/china/refund-inbox/mock/__tests__/route.unit.spec.ts
bunx tsc --noEmit -p tsconfig.json
cd ../..
.codex/scripts/payment-notification-idempotency-harness.sh
.codex/scripts/refund-inbox-repository-disposable-db-dry-run.sh
grep -RIn \
  -e execute_workflow \
  -e providerRefundRequest \
  -e refundStateMutation \
  -e settlement_adjusted \
  -e commission_adjusted \
  -e payout_adjusted \
  -e checkout \
  packages/api/src/api/china/refund-inbox || true
git diff --check
```

如果 typecheck / route type generation 修改 `packages/api/.mercur/index.d.ts`，除非任务明确要求 codegen，否则继续恢复，不提交。

## Rollback

如果 local DB route 出现异常：

- 设置 `CHINA_REFUND_INBOX_ROUTE_ENABLED=false`。
- 删除 local disposable DB。
- revert local DB route PR。
- 保持 in-memory route 可作为本地 fallback。
- 生产无数据回滚，因为该阶段不得连接生产或预发 DB。

## Go / No-Go

Go：

- 下一步可以做 `refund-inbox-local-db-route`，但必须先确保 schema allowlist 支持 refund event log。
- 只允许 local disposable DB。
- 只允许 fake provider / fake secret。
- 只允许 inbox / audit log writes。

No-Go：

- 真实支付宝 / 微信支付 refund notify route。
- provider refund request。
- payment / refund workflow execution。
- refund success state mutation。
- settlement / commission / payout adjustment。
- permission、fulfillment、logistics 状态写入。
- 连接预发或生产 DB。
