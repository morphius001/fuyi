# Task: admin-config-readonly-api

## 目标

新增 Admin 模块配置只读 API，让 Admin 可以读取 module definitions、static configs 和 effective capability view。本任务不保存、不发布、不生效。

## 允许修改

- `packages/api/src/lib/china-read-models.ts`
- `packages/api/src/lib/__tests__/**`
- `packages/api/src/api/admin/china/module-configs/**`
- `packages/api/.mercur/index.d.ts`，如 build/codegen 更新
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- 禁止新增 POST/PATCH/DELETE 写 API
- 禁止新增 migration
- 禁止让模块配置影响权限、菜单、checkout、订单、支付、退款、结算、佣金或履约
- 禁止新增依赖

## 验证

```bash
./node_modules/.bin/tsc --noEmit -p packages/api/tsconfig.json
cd packages/api && TEST_TYPE=unit ./node_modules/.bin/jest src/lib/__tests__/china-read-models.unit.spec.ts --runInBand
cd packages/api && ./node_modules/.bin/medusa build
git diff --check -- packages/api/src/lib packages/api/src/api/admin/china/module-configs .codex/queue.md project-ledger .codex/tasks/admin-config-readonly-api.md
```
