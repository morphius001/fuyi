# Refund Inbox Local DB Route

更新时间：2026-05-10 Asia/Shanghai

## 任务目标

把 `/china/refund-inbox/mock` 扩展为 fake/local disposable DB-backed inbox-only route。该 route 只允许本地一次性 DB、fake provider、fake secret 和 inbox / audit 写入，不代表退款成功。

## 允许范围

- 修改 `packages/api/src/api/china/refund-inbox/mock/route.ts`
- 修改 `packages/api/src/api/china/refund-inbox/mock/__tests__/route.unit.spec.ts`
- 修改 `packages/api/src/modules/china-payment-notification/local-postgres-db-client.ts`
- 修改 `packages/api/src/modules/china-payment-notification/__tests__/local-postgres-db-client.unit.spec.ts`
- 新增 `docs/refund-inbox-local-db-route.md`
- 更新 `.codex/queue.md`
- 更新 `project-ledger/changelog.md`
- 更新 `project-ledger/status.md`
- 更新 `project-ledger/handoff.md`

## 禁止范围

- 不修改 `apps/**`
- 不注册 module 或 migration
- 不连接预发或生产 DB
- 不调用 provider refund API
- 不执行 payment / refund workflow
- 不写 refund success state
- 不改变 checkout、cart、order、payment、refund、settlement、commission、payout、permission、fulfillment 或 logistics runtime

## 验证要求

- focused refund route tests
- focused local postgres client tests
- API typecheck
- payment notification harness
- refund inbox repository disposable DB dry-run
- runtime grep
- `git diff --check`
- 子智能体只读复核

## 完成输出

完成后说明：

- 修改文件
- 验证结果
- 风险点
- 下一步建议
