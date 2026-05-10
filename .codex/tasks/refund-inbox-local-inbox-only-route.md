# Refund Inbox Local Inbox-only Route

更新时间：2026-05-10 Asia/Shanghai

## 任务目标

将 `/china/refund-inbox/mock` 从 disabled-only 扩展到 fake/local in-memory inbox-only。只允许本地开发环境、mock provider、fake signature、in-memory repository；不接真实 DB、Provider refund API 或 workflow。

## 允许范围

- 修改 `packages/api/src/api/china/refund-inbox/mock/route.ts`
- 修改 `packages/api/src/api/china/refund-inbox/mock/__tests__/route.unit.spec.ts`
- 新增 `docs/refund-inbox-local-inbox-only-route.md`
- 更新 `.codex/queue.md`
- 更新 `project-ledger/changelog.md`
- 更新 `project-ledger/status.md`
- 更新 `project-ledger/handoff.md`

## 禁止范围

- 不修改 `apps/**`
- 不修改 `packages/api/medusa-config.ts`
- 不修改 migration
- 不注册 module
- 不连接真实 DB 或 local DB route wiring
- 不调用 provider refund API
- 不执行 payment / refund workflow
- 不写真实 refund success state
- 不改变 checkout、cart、order、payment、refund、settlement、commission、payout、permission、fulfillment 或 logistics runtime

## 验证要求

- focused route unit test
- API typecheck
- payment notification harness
- refund disposable DB dry-run
- runtime grep
- `git diff --check`
- 子智能体只读复核

## 完成输出

完成后说明：

- 修改文件
- 验证结果
- 风险点
- 下一步建议
