# Task: admin-market-readonly-api

## 目标

新增 Admin 中国市场只读 API，供运营后台查看市场列表和详情。本任务只读，不保存、不发布、不改变权限。

## 允许修改

- `packages/api/src/api/admin/china/markets/**`
- `packages/api/.mercur/index.d.ts`，如 build/codegen 更新
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- 禁止新增写 API
- 禁止新增 migration
- 禁止修改 permission/RBAC、checkout、shipping options、order、payment、refund、settlement、commission、fulfillment 逻辑
- 禁止新增依赖

## 验证

```bash
./node_modules/.bin/tsc --noEmit -p packages/api/tsconfig.json
cd packages/api && ./node_modules/.bin/medusa build
git diff --check -- packages/api/src/api/admin/china/markets .codex/queue.md project-ledger .codex/tasks/admin-market-readonly-api.md packages/api/.mercur/index.d.ts
```
