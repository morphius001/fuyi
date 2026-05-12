# Refund State Mutation Approval Persistence Migration Plan

更新时间：2026-05-12 Asia/Shanghai

## 结论

真实生产退款成功状态写入仍是 No-Go。本计划只规划 approval persistence migration skeleton / local disposable DB rehearsal，不新增真实注册 migration、不连接生产 DB、不写 approval record、不执行生产 workflow、不写 production refund success state。

下一步允许新增未注册 migration skeleton 和本地 disposable DB rehearsal 脚本，但必须保持生产未注册、可回滚、只在临时数据库验证。

## Planned Files

建议后续实现 PR 新增：

```text
packages/api/src/modules/china-payment-notification/migrations/Migration20260512000300.ts
.codex/scripts/refund-state-mutation-approval-persistence-local-dry-run.sh
docs/refund-state-mutation-approval-persistence-migration-skeleton.md
```

仍不得修改：

```text
packages/api/medusa-config.ts
apps/**
packages/api/src/api/**
packages/api/src/workflows/**
```

## Migration Skeleton Scope

Skeleton 只创建 approval persistence 相关表：

- `china_refund_state_mutation_approval`
- `china_refund_state_mutation_approval_event`

第一版 up SQL 必须包含：

- primary keys。
- unique `approval_idempotency_key`。
- positive `amount_minor` check。
- `currency = 'CNY'` check。
- allowed status check。
- allowed reviewer role check。
- reviewer / requester separation check。
- index on `platform_refund_id`。
- index on `provider_name, provider_refund_reference`。
- event log foreign key to approval table。
- event action check。

第一版 down SQL 必须完整删除 event table 和 approval table。

## Local Disposable DB Rehearsal

Dry-run 脚本必须：

1. 创建随机本地 disposable PostgreSQL database。
2. 拒绝非 local / disposable database name。
3. 应用 migration skeleton up SQL。
4. 插入合法 approval / event fixtures。
5. 验证 unique idempotency。
6. 验证 amount / currency / status / reviewer role / reviewer separation constraints。
7. 验证 event action constraint。
8. 应用 down SQL。
9. 复查表已删除。
10. 删除 disposable database。

脚本失败时必须尽力清理临时 DB，并输出清晰错误。

## No-Go Boundaries

- 不注册 migration。
- 不连接 staging / production DB。
- 不新增 repository。
- 不新增 route / job / subscriber。
- 不执行 production workflow。
- 不写 approval record 到真实数据库。
- 不写 production refund success state。
- 不触发 settlement、commission、payout、permission、fulfillment 或 logistics。

## Proposed Next PR Sequence

1. `refund-state-mutation-approval-persistence-migration-validation`：验证本计划文件范围和 No-Go。
2. `refund-state-mutation-approval-persistence-migration-skeleton`：新增未注册 migration skeleton 和 local dry-run 脚本。
3. `refund-state-mutation-approval-persistence-migration-skeleton-validation`：验证 skeleton / dry-run / 无生产注册。
4. `refund-state-mutation-approval-persistence-repository-contract`：新增 disabled repository contract，不接生产 DB。

## Verification Plan

本计划 PR 需要运行：

```bash
git diff --check
git status --short --branch
```

本计划 PR 已验证：

```text
git diff --check passed
No apps/** or packages/** runtime diff
```

复核重点：

- 本轮仅 docs / task / queue / ledger。
- 未修改 `apps/**` 或 `packages/**` runtime。
- 未新增 route、job、subscriber、migration、DB、SDK、provider request / query、workflow execution、refund success state mutation。
- 未改变 settlement、commission、payout、permission、fulfillment 或 logistics。
