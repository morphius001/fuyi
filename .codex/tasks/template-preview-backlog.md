# template-preview-backlog

## 目标

规划第九十七轮模板预览 backlog，让后续 Storefront/Admin/Vendor 页面实现按模板 id、预览、验证和回滚推进。

## 允许修改

- `docs/template-preview-backlog.md`
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

- Storefront 首页 v2 模板预览。
- Storefront 店铺页 v2 模板预览。
- Admin 首页 v2 模板预览。
- Vendor 角色工作台 v2 模板预览。
- Template preview validation。
- 每个模板实现前必须有模板 id、读取 view model、隐藏能力、验证方式和回滚方式。

## 验证

```bash
git diff --check
git diff --name-only
```

确认没有 `apps/**` 或 `packages/**` 修改。

## 提交规则

本任务可在验证通过后提交、推送并创建 PR。
