# Refund Provider Real Verifier Contract Validation

更新时间：2026-05-10 Asia/Shanghai

## 结论

PR #374-#375 provider real verifier contract 阶段已合并：

- PR #374 `[china] Refund WeChat real verifier contract`，merge commit `248171d1d1bb10aa52140637206717384cfbbb1b`。
- PR #375 `[china] Refund Alipay real verifier contract`，merge commit `f712deb939e747ff48a5570ccc90f98021e10a6f`。

合并后验证通过。两个 PR 均只新增 provider verifier 纯函数、redacted fixtures、focused tests、module export、payment notification harness 和 docs / ledger；没有新增 route、DB 写入、module registration、SDK、真实密钥、provider refund API、refund query API、workflow 或 refund success state。

## 验证结果

在最新 `origin/main` 基线分支 `china/pr-nk-refund-provider-real-verifier-contract-validation` 上已执行：

```bash
git diff --check
git status --short --branch
git diff-tree --no-commit-id --name-status -r 248171d
git diff-tree --no-commit-id --name-status -r f712deb
cd packages/api
source "$HOME/.nvm/nvm.sh" && nvm use 24
/home/codex/.bun/bin/bun run test:unit --runTestsByPath \
  src/modules/china-payment-notification/__tests__/wechat-pay-refund-notification-verifier.unit.spec.ts \
  src/modules/china-payment-notification/__tests__/alipay-refund-notification-verifier.unit.spec.ts
/home/codex/.bun/bin/bunx tsc --noEmit -p tsconfig.json
cd ../..
.codex/scripts/payment-notification-idempotency-harness.sh
```

结果：

- `git diff --check` passed。
- 工作区在验证前后无未提交 diff。
- PR #374 文件范围：wechat refund verifier 纯函数、redacted fixtures、focused tests、module export、harness、docs / task / ledger。
- PR #375 文件范围：alipay refund verifier 纯函数、redacted fixtures、focused tests、module export、harness、docs / task / ledger。
- Focused WeChat + Alipay refund verifier tests：2 suites / 21 tests passed。
- API typecheck passed。
- Payment notification harness：42 suites / 322 tests passed。
- Payment DB dry-run row count：`2|9`，down/drop cleanup 通过。
- `packages/api/.mercur/index.d.ts` 如由 typecheck 触发已恢复，未纳入验证分支。

## Safety Boundary

仍保持：

- 不接微信支付 SDK。
- 不接支付宝 SDK。
- 不写真实 app id、mch id、seller id、merchant id、private key、APIv3 key、公钥、证书或 webhook token。
- 不新增真实 route。
- 不写 inbox / event log。
- 不调用 provider refund API。
- 不调用 refund query API。
- 不执行 workflow。
- 不写 refund success state。
- 不改变 settlement、commission、payout、permission、fulfillment 或 logistics。

## Provider-Specific 结论

微信支付：

- `REFUND.SUCCESS` 只代表 verifier output，不代表平台退款成功。
- `REFUND.ABNORMAL`、`REFUND.CLOSED` 保持非可执行输出。

支付宝：

- `product_specific_refund_notify` 可形成 `refund.succeeded` verifier envelope，但不代表平台退款成功。
- `trade_async_notify` 的 trade-only 通知保持 `trade.updated` + review semantics。
- `refund_query_follow_up` 保持 query-required semantics，但本阶段不调用查询 API。

## 下一步

建议进入 `refund-provider-inbox-route-plan`，规划 provider inbox-only route shadow；仍不得接真实 route runtime、provider refund API、refund query API、workflow 或 refund success state。
