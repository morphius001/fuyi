# payment-runtime-external-readiness-review

## 目标

复核 payment runtime 外部执行边界，确认当前是否具备连接 disposable preprod DB、执行 preprod smoke、注册 migration 或进入真实 provider 的条件。

## 范围

- 复核 `.codex/scripts/payment-notification-preprod-disposable-db-smoke.sh` 当前能力。
- 复核 disposable preprod DB checklist。
- 复核 blocked-external 条件。
- 输出 Go / No-Go 与下一步建议。

## 非目标

- 不连接任何外部 DB。
- 不执行 `--preflight` 或 `--smoke` 外部连接。
- 不注册 migration。
- 不修改 `apps/**` 或 `packages/**` runtime。
- 不接支付宝、微信支付、退款、对账、结算、佣金、权限或 payment workflow。

## 验证

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn
.codex/scripts/payment-notification-preprod-disposable-db-smoke.sh --print-plan
git diff --check
```

## 交付

- `docs/payment-runtime-external-readiness-review.md`
- ledger / queue 更新

