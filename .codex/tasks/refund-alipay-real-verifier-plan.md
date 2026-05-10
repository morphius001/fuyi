# Refund Alipay Real Verifier Plan

## 任务

细化支付宝退款相关异步通知 / 交易通知 verifier 的文件边界、产品模式确认、输入输出、fixture 和验证矩阵。

## 范围

- 新增 `docs/refund-alipay-real-verifier-plan.md`。
- 更新 `.codex/queue.md`、`project-ledger/changelog.md`、`project-ledger/status.md`、`project-ledger/handoff.md`。
- 只做 docs-only provider-specific plan。

## 非目标

- 不修改 `apps/**`。
- 不修改 `packages/**` runtime。
- 不接支付宝 SDK。
- 不写真实 app id、seller id、merchant id、private key、支付宝公钥 / 证书或 webhook token。
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
