# PR E Staging Commands: Storefront Market Discovery

日期：2026-05-05

本文档只列出 PR E 的显式 staging 命令。当前未执行 `git add`、未 commit、未 push。PR E 是消费者前台发现链路批次，聚焦首页、搜索、店铺/档口页、提货卡独立入口和本地市场图片资源。

## 原则

- 不使用 `git add .`。
- 不加入购物车、地址、商品详情、结算文案文件；这些属于 PR F。
- 不加入 `apps/admin/**`、`apps/vendor/**`、`packages/**`。
- 不把市场物料采购放进消费者首页主链路。
- 提货卡保持独立入口，不进入优惠券、折扣、储值、支付或购物车抵扣链路。

## 预检命令

```bash
git status --short -- \
  apps/storefront/public/images/local-market \
  apps/storefront/src/app/[locale]/\\(main\\)/data \
  apps/storefront/src/app/[locale]/\\(main\\)/page.tsx \
  apps/storefront/src/app/[locale]/\\(main\\)/search \
  apps/storefront/src/app/[locale]/\\(main\\)/sellers/[handle]/page.tsx \
  apps/storefront/src/app/[locale]/\\(main\\)/pickup-card \
  apps/storefront/src/components/cells/Navbar/Navbar.tsx \
  apps/storefront/src/components/organisms/Footer/Footer.tsx \
  apps/storefront/src/components/organisms/Header/Header.tsx \
  apps/storefront/src/components/organisms/ProductCard/ProductCard.tsx \
  apps/storefront/src/components/organisms/ProductListingHeader/ProductListingHeader.tsx \
  apps/storefront/src/components/organisms/ProductSidebar/ProductSidebar.tsx \
  apps/storefront/src/components/organisms/ProductsList/ProductsList.tsx \
  apps/storefront/src/components/molecules/ProductListingLoadingView/ProductListingLoadingView.tsx \
  apps/storefront/src/components/molecules/ProductListingNoResultsView/ProductListingNoResultsView.tsx \
  docs/integration-pr-e-storefront-discovery-preflight.md

git diff --check -- apps/storefront docs/integration-pr-e-storefront-discovery-preflight.md
bun --cwd apps/storefront lint
bun --cwd apps/storefront build
.codex/scripts/start-dev.sh status
```

## 推荐 PR E staging

```bash
git add -- apps/storefront/public/images/local-market
git add -- apps/storefront/src/app/[locale]/\\(main\\)/data
git add -- apps/storefront/src/app/[locale]/\\(main\\)/page.tsx
git add -- apps/storefront/src/app/[locale]/\\(main\\)/search
git add -- apps/storefront/src/app/[locale]/\\(main\\)/sellers/[handle]/page.tsx
git add -- apps/storefront/src/app/[locale]/\\(main\\)/pickup-card
git add -- apps/storefront/src/components/cells/Navbar/Navbar.tsx
git add -- apps/storefront/src/components/organisms/Footer/Footer.tsx
git add -- apps/storefront/src/components/organisms/Header/Header.tsx
git add -- apps/storefront/src/components/organisms/ProductCard/ProductCard.tsx
git add -- apps/storefront/src/components/organisms/ProductListingHeader/ProductListingHeader.tsx
git add -- apps/storefront/src/components/organisms/ProductSidebar/ProductSidebar.tsx
git add -- apps/storefront/src/components/organisms/ProductsList/ProductsList.tsx
git add -- apps/storefront/src/components/molecules/ProductListingLoadingView/ProductListingLoadingView.tsx
git add -- apps/storefront/src/components/molecules/ProductListingNoResultsView/ProductListingNoResultsView.tsx
git add -- docs/integration-pr-e-storefront-discovery-preflight.md
git add -- docs/integration-pr-e-storefront-discovery-staging-commands.md
```

## 明确排除

```bash
git restore --staged -- AGENTS.md 2>/dev/null || true
git restore --staged -- .codex 2>/dev/null || true
git restore --staged -- apps/admin 2>/dev/null || true
git restore --staged -- apps/vendor 2>/dev/null || true
git restore --staged -- packages 2>/dev/null || true
git restore --staged -- .mercur 2>/dev/null || true
git restore --staged -- apps/storefront/src/app/[locale]/\\(checkout\\)/checkout/page.tsx 2>/dev/null || true
git restore --staged -- apps/storefront/src/app/[locale]/\\(main\\)/cart/page.tsx 2>/dev/null || true
git restore --staged -- apps/storefront/src/components/cells/AddressSelect/AddressSelect.tsx 2>/dev/null || true
git restore --staged -- apps/storefront/src/components/cells/CartItemsFooter/CartItemsFooter.tsx 2>/dev/null || true
git restore --staged -- apps/storefront/src/components/cells/CartItemsHeader/CartItemsHeader.tsx 2>/dev/null || true
git restore --staged -- apps/storefront/src/components/cells/OrderAddresses/OrderAddresses.tsx 2>/dev/null || true
git restore --staged -- apps/storefront/src/components/cells/ProductDetailsHeader/ProductDetailsHeader.tsx 2>/dev/null || true
git restore --staged -- apps/storefront/src/components/cells/ProductDetailsSeller/ProductDetailsSeller.tsx 2>/dev/null || true
git restore --staged -- apps/storefront/src/components/cells/ProductDetailsShipping/ProductDetailsShipping.tsx 2>/dev/null || true
git restore --staged -- apps/storefront/src/components/organisms/Addressess/Addresses.tsx 2>/dev/null || true
git restore --staged -- apps/storefront/src/components/organisms/BillingAddress/BillingAddress.tsx 2>/dev/null || true
git restore --staged -- apps/storefront/src/components/organisms/PromoCode/PromoCode.tsx 2>/dev/null || true
git restore --staged -- apps/storefront/src/components/sections/Cart 2>/dev/null || true
```

说明：

- 以上命令只取消 staging，不改工作区内容。
- PR F 文件触达购物车/结算，必须和 PR E 分开。

## staged 后检查

```bash
git diff --cached --name-status
git diff --cached --check
git diff --cached --name-only | grep -E '^(AGENTS\\.md|\\.codex/|apps/admin/|apps/vendor/|packages/|\\.mercur/)' && exit 1 || true
git diff --cached --name-only | grep -E 'apps/storefront/src/(app/\\[locale\\]/\\(checkout\\)|app/\\[locale\\]/\\(main\\)/cart|components/(cells/(AddressSelect|CartItems|OrderAddresses|ProductDetails)|organisms/(Addressess|BillingAddress|PromoCode)|sections/Cart))' && exit 1 || true
```

预期 staged 文件只应属于：

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
```

## commit 说明建议

如果用户明确要求 commit，建议提交信息：

```text
feat(storefront): add China market discovery experience
```

不要自动 commit；只有用户明确说“提交 PR E”或“commit PR E”时才执行。
