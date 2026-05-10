# Refund Inbox Local DB Route

更新时间：2026-05-10 Asia/Shanghai

## 结论

`/china/refund-inbox/mock` 现在支持 fake/local disposable DB-backed inbox-only 路径。它只在显式本地 gate 通过后读取 fake refund notification，把结果写入 shared local inbox / event log 表；默认仍 disabled，production / prod / preprod / staging 仍 blocked。

该 route 仍不是可用真实退款入口。`accepted`、`duplicate` 和 `manual_review_required` 只代表本地 inbox / audit 语义，不代表退款成功，也不会调用 provider refund API、workflow、refund state mutation、settlement、commission、payout、permission、fulfillment 或 logistics。

## Runtime Gate

local DB route 必须同时满足：

```text
NODE_ENV=development
CHINA_REFUND_INBOX_ROUTE_ENABLED=true
CHINA_REFUND_INBOX_ROUTE_MODE=mock_local_db_inbox_only
CHINA_REFUND_INBOX_PROVIDER=mock_china_pay
CHINA_REFUND_INBOX_LOCAL_DB=true
CHINA_REFUND_INBOX_LOCAL_INMEMORY=false 或未设置
CHINA_REFUND_INBOX_LOCAL_DB_URL=<local disposable db url>
CHINA_REFUND_INBOX_LOCAL_DB_NAME=fuyi_refund_inbox_route_dry_run_<suffix>
CHINA_REFUND_INBOX_MOCK_SECRET=<fake local secret>
```

route 在读取 body 前会拒绝：

- production / prod / preprod / staging。
- 缺少 local DB URL / DB name。
- actual `current_database()` 与 env DB name 不一致。
- actual server host 非 `127.0.0.1` / `::1` / `localhost` / local socket。
- actual server port 与 env URL port 不一致。
- DB name 不符合 refund disposable DB 前缀。
- local in-memory 和 local DB 同时开启。

## 实现范围

- 新增 `createLocalRefundInboxPostgresClient()`，复用本地 PG driver 形状，但只接受 refund disposable DB 前缀。
- local client 将 refund inbox row 写入 shared `payment_notification_inbox`，并映射 refund-only 状态到 DB-safe processing status。
- local client 将 `system_job` / `admin` / `vendor` audit actor 映射到当前 DB 允许的 `system` / `operator` / `provider`。
- local client 在 event metadata 写入前递归移除 raw payload、provider refund request、workflow command、state mutation、密钥、完整手机号 / 身份证 / 银行卡 / 地址等字段。
- route 复用 `DbRefundInboxRepository`，只写 inbox / audit log。
- response 只返回安全 record 摘要，不返回 raw body、signature、secret、DB URL 或 executable command。

注意：当前 shared inbox migration 仍是 payment-first skeleton。local DB client 的 state / actor 映射只是为了本地 disposable DB route rehearsal；进入预发 / 生产或真实退款 state owner 前，必须另做 refund schema migration / constraint PR，不能把本轮映射当作最终退款状态模型。

## 覆盖场景

Focused tests 覆盖：

- 默认 disabled 不读 body。
- local in-memory 既有 accepted / duplicate / digest conflict / rejected 场景。
- local DB env incomplete disabled，不读 body。
- actual DB host remote disabled，不读 body。
- actual DB name mismatch disabled，不读 body。
- actual DB port mismatch disabled，不读 body。
- signed fake refund notification accepted into local DB inbox。
- duplicate same digest 返回 duplicate。
- duplicate different digest 返回 manual review required。
- response redaction 不泄露 raw body、signature、fake secret 或 DB URL。
- local refund PG client 拒绝 unsafe DB / preprod env。
- local refund PG client 映射 DB-safe status / actor type，并递归 redacts metadata。

## 验证

已执行：

```bash
cd packages/api
source "$HOME/.nvm/nvm.sh" && nvm use 24
/home/codex/.bun/bin/bun run test:unit --runTestsByPath \
  src/api/china/refund-inbox/mock/__tests__/route.unit.spec.ts \
  src/modules/china-payment-notification/__tests__/local-postgres-db-client.unit.spec.ts
/home/codex/.bun/bin/bunx tsc --noEmit -p tsconfig.json
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
  packages/api/src/api/china/refund-inbox packages/api/src/modules/china-payment-notification/local-postgres-db-client.ts || true
git diff --check
```

结果：

- Focused route + local PG client tests：2 suites / 33 tests passed。
- API typecheck passed；生成的 `packages/api/.mercur/index.d.ts` 已按项目规则恢复，未纳入本轮。
- Payment notification harness：40 suites / 300 tests passed，payment DB dry-run row count `2|9`。
- Refund inbox repository disposable DB dry-run：row count `1|8`，down/drop cleanup 通过且无残留 DB。
- Runtime grep 只命中测试负断言和 local client redaction denylist，未发现可执行 provider refund request、workflow、state mutation 或 settlement / commission / payout 调整调用。
- `git diff --check` passed。

## Rollback

- 设置 `CHINA_REFUND_INBOX_ROUTE_ENABLED=false`。
- 删除本地 disposable DB。
- revert 本 PR。
- 保留 in-memory route 作为本地 fallback。
- 生产无数据回滚，因为该阶段仍不得连接生产或预发 DB。

## No-Go

仍禁止：

- 真实支付宝 / 微信支付 refund notify。
- provider refund request。
- payment / refund workflow execution。
- refund success state mutation。
- settlement / commission / payout adjustment。
- permission、fulfillment、logistics 状态写入。
- 预发或生产 DB 连接。
