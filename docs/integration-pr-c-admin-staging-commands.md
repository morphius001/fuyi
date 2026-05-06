# PR C Staging Commands: Admin China Operations Shell

日期：2026-05-05

本文档只列出 PR C 的显式 staging 命令。当前未执行 `git add`、未 commit、未 push。PR C 是 Admin 中国运营后台 UI/mock 批次，不应包含 Vendor、Storefront、API 后端或通用架构文档。

## 原则

- 不使用 `git add .`。
- 不加入 `apps/vendor/**`、`apps/storefront/**`、`packages/**`。
- 不加入 `.codex/**`、`.mercur/**`。
- 不加入真实 `.env`、密钥、构建产物或依赖目录。
- PR C 只做 Admin UI/mock，不接真实后端写能力。

## 预检命令

```bash
git status --short -- apps/admin docs/integration-pr-c-admin-preflight.md
git diff --check -- apps/admin docs/integration-pr-c-admin-preflight.md
bun --cwd apps/admin lint
bun --cwd apps/admin build
.codex/scripts/start-dev.sh status
```

## 整体 PR C staging

如果选择一个 Admin 大 PR：

```bash
git add -- apps/admin/src/components/ChinaAdminDashboard.tsx
git add -- apps/admin/src/components/ChinaAdminOperationsConsole.tsx
git add -- apps/admin/src/components/ChinaAdminPageShell.tsx
git add -- apps/admin/src/components/ChinaAdminPageShellSections.tsx
git add -- apps/admin/src/components/ChinaAdminProductSpecTemplates.tsx
git add -- apps/admin/src/components/ChinaAdminShell.tsx
git add -- apps/admin/src/components/ChinaAdminSidebar.tsx
git add -- apps/admin/src/components/PickupCardDashboard.tsx
git add -- apps/admin/src/components/china-ops
git add -- apps/admin/src/i18n/en.json
git add -- apps/admin/src/i18n/zh-CN.json
git add -- apps/admin/src/i18n/use-china-admin-translation.ts
git add -- apps/admin/src/lib/china-admin-dashboard-data.ts
git add -- apps/admin/src/lib/china-admin-icon-maps.ts
git add -- apps/admin/src/lib/china-admin-menu.ts
git add -- apps/admin/src/lib/china-admin-pickup-card-data.ts
git add -- apps/admin/src/lib/china-admin-sidebar-sections.ts
git add -- apps/admin/src/lib/china-admin-spec-template-data.ts
git add -- apps/admin/src/lib/china-admin-table-*.ts
git add -- apps/admin/src/routes/[section]/[page]/page.tsx
git add -- apps/admin/src/routes/cn
git add -- apps/admin/src/styles/china-admin.css
git add -- apps/admin/vite.config.ts
git add -- docs/integration-pr-c-admin-preflight.md
git add -- docs/integration-pr-c-admin-staging-commands.md
```

## 可选 C1-C4 拆分 staging

### C1 Admin 基础壳与菜单

```bash
git add -- apps/admin/src/components/ChinaAdminShell.tsx
git add -- apps/admin/src/components/ChinaAdminSidebar.tsx
git add -- apps/admin/src/i18n/en.json
git add -- apps/admin/src/i18n/zh-CN.json
git add -- apps/admin/src/i18n/use-china-admin-translation.ts
git add -- apps/admin/src/lib/china-admin-menu.ts
git add -- apps/admin/src/lib/china-admin-sidebar-sections.ts
git add -- apps/admin/src/lib/china-admin-icon-maps.ts
git add -- apps/admin/src/routes/cn
git add -- apps/admin/src/styles/china-admin.css
git add -- apps/admin/vite.config.ts
```

### C2 Admin 首页与运营控制台

```bash
git add -- apps/admin/src/components/ChinaAdminDashboard.tsx
git add -- apps/admin/src/components/ChinaAdminOperationsConsole.tsx
git add -- apps/admin/src/components/china-ops
git add -- apps/admin/src/lib/china-admin-dashboard-data.ts
```

### C3 Admin 通用只读表格数据

```bash
git add -- apps/admin/src/components/ChinaAdminPageShell.tsx
git add -- apps/admin/src/components/ChinaAdminPageShellSections.tsx
git add -- apps/admin/src/lib/china-admin-table-*.ts
git add -- apps/admin/src/routes/[section]/[page]/page.tsx
```

### C4 Admin 提货卡与规格模板

```bash
git add -- apps/admin/src/components/PickupCardDashboard.tsx
git add -- apps/admin/src/components/ChinaAdminProductSpecTemplates.tsx
git add -- apps/admin/src/lib/china-admin-pickup-card-data.ts
git add -- apps/admin/src/lib/china-admin-spec-template-data.ts
git add -- apps/admin/src/lib/china-admin-table-pickup-card-tables.ts
```

## 明确排除

```bash
git restore --staged -- AGENTS.md 2>/dev/null || true
git restore --staged -- .codex 2>/dev/null || true
git restore --staged -- apps/vendor 2>/dev/null || true
git restore --staged -- apps/storefront 2>/dev/null || true
git restore --staged -- packages 2>/dev/null || true
git restore --staged -- .mercur 2>/dev/null || true
git restore --staged -- docs/integration-pr-a-preflight.md 2>/dev/null || true
git restore --staged -- docs/integration-pr-b-preflight.md 2>/dev/null || true
git restore --staged -- docs/integration-pr-file-manifest.md 2>/dev/null || true
git restore --staged -- docs/china-backend-data-contract-map.md 2>/dev/null || true
git restore --staged -- docs/china-platform-architecture-map.md 2>/dev/null || true
```

说明：

- 以上命令只取消 staging，不改工作区内容。
- 架构合同文档属于 PR B。
- 其它端和 API 配置分别属于 PR D-H。

## staged 后检查

```bash
git diff --cached --name-status
git diff --cached --check
git diff --cached --name-only | grep -E '^(AGENTS\\.md|\\.codex/|apps/vendor/|apps/storefront/|packages/|\\.mercur/|docs/(?!integration-pr-c-admin-).*)' && exit 1 || true
```

如果 shell 不支持负向前瞻，使用更简单的检查：

```bash
git diff --cached --name-only | grep -E '^(AGENTS\\.md|\\.codex/|apps/vendor/|apps/storefront/|packages/|\\.mercur/)' && exit 1 || true
```

预期 staged 文件只应属于：

```text
apps/admin/**
docs/integration-pr-c-admin-preflight.md
docs/integration-pr-c-admin-staging-commands.md
```

## commit 说明建议

如果用户明确要求 commit，建议提交信息：

```text
feat(admin): add China operations dashboard shell
```

不要自动 commit；只有用户明确说“提交 PR C”或“commit PR C”时才执行。
