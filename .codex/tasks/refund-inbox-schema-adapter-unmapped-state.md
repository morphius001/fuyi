# Refund Inbox Schema Adapter Unmapped State

更新时间：2026-05-10 Asia/Shanghai

## 任务目标

更新 local PG refund inbox adapter，在新 schema 下让 refund-only state / actor 原样写入和读回，不再映射到 payment-first DB-safe values。

## 允许范围

- 修改 `packages/api/src/modules/china-payment-notification/local-postgres-db-client.ts`
- 修改 `packages/api/src/modules/china-payment-notification/__tests__/local-postgres-db-client.unit.spec.ts`
- 修改 `packages/api/src/api/china/refund-inbox/mock/__tests__/route.unit.spec.ts`
- 新增 `docs/refund-inbox-schema-adapter-unmapped-state.md`
- 更新 `.codex/queue.md`
- 更新 `project-ledger/changelog.md`
- 更新 `project-ledger/status.md`
- 更新 `project-ledger/handoff.md`

## 禁止范围

- 不修改 `apps/**`
- 不修改 route runtime，route test fixture 除外
- 不注册 module
- 不新增 route
- 不连接预发或生产 DB
- 不调用 provider refund API
- 不执行 workflow
- 不写 refund success state
- 不改变 checkout、cart、order、payment、refund、settlement、commission、payout、permission、fulfillment 或 logistics runtime

## 验证要求

- schema constraint rehearsal
- focused local client / refund repository / payment repository tests
- API typecheck
- payment harness
- existing refund real-adapter rehearsal
- `git diff --check`
- 子智能体只读复核

## 完成输出

完成后说明：

- 修改文件
- 验证结果
- 风险点
- 下一步建议
