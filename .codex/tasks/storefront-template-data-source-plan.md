# storefront-template-data-source-plan

## 目标

规划消费者首页和店铺页如何从静态展示数据逐步切到真实只读 discovery / market / seller read model，不修改页面或 API。

## 允许修改

- `docs/storefront-template-data-source-plan.md`
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

- 当前 Storefront 静态数据文件和已存在只读 API。
- 首页从静态 `home-market` 数据迁到 home view model 的步骤。
- 店铺页从 seller metadata / 静态档口展示迁到 seller/shop view model 的步骤。
- 搜索页和类目入口的关联。
- fallback 策略。
- 不影响 cart、checkout、shipping options、payment、order、refund、settlement、commission、permission。
- 后续 PR 拆分和验证方式。

## 验证

```bash
git diff --check
git diff --name-only
```

确认没有 `apps/**` 或 `packages/**` 修改。

## 提交规则

本任务可在验证通过后提交、推送并创建 PR。提交时必须排除 `docs/visual-qa-artifacts/**`。
