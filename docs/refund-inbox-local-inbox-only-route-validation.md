# Refund Inbox Local Inbox-only Route Validation

更新时间：2026-05-10 Asia/Shanghai

## 结论

PR #350 `Refund inbox local inbox-only route` 合并后验证通过。当前 `/china/refund-inbox/mock` 支持 fake/local in-memory inbox-only，但仍默认 disabled，production / preprod / staging blocked，local DB route wiring 未启用。

accepted、duplicate、manual review 和 rejected response 都只代表本地 in-memory inbox 语义，不代表退款成功。当前仍不连接 DB、不注册 module / migration、不调用 provider refund API、不执行 payment / refund workflow、不写真实 refund success state。

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
Tests: 9 passed, 9 total
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
Tests: 289 passed, 289 total
Payment inbox DB dry-run row count: 2|9
Down SQL / drop cleanup: passed
```

Refund disposable DB dry-run：

```bash
.codex/scripts/refund-inbox-repository-disposable-db-dry-run.sh
```

结果：

```text
Refund inbox row count: 1|8
Down SQL / drop cleanup: passed
No residual database
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

结果：仅命中 focused route test 的负断言和 `must-not-be-read` fixture；未发现 route runtime 调用 provider refund request、workflow、checkout 或状态写入命令。

Diff check：

```bash
git diff --check
git status --short --branch
```

结果：通过，验证分支写报告前工作区干净。

## 当前边界

- Route 默认 disabled。
- `production` / `prod` / `preprod` / `staging` blocked。
- Local in-memory gate 必须显式开启。
- `CHINA_REFUND_INBOX_LOCAL_DB=true` 不会启用 DB route wiring。
- 所有 response 均保留 `runtimeMutationBlocked: true`。
- 不写真实 refund success state。
- 不联动 settlement、commission、payout、permission、fulfillment 或 logistics。

## 下一步

可以继续：

1. `refund-inbox-local-db-route-plan`
   - 只规划 local disposable DB-backed route wiring。
   - 仍不接真实 Provider 或 workflow。

2. `refund-inbox-repository-real-db-adapter-rehearsal-plan`
   - 只规划真实 DB adapter rehearsal。
   - 仍必须保持 local disposable DB 和 no-runtime-mutation gate。

仍然 No-Go：

- 真实支付宝 / 微信支付 refund notify route。
- provider refund request。
- payment / refund workflow execution。
- refund success state mutation。
- settlement / commission / payout adjustment。
- permission、fulfillment、logistics 状态写入。
- 连接预发或生产 DB。
