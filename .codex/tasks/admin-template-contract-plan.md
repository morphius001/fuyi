# admin-template-contract-plan

## 目标

规划 Admin 平台运营后台模板合同，明确后续可以替换后台首页、菜单、运营看板、市场、商户、商品、提货卡、营销、风控和系统配置页面的布局，但不改变权限、审计、支付、订单、退款、结算、佣金或履约事实来源。

## 允许修改

- `docs/admin-template-contract-plan.md`
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

- Admin 首页模板合同。
- 菜单/信息架构模板合同。
- 市场运营模板合同。
- 商户管理模板合同。
- 商品审核/规格模板合同。
- 提货卡运营模板合同。
- 营销、客服、风控和系统配置模板边界。
- 模板不能替代 RBAC、审计、支付成功、订单状态、退款、结算、佣金和履约状态。

## 验证

```bash
git diff --check
git diff --name-only
```

确认没有 `apps/**` 或 `packages/**` 修改。

## 提交规则

本任务可在验证通过后提交、推送并创建 PR。
