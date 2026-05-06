# PR B Preflight: Architecture And Backend Contract Docs

日期：2026-05-05

本文档记录 `china/integration-localization` worktree 第二批 PR B 的预检结果。PR B 目标是提交架构图、后端数据契约、页面覆盖、Provider 边界、提货卡架构和视觉 QA 文档，不包含 `apps/**` 或 `packages/**` 代码。

## 建议纳入 PR B 核心文档

```text
docs/china-platform-architecture-map.md
docs/china-backend-data-contract-map.md
docs/admin-china-page-coverage.md
docs/vendor-china-page-coverage.md
docs/admin-market-settings-backend-design.md
docs/admin-feature-flag-api-design.md
docs/admin-feature-flag-backend-split.md
docs/vendor-draft-product-api-design.md
docs/vendor-shop-decoration-api-design.md
docs/product-spec-model.md
docs/product-spec-template-admin-design.md
docs/pickup-card-architecture.md
docs/mock-service-providers.md
docs/integration-review-and-split-plan.md
docs/integration-pr-file-manifest.md
docs/integration-pr-a-preflight.md
docs/integration-pr-b-preflight.md
docs/integration-config-and-release-boundary-audit.md
docs/integration-readiness-report.md
docs/china-localization-progress-board.md
```

说明：

- `docs/pickup-card-architecture.md` 和 `docs/mock-service-providers.md` 也会被后续实现 PR 引用；建议先在 PR B 作为合同文档进入，后续代码 PR 只追加实现和测试。
- `docs/china-localization-progress-board.md` 建议放 PR B，因为它是当前集成状态和验证记录，不属于单纯任务入口。
- `docs/integration-pr-a-preflight.md` 和 `docs/integration-pr-b-preflight.md` 都属于拆 PR 过程的可追溯文档，可以随 PR B 一起提交。

## 可选随 PR B 纳入

```text
docs/admin-authenticated-visual-qa.md
docs/admin-i18n-static-audit.md
docs/admin-vendor-component-split-plan.md
docs/vendor-mobile-quick-listing-visual-qa.md
docs/storefront-dev-server-access-fix.md
docs/storefront-visual-qa-runbook.md
docs/visual-qa-admin-vendor-storefront.md
docs/visual-qa-round-8.md
```

建议：

- 如果希望 PR B 只聚焦架构合同，可把视觉 QA 文档拆成 `PR B2: Visual QA Runbooks`。
- 如果希望第一批文档一次性落库，可随 PR B 纳入；这些文档不改变运行时。

## 建议排除 PR B

```text
AGENTS.md
.codex/**
apps/**
packages/**
docs/china-localization-task-list.md
docs/codex-app-setup.md
docs/china-worktree-plan.md
docs/mechanical-closeout-commands.md
docs/mechanical-wip-closeout-plan.md
.mercur/**
node_modules/**
dist/**
.next/**
.env
.env.local
真实密钥或证书
```

说明：

- `AGENTS.md`、`.codex/**`、基础任务规划属于 PR A。
- `apps/**`、`packages/**` 属于后续 UI、Provider 或 API 配置 PR。
- `mechanical-*` 是过程收口文档，当前不建议进入正式架构合同 PR；如要保留，应先整理为正式 runbook。
- `.mercur/**` 当前来源未确认，不进入 PR B。

## 风险扫描结果

已对 PR B 建议文档范围扫描：

- `secret`、`merchant_id`、`private_key`、`access_key` 等命中均为字段名、示例占位、风险说明或“不写真实密钥”的规则。
- 未发现真实生产密钥、真实 app id、真实商户号、真实私钥、真实证书或真实 Provider 凭证。
- 发现 `docs/pickup-card-architecture.md` 第 3 行尾随空白，已修复。
- PR B 文档范围 `git diff --check -- docs` 通过。

需要人工关注：

- `docs/integration-config-and-release-boundary-audit.md` 明确指出本地存在 `supersecret`、`pk_mock_visual_qa`、localhost 等开发占位；这是审计发现，不是生产配置建议。
- `docs/admin-feature-flag-api-design.md` 里有 `merchant_id` 示例字段；应保持为合同字段，不代表真实商户号。
- `docs/pickup-card-architecture.md` 使用 `secret_hash`、`secret_salt` 等字段名，这是提货卡安全模型字段，不是密钥值。

## PR B 提交前命令

只做预检，不自动提交：

```bash
git status --short -- docs
git diff --check -- docs
.codex/scripts/start-dev.sh status
```

如要 staged，应按核心文档或可选文档显式添加，不要使用 `git add docs` 直接全收。

## 当前结论

PR B 可以作为第二批准备对象，推荐拆法：

- `PR B1`：架构、后端合同、页面覆盖、Provider/提货卡合同、集成拆分文档。
- `PR B2`：视觉 QA、浏览器访问、移动端验收 runbook。

如果用户想减少 PR 数量，也可以合成一个纯 docs PR；但仍应排除 `mechanical-*` 和所有 `apps/**`、`packages/**`。
