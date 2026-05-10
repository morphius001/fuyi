# Refund Inbox Local DB Route Validation

更新时间：2026-05-10 Asia/Shanghai

## 结论

PR #353 `[china] Refund inbox local DB route` 已合并到 `main`，merge commit 为 `6c2f946cb3b538e54d2d73d2048a75d9372e046e`。

合并后验证通过。当前 `/china/refund-inbox/mock` 仍只是 fake/local disposable DB-backed inbox-only rehearsal，不是可用真实退款入口。

## 验证结果

在最新 `origin/main` 基线分支 `china/pr-mo-refund-inbox-local-db-route-validation` 上已执行：

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
- API typecheck passed。
- Payment notification harness：40 suites / 301 tests passed。
- Payment DB dry-run row count：`2|9`。
- Refund inbox repository disposable DB dry-run row count：`1|8`，down/drop cleanup 通过且无残留 DB。
- Runtime grep 只命中 route test 负断言和 local client redaction denylist；未发现可执行 provider refund request、workflow、state mutation、settlement / commission / payout 调整或 checkout 调用。
- `git diff --check` passed。
- 验证命令结束后工作区无 runtime diff。

## 安全边界

仍保持：

- 默认 disabled。
- production / prod / preprod / staging blocked。
- local DB route 必须显式 `mock_local_db_inbox_only`、fake provider、fake secret、local DB true、in-memory false。
- actual DB name / host / port mismatch 会在读取 body 前 disabled。
- accepted / duplicate / manual review 只代表 inbox / audit 状态，不代表退款成功。

仍未启用：

- 真实支付宝 / 微信支付 refund notify。
- provider refund request。
- payment / refund workflow execution。
- refund success state mutation。
- settlement、commission、payout adjustment。
- permission、fulfillment、logistics 状态写入。
- 预发或生产 DB 连接。

## 剩余风险

`createLocalRefundInboxPostgresClient()` 的 refund state / actor 映射只是兼容当前 payment-first shared inbox skeleton 的 local disposable DB rehearsal。进入预发、生产或真实退款 state owner 前，必须另做 refund schema migration / constraint PR，不能把本轮映射当作最终退款状态模型。

## 下一步

可以进入 `refund-inbox-repository-real-db-adapter-rehearsal-plan`，但仍应先 docs-only 规划 real DB adapter rehearsal，继续禁止预发 / 生产 DB、真实 provider、workflow、refund success state、settlement、commission、payout、permission、fulfillment 和 logistics。
