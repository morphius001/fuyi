# storefront-template-contract-plan

## 目标

规划 Storefront 消费者端模板合同，明确后续首页、搜索页、店铺页、商品页和提货卡页如何换模板，但不改变数据合同和交易链路。

## 允许修改

- `docs/storefront-template-contract-plan.md`
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

- 消费者首页模板合同。
- 搜索/类目模板合同。
- 店铺/档口主页模板合同。
- 商品详情模板合同。
- 提货卡独立页模板合同。
- 移动端 App-like 模板合同。
- 物料供应商、配送供应商、上游供应关系在消费者端默认隐藏。
- 提货卡不进入普通购物车抵扣。
- 直播只作为店铺状态，不作为首页主入口。
- 配送方式提示应挂在店铺/档口和结算确认，不作为商品核心卖点。

## 验证

```bash
git diff --check
git diff --name-only
```

确认没有 `apps/**` 或 `packages/**` 修改。

## 提交规则

本任务可在验证通过后提交、推送并创建 PR。
