# template-registry-surface-binding-plan

## 目标

规划 Storefront、Admin、Vendor 三端如何从统一 template registry / stable view model 读取 template v2，而不是继续把模板 id、模块顺序和可见性写散在页面里。

## 允许修改

- `docs/template-registry-surface-binding-plan.md`
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

- 当前 template registry contract 仍是只读 v1 skeleton。
- Storefront 首页/店铺页 v2 如何绑定 registry。
- Admin 首页 v2 如何绑定 registry。
- Vendor 多角色经营看板 v2 如何绑定 registry。
- template id、view model、slots、visibility、fallback/rollback 的职责边界。
- 不把 registry 当 RBAC、feature flag、支付、订单、履约、结算或权限事实来源。
- 后续 PR 拆分和验证方式。

## 验证

```bash
git diff --check
git diff --name-only
```

确认没有 `apps/**` 或 `packages/**` 修改。

## 提交规则

本任务可在验证通过后提交、推送并创建 PR。提交时必须排除 `docs/visual-qa-artifacts/**`。
