# vendor-template-contract-plan

## 目标

规划 Vendor 商户后台模板合同，明确后续商户首页、商品、订单、售后、店铺装修、手机快速上架、AI 草稿、物料采购、配送供应商和上游供给角色如何模板化。

## 允许修改

- `docs/vendor-template-contract-plan.md`
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

- Vendor 首页模板合同。
- 商户角色切换模板合同。
- 手机快速上架模板合同。
- AI 上架草稿模板合同。
- 店铺装修模板合同。
- 普通商户、物料供应商、配送供应商、养殖户/种植户、种苗供应商、外地批发商的模板边界。
- 物料采购面向商户，不进入消费者首页。
- 配送供应商可接单必须后续单独做权限、履约和结算边界。
- 模板不能直接确认发货、退款、结算、打款、改佣金或改权限。

## 验证

```bash
git diff --check
git diff --name-only
```

确认没有 `apps/**` 或 `packages/**` 修改。

## 提交规则

本任务可在验证通过后提交、推送并创建 PR。
