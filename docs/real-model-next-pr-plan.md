# Real Model Next PR Plan

更新时间：2026-05-07 Asia/Shanghai

## 结论

PR O-R 已经把只读 builder、view shape、未注册草稿 skeleton 和 Admin readonly API 放到主线。下一步可以开始真实模型，但必须继续“小步、先读后写、先 skeleton 后生效”。

本计划只做拆分，不写业务代码。

## 当前可用基线

- `packages/api/src/lib/china-read-models.ts`
- `/store/china/discovery`
- `/admin/china/module-configs`
- `/admin/china/module-configs/effective`
- `packages/api/src/modules/china-product-drafts/**` 未注册 skeleton
- `packages/api/src/modules/china-service-providers/**` mock providers

## 下一轮推荐顺序

### PR U: Market Read Model Module Skeleton

范围：

- 新增 `packages/api/src/modules/china-market-read-model/**`。
- 定义 market、membership、seller role、announcement、business hours、delivery profile 的类型和 service skeleton。
- 不注册真实 module 或只注册无 migration 的纯 service skeleton，视 Medusa 模式确认。
- 不影响 Storefront、checkout 或 Vendor。

验证：

```bash
./node_modules/.bin/tsc --noEmit -p packages/api/tsconfig.json
cd packages/api && ./node_modules/.bin/medusa build
```

门禁：

- 不新增 migration。
- 不新增写 API。
- 不接 checkout。

### PR V: Market Read Model Static Adapter

范围：

- 用 static adapter 把当前 discovery seller/category/static markets 包装成 market read model。
- `/store/china/discovery` 可继续读取 builder，行为保持兼容。

门禁：

- 不改前端 UI。
- 不改查询权限。
- 不影响商品可见性。

### PR W: Market Readonly Store API

范围：

- 新增只读 Store API：
  - `GET /store/china/markets`
  - `GET /store/china/markets/:slug`
  - `GET /store/china/markets/:slug/sellers`

门禁：

- 只读。
- 不做距离、库存聚合、复杂排序。
- 不接真实搜索 provider。

### PR X: Admin Market Readonly API

范围：

- 新增只读 Admin API：
  - `GET /admin/china/markets`
  - `GET /admin/china/markets/:id`

门禁：

- 不保存。
- 不发布。
- 不改变权限。

### PR Y: Vendor Draft Product API Skeleton

范围：

- 在现有 `china-product-drafts` skeleton 基础上新增只读/写草稿 API 草案实现：
  - `POST /vendor/china/product-drafts`
  - `GET /vendor/china/product-drafts`
  - `GET /vendor/china/product-drafts/:id`
  - `PATCH /vendor/china/product-drafts/:id`

门禁：

- 只写 draft skeleton storage 或 mock service。
- 不创建 product。
- 不初始化 inventory。
- 不发布商品。
- 商户只能访问自己的 draft。

### PR Z: Admin Module Config Draft Plan To Code

范围：

- 只做 draft 写入前的 service skeleton 或 route contract。
- 如果新增写 API，必须先做 idempotency、audit、version、reason 字段。

门禁：

- 不让 config 影响 runtime。
- 不改变菜单/权限。
- 高风险 module 保持 blocked。

## 绝对不能混入的高风险内容

- payment provider。
- payment notification。
- refund。
- reconciliation。
- settlement。
- payout。
- commission。
- permission/RBAC。
- checkout shipping option。
- cart total。
- order fulfillment status。
- real logistics/waybill printing。
- real SMS/IM/live/AI providers。

## 实施原则

1. 一个 PR 只改变一个后端层次。
2. API route 先只读，写 API 另开。
3. 写 API 必须具备审计、幂等、回滚、权限说明。
4. Storefront/Vendor/Admin UI 接入必须等 read model 稳定。
5. 真实 provider 必须先 mock，再 sandbox，再 production disabled，再 production。
6. 所有实现 PR 都必须跑 API typecheck/build 和相关 unit tests。

## 需要补的任务文件

下一轮开始前建议创建：

- `.codex/tasks/market-read-model-module-skeleton.md`
- `.codex/tasks/market-read-model-static-adapter.md`
- `.codex/tasks/market-readonly-store-api.md`
- `.codex/tasks/admin-market-readonly-api.md`
- `.codex/tasks/vendor-draft-product-api-skeleton.md`
- `.codex/tasks/admin-module-config-draft-skeleton.md`

## 当前推荐下一步

先做 `market-read-model-module-skeleton`。它是最基础的真实模型前置层，但仍不接数据库 migration、不接 checkout、不影响任何交易行为。
