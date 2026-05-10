# refund-inbox-repository-db-adapter-skeleton

更新时间：2026-05-10 Asia/Shanghai

## 目标

新增退款 inbox repository mocked DB adapter skeleton 和 focused tests。

本任务只允许外部注入 transaction / mock DB client，不连接真实 DB、不接 route、不注册 migration、不调用 provider API 或 workflow。

## 范围

允许修改：

- `packages/api/src/modules/china-payment-notification/refund-db-inbox-repository.ts`
- `packages/api/src/modules/china-payment-notification/__tests__/refund-db-inbox-repository.unit.spec.ts`
- `packages/api/src/modules/china-payment-notification/index.ts`
- `.codex/scripts/payment-notification-idempotency-harness.sh`
- `.codex/tasks/refund-inbox-repository-db-adapter-skeleton.md`
- `docs/refund-inbox-repository-db-adapter-skeleton.md`
- `.codex/queue.md`
- `project-ledger/changelog.md`
- `project-ledger/status.md`
- `project-ledger/handoff.md`

禁止修改：

- `apps/**`
- `packages/api/medusa-config.ts`
- `packages/api/src/api/**`
- `packages/api/src/workflows/**`
- `packages/api/src/subscribers/**`
- `packages/api/src/jobs/**`
- `packages/api/src/links/**`
- package / lock / env 文件

## 必须满足

- 只实现 `RefundInboxRepositoryContract` skeleton。
- 只使用 injected transaction / mocked DB client。
- duplicate same digest 返回 no-op inbox outcome。
- duplicate digest conflict 返回 manual review inbox outcome。
- event log 和 inbox update 同 transaction。
- metadata 顶层和嵌套敏感 / 可执行字段必须清洗。
- 不输出 provider refund request、workflow command 或 refund state mutation。

## 验证

至少执行：

```bash
cd packages/api && bun run test:unit --runTestsByPath src/modules/china-payment-notification/__tests__/refund-db-inbox-repository.unit.spec.ts
cd packages/api && bunx tsc --noEmit -p tsconfig.json
.codex/scripts/payment-notification-idempotency-harness.sh
git diff --check
```

并安排子智能体只读复核。
