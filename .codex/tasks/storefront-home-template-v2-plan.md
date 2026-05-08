# storefront-home-template-v2-plan

## 目标

规划 Storefront 消费者首页 v2 模板预览，不修改页面。

## 允许修改

- `docs/storefront-home-template-v2-plan.md`
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

- 首页 template id。
- 读取的 view model。
- 桌面版布局。
- 移动端 App-like 布局。
- 删除重复搜索和重复类目标题。
- 首页以市场、店铺/档口、今日鲜货、搜索为主。
- 物料供应商、配送供应商、上游供给不进入消费者首页主路径。
- 提货卡只做独立入口，不进入首页主业务流。
- 直播最多作为店铺卡片状态。
- 验证和回滚方式。

## 验证

```bash
git diff --check
git diff --name-only
```

确认没有 `apps/**` 或 `packages/**` 修改。

## 提交规则

本任务可在验证通过后提交、推送并创建 PR。
