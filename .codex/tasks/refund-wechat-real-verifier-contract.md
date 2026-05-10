# Refund WeChat Real Verifier Contract

## 任务

新增微信支付退款结果回调 verifier 纯函数合同和 redacted fixtures。

## 范围

- 新增 `wechat-pay-refund-notification-test-vectors.ts`。
- 新增 `wechat-pay-refund-notification-verifier.ts`。
- 新增 focused unit tests。
- 更新模块导出和 payment notification harness。
- 新增 `docs/refund-wechat-real-verifier-contract.md`。
- 更新 queue / ledger。

## 非目标

- 不接微信支付 SDK。
- 不写真实 app id、mch id、private key、APIv3 key、平台证书、公钥或 webhook token。
- 不新增 route。
- 不写 inbox / event log。
- 不调用 provider refund API。
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
