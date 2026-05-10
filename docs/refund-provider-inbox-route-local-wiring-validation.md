# Refund Provider Inbox Route Local Wiring Validation

更新时间：2026-05-10 Asia/Shanghai

## 结论

PR #383 `[china] Refund provider inbox route local wiring` 已合并到 `main`，merge commit `825ef3f2ee8986af0a09f068119db166137a7d4e`。

合并后验证通过。Provider refund inbox route 现在仅在 development/local/in-memory/fixture-only gate 通过后读取 body、调用 verifier contract、写 local in-memory inbox；未通过 gate 时不读取 body。当前仍不连接 DB、不注册 module、不接 SDK、不写真实密钥、不调用 provider refund API、不调用 refund query API、不执行 workflow、不写 refund success state。

## 文件范围

```text
M .codex/queue.md
A .codex/tasks/refund-provider-inbox-route-local-wiring.md
A docs/refund-provider-inbox-route-local-wiring.md
M packages/api/src/api/china/refund-inbox/alipay/__tests__/route.unit.spec.ts
M packages/api/src/api/china/refund-inbox/alipay/route.ts
M packages/api/src/api/china/refund-inbox/wechat-pay/__tests__/route.unit.spec.ts
M packages/api/src/api/china/refund-inbox/wechat-pay/route.ts
A packages/api/src/modules/china-payment-notification/__tests__/refund-provider-inbox-local-repository.unit.spec.ts
A packages/api/src/modules/china-payment-notification/__tests__/refund-provider-inbox-route-normalizer.unit.spec.ts
M packages/api/src/modules/china-payment-notification/index.ts
A packages/api/src/modules/china-payment-notification/refund-provider-inbox-local-repository.ts
A packages/api/src/modules/china-payment-notification/refund-provider-inbox-route-normalizer.ts
M project-ledger/changelog.md
M project-ledger/handoff.md
M project-ledger/status.md
```

统计：15 files changed, 1548 insertions(+), 43 deletions(-)。

## 验证结果

已执行：

```bash
git diff-tree --no-commit-id --name-status -r 825ef3f
git show --stat --oneline --no-renames 825ef3f
cd packages/api
source "$HOME/.nvm/nvm.sh" && nvm use 24
/home/codex/.bun/bin/bun run test:unit --runTestsByPath \
  src/api/china/refund-inbox/wechat-pay/__tests__/route.unit.spec.ts \
  src/api/china/refund-inbox/alipay/__tests__/route.unit.spec.ts \
  src/modules/china-payment-notification/__tests__/refund-provider-inbox-route-config.unit.spec.ts \
  src/modules/china-payment-notification/__tests__/refund-provider-inbox-response.unit.spec.ts \
  src/modules/china-payment-notification/__tests__/refund-provider-inbox-local-repository.unit.spec.ts \
  src/modules/china-payment-notification/__tests__/refund-provider-inbox-route-normalizer.unit.spec.ts
/home/codex/.bun/bin/bunx tsc --noEmit -p tsconfig.json
cd ../..
.codex/scripts/payment-notification-idempotency-harness.sh
grep -RIn \
  -e providerRefundRequest \
  -e refundQuery \
  -e execute_workflow \
  -e refundStateMutation \
  -e settlement_adjusted \
  -e commission_adjusted \
  -e payout_adjusted \
  -e fulfillment \
  -e logistics \
  packages/api/src/api/china/refund-inbox/wechat-pay \
  packages/api/src/api/china/refund-inbox/alipay \
  packages/api/src/modules/china-payment-notification/refund-provider-inbox-*.ts || true
git diff --check
```

结果：

- Focused tests：6 suites / 29 tests passed。
- API typecheck passed。
- Payment notification harness：42 suites / 322 tests passed。
- Payment DB dry-run row count：`2|9`。
- Runtime grep 只命中测试负断言和 response redaction denylist。
- `git diff --check` passed。
- `packages/api/.mercur/index.d.ts` 由 typecheck 刷新后已恢复，未纳入本轮。

## Safety Boundary

仍保持：

- 未通过 local gate 不读取 body。
- 只写 local in-memory repository。
- 不连接 DB。
- 不注册 module。
- 不接 SDK。
- 不写真实密钥、证书、公钥、webhook token 或 DB URL。
- 不调用 provider refund API。
- 不调用 refund query API。
- 不执行 workflow。
- 不写 refund success state。
- 不改变 settlement、commission、payout、permission、fulfillment 或 logistics。

## 下一步

建议进入 `refund-provider-inbox-route-disposable-db-plan`，先 docs-only 规划 disposable DB wiring gate；不要直接连接普通预发或生产 DB。
