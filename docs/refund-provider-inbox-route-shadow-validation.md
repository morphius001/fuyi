# Refund Provider Inbox Route Shadow Validation

更新时间：2026-05-10 Asia/Shanghai

## 结论

PR #380 `[china] Refund provider inbox route shadow` 已合并到 `main`，merge commit `d63dd9717e02ed0f3ed226cbde8abfd31f55b682`。

合并后验证通过。该 PR 新增支付宝 / 微信支付 refund provider inbox route disabled shadow skeleton、route config parser、safe response redaction helper 和 focused tests。当前 route 默认 disabled；即使 local shadow flags 打开，也返回 disabled，不读取 body、不写 inbox、不连接 DB、不执行 workflow、不写 refund success state。

## 合并文件范围

已执行：

```bash
git diff-tree --no-commit-id --name-status -r d63dd97
git show --stat --oneline --no-renames d63dd97
```

文件范围：

```text
M .codex/queue.md
A .codex/tasks/refund-provider-inbox-route-shadow.md
A docs/refund-provider-inbox-route-shadow.md
A packages/api/src/api/china/refund-inbox/alipay/__tests__/route.unit.spec.ts
A packages/api/src/api/china/refund-inbox/alipay/route.ts
A packages/api/src/api/china/refund-inbox/wechat-pay/__tests__/route.unit.spec.ts
A packages/api/src/api/china/refund-inbox/wechat-pay/route.ts
A packages/api/src/modules/china-payment-notification/__tests__/refund-provider-inbox-response.unit.spec.ts
A packages/api/src/modules/china-payment-notification/__tests__/refund-provider-inbox-route-config.unit.spec.ts
M packages/api/src/modules/china-payment-notification/index.ts
A packages/api/src/modules/china-payment-notification/refund-provider-inbox-response.ts
A packages/api/src/modules/china-payment-notification/refund-provider-inbox-route-config.ts
M project-ledger/changelog.md
M project-ledger/handoff.md
M project-ledger/status.md
```

统计：

```text
15 files changed, 1075 insertions(+), 1 deletion(-)
```

## 验证结果

在最新 `origin/main` 基线分支 `china/pr-np-refund-provider-inbox-route-shadow-validation` 上已执行：

```bash
cd packages/api
source "$HOME/.nvm/nvm.sh" && nvm use 24
/home/codex/.bun/bin/bun run test:unit --runTestsByPath \
  src/api/china/refund-inbox/wechat-pay/__tests__/route.unit.spec.ts \
  src/api/china/refund-inbox/alipay/__tests__/route.unit.spec.ts \
  src/modules/china-payment-notification/__tests__/refund-provider-inbox-route-config.unit.spec.ts \
  src/modules/china-payment-notification/__tests__/refund-provider-inbox-response.unit.spec.ts
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
  packages/api/src/modules/china-payment-notification/refund-provider-inbox-route-config.ts \
  packages/api/src/modules/china-payment-notification/refund-provider-inbox-response.ts || true
git diff --check
git status --short --branch
```

结果：

- Focused route / config / response tests：4 suites / 16 tests passed。
- API typecheck passed。
- Payment notification harness：42 suites / 322 tests passed。
- Payment DB dry-run row count：`2|9`，down/drop cleanup 通过。
- Runtime grep 只命中测试负断言和 response redaction denylist。
- `git diff --check` passed。
- `packages/api/.mercur/index.d.ts` 由 typecheck 刷新后已按项目规则恢复，未纳入验证分支。
- 工作区在验证命令结束后干净。

## Safety Boundary

仍保持：

- Route 默认 disabled。
- Local shadow flags enabled 时仍返回 disabled。
- Route 不读取 body。
- Route 不写 inbox。
- 不连接 DB。
- 不注册 module。
- 不接 SDK。
- 不写真实密钥、证书、公钥、webhook token 或 DB URL。
- 不调用 provider refund API。
- 不调用 refund query API。
- 不执行 workflow。
- 不写 refund success state。
- 不改变 settlement、commission、payout、permission、fulfillment 或 logistics。

## Response Redaction

PR #380 的 response helper 已覆盖 key 和 string value 两层 redaction：

- raw body / raw payload。
- signature / sign / nonce / serial。
- secret、private key、APIv3 key、certificate、public key、webhook token。
- DB URL。
- provider refund request / query command。
- workflow command / workflow execution。
- refund state mutation command。
- 完整手机号、身份证、银行卡、详细地址。
- settlement、commission、payout、fulfillment、logistics 字段。

## 下一步

建议进入 `refund-provider-inbox-route-local-wiring-plan`，先 docs-only 规划后续 local in-memory inbox wiring；不要直接进入 DB-backed provider route、state owner handoff 或 refund workflow。
