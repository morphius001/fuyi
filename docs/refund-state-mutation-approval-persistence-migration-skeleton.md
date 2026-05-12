# Refund State Mutation Approval Persistence Migration Skeleton

更新时间：2026-05-12 Asia/Shanghai

## 结论

本轮新增未注册 approval persistence migration skeleton 和本地 disposable DB dry-run 脚本。当前仍是 No-Go to real refund success state mutation：不注册 migration、不连接 production / preprod DB、不新增 repository / route / workflow execution、不写 production refund success state。

## Files Changed

- `packages/api/src/modules/china-payment-notification/migrations/Migration20260512000300.ts`
- `.codex/scripts/refund-state-mutation-approval-persistence-local-dry-run.sh`
- `.codex/tasks/refund-state-mutation-approval-persistence-migration-skeleton.md`
- `.codex/queue.md`
- `project-ledger/changelog.md`
- `project-ledger/handoff.md`
- `project-ledger/status.md`

## Migration Skeleton Scope

新增未注册表：

1. `china_refund_state_mutation_approval`
2. `china_refund_state_mutation_approval_event`

主表包含：

- unique `approval_idempotency_key`
- `platform_refund_id`
- `provider_name` / `provider_refund_reference`
- `merchant_order_reference` / `refund_request_reference`
- `target_state` / `target_state_audit_label`
- `amount_minor > 0`
- `currency = 'CNY'`
- `request_actor_type`
- `reviewer_role`
- reviewer / requester separation
- readiness / shadow / runtime adapter / feature flag snapshot keys
- `status`

事件表包含：

- `approval_id` foreign key
- action allowlist
- actor type allowlist
- redacted metadata JSONB
- metadata blocked-key helper function check

## Local Dry-Run Coverage

脚本 `refund-state-mutation-approval-persistence-local-dry-run.sh` 会：

1. 拒绝非 local host 和非 disposable DB 名称。
2. 拒绝疑似 production / preprod / staging 环境。
3. 拒绝 migration 已注册或 staged 文件超出 allowlist 的情况。
4. 从 `Migration20260512000300.ts` 提取 up/down SQL。
5. 创建一次性本地数据库并应用 up SQL。
6. 插入合法 approval / event fixture。
7. 验证 unique idempotency、amount、currency、status、reviewer role、reviewer separation、event action 和 metadata blocked-key 约束。
8. 应用 down SQL 并确认表已删除。
9. 退出时自动删除 disposable DB。

## Non-Goals

- 不修改 `packages/api/medusa-config.ts`
- 不新增 repository contract / DB adapter
- 不新增 route / job / subscriber
- 不执行 workflow
- 不写 refund success state
- 不触发 settlement、commission、payout、permission、fulfillment 或 logistics

## Verification

运行：

```bash
bash .codex/scripts/refund-state-mutation-approval-persistence-local-dry-run.sh
bunx tsc --noEmit -p packages/api/tsconfig.json
git diff --check
git status --short --branch
```

复核重点：

- migration 保持未注册
- dry-run 仅使用本地 disposable DB
- approval / event 表约束与计划一致
- down SQL 完整回滚
- 无 runtime、provider、workflow、财务、权限或履约链路改动
