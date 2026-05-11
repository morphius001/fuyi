# Refund Provider Inbox Route Disposable DB Validation

更新时间：2026-05-12 Asia/Shanghai

## 结论

PR #386 已合并到 `main`。

```text
PR: #386
Title: [china] Refund provider inbox route disposable DB
Merge commit: 2386086b19fd6ff541d551018d041f12c84a76d7
```

合并后验证通过。当前 provider refund inbox route 仍只支持 development/local/disposable DB/fixture-only inbox rehearsal；未通过 config / DB gate 前不读取 body。它仍不是可用退款 runtime。

## 文件范围

`git diff-tree --no-commit-id --name-status -r 2386086b19fd6ff541d551018d041f12c84a76d7` 确认 PR #386 文件范围为：

```text
M .codex/queue.md
A .codex/tasks/refund-provider-inbox-route-disposable-db.md
A docs/refund-provider-inbox-route-disposable-db.md
M packages/api/src/api/china/refund-inbox/alipay/__tests__/route.unit.spec.ts
M packages/api/src/api/china/refund-inbox/alipay/route.ts
A packages/api/src/api/china/refund-inbox/provider-local-db.ts
M packages/api/src/api/china/refund-inbox/wechat-pay/__tests__/route.unit.spec.ts
M packages/api/src/api/china/refund-inbox/wechat-pay/route.ts
M packages/api/src/modules/china-payment-notification/__tests__/local-postgres-db-client.unit.spec.ts
M packages/api/src/modules/china-payment-notification/__tests__/refund-provider-inbox-route-config.unit.spec.ts
M packages/api/src/modules/china-payment-notification/local-postgres-db-client.ts
M packages/api/src/modules/china-payment-notification/refund-provider-inbox-route-config.ts
M project-ledger/changelog.md
M project-ledger/handoff.md
M project-ledger/status.md
```

没有 `apps/**` 改动，没有 `medusa-config.ts` module registration，没有真实 SDK / secret / provider request / provider query / workflow / refund success state owner 改动。

## 验证命令

已在合并后的 `origin/main` 分支基线运行：

```bash
cd packages/api
source "$HOME/.nvm/nvm.sh" && nvm use 24
/home/codex/.bun/bin/bun run test:unit --runTestsByPath \
  src/api/china/refund-inbox/wechat-pay/__tests__/route.unit.spec.ts \
  src/api/china/refund-inbox/alipay/__tests__/route.unit.spec.ts \
  src/modules/china-payment-notification/__tests__/refund-provider-inbox-route-config.unit.spec.ts \
  src/modules/china-payment-notification/__tests__/refund-provider-inbox-response.unit.spec.ts \
  src/modules/china-payment-notification/__tests__/refund-provider-inbox-local-repository.unit.spec.ts \
  src/modules/china-payment-notification/__tests__/refund-provider-inbox-route-normalizer.unit.spec.ts \
  src/modules/china-payment-notification/__tests__/local-postgres-db-client.unit.spec.ts \
  src/modules/china-payment-notification/__tests__/refund-db-inbox-repository.unit.spec.ts
```

结果：

```text
8 test suites passed
60 tests passed
```

此前 PR #386 合并前验证也已通过：

```text
API typecheck passed
payment notification harness passed: 42 suites / 323 tests, DB dry-run 2|9
refund real-adapter rehearsal passed: 1|9, no residual database
runtime grep only matched negative assertions and response denylist
git diff --check passed
subagent readonly review: No Findings
```

## 安全边界

仍 No-Go：

- 生产、预发、staging 或普通共享 DB 连接。
- 真实支付宝 / 微信支付 SDK。
- 真实密钥、证书、公钥、webhook token 或生产 merchant id。
- provider refund request。
- provider refund query API。
- workflow execution。
- refund success state mutation。
- settlement、commission、payout adjustment。
- permission weakening。
- fulfillment / logistics mutation。

`accepted`、`duplicate`、`manual_review`、`processed_for_audit_only`、`query_required` 仍只代表 inbox / audit 结果，不代表平台退款成功。

## 下一步

下一步可以进入 `refund-state-owner-handoff-plan`，先 docs-only 规划平台退款状态 owner、workflow command handoff、manual review gate 和 reconciliation boundary。不要直接从 provider inbox route 写退款成功状态。
