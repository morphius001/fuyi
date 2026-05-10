# refund-runtime-gate-validation-v2

更新时间：2026-05-10 Asia/Shanghai

## 目标

汇总退款 runtime gate 第二版验证，覆盖退款金额 guard、请求幂等、通知 verifier / normalizer、manual review audit、audit action allowlist 和 refund inbox state transition contract。

本任务只做 docs-only validation，不新增 runtime。

## 范围

允许修改：

- `.codex/tasks/refund-runtime-gate-validation-v2.md`
- `docs/refund-runtime-gate-validation-v2.md`
- `.codex/queue.md`
- `project-ledger/changelog.md`
- `project-ledger/status.md`
- `project-ledger/handoff.md`

禁止修改：

- `apps/**`
- `packages/**`
- route、DB repository runtime、migration 注册、provider API、workflow、checkout / order / payment / refund / settlement / commission / payout / permission / fulfillment / logistics runtime

## 必须覆盖

- 当前已完成 refund gate contracts。
- 当前 Go / No-Go。
- 验证命令和结果。
- registration grep。
- high-risk runtime grep。
- 仍然不能接真实支付宝 / 微信支付 refund API 或 workflow 的原因。
- 下一步只能进入 docs-only / interface-only repository plan 或继续 validation。

## 验证

至少执行：

```bash
cd packages/api && bunx tsc --noEmit -p tsconfig.json
.codex/scripts/payment-notification-idempotency-harness.sh
grep -R "china-payment-notification" packages/api/medusa-config.ts
git diff --check
git diff --name-only
```

并安排子智能体只读复核。
