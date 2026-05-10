# Refund WeChat Real Verifier Plan

## 任务

细化微信支付真实退款结果回调 verifier 的文件边界、输入输出、fixture 和验证矩阵。

## 范围

- 新增 `docs/refund-wechat-real-verifier-plan.md`。
- 更新 `.codex/queue.md`、`project-ledger/changelog.md`、`project-ledger/status.md`、`project-ledger/handoff.md`。
- 只做 docs-only provider-specific plan。

## 非目标

- 不修改 `apps/**`。
- 不修改 `packages/**` runtime。
- 不接微信支付 SDK。
- 不写真实 app id、mch id、private key、APIv3 key、平台证书、公钥或 webhook token。
- 不新增真实 route。
- 不写 inbox / event log。
- 不调用 provider refund API。
- 不执行 workflow。
- 不写 refund success state。
- 不改变 settlement、commission、payout、permission、fulfillment 或 logistics。

## 验证

- `git diff --check`
- `git status --short --branch`
- 子智能体只读复核。
