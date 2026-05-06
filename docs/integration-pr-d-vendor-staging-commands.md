# PR D Staging Commands: Vendor China Merchant Shell

日期：2026-05-05

本文档只列出 PR D 的显式 staging 命令。当前未执行 `git add`、未 commit、未 push。PR D 是 Vendor 中国商家后台 UI/mock 批次，不应包含 Admin、Storefront、API 后端或通用架构文档。

## 原则

- 不使用 `git add .`。
- 不加入 `apps/admin/**`、`apps/storefront/**`、`packages/**`。
- 不加入 `.codex/**`、`.mercur/**`。
- PR D 只做商家后台 UI/mock，不创建真实商品、订单、发货、退款、结算或 Provider 调用。
- 当前 Vendor 主要逻辑集中在 `App.tsx`，D1-D4 更适合作为 review 分组；真正拆组件应后续单独做。

## 预检命令

```bash
git status --short -- apps/vendor docs/integration-pr-d-vendor-preflight.md
git diff --check -- apps/vendor docs/integration-pr-d-vendor-preflight.md
bun --cwd apps/vendor lint
bun --cwd apps/vendor build
.codex/scripts/start-dev.sh status
```

## 推荐 PR D staging

```bash
git add -- apps/vendor/src/App.tsx
git add -- apps/vendor/src/styles.css
git add -- apps/vendor/src/china
git add -- docs/integration-pr-d-vendor-preflight.md
git add -- docs/integration-pr-d-vendor-staging-commands.md
```

## Review 分组

虽然 staging 建议作为一个 Vendor UI baseline，但 review 时按以下分组看：

### D1 Vendor 首页与菜单能力

- `apps/vendor/src/App.tsx`
- `apps/vendor/src/china/data/vendorMockData.ts`
- `apps/vendor/src/styles.css`

关注：

- 商户首页是否像工作台。
- 市场选择、商户类型、模块开关是否只做 mock 展示。

### D2 手机快速上架和 AI 草稿

- `apps/vendor/src/App.tsx`
- `apps/vendor/src/china/data/vendorMockData.ts`
- `apps/vendor/src/styles.css`

关注：

- 快速上架是否足够移动端友好。
- AI 草稿是否明确需要商户确认，不能自动发布。

### D3 店铺装修壳

- `apps/vendor/src/App.tsx`
- `apps/vendor/src/china/data/vendorMockData.ts`
- `apps/vendor/src/styles.css`

关注：

- 店铺/档口主页装修是否覆盖店招、公告、今日鲜货、资质、配送说明和直播状态。
- 不保存真实装修、不发布真实店铺页。

### D4 B 端供应链壳

- `apps/vendor/src/App.tsx`
- `apps/vendor/src/china/data/vendorMockData.ts`
- `apps/vendor/src/styles.css`

关注：

- 物料、配送、养殖户、种植户、种苗、外地批发商入口是否明显是 B 端能力。
- 不进入消费者前台主链路。

## 明确排除

```bash
git restore --staged -- AGENTS.md 2>/dev/null || true
git restore --staged -- .codex 2>/dev/null || true
git restore --staged -- apps/admin 2>/dev/null || true
git restore --staged -- apps/storefront 2>/dev/null || true
git restore --staged -- packages 2>/dev/null || true
git restore --staged -- .mercur 2>/dev/null || true
git restore --staged -- docs/vendor-draft-product-api-design.md 2>/dev/null || true
git restore --staged -- docs/vendor-shop-decoration-api-design.md 2>/dev/null || true
git restore --staged -- docs/vendor-china-page-coverage.md 2>/dev/null || true
git restore --staged -- docs/integration-pr-a-preflight.md 2>/dev/null || true
git restore --staged -- docs/integration-pr-b-preflight.md 2>/dev/null || true
git restore --staged -- docs/integration-pr-c-admin-preflight.md 2>/dev/null || true
git restore --staged -- docs/integration-pr-file-manifest.md 2>/dev/null || true
```

说明：

- 以上命令只取消 staging，不改工作区内容。
- Vendor API 合同和页面覆盖文档属于 PR B。

## staged 后检查

```bash
git diff --cached --name-status
git diff --cached --check
git diff --cached --name-only | grep -E '^(AGENTS\\.md|\\.codex/|apps/admin/|apps/storefront/|packages/|\\.mercur/)' && exit 1 || true
```

预期 staged 文件只应属于：

```text
apps/vendor/**
docs/integration-pr-d-vendor-preflight.md
docs/integration-pr-d-vendor-staging-commands.md
```

## commit 说明建议

如果用户明确要求 commit，建议提交信息：

```text
feat(vendor): add China merchant dashboard shell
```

不要自动 commit；只有用户明确说“提交 PR D”或“commit PR D”时才执行。
