# vendor-role-workspace-template-v2-plan

## 目标

规划 Vendor 商户角色工作台 v2 模板预览，不修改页面。

## 允许修改

- `docs/vendor-role-workspace-template-v2-plan.md`
- `.codex/queue.md`
- `project-ledger/status.md`
- `project-ledger/handoff.md`
- `project-ledger/changelog.md`

## 禁止修改

- `apps/**`
- `packages/**`
- `package.json`
- `bun.lock`
- `.env`
- 真实密钥
- checkout、cart、order、payment、refund、settlement、commission、payout、permission、fulfillment runtime

## 必须覆盖

- Vendor role workspace template id。
- 普通商户、水果蔬菜商户、物料供应商、配送供应商、养殖户/种植户、种苗供应商、外地批发商。
- 手机快速上架和 AI 草稿只是草稿/审核候选。
- 店铺装修 preview 不改变商品、库存、价格、订单和履约。
- 配送供应商接单必须另走权限、履约、结算、异常和日志边界。
- 验证和回滚方式。

## 验证

```bash
git diff --check
git diff --name-only
```

确认没有 `apps/**` 或 `packages/**` 修改。

## 提交规则

本任务可在验证通过后提交、推送并创建 PR。
