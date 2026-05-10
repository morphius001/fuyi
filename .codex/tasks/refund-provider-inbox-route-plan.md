# Refund Provider Inbox Route Plan

## 任务

规划真实支付宝 / 微信支付退款通知进入 provider inbox-only route shadow 的后续实现边界。

## 范围

- 新增 `docs/refund-provider-inbox-route-plan.md`。
- 更新 `.codex/queue.md`、`project-ledger/changelog.md`、`project-ledger/status.md`、`project-ledger/handoff.md`。
- 只做 route shadow、feature flag、provider verifier wiring、inbox / audit、响应语义、测试和 rollout 计划。

## 非目标

- 不修改 `apps/**`。
- 不修改 `packages/**` runtime。
- 不新增真实 route 实现。
- 不注册 module。
- 不连接数据库。
- 不接 SDK。
- 不读取或写入真实 app id、merchant id、private key、APIv3 key、证书、公钥或 webhook token。
- 不调用 provider refund API。
- 不调用 refund query API。
- 不执行 workflow。
- 不写 refund success state。
- 不改变 settlement、commission、payout、permission、fulfillment 或 logistics。

## 必须覆盖

- provider inbox-only route 默认 disabled，production blocked，只有后续单独 PR 才能在 local / disposable preprod gate 下 shadow 写入 inbox / audit。
- 微信支付与支付宝 verifier 输出进入 route 前的验签、identity、amount、currency、idempotency 和 redaction gate。
- `accepted`、`duplicate`、`manual_review`、`processed_for_audit_only` 等响应语义不得等同退款成功。
- response、event log 和 audit metadata 禁止暴露 raw payload、signature、secret、DB URL、provider request command、workflow command、完整手机号 / 地址 / 证件号 / 银行卡等敏感信息。
- 后续 PR 顺序、No-Go 条件、验证命令和回滚方式。

## 验证

- `git diff --check`
- `git status --short --branch`
- 子智能体只读复核。
