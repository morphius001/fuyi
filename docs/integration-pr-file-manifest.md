# Integration PR File Manifest

日期：2026-05-05

本文档把 `china/integration-localization` worktree 当前 WIP 文件按后续 PR 批次归属。目标是避免把文档、UI mock、Provider skeleton、API 配置和临时本地文件混成一个不可 review 的大提交。

## 使用规则

- 提交前先按本清单挑文件，不要直接 `git add .`。
- 每个 PR 只包含一个主题的文件。
- 如果某个文件同时出现在多个主题，优先放入最早能独立验证的 PR，并在后续 PR 只追加必要改动。
- `.mercur/`、`.codex/agent-notes/`、临时日志、构建产物、真实 `.env` 不进入提交。
- 没有用户明确要求时，不自动 commit、不 push。

## PR A: Codex Workflow And Task Memory

目的：固化 Codex 后续执行方式、任务队列和安全边界。

建议包含：

```text
AGENTS.md
.codex/memory.md
.codex/queue.md
.codex/scripts/start-dev.sh
.codex/tasks/*.md
docs/china-localization-task-list.md
docs/codex-app-setup.md
docs/china-worktree-plan.md
```

注意：

- `.codex/agent-notes/` 先不要提交，除非后续要做 agent 交接审计。
- `.codex/scripts/start-dev.sh` 可以进入 PR A，因为它解决重启后后台启动找不到 `bun` 和服务恢复问题。
- 任务文件里不能写“自动 commit / push / PR”作为默认动作。

验证：

```bash
git diff --check -- AGENTS.md .codex docs/china-localization-task-list.md docs/codex-app-setup.md docs/china-worktree-plan.md
```

## PR B: Architecture And Backend Contract Docs

目的：先把当前中国本地化产品、架构、数据契约和高风险边界写清楚。

建议包含：

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
docs/integration-submit-control-panel.md
docs/integration-pr-a-preflight.md
docs/integration-pr-a-staging-commands.md
docs/integration-pr-a-submit-readiness.md
docs/integration-pr-b-preflight.md
docs/integration-pr-b-staging-commands.md
docs/integration-pr-b-submit-readiness.md
docs/integration-pr-preflight-summary.md
docs/integration-pr-file-manifest.md
docs/integration-config-and-release-boundary-audit.md
docs/integration-readiness-report.md
docs/admin-authenticated-visual-qa.md
docs/admin-i18n-static-audit.md
docs/admin-vendor-component-split-plan.md
docs/vendor-mobile-quick-listing-visual-qa.md
docs/storefront-dev-server-access-fix.md
docs/storefront-visual-qa-runbook.md
docs/visual-qa-admin-vendor-storefront.md
docs/visual-qa-round-8.md
```

注意：

- 这批只做文档，不带 `apps/**` 或 `packages/**`。
- `docs/china-localization-progress-board.md` 可以放 PR B，也可以放 PR A；建议放 PR B，因为它是集成进度记录。
- 文档里不能出现真实 app id、merchant id、access key、secret、私钥或证书。

验证：

```bash
git diff --check -- docs
```

## PR C: Admin China Operations Shell

目的：提交平台运营后台 UI/mock，不接真实后端写能力。

建议包含：

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
docs/integration-pr-c-admin-staging-commands.md
docs/integration-pr-c-admin-submit-readiness.md
```

注意：

- 只做只读运营壳、mock 表格、菜单和视觉布局。
- 不提交真实审核、冻结、退款、打款、发券、发送消息、权限改写。
- 如果这个 PR 太大，按 `C1-C4` 再拆：基础壳、运营控制台、只读表格、提货卡/规格模板。

验证：

```bash
bun --cwd apps/admin lint
bun --cwd apps/admin build
```

## PR D: Vendor China Merchant Shell

目的：提交商家后台 UI/mock 和 B 端供应链工作台壳。

建议包含：

```text
apps/vendor/src/App.tsx
apps/vendor/src/styles.css
apps/vendor/src/china/**
docs/integration-pr-d-vendor-preflight.md
docs/integration-pr-d-vendor-staging-commands.md
docs/integration-pr-d-vendor-submit-readiness.md
```

注意：

- AI 上架只能停留在草稿，不创建真实商品。
- 手机快速上架不能绕过审核、库存或商品权限。
- 物料、配送、上游、种苗、外地批发商属于 B 端能力，不进入消费者首页主链路。
- 后续应拆组件，避免 `App.tsx` 长期过大。

验证：

```bash
bun --cwd apps/vendor lint
bun --cwd apps/vendor build
```

## PR E: Storefront Market Discovery

目的：提交消费者前台找市场、找店、找货、店铺/档口页和提货卡独立入口。

建议包含：

```text
apps/storefront/public/images/local-market/**
apps/storefront/src/app/[locale]/(main)/data/**
apps/storefront/src/app/[locale]/(main)/page.tsx
apps/storefront/src/app/[locale]/(main)/search/**
apps/storefront/src/app/[locale]/(main)/sellers/[handle]/page.tsx
apps/storefront/src/app/[locale]/(main)/pickup-card/**
apps/storefront/src/components/cells/Navbar/Navbar.tsx
apps/storefront/src/components/organisms/Footer/Footer.tsx
apps/storefront/src/components/organisms/Header/Header.tsx
apps/storefront/src/components/organisms/ProductCard/ProductCard.tsx
apps/storefront/src/components/organisms/ProductListingHeader/ProductListingHeader.tsx
apps/storefront/src/components/organisms/ProductSidebar/ProductSidebar.tsx
apps/storefront/src/components/organisms/ProductsList/ProductsList.tsx
apps/storefront/src/components/molecules/ProductListingLoadingView/ProductListingLoadingView.tsx
apps/storefront/src/components/molecules/ProductListingNoResultsView/ProductListingNoResultsView.tsx
docs/integration-pr-e-storefront-discovery-preflight.md
docs/integration-pr-e-storefront-discovery-staging-commands.md
docs/integration-pr-e-storefront-discovery-submit-readiness.md
```

注意：

- 首页不要把市场物料采购放到消费者主链路。
- 提货卡保持独立入口，不做首页主模块。
- 直播最多作为店铺/档口状态标签，不做首页主模块。

验证：

```bash
bun --cwd apps/storefront lint
bun --cwd apps/storefront build
```

## PR F: Storefront Detail, Address, Cart, Checkout Copy

目的：提交商品详情、中国地址 UI、购物车和结算文案 polish。

建议包含：

```text
apps/storefront/src/app/[locale]/(checkout)/checkout/page.tsx
apps/storefront/src/app/[locale]/(main)/cart/page.tsx
apps/storefront/src/components/cells/AddressSelect/AddressSelect.tsx
apps/storefront/src/components/cells/CartItemsFooter/CartItemsFooter.tsx
apps/storefront/src/components/cells/CartItemsHeader/CartItemsHeader.tsx
apps/storefront/src/components/cells/OrderAddresses/OrderAddresses.tsx
apps/storefront/src/components/cells/ProductDetailsHeader/ProductDetailsHeader.tsx
apps/storefront/src/components/cells/ProductDetailsSeller/ProductDetailsSeller.tsx
apps/storefront/src/components/cells/ProductDetailsShipping/ProductDetailsShipping.tsx
apps/storefront/src/components/organisms/Addressess/Addresses.tsx
apps/storefront/src/components/organisms/BillingAddress/BillingAddress.tsx
apps/storefront/src/components/organisms/PromoCode/PromoCode.tsx
apps/storefront/src/components/sections/Cart/Cart.tsx
apps/storefront/src/components/sections/CartAddressSection/CartAddressSection.tsx
apps/storefront/src/components/sections/CartPaymentSection/CartPaymentSection.tsx
apps/storefront/src/components/sections/CartReview/CartReview.tsx
apps/storefront/src/components/sections/CartShippingMethodsSection/CartShippingMethodsSection.tsx
docs/integration-pr-f-storefront-checkout-detail-preflight.md
docs/integration-pr-f-storefront-checkout-detail-staging-commands.md
docs/integration-pr-f-storefront-checkout-detail-submit-readiness.md
```

注意：

- 不改 `setAddresses`、`setShippingMethod`、`initiatePaymentSession`、`placeOrder` 的真实行为。
- 支付成功仍以后端异步通知为准。
- 提货卡不是优惠码、储值余额或支付方式。

验证：

```bash
bun --cwd apps/storefront lint
bun --cwd apps/storefront build
```

## PR G: Mock China Service Providers

目的：提交未注册的 mock provider skeleton 和测试。

建议包含：

```text
packages/api/src/modules/china-service-providers/**
docs/mock-service-providers.md
docs/integration-pr-g-mock-provider-preflight.md
docs/integration-pr-g-mock-provider-staging-commands.md
docs/integration-pr-g-mock-provider-submit-readiness.md
```

注意：

- 如果 `packages/api/medusa-config.ts` 注册了 provider，就不要放在 PR G；那会把 PR G 从 skeleton 变成运行时接入。
- 不接真实腾讯 IM、环信、阿里云短信、腾讯短信、快递100、菜鸟、直播或 AI 服务。
- 不写真实凭证。

验证：

```bash
bunx tsc --noEmit --project packages/api/tsconfig.json
PATH=/home/codex/.nvm/versions/node/v24.15.0/bin:/home/codex/.bun/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin \
  npm run test:unit -- src/modules/china-service-providers/__tests__/mock-service-providers.unit.spec.ts
```

## PR H: API Config Template And Seed Safety

目的：提交 API 配置模板、seed 和 mock provider 配置占位前的安全审计结果。

建议包含：

```text
packages/api/.env.template
packages/api/medusa-config.ts
packages/api/src/scripts/seed.ts
docs/integration-config-and-release-boundary-audit.md
docs/integration-pr-h-api-config-preflight.md
docs/integration-pr-h-api-config-staging-commands.md
docs/integration-pr-h-api-config-submit-readiness.md
```

注意：

- 这是中风险 PR，必须单独 review。
- 不允许真实 app id、merchant id、token、secret、private key、证书。
- 不允许顺手改 payment、order、refund、payout、commission、permission 逻辑。
- 如果只是 `.env.template` 占位，可以合；如果注册运行时 provider，需要独立说明开关和回滚。

验证：

```bash
bunx tsc --noEmit --project packages/api/tsconfig.json
grep -R -n "sk_live\\|pk_live\\|app_secret\\|private_key\\|merchant_id" packages/api .env* || true
```

## 暂不提交

以下内容先不要提交：

```text
.codex/agent-notes/**
.mercur/**
node_modules/**
dist/**
.next/**
*.log
*.tmp
.env
.env.local
真实密钥或证书
```

原因：

- agent notes 更像本地过程痕迹，除非明确转成正式交接文档。
- `.mercur/` 需要单独确认是否是 Mercur CLI 缓存或运行时产物。
- 构建产物和依赖目录不应进入源码 PR。
- 真实环境文件和密钥绝不能提交。

## 建议提交顺序

1. PR A：Codex workflow / task memory。
2. PR B：Architecture / backend contract docs。
3. PR C：Admin UI mock。
4. PR D：Vendor UI mock。
5. PR E：Storefront discovery。
6. PR F：Storefront detail/address/cart/checkout copy。
7. PR G：Mock provider skeleton。
8. PR H：API config template / seed safety。

第一轮合并目标建议只做到 PR G。PR H 及后续真实后端接入要单独排期。
