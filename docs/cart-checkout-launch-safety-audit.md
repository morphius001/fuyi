# Cart Checkout Launch Safety Audit

更新时间：2026-05-10 Asia/Shanghai

## 结论

当前 cart / checkout 可以继续作为现有 Medusa Store API + Stripe / manual test payment 的本地 QA 基线，但不能直接作为中国支付上线闭环。

中国上线前必须保持硬门禁：支付宝、微信支付或任何中国本地支付 provider 不能复用“前端确认支付结果后调用 `placeOrder()`”的模式。支付成功必须以后端异步通知为准，且通知链路必须验签、幂等、可重试，并经过 payment notification runtime gate、DB rehearsal 和 workflow execution adapter 的串行验证。

本轮只做审计，不修改运行时代码。

## 审计范围

核心文件：

- `apps/storefront/src/lib/data/cart.ts`
- `apps/storefront/src/lib/data/payment.ts`
- `apps/storefront/src/lib/data/fulfillment.ts`
- `apps/storefront/src/app/[locale]/(checkout)/checkout/page.tsx`
- `apps/storefront/src/app/[locale]/(main)/cart/page.tsx`
- `apps/storefront/src/components/sections/Cart/Cart.tsx`
- `apps/storefront/src/components/sections/CartAddressSection/CartAddressSection.tsx`
- `apps/storefront/src/components/sections/CartShippingMethodsSection/CartShippingMethodsSection.tsx`
- `apps/storefront/src/components/sections/CartPaymentSection/CartPaymentSection.tsx`
- `apps/storefront/src/components/sections/CartReview/PaymentButton.tsx`

## 当前调用点

| 调用点 | 当前位置 | 当前语义 | 上线判断 |
| --- | --- | --- | --- |
| `retrieveCart()` | checkout page / cart provider | 从 cookie cart id 读取 cart | 可继续 QA |
| `getOrSetCart(countryCode)` | add-to-cart | 按 region 创建或更新 cart | 需继续 CN/CNY smoke |
| `addToCart()` | product detail flow | 创建或更新 line item | 不在本轮修改 |
| `setAddresses()` | CartAddressSection | 提交 shipping/billing address，并强制 billing = shipping | 可 QA，但需手机号/地址格式后续增强 |
| `setShippingMethod()` | CartShippingMethodsSection | 写入 selected shipping option | 当前只消费 Medusa shipping options，不读取市场配送规则 |
| `initiatePaymentSession()` | CartPaymentSection | 创建 payment session | 中国 provider 上线前必须另走 runtime gate |
| `placeOrder()` | PaymentButton | POST `/store/carts/:id/complete` 并 redirect confirmed | 中国本地支付不能由前端支付返回直接触发 |

## 已具备的安全点

- `/checkout` 无 cart 时会 redirect 到 `/${locale}/cart`。
- 地址展示已按中国阅读顺序展示：省、市、区县/街道、详细地址、邮编、国家地区。
- 支付方式区已有提示：支付成功必须以后端异步通知确认为准。
- 提货卡文案已明确不属于礼品卡、优惠券或支付方式。
- 配送方式仍来自 Medusa shipping options，没有让市场/商家只读配送展示直接影响 checkout。

## 阻断风险

### Stripe 前端确认后 placeOrder

`PaymentButton` 中 Stripe 分支会在 `confirmCardPayment()` 返回 `requires_capture` 或 `succeeded` 后调用 `placeOrder()`。

这属于现有 Stripe checkout 行为审计结果，不在本轮修改。但它不能成为中国支付 provider 的实现模板。

中国支付 provider 必须阻断：

- 前端返回页触发 `placeOrder()`。
- 前端按钮状态触发支付成功。
- 未验签通知触发订单完成。
- 未幂等通知重复完成订单。
- 未经 DB-backed inbox / event log 记录就推进 payment/order 状态。

### Manual test payment

Manual test payment button 会直接调用 `placeOrder()`。

上线要求：

- 只能用于本地 / 测试 / mock。
- 生产中国支付入口必须 disabled-by-default 或从真实 payment method 列表中移除。
- 不能作为支付宝、微信支付、线下转账或提货卡替代。

### Gift card zero total

当前存在 `paidByGiftcard` 路径。

上线要求：

- 提货卡不能接入 gift card、promotion、coupon、wallet 或 cart discount。
- 如果未来需要提货卡，必须独立履约凭证链路，不能穿透 checkout 支付抵扣。

### 地址和手机号

当前地址表单使用 Medusa cart address 字段，billing address 强制等于 shipping address。

上线要求：

- 大陆手机号校验、E.164 存储、区县/街道字段映射需要单独 PR。
- 不得在本轮临时改变 checkout address 提交结构。

### 配送方式

当前配送方式来自 `/store/shipping-options?cart_id=...` 和 `/store/carts/:id/shipping-methods`。

上线要求：

- 市场统一配送、商家自配送、配送供应商、面单能力不能通过只读展示字段直接影响 shipping options。
- 真实市场配送规则接入前，必须有 fulfillment / logistics runtime gate 和 rollback。

## Cart / Checkout Go 条件

上线前至少满足：

- CN region cart 创建成功。
- cart currency 为 `cny`。
- 商品详情页加购后 cart item 名称、variant、quantity、price 正确。
- 数量更新、删除 line item、promotion error 均可控。
- `/cn/checkout` 无 cart redirect 到 `/cn/cart`。
- 地址提交后 cart shipping/billing address 可读，字段顺序展示正确。
- shipping option 写入成功，cart totals 更新。
- payment session 只对当前 provider 创建，错误可显示。
- 订单完成只在当前已批准 provider 模式下发生。
- 中国支付 provider 仍保持 disabled / mock / runtime-gated，不能通过前端返回页完成订单。

## No-Go

出现以下任一情况停止上线：

- 支付成功依赖前端跳转、前端返回页或按钮状态。
- 支付通知未验签、未幂等、不可重试。
- manual payment 在生产可见。
- 提货卡被当成礼品卡、优惠券、余额或支付方式。
- 市场/商家只读配送展示直接改变 checkout shipping options。
- cart total、shipping total、tax、discount、payment、refund、settlement、commission 的事实来源不清楚。
- capability view 或前端隐藏入口被当成权限控制。

## 后续 PR 顺序

1. `cart-checkout-smoke-runbook`
   - 记录 CN cart、add-to-cart、shipping method、payment session 的本地 smoke。
   - 不改 runtime。

2. `china-payment-button-runtime-boundary`
   - 为中国 provider 定义 pending / awaiting notify 的按钮和结果页边界。
   - 不调用 `placeOrder()`。

3. `payment-risk-register`
   - 汇总支付、退款、对账、结算、佣金、权限风险。
   - 不写 runtime。

4. `payment-notification-db-runtime-rehearsal`
   - 仅在 disposable DB 授权后执行。
   - 不接真实 provider。

5. `fulfillment-logistics-runtime-gate-plan`
   - 配送和物流 runtime gate。
   - 不直接改 checkout shipping options。

## 本 PR 验证

```bash
grep -R -n 'setAddresses\|setShippingMethod\|initiatePaymentSession\|placeOrder\|completeCart' apps/storefront/src/app/[locale]/\(checkout\) apps/storefront/src/app/[locale]/\(main\)/cart apps/storefront/src/components/sections/Cart* apps/storefront/src/lib/data | head -n 240
cd apps/storefront && /home/codex/.bun/bin/bun run build
git diff --check
```

预期：

- Storefront build 通过，允许保留既有 React Hook dependency warnings。
- `git diff --check` 无输出。

