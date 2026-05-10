# Refund Inbox Disabled Route Validation

更新时间：2026-05-10 Asia/Shanghai

## 结论

PR #347 `Refund inbox disabled route skeleton` 合并后验证通过。当前 `/china/refund-inbox/mock` 仍是 disabled-only route：默认 disabled，production blocked，GET 405；不读取 request body，不连接 DB，不调用 verifier / normalizer / repository / provider refund API / workflow，不写 inbox / event log。

该 route 仍不能表达 refund inbox accepted、duplicate、manual review 或 refund success。退款、结算、佣金、打款、权限、履约和物流 runtime 继续阻断。

## 已验证

Focused route test：

```bash
cd packages/api
source "$HOME/.nvm/nvm.sh" && nvm use 24
bun run test:unit --runTestsByPath src/api/china/refund-inbox/mock/__tests__/route.unit.spec.ts
```

结果：

```text
Test Suites: 1 passed, 1 total
Tests: 4 passed, 4 total
```

API typecheck：

```bash
cd packages/api
source "$HOME/.nvm/nvm.sh" && nvm use 24
bunx tsc --noEmit -p tsconfig.json
```

结果：通过。

Payment notification harness：

```bash
.codex/scripts/payment-notification-idempotency-harness.sh
```

结果：

```text
Test Suites: 40 passed, 40 total
Tests: 284 passed, 284 total
DB dry-run row count: 2|9
Down SQL / drop cleanup: passed
```

Runtime grep：

```bash
grep -RIn \
  -e execute_workflow \
  -e providerRefundRequest \
  -e refundStateMutation \
  -e settlement_adjusted \
  -e commission_adjusted \
  -e payout_adjusted \
  -e checkout \
  packages/api/src/api/china/refund-inbox || true
```

结果：仅命中 focused route test 的负断言和 `must-not-be-read` fixture，未发现 route runtime 调用 provider refund request、workflow、checkout 或状态写入命令。

Diff check：

```bash
git diff --check
git status --short --branch
```

结果：通过，验证分支写报告前工作区干净。

## 风险和边界

- 当前 route 只是 disabled skeleton，不是可用退款通知入口。
- route 没有读取 request body，因此不能验签、归一化或写 inbox。
- route 没有 DB 连接，也没有 repository / workflow 调用。
- `china-payment-notification` module 仍未注册到 `medusa-config.ts`。
- `packages/api/.mercur/index.d.ts` 由 typecheck / generated route type 流程可能产生本地副作用；本轮已确认不提交该文件。

## 下一步

可以继续：

1. `refund-inbox-local-inbox-only-route-plan`
   - 只规划 fake/local inbox-only route gate。
   - 必须继续默认 production blocked。
   - 必须使用 local disposable DB 或 in-memory。

2. `refund-inbox-repository-real-db-adapter-rehearsal-plan`
   - 只规划真实 DB adapter rehearsal。
   - 仍不能接真实 refund runtime。

仍然 No-Go：

- 真实支付宝 / 微信支付 refund notify route。
- provider refund request。
- payment / refund workflow execution。
- refund success state mutation。
- settlement / commission / payout adjustment。
- permission、fulfillment、logistics 状态写入。
- 连接预发或生产 DB。
