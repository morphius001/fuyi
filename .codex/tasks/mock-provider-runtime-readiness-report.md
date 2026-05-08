# Task: mock-provider-runtime-readiness-report

## 目标

记录 mock provider runtime gate 组合测试合并后的 readiness 验证结果。

本任务只写文档和 ledger，不接 runtime。

## 允许修改

- `.codex/tasks/mock-provider-runtime-readiness-report.md`
- `docs/mock-provider-runtime-readiness-report.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- 不修改 `apps/**`。
- 不修改 `packages/**`。
- 不修改 `.codex/scripts/**`。
- 不修改 `packages/api/medusa-config.ts`。
- 不连接外部数据库。
- 不接支付宝或微信支付。
- 不注册 Medusa payment provider。
- 不执行 payment workflow。

## 验证命令

```bash
.codex/scripts/payment-notification-idempotency-harness.sh
bunx tsc --noEmit -p packages/api/tsconfig.json
grep -R "china-payment-notification" packages/api/medusa-config.ts || true
git diff --check
git status --short --untracked-files=all
```

## 完成标准

- 报告记录 harness、typecheck、runtime grep 和 DB 无残留结果。
- queue 更新下一项。
- 未纳入视觉 QA 产物。
