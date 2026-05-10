# Refund Route Runtime Readiness Plan

## 任务

规划真实退款通知 route / runtime 启用前的 readiness gate。

## 范围

- 新增 `docs/refund-route-runtime-readiness-plan.md`。
- 更新 `.codex/queue.md`、`project-ledger/changelog.md`、`project-ledger/status.md`、`project-ledger/handoff.md`。
- 只做文档、上线门禁和验证矩阵。

## 非目标

- 不修改 `apps/**`。
- 不修改 `packages/**` runtime。
- 不新增或启用真实 route。
- 不注册 `china-payment-notification` module。
- 不连接预发 / 生产 DB。
- 不接真实支付宝 / 微信支付退款通知。
- 不调用 provider refund API。
- 不执行 refund workflow。
- 不写 refund success state。
- 不改变 settlement、commission、payout、permission、fulfillment 或 logistics。

## 必须覆盖

- 当前 fake/local refund inbox route、schema、adapter 的已完成边界。
- 真实 route / runtime 启用前的 Go / No-Go 条件。
- Feature flag、环境、provider、DB、schema、签名验签、幂等、manual review 和 audit gate。
- 退款状态 owner handoff 与 settlement / commission / payout block。
- 验证命令、rollback 和发布顺序。

## 验证

- `git diff --check`
- `git status --short`
- 子智能体只读复核：确认本轮 docs-only，且 readiness plan 未允许真实退款 runtime 直接上线。
