# Refund Inbox Disabled Route Skeleton

更新时间：2026-05-10 Asia/Shanghai

## 任务目标

新增 refund inbox disabled route skeleton 和 focused tests。该 route 只返回 disabled / production blocked，不读 body、不连接 DB、不调用 verifier / normalizer / repository / provider API / workflow。

## 允许范围

- 新增 `packages/api/src/api/china/refund-inbox/mock/route.ts`
- 新增 `packages/api/src/api/china/refund-inbox/mock/__tests__/route.unit.spec.ts`
- 新增 `docs/refund-inbox-disabled-route-skeleton.md`
- 更新 `.codex/scripts/payment-notification-idempotency-harness.sh`
- 更新 `.codex/queue.md`
- 更新 `project-ledger/changelog.md`
- 更新 `project-ledger/status.md`
- 更新 `project-ledger/handoff.md`

## 禁止范围

- 不修改 `apps/**`
- 不修改 `packages/api/medusa-config.ts`
- 不修改 `packages/api/src/modules/**` runtime
- 不注册 module 或 migration
- 不读取 request body
- 不连接 DB
- 不调用 refund verifier / normalizer / repository
- 不调用 provider refund API 或 workflow
- 不写 inbox / event log
- 不改变 checkout、cart、order、payment、refund、settlement、commission、payout、permission、fulfillment 或 logistics runtime

## 验证要求

- focused route unit test
- API typecheck
- payment notification harness
- runtime grep
- `git diff --check`
- 子智能体只读复核

## 完成输出

完成后说明：

- 修改文件
- 验证结果
- 风险点
- 下一步建议
