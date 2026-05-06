# PR F Preflight: Storefront Detail, Address, Cart, Checkout Copy

日期：2026-05-05

本文档记录 `china/integration-localization` worktree 第六批 PR F 的预检结果。PR F 目标是提交消费者前台商品详情、中国地址 UI、购物车、配送、支付提示和结算文案 polish。PR F 不改变真实下单、支付、配送方式设置、订单状态、退款、结算、佣金或权限逻辑。

## 建议纳入 PR F

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
```

## 建议排除 PR F

```text
apps/storefront/src/app/[locale]/(main)/page.tsx
apps/storefront/src/app/[locale]/(main)/search/**
apps/storefront/src/app/[locale]/(main)/sellers/[handle]/page.tsx
apps/storefront/src/app/[locale]/(main)/pickup-card/**
apps/storefront/src/app/[locale]/(main)/data/**
apps/storefront/public/images/local-market/**
apps/admin/**
apps/vendor/**
packages/**
```

说明：

- 首页、搜索、店铺页、提货卡独立入口属于 PR E。
- Admin、Vendor、Provider 和 API 配置分别属于其它 PR。

## 当前文件分组

| 分组 | 文件 | 说明 |
| --- | --- | --- |
| 商品详情 | `ProductDetailsHeader`、`ProductDetailsSeller`、`ProductDetailsShipping` | 中文今日价、档口/商家信息、履约提示。 |
| 地址 UI | `AddressSelect`、`OrderAddresses`、`Addresses`、`BillingAddress` | 中国地址展示和表单文案 polish。 |
| 购物车 | `cart/page.tsx`、`Cart`、`CartItemsHeader`、`CartItemsFooter`、`PromoCode` | 购物车中文文案、优惠码边界、费用展示。 |
| 结算 | `checkout/page.tsx`、`CartAddressSection`、`CartShippingMethodsSection`、`CartPaymentSection`、`CartReview` | 结算步骤中文化、支付异步通知提示、配送方式文案。 |

## 敏感函数扫描

扫描范围内仍存在以下现有结算函数调用：

- `setAddresses`
- `setShippingMethod`
- `initiatePaymentSession`

这三个调用位于原有 checkout/cart 组件中，属于结算流程既有入口。PR F 的 review 重点：

- 允许调整这些组件的中文文案和说明。
- 不允许改变函数调用语义、参数来源、执行时机或错误处理路径。
- 不允许新增支付成功判断逻辑。
- 不允许以前端跳转或支付页返回作为支付成功来源。

未发现：

- `placeOrder`
- `completeCart`
- `commission`
- `payout`

## 风险边界

PR F 允许：

- 中国地址 UI 和展示文案。
- 商品详情中文化和本地履约说明。
- 购物车、配送、支付、核对订单文案 polish。
- 支付结果说明强调“支付成功以后端异步通知为准”。
- 优惠码文案明确提货卡不是优惠券、余额或支付方式。

PR F 禁止：

- 改 `setAddresses`、`setShippingMethod`、`initiatePaymentSession`、`placeOrder` 的真实业务行为。
- 新增真实微信支付、支付宝或支付结果判断。
- 改订单状态、支付状态、退款状态、配送状态。
- 改结算、佣金、payout 或权限逻辑。
- 把提货卡做成优惠码、余额、支付方式或购物车抵扣。

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
- PR F 文件尾随空白检查：通过。

当前 warning：

- `ShippingAddress.tsx`：`useMemo` / `useEffect` dependency warnings。
- `PasswordValidator.tsx`：`useEffect` dependency warning。
- `CartDropdown.tsx`：`useEffect` dependency warning。
- `CartAddressSection.tsx`：`useEffect` dependency warning。

这些 warning 本轮未处理；PR F 不应顺手修 unrelated hook 依赖，除非后续单独开质量修复 PR。

## 仍需人工视觉确认

- 商品详情页：价格、规格、档口、配送说明是否清晰。
- 购物车页：费用、商品、优惠码提示是否符合国内消费者习惯。
- 结算页：中国地址字段顺序和配送/支付提示是否易懂。
- 支付提示是否没有暗示“前端支付返回即成功”。
- 提货卡是否没有出现在优惠码、余额或支付方式中。

## 当前结论

PR F 可以进入准备阶段。代码层面 lint/build/diff-check 已通过，但由于它触达购物车和结算页面，提交前需要重点 review 敏感函数调用没有被改变。
