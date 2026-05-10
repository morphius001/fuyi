# Refund Inbox Repository Real DB Adapter Rehearsal

更新时间：2026-05-10 Asia/Shanghai

## 结论

已新增本地 disposable PostgreSQL rehearsal 脚本：

```bash
.codex/scripts/refund-inbox-repository-real-db-adapter-rehearsal.sh
```

它验证 refund inbox repository / SQL adapter 相关的真实 SQL 语义，但只连接本地一次性 DB。它不连接预发或生产，不注册 migration / module，不新增 route，不调用 provider refund API，不执行 workflow，也不改变任何退款成功、结算、佣金、打款、权限、履约或物流状态。

## Disposable DB Guard

默认 DB 名：

```text
fuyi_refund_inbox_real_adapter_dry_run_<timestamp>
```

使用较短前缀是为了避开 PostgreSQL 63 字符 identifier 限制，避免 createdb/dropdb 和残留检查出现截断歧义。

脚本会拒绝：

- 非 `localhost` / `127.0.0.1` host。
- DB name 不符合 `fuyi_refund_inbox_real_adapter_dry_run_YYYYMMDDHHMMSS` 或 `fuyi_refund_inbox_real_adapter_dry_run_local_<safe_suffix>`。
- env hint 包含 production / prod / preprod / staging。
- `packages/api/medusa-config.ts` 已注册 `china-payment-notification`。
- staged files 包含 `apps/**`、`packages/**`、package / lock / env。
- 缺少 `psql`、`createdb`、`dropdb` 或 Node。
- PostgreSQL 未就绪。

## Rehearsal Coverage

脚本从未注册 shared inbox migration skeleton 提取 up / down SQL，在 disposable DB 内追加本地约束：

- positive amount check。
- refund event action allowlist。
- recursive metadata redaction check。

脚本验证：

- fake `refund.succeeded` inbox row 可写入。
- `refund_notification_received` event 可写入。
- DB-safe `processing_status='verified'` 可承载 route/repository 的 verified / normalized 映射。
- DB-safe `actor_type='system'` 可承载 `system_job` 映射。
- same digest duplicate 不创建第二条 inbox row。
- different digest duplicate 不覆盖原 digest，并写 digest conflict / manual review event。
- unmapped refund processing status `normalized` 会被 shared schema 拒绝。
- unmapped actor `system_job` 会被 shared schema 拒绝。
- forbidden actions 会被拒绝。
- metadata redaction constraint 会拒绝 provider refund request、workflow command、完整手机号等顶层或嵌套字段。
- failed subtransaction 不留下 partial event rows。
- down SQL 移除 rehearsal tables。
- disposable DB 被 drop，并复查无残留。

## 已执行验证

```bash
.codex/scripts/refund-inbox-repository-real-db-adapter-rehearsal.sh
CODEX_DRY_RUN_DB=unsafe_refund_rehearsal .codex/scripts/refund-inbox-repository-real-db-adapter-rehearsal.sh
NODE_ENV=production .codex/scripts/refund-inbox-repository-real-db-adapter-rehearsal.sh
cd packages/api
source "$HOME/.nvm/nvm.sh" && nvm use 24
/home/codex/.bun/bin/bun run test:unit --runTestsByPath \
  src/modules/china-payment-notification/__tests__/local-postgres-db-client.unit.spec.ts \
  src/modules/china-payment-notification/__tests__/refund-db-inbox-repository.unit.spec.ts
/home/codex/.bun/bin/bunx tsc --noEmit -p tsconfig.json
cd ../..
.codex/scripts/payment-notification-idempotency-harness.sh
.codex/scripts/refund-inbox-repository-disposable-db-dry-run.sh
git diff --check
```

结果：

- Real adapter rehearsal positive run：row count `1|8`，down/drop cleanup 通过且无残留 DB。
- Unsafe DB name guard：拒绝 `unsafe_refund_rehearsal`。
- Production env guard：`NODE_ENV=production` 被拒绝。
- Focused local client + refund repository tests：2 suites / 24 tests passed。
- API typecheck passed。
- Payment notification harness：40 suites / 301 tests passed，payment DB dry-run row count `2|9`。
- Existing refund inbox repository disposable DB dry-run：row count `1|8`，down/drop cleanup 通过且无残留 DB。
- `git diff --check` passed。

## Remaining Risk

当前 shared migration 仍是 payment-first skeleton。rehearsal 明确证明了 unmapped refund-only `processing_status` 和 `system_job` actor 会被拒绝；因此 `createLocalRefundInboxPostgresClient()` 的 state / actor mapping 仍只能作为 local disposable DB rehearsal 兼容层。真实 refund schema / constraint migration 必须单独规划和验证。

## No-Go

仍禁止：

- 预发 / 生产 DB。
- 真实支付宝 / 微信支付 refund notify。
- provider refund request。
- payment / refund workflow execution。
- refund success state mutation。
- settlement / commission / payout adjustment。
- permission、fulfillment、logistics 状态写入。
