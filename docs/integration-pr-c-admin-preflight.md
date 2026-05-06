# PR C Preflight: Admin China Operations Shell

日期：2026-05-05

本文档记录 `china/integration-localization` worktree 第三批 PR C 的预检结果。PR C 目标是提交中国平台运营后台 UI/mock：菜单、首页、运营控制台、提货卡、规格模板、只读运营表格和 i18n。PR C 不接真实后端写能力，不修改订单、支付、退款、结算、佣金或权限业务逻辑。

## 建议纳入 PR C

```text
apps/admin/src/components/ChinaAdminDashboard.tsx
apps/admin/src/components/ChinaAdminOperationsConsole.tsx
apps/admin/src/components/ChinaAdminPageShell.tsx
apps/admin/src/components/ChinaAdminPageShellSections.tsx
apps/admin/src/components/ChinaAdminProductSpecTemplates.tsx
apps/admin/src/components/ChinaAdminShell.tsx
apps/admin/src/components/ChinaAdminSidebar.tsx
apps/admin/src/components/PickupCardDashboard.tsx
apps/admin/src/components/china-ops/**
apps/admin/src/i18n/en.json
apps/admin/src/i18n/zh-CN.json
apps/admin/src/i18n/use-china-admin-translation.ts
apps/admin/src/lib/china-admin-*.ts
apps/admin/src/routes/[section]/[page]/page.tsx
apps/admin/src/routes/cn/**
apps/admin/src/styles/china-admin.css
apps/admin/vite.config.ts
docs/integration-pr-c-admin-preflight.md
```

## 建议排除 PR C

```text
AGENTS.md
.codex/**
apps/vendor/**
apps/storefront/**
packages/**
docs/integration-pr-a-preflight.md
docs/integration-pr-b-preflight.md
docs/integration-pr-file-manifest.md
docs/china-backend-data-contract-map.md
docs/china-platform-architecture-map.md
.mercur/**
dist/**
node_modules/**
.env
.env.local
```

说明：

- PR C 只提交 Admin 运行时代码和本预检文档。
- 架构合同文档属于 PR B，商家后台属于 PR D，消费者前台属于 PR E/F，Provider 和 API 配置属于 PR G/H。

## 当前 Admin 文件分组

建议 review 时按以下逻辑拆看：

| 分组 | 文件 | 说明 |
| --- | --- | --- |
| 基础壳 | `ChinaAdminShell.tsx`、`ChinaAdminSidebar.tsx`、`china-admin-menu.ts`、`china-admin-sidebar-sections.ts`、`china-admin.css` | 中国平台运营后台菜单、侧边栏、顶部区和基础布局。 |
| i18n | `zh-CN.json`、`en.json`、`use-china-admin-translation.ts` | 修复 `chinaAdmin.*` key 展示问题，避免直接显示翻译 key。 |
| 首页与运营控制台 | `ChinaAdminDashboard.tsx`、`ChinaAdminOperationsConsole.tsx`、`china-admin-dashboard-data.ts`、`components/china-ops/**` | 平台首页、模块开关、市场能力、商户角色能力、Provider 准备度。 |
| 通用页面壳 | `ChinaAdminPageShell.tsx`、`ChinaAdminPageShellSections.tsx`、`routes/[section]/[page]/page.tsx` | 动态菜单页面和只读运营表格框架。 |
| 表格数据 | `china-admin-table-*.ts` | 各业务域 mock 表格、状态、列定义和基础行数据。 |
| 提货卡 | `PickupCardDashboard.tsx`、`china-admin-pickup-card-data.ts`、`china-admin-table-pickup-card-tables.ts` | 提货卡看板和细分页，只读展示，不触发真实提货/发货/退款。 |
| 规格模板 | `ChinaAdminProductSpecTemplates.tsx`、`china-admin-spec-template-data.ts` | 商品规格模板只读控制台，不保存模板、不发布商品。 |

## 可选再拆 PR

如果 PR C 太大，建议拆成：

1. `C1 Admin 基础壳与菜单`
2. `C2 Admin 首页与运营控制台`
3. `C3 Admin 通用只读表格数据`
4. `C4 Admin 提货卡与规格模板`

每个拆分 PR 都需要单独跑 `bun --cwd apps/admin lint` 和 `bun --cwd apps/admin build`。

## 风险边界

PR C 允许：

- 中文运营菜单。
- 平台运营首页 mock 指标。
- 市场、模块、商户类型和 Provider 准备度只读展示。
- 商户、商品、订单、售后、支付对账、结算、营销、客服、风控、系统配置的只读 mock 表格。
- 提货卡作为实体卡提货权益的只读管理壳。

PR C 禁止：

- 真实入驻审核、冻结、处罚、权限变更。
- 真实上架、下架、库存或价格改写。
- 真实订单状态、履约状态或支付状态改写。
- 真实退款、对账、结算、提现、佣金或打款。
- 真实短信、IM、物流、电子面单、直播或 AI 服务。
- 写入真实 app id、merchant id、token、access key、secret、私钥或证书。

## 已执行验证

```bash
/home/codex/.bun/bin/bun --cwd apps/admin lint
/home/codex/.bun/bin/bun --cwd apps/admin build
git diff --check -- apps/admin
```

结果：

- Admin lint：通过。
- Admin build：通过。
- Admin build 仍有既有 Vite chunk size warning，未在本 PR C 预检中处理。
- `git diff --check -- apps/admin`：通过。

## 仍需人工视觉确认

- 登录后打开 `http://127.0.0.1:7000/dashboard/cn`，确认首页不是订单列表样式。
- 查看顶部工具区是否靠右且不占据中间视觉重心。
- 查看提货卡页面是否是运营看板/列表，而不是大块松散详情。
- 随机点订单、支付对账、结算、风控、系统配置细分页，确认均为只读 mock 展示。
- 侧边栏中文菜单在窄屏和滚动状态下不遮挡内容。

## 当前结论

PR C 可以进入准备阶段，但建议先让用户在登录态浏览器里确认 Admin 首页、提货卡和几个高频细分页的排版满意后再提交。代码层面当前 lint/build/diff-check 已通过。
