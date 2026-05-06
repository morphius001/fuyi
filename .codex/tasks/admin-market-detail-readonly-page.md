# admin-market-detail-readonly-page

## 目标

为 Admin 中国平台运营后台新增市场详情只读页，让运营人员可以从市场只读列表进入单个市场，查看市场基础信息、档口/商户归属、营业时间、公告和配送 profile。

## 允许修改

- `apps/admin/src/components/**`
- `apps/admin/src/routes/**`
- `apps/admin/src/i18n/**`
- `.codex/tasks/**`
- `.codex/queue.md`

## 禁止修改

- `packages/api/**`
- `apps/vendor/**`
- `apps/storefront/**`
- 支付、订单、退款、结算、佣金、权限、真实履约逻辑
- 真实微信支付、支付宝、短信、IM、物流、直播或 AI Provider
- 真实密钥

## 实现边界

- 页面只读取 `retrieveChinaAdminMarketDetail(id)`。
- 只展示 `/admin/china/markets/:id` 的 read-only market detail view。
- 不提供保存、发布、开关生效、配送生效、订单流转、权限变更等操作。
- 如果 API 不可用，页面必须显示只读 fallback / empty 状态。
- 列表页只增加“查看详情”入口。

## 验证

```bash
cd apps/admin && bun run lint
cd apps/admin && bun run build
git diff --check
```

## 提交规则

- 默认不要自动提交。
- 默认不要 push。
- 如果用户已明确进入连续 PR 流程，提交、push、开 PR 前仍需先验证通过。
