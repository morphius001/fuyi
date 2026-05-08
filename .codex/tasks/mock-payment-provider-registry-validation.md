# Task: mock-payment-provider-registry-validation

## 目标

记录 mock payment provider registry 合并后的验证结果。

本任务只写文档和 ledger，不修改业务代码。

## 允许修改

- `.codex/tasks/mock-payment-provider-registry-validation.md`
- `docs/mock-payment-provider-registry-validation.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- 不修改 `apps/**`。
- 不修改 `packages/**`。
- 不修改 `.codex/scripts/**`。
- 不修改 `packages/api/medusa-config.ts`。
- 不连接外部数据库。
- 不接真实支付宝或微信支付。
- 不执行 payment workflow。

## 验证命令

```bash
.codex/scripts/payment-notification-idempotency-harness.sh
bunx tsc --noEmit -p packages/api/tsconfig.json
grep -R "china-payment-notification" packages/api/medusa-config.ts || true
git diff --check
```

## 完成标准

- 文档记录 harness、typecheck、runtime grep 和 DB 无残留结果。
- queue 更新下一项建议。
- 未纳入视觉 QA 产物。
