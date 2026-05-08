# admin-dashboard-template-v2-plan

## 目标

规划 Admin 平台运营首页 v2 模板预览，不修改页面。

## 允许修改

- `docs/admin-dashboard-template-v2-plan.md`
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

- Admin dashboard template id。
- 顶部工具靠右。
- 首页首屏密度。
- KPI、运营待办、风险提醒、快捷入口、数据来源说明。
- 不把 mock 指标当真实交易事实。
- 不替代 RBAC、审计、支付、退款、结算、佣金、打款或履约事实。
- 验证和回滚方式。

## 验证

```bash
git diff --check
git diff --name-only
```

确认没有 `apps/**` 或 `packages/**` 修改。

## 提交规则

本任务可在验证通过后提交、推送并创建 PR。
