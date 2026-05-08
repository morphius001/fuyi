# storefront-shop-template-v2-plan

## 目标

规划 Storefront 店铺/档口主页 v2 模板预览，不修改页面。

## 允许修改

- `docs/storefront-shop-template-v2-plan.md`
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

- 店铺页 template id。
- 读取的 view model。
- 店铺头部：市场、档口号、营业状态、公告、配送/自提方式。
- 商品列表和商品卡信息边界。
- 配送方式属于店铺/档口能力，商品卡只做轻提示。
- 店铺装修和直播状态位置。
- 移动端店铺页布局。
- 验证和回滚方式。

## 验证

```bash
git diff --check
git diff --name-only
```

确认没有 `apps/**` 或 `packages/**` 修改。

## 提交规则

本任务可在验证通过后提交、推送并创建 PR。
