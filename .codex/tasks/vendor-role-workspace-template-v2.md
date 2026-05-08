# vendor-role-workspace-template-v2

## 目标

小范围落地 Vendor 商户角色工作台 v2 模板预览，让商户端首页更清楚地区分普通商品商户、水果蔬菜商户、物料供应商、配送供应商、养殖户/种植户、种苗供应商和外地批发商。

## 允许修改

- `apps/vendor/**`
- `docs/vendor-role-workspace-template-v2.md`
- `.codex/queue.md`
- `project-ledger/status.md`
- `project-ledger/handoff.md`
- `project-ledger/changelog.md`

## 禁止修改

- `apps/admin/**`
- `apps/storefront/**`
- `packages/**`
- `package.json`
- `bun.lock`
- `.env`
- 真实密钥
- checkout、cart、order、payment、refund、settlement、commission、payout、permission、fulfillment runtime

## 实现要求

- 使用模板 id `vendor-role-workspace-v2`。
- 首页新增只读模板预览区，不替代真实权限或后端 feature flag。
- 明确每类角色的工作重点和禁止边界。
- 手机快速上架和 AI 草稿只停留在草稿/审核候选语义。
- 店铺装修 preview 不改变商品、库存、价格、订单和履约。
- 配送供应商接单必须保持另走权限、履约、结算、异常和日志边界。
- 所有入口只能是查看占位或跳转到现有占位页，不执行真实接单、发货、打印、发布、开播或结算。

## 验证

```bash
cd apps/vendor && bun run lint
cd apps/vendor && bun run build
git diff --check
curl -I http://127.0.0.1:7001/
```

## 提交规则

本任务可在验证通过后提交、推送并创建 PR。提交时必须排除 `docs/visual-qa-artifacts/**`。
