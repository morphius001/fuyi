# admin-dashboard-template-v2

## 目标

落地 Admin 平台运营首页 v2 的第一版展示层，把首页调整为国内平台运营后台常见结构：右侧工具、紧凑 KPI、运营待办、风险提醒、快捷入口、近期重点模块和数据来源说明。

## 允许修改

- `apps/admin/src/components/ChinaAdminDashboard.tsx`
- `apps/admin/src/lib/china-admin-dashboard-data.ts`
- `apps/admin/src/i18n/zh-CN.json`
- `apps/admin/src/i18n/en.json`
- `docs/admin-dashboard-template-v2.md`
- `.codex/queue.md`
- `project-ledger/status.md`
- `project-ledger/handoff.md`
- `project-ledger/changelog.md`

## 禁止修改

- `packages/api/**`
- `apps/storefront/**`
- `apps/vendor/**`
- `package.json`
- `bun.lock`
- `.env`
- 真实密钥
- RBAC、audit、order、payment、refund、settlement、commission、payout、permission、fulfillment runtime

## 实现要求

- 顶部工具靠右，不能插在标题正文中间。
- KPI 必须紧凑，首屏能看到待办和风险。
- 页面明确展示数据来源，不能把展示指标当真实交易事实。
- 待办、风险、快捷入口和重点模块只做只读展示或禁用入口，不执行高风险动作。
- 无 `chinaAdmin.*` i18n key 泄漏。

## 验证

```bash
cd apps/admin && bun run lint
cd apps/admin && bun run build
git diff --check
curl -s -o /tmp/fuyi-admin-dashboard.html -w "%{http_code}\n" http://127.0.0.1:7000/dashboard/cn
```

建议保存桌面截图到 `docs/visual-qa-artifacts/`，截图产物不纳入提交。

## 提交规则

验证通过后可以提交、推送并创建 PR。PR 必须说明本轮未改权限、审计、订单、支付、退款、结算、佣金、打款或履约逻辑。
