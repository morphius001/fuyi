# PR E Preflight: Storefront Market Discovery

日期：2026-05-05

本文档记录 `china/integration-localization` worktree 第五批 PR E 的预检结果。PR E 目标是提交消费者前台的市场发现链路：本地生鲜首页、搜索页、店铺/档口页、提货卡独立入口、发现链路所需 mock 数据和本地市场图片资源。PR E 不修改 checkout、payment、order、refund、settlement、commission 或 permission 逻辑。

## 建议纳入 PR E

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
```

说明：

- `apps/storefront/src/app/[locale]/(main)/data/home-market.ts` 是当前消费者前台本地鲜货 mock 数据入口。
- `apps/storefront/public/images/local-market/seafood-market-hero.png` 是首页视觉资产。
- `pickup-card` 页面保留为独立入口，不作为首页主模块。

## 建议排除 PR E

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
apps/storefront/src/components/sections/Cart/**
```

说明：

- 上述文件属于 PR F：商品详情、地址、购物车、结算文案。
- PR E 专注发现链路，避免把购物车/结算行为风险混进来。

## 当前 Storefront 发现链路分组

| 分组 | 文件 | 说明 |
| --- | --- | --- |
| 首页 | `page.tsx`、`data/home-market.ts`、本地市场图片 | 爱采购式找店找货首页，面向本地生鲜海鲜平台。 |
| 搜索 | `search/**`、商品列表 loading/empty 组件 | 搜索商品、市场和店铺，中文空状态。 |
| 店铺/档口页 | `sellers/[handle]/page.tsx` | 展示档口、今日鲜货、配送能力、直播状态标签。 |
| 提货卡独立入口 | `pickup-card/**` | 消费者持实体卡提货入口，不进入购物车支付/优惠券主链路。 |
| 全局展示组件 | Header、Footer、Navbar、ProductCard、ProductSidebar 等 | 中文导航、类目/筛选、商品卡和 footer 合规占位。 |

## 产品边界

PR E 允许：

- 本地生鲜/海鲜平台首页。
- 以店铺/档口为主的发现链路。
- 搜索、类目、商品卡、店铺卡的中文化和 mock 数据。
- 店铺页展示自提/配送能力和直播状态标签。
- 提货卡独立入口。

PR E 禁止：

- 把市场物料采购放到消费者首页主链路。
- 把直播作为首页主模块。
- 把提货卡做成优惠券、满减券、折扣券、储值卡或支付方式。
- 修改 checkout、payment session、place order、order status、refund、settlement、commission 或 permission 行为。
- 接真实微信支付、支付宝、客服、物流、直播或 AI 服务。
- 写入真实密钥或真实 Provider 凭证。

## 已执行验证

```bash
/home/codex/.bun/bin/bun --cwd apps/storefront lint
/home/codex/.bun/bin/bun --cwd apps/storefront build
git diff --check -- apps/storefront
```

结果：

- Storefront lint：通过，但有既有 React Hook dependency warnings。
- Storefront build：通过，但重复显示同一批既有 React Hook dependency warnings。
- `git diff --check -- apps/storefront`：通过。

当前 warning：

- `ShippingAddress.tsx`：`useMemo` / `useEffect` dependency warnings。
- `PasswordValidator.tsx`：`useEffect` dependency warning。
- `CartDropdown.tsx`：`useEffect` dependency warning。
- `CartAddressSection.tsx`：`useEffect` dependency warning。

这些 warning 本轮未处理，且主要落在购物车/地址/账户相关组件，不属于 PR E 的发现链路主范围。

## 仍需人工视觉确认

- 打开 `http://127.0.0.1:3101/cn`，确认首页更像本地鲜货找店找货平台，而不是普通商城首页。
- 移动端确认首页不太长，首屏像 App。
- 确认市场物料没有放到消费者首页前排。
- 确认直播最多在店铺/档口状态出现，不是首页大模块。
- 确认提货卡是独立链接/页面，不进入首页主卖点。
- 打开 `/cn/search`、`/cn/sellers/a-hai-xian-huo-dang`、`/cn/pickup-card` 做基础浏览。

## 当前结论

PR E 可以进入准备阶段。代码层面 lint/build/diff-check 已通过；提交前建议做一次消费者视角的桌面和移动视觉确认。
