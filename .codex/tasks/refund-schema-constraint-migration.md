# Refund Schema Constraint Migration

更新时间：2026-05-10 Asia/Shanghai

## 任务目标

更新未注册的 payment notification inbox migration skeleton，使其显式支持 refund-only inbox status、audit action、actor、positive amount、metadata redaction 和 provider refund index。

## 允许范围

- 修改 `packages/api/src/modules/china-payment-notification/migrations/Migration20260507000200.ts`
- 更新 `.codex/scripts/refund-schema-constraint-migration-rehearsal.sh`
- 新增 `docs/refund-schema-constraint-migration.md`
- 更新 `docs/refund-schema-constraint-migration-rehearsal.md`
- 更新 `.codex/queue.md`
- 更新 `project-ledger/changelog.md`
- 更新 `project-ledger/status.md`
- 更新 `project-ledger/handoff.md`

## 禁止范围

- 不修改 `apps/**`
- 不修改 `packages/**` runtime，migration skeleton 除外
- 不注册 module
- 不新增 route
- 不连接预发或生产 DB
- 不调用 provider refund API
- 不执行 workflow
- 不写 refund success state
- 不改变 checkout、cart、order、payment、refund、settlement、commission、payout、permission、fulfillment 或 logistics runtime

## 验证要求

- schema constraint rehearsal positive run
- unsafe DB name guard
- production env guard
- focused local client / refund repository / payment repository tests
- API typecheck
- payment harness
- existing refund real-adapter rehearsal
- `git diff --check`
- migration diff review
- 子智能体只读复核

## 完成输出

完成后说明：

- 修改文件
- 验证结果
- 风险点
- 下一步建议
