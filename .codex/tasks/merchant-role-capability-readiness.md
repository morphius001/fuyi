# Task: merchant-role-capability-readiness

## 目标

整理普通商户、物料供应商、配送供应商、养殖户、种植户、种苗供应商和外地批发商的角色能力矩阵。

## 允许修改

- `.codex/tasks/merchant-role-capability-readiness.md`
- `docs/merchant-role-capability-readiness.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- 不修改 `apps/**`。
- 不修改 `packages/**`。
- 不新增权限逻辑。
- 不新增结算、佣金、订单归属逻辑。
- 不接真实服务。

## 验证命令

```bash
git diff --check
git diff --name-only
```

## 完成标准

- 明确每种角色的消费者可见性、商户可见性、后台开通方式和禁止项。
- 明确下一步 read-only / docs-only PR 顺序。
