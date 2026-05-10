# Refund Provider Real Verifier Plan

## 任务

规划支付宝 / 微信支付真实退款通知 verifier 的后续实现边界。

## 范围

- 新增 `docs/refund-provider-real-verifier-plan.md`。
- 更新 `.codex/queue.md`、`project-ledger/changelog.md`、`project-ledger/status.md`、`project-ledger/handoff.md`。
- 只做 provider-specific 验签、解密、幂等和测试计划。

## 非目标

- 不修改 `apps/**`。
- 不修改 `packages/**` runtime。
- 不接 SDK。
- 不读取或写入真实 app id、merchant id、private key、APIv3 key、证书、公钥或 webhook token。
- 不新增真实 route。
- 不写 inbox / event log。
- 不调用 provider refund API。
- 不执行 workflow。
- 不写 refund success state。
- 不改变 settlement、commission、payout、permission、fulfillment 或 logistics。

## 必须覆盖

- 微信支付退款结果回调验签、证书 / 公钥选择、AES-256-GCM 解密、event type、idempotency key 和 response 语义。
- 支付宝退款相关异步通知 / 交易状态通知的产品差异、验签 canonicalization、notify_id / out_request_no / out_biz_no 约束和 response 语义。
- shared verifier interface、provider-specific failure code、redaction 和 fixture / sandbox vector 要求。
- 后续 PR 顺序与 No-Go 条件。

## 验证

- `git diff --check`
- `git status --short --branch`
- 子智能体只读复核。
