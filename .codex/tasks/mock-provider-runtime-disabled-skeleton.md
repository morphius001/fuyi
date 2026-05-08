# Task: mock-provider-runtime-disabled-skeleton

## 目标

新增 mock provider runtime disabled route skeleton。

本任务只允许 disabled route 和单元测试，不接 DB、不调用 adapter、不执行 workflow。

## 允许修改

- `packages/api/src/api/china/payment-providers/mock/**`
- `.codex/scripts/payment-notification-idempotency-harness.sh`
- `.codex/tasks/mock-provider-runtime-disabled-skeleton.md`
- `docs/mock-provider-runtime-disabled-skeleton.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- 不修改 `apps/**`。
- 不修改 `packages/api/medusa-config.ts`。
- 不修改 `packages/api/package.json`。
- 不修改 `bun.lock`。
- 不新增依赖。
- 不读取 request body。
- 不连接数据库。
- 不调用 provider registry。
- 不调用 runtime gate。
- 不调用 provider adapter。
- 不执行 payment workflow。
- 不改变 checkout、order、payment、refund、settlement、commission 或 permission 行为。

## 验证命令

```bash
.codex/scripts/payment-notification-idempotency-harness.sh
bunx tsc --noEmit -p packages/api/tsconfig.json
git diff --check
```

## 完成标准

- Disabled route 默认返回 503。
- Production 仍返回 disabled / blocked。
- 单测确认 disabled 时不读 body、不泄露 secret、不暴露 workflow。
- Harness 纳入新增 route test。
