# PR F Staging Commands: Storefront Detail, Address, Cart, Checkout Copy

日期：2026-05-05

本文档只列出 PR F 的显式 staging 命令。当前未执行 `git add`、未 commit、未 push。PR F 是消费者前台交易前后文案和界面 polish 批次，聚焦商品详情、中国地址 UI、购物车和结算页展示，不改变真实 checkout、支付、订单创建或地址保存行为。

## 原则

- 不使用 `git add .`。
- 不加入首页、搜索、店铺/档口页、提货卡独立入口；这些属于 PR E。
- 不加入 `apps/admin/**`、`apps/vendor/**`、`packages/**`。
- 不改 `setAddresses`、`setShippingMethod`、`initiatePaymentSession`、`placeOrder` 的真实业务语义。
- 支付成功仍以后端异步通知为准，前端页面只显示状态或引导。
- 提货卡不是优惠码、储值余额、支付方式或购物车抵扣能力。

## 预检命令

```bash
git status --short -- \
  apps/storefront/src/app/[locale]/\\(checkout\\)/checkout/page.tsx \
  apps/storefront/src/app/[locale]/\\(main\\)/cart/page.tsx \
  apps/storefront/src/app/[locale]/\\(main\\)/products/[handle]/page.tsx \
  apps/storefront/src/components/cells/AddressSelect/AddressSelect.tsx \
  apps/storefront/src/components/cells/CartItemsFooter/CartItemsFooter.tsx \
  apps/storefront/src/components/cells/CartItemsHeader/CartItemsHeader.tsx \
  apps/storefront/src/components/cells/ProductAdditionalAttributes/ProductAdditionalAttributes.tsx \
  apps/storefront/src/components/cells/OrderAddresses/OrderAddresses.tsx \
  apps/storefront/src/components/cells/ProductDetailsHeader/ProductDetailsHeader.tsx \
  apps/storefront/src/components/cells/ProductDetailsSeller/ProductDetailsSeller.tsx \
  apps/storefront/src/components/cells/ProductDetailsShipping/ProductDetailsShipping.tsx \
  apps/storefront/src/components/organisms/Addressess/Addresses.tsx \
  apps/storefront/src/components/organisms/BillingAddress/BillingAddress.tsx \
  apps/storefront/src/components/organisms/PromoCode/PromoCode.tsx \
  apps/storefront/src/components/sections/Cart \
  apps/storefront/src/components/sections/CartAddressSection/CartAddressSection.tsx \
  apps/storefront/src/components/sections/CartPaymentSection/CartPaymentSection.tsx \
  apps/storefront/src/components/sections/CartReview/CartReview.tsx \
  apps/storefront/src/components/sections/CartShippingMethodsSection/CartShippingMethodsSection.tsx \
  apps/storefront/src/components/sections/ProductDetailsPage/ProductDetailsPage.tsx \
  docs/integration-pr-f-storefront-checkout-detail-preflight.md

git diff --check -- apps/storefront docs/integration-pr-f-storefront-checkout-detail-preflight.md
bun --cwd apps/storefront lint
bun --cwd apps/storefront build
.codex/scripts/start-dev.sh status
```

## 推荐 PR F staging

```bash
git add -- apps/storefront/src/app/[locale]/\\(checkout\\)/checkout/page.tsx
git add -- apps/storefront/src/app/[locale]/\\(main\\)/cart/page.tsx
git add -- apps/storefront/src/app/[locale]/\\(main\\)/products/[handle]/page.tsx
git add -- apps/storefront/src/components/cells/AddressSelect/AddressSelect.tsx
git add -- apps/storefront/src/components/cells/CartItemsFooter/CartItemsFooter.tsx
git add -- apps/storefront/src/components/cells/CartItemsHeader/CartItemsHeader.tsx
git add -- apps/storefront/src/components/cells/ProductAdditionalAttributes/ProductAdditionalAttributes.tsx
git add -- apps/storefront/src/components/cells/OrderAddresses/OrderAddresses.tsx
git add -- apps/storefront/src/components/cells/ProductDetailsHeader/ProductDetailsHeader.tsx
git add -- apps/storefront/src/components/cells/ProductDetailsSeller/ProductDetailsSeller.tsx
git add -- apps/storefront/src/components/cells/ProductDetailsShipping/ProductDetailsShipping.tsx
git add -- apps/storefront/src/components/organisms/Addressess/Addresses.tsx
git add -- apps/storefront/src/components/organisms/BillingAddress/BillingAddress.tsx
git add -- apps/storefront/src/components/organisms/PromoCode/PromoCode.tsx
git add -- apps/storefront/src/components/sections/Cart
git add -- apps/storefront/src/components/sections/CartAddressSection/CartAddressSection.tsx
git add -- apps/storefront/src/components/sections/CartPaymentSection/CartPaymentSection.tsx
git add -- apps/storefront/src/components/sections/CartReview/CartReview.tsx
git add -- apps/storefront/src/components/sections/CartShippingMethodsSection/CartShippingMethodsSection.tsx
git add -- apps/storefront/src/components/sections/ProductDetailsPage/ProductDetailsPage.tsx
git add -- docs/integration-pr-f-storefront-checkout-detail-preflight.md
git add -- docs/integration-pr-f-storefront-checkout-detail-staging-commands.md
```

## 明确排除

```bash
git restore --staged -- AGENTS.md 2>/dev/null || true
git restore --staged -- .codex 2>/dev/null || true
git restore --staged -- apps/admin 2>/dev/null || true
git restore --staged -- apps/vendor 2>/dev/null || true
git restore --staged -- packages 2>/dev/null || true
git restore --staged -- .mercur 2>/dev/null || true
git restore --staged -- apps/storefront/public/images/local-market 2>/dev/null || true
git restore --staged -- apps/storefront/src/app/[locale]/\\(main\\)/data 2>/dev/null || true
git restore --staged -- apps/storefront/src/app/[locale]/\\(main\\)/page.tsx 2>/dev/null || true
git restore --staged -- apps/storefront/src/app/[locale]/\\(main\\)/search 2>/dev/null || true
git restore --staged -- apps/storefront/src/app/[locale]/\\(main\\)/sellers 2>/dev/null || true
git restore --staged -- apps/storefront/src/app/[locale]/\\(main\\)/pickup-card 2>/dev/null || true
```

说明：

- 以上命令只取消 staging，不改工作区内容。
- 如果 staged diff 出现 payment/order/refund/payout/commission/permission 相关后端文件，立即取消本轮 staging 并重新拆分。

## staged 后检查

```bash
git diff --cached --name-status
git diff --cached --check
git diff --cached --name-only | grep -E '^(AGENTS\\.md|\\.codex/|apps/admin/|apps/vendor/|packages/|\\.mercur/)' && exit 1 || true
git diff --cached --name-only | grep -E 'apps/storefront/src/(app/\\[locale\\]/\\(main\\)/(data|page\\.tsx|search|sellers|pickup-card)|components/(organisms/(Header|Footer|ProductCard|ProductListingHeader|ProductSidebar|ProductsList)|molecules/(ProductListingLoadingView|ProductListingNoResultsView)|cells/Navbar))' && exit 1 || true
git diff --cached -- docs/integration-pr-f-storefront-checkout-detail-preflight.md docs/integration-pr-f-storefront-checkout-detail-staging-commands.md apps/storefront | grep -E 'setAddresses|setShippingMethod|initiatePaymentSession|placeOrder' || true
```

预期 staged 文件只应属于：

```text
apps/storefront/src/app/[locale]/(checkout)/checkout/page.tsx
apps/storefront/src/app/[locale]/(main)/cart/page.tsx
apps/storefront/src/app/[locale]/(main)/products/[handle]/page.tsx
apps/storefront/src/components/cells/AddressSelect/AddressSelect.tsx
apps/storefront/src/components/cells/CartItemsFooter/CartItemsFooter.tsx
apps/storefront/src/components/cells/CartItemsHeader/CartItemsHeader.tsx
apps/storefront/src/components/cells/ProductAdditionalAttributes/ProductAdditionalAttributes.tsx
apps/storefront/src/components/cells/OrderAddresses/OrderAddresses.tsx
apps/storefront/src/components/cells/ProductDetailsHeader/ProductDetailsHeader.tsx
apps/storefront/src/components/cells/ProductDetailsSeller/ProductDetailsSeller.tsx
apps/storefront/src/components/cells/ProductDetailsShipping/ProductDetailsShipping.tsx
apps/storefront/src/components/organisms/Addressess/Addresses.tsx
apps/storefront/src/components/organisms/BillingAddress/BillingAddress.tsx
apps/storefront/src/components/organisms/PromoCode/PromoCode.tsx
apps/storefront/src/components/sections/Cart/**
apps/storefront/src/components/sections/CartAddressSection/CartAddressSection.tsx
apps/storefront/src/components/sections/CartPaymentSection/CartPaymentSection.tsx
apps/storefront/src/components/sections/CartReview/CartReview.tsx
apps/storefront/src/components/sections/CartShippingMethodsSection/CartShippingMethodsSection.tsx
apps/storefront/src/components/sections/ProductDetailsPage/ProductDetailsPage.tsx
docs/integration-pr-f-storefront-checkout-detail-preflight.md
docs/integration-pr-f-storefront-checkout-detail-staging-commands.md
```

## commit 说明建议

如果用户明确要求 commit，建议提交信息：

```text
feat(storefront): localize cart checkout and product detail copy
```

不要自动 commit；只有用户明确说“提交 PR F”或“commit PR F”时才执行。
