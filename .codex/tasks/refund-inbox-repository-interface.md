# refund-inbox-repository-interface

更新时间：2026-05-10 Asia/Shanghai

## 目标

新增退款 inbox repository interface-only 合同和纯 error classifier。

本任务不实现 DB adapter，不接 route，不注册 migration，不调用 provider API 或 workflow。

## 范围

允许修改：

- `packages/api/src/modules/china-payment-notification/refund-inbox-repository-contract.ts`
- `packages/api/src/modules/china-payment-notification/__tests__/refund-inbox-repository-contract.unit.spec.ts`
- `packages/api/src/modules/china-payment-notification/index.ts`
- `.codex/scripts/payment-notification-idempotency-harness.sh`
- `.codex/tasks/refund-inbox-repository-interface.md`
- `docs/refund-inbox-repository-interface.md`
- `.codex/queue.md`
- `project-ledger/changelog.md`
- `project-ledger/status.md`
- `project-ledger/handoff.md`

禁止修改：

- `apps/**`
- `packages/api/medusa-config.ts`
- route、DB adapter/runtime、migration 注册、provider refund API、workflow、checkout / order / payment / refund / settlement / commission / payout / permission / fulfillment / logistics runtime

## 必须满足

- receive result 只能是 inbox outcome，不是退款成功。
- duplicate digest conflict 进入 manual review 语义。
- unknown error 不能默认成为 success / processed。
- contract 不包含 provider request sender、workflow command 或 refund state mutation。
- harness 纳入 focused tests。

## 验证

至少执行：

```bash
cd packages/api && bun run test:unit --runTestsByPath src/modules/china-payment-notification/__tests__/refund-inbox-repository-contract.unit.spec.ts
cd packages/api && bunx tsc --noEmit -p tsconfig.json
.codex/scripts/payment-notification-idempotency-harness.sh
git diff --check
```

并安排子智能体只读复核。
