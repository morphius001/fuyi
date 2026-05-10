# Refund Alipay Real Verifier Contract

## 任务

新增支付宝退款相关通知 verifier 纯函数合同和 redacted fixtures。

## 范围

- 新增 `alipay-refund-notification-test-vectors.ts`。
- 新增 `alipay-refund-notification-verifier.ts`。
- 新增 focused unit tests。
- 更新模块导出和 payment notification harness。
- 新增 `docs/refund-alipay-real-verifier-contract.md`。
- 更新 queue / ledger。

## 非目标

- 不接支付宝 SDK。
- 不写真实 app id、seller id、merchant id、private key、支付宝公钥 / 证书或 webhook token。
- 不新增 route。
- 不写 inbox / event log。
- 不调用 provider refund API 或 refund query API。
- 不执行 workflow。
- 不写 refund success state。
- 不改变 settlement、commission、payout、permission、fulfillment 或 logistics。

## 验证

- focused unit tests。
- API typecheck。
- payment notification harness。
- runtime grep。
- `git diff --check`。
- 子智能体只读复核。
