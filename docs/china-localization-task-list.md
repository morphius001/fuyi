# China Localization Task List

本文档把中国大陆本地化改造拆分成可审计的 PR。第一阶段只做规划；后续实施时，每个 PR 必须包含验证步骤。

## Batch 1: Low-Risk PRs

### PR 0: Storefront Scaffold

Scope:

- Add the official Mercur B2C Storefront under `apps/storefront`.
- Keep the scaffold close to the upstream storefront.
- Align package manager usage with root `bun@1.3.13`.
- Do not localize copy, layout, payment, order, refund, settlement, commission, or permission behavior.

Verification:

- Confirm root workspaces include `apps/*`.
- Run `bun install`.
- Run `bun run lint:storefront` and record scaffold-level compatibility issues without broad business-code fixes.
- Confirm `.env.local.example` exists and `.env.local` remains ignored/untracked.

Risk:

- Storefront scaffold brings React 19 and Next.js 15 dependencies into a monorepo that already has React 18 dashboard apps.
- Provider dependencies such as Stripe, Algolia, and TalkJS remain present but must stay unconfigured unless a later scoped task requires mock or placeholder setup.

### PR 1: Storefront 中文化和国内布局

Scope:

- Use `apps/storefront` as the storefront location.
- Localize storefront copy to zh-CN where applicable.
- Use CNY display conventions.
- Propose domestic ecommerce layout improvements for product listing, product detail, cart, checkout, and mobile sticky actions.
- Keep checkout/order/payment behavior unchanged.

Verification:

- Desktop and mobile screenshots.
- Typecheck and lint.
- Manual flow through listing, product detail, cart, and checkout UI if storefront exists.

### PR 2: Admin Panel 菜单重组和中文化

Scope:

- Localize Admin Panel copy to zh-CN.
- Reorganize menus around platform operator workflows: 商品, 订单, 商家, 用户, 营销, 内容, 财务, 售后, 风控, 设置.
- Keep RBAC, permission, payout, commission, refund, order, and payment behavior unchanged.

Verification:

- Typecheck and lint.
- Manual navigation through all top-level menus.
- Confirm restricted or permission-sensitive surfaces remain unchanged.

### PR 3: Seller Panel 菜单重组和中文化

Scope:

- Localize Seller Panel copy to zh-CN.
- Reorganize menus around merchant workflows: 首页, 商品, 订单, 售后, 店铺, 营销, 客服, 财务, 设置.
- Improve repeated seller workflow ergonomics where UI-only and low-risk.
- Keep settlement, payout, refund, commission, permission, order, and payment behavior unchanged.

Verification:

- Typecheck and lint.
- Manual navigation through all top-level menus.
- Confirm merchant ownership and finance-sensitive behavior remain unchanged.

### PR 4: 中国地址模型和表单

Scope:

- Audit and design China address support: province, city, district/county, street/town, detailed address, contact name, mobile phone, optional postal code.
- Implement only after data model and migration risks are reviewed.
- Avoid breaking existing Medusa address contracts.

Verification:

- Unit or integration coverage for validation and serialization if model logic changes.
- Manual address form checks on desktop and mobile.
- Confirm existing order/customer address flows remain compatible.

### PR 5: Mock ChatProvider

Scope:

- Introduce a switchable mock ChatProvider boundary.
- Preserve TalkJS integration.
- Do not connect real domestic IM.
- Document future adapter requirements for provider identity mapping, unread counts, conversation ids, and message delivery errors.

Verification:

- Typecheck and lint.
- Manual UI check for chat entry points.
- Confirm TalkJS path is still available or recoverable.

## High-Risk Serial PRs

### PR 6: Mock China PaymentProvider

Scope:

- Add mock-only China payment provider behavior.
- Document frontend pending state and backend notification source-of-truth requirements.
- Do not connect real Alipay or WeChat Pay.

Verification:

- Payment provider unit/integration tests.
- Manual pending/success/failure mock flows.
- Confirm no real credentials are required.

### PR 7: 支付通知幂等框架

Scope:

- Add provider notification idempotency design and persistence.
- Verify signatures before state changes.
- Store provider event identifiers and retry-safe processing state.
- Keep implementation serial and heavily reviewed.

Verification:

- Duplicate notification tests.
- Invalid signature tests.
- Retry and failure-state tests.
- Confirm frontend return URL does not mark payment successful by itself.

### PR 8: 支付宝 Provider

Scope:

- Add Alipay provider behind adapter boundary.
- Use environment-driven configuration.
- Include signature verification, idempotency, retry behavior, and error mapping.
- No hardcoded real credentials.

Verification:

- Sandbox-only integration tests where available.
- Signature verification tests.
- Notification idempotency tests.
- Manual sandbox payment flow.

### PR 9: 微信支付 Provider

Scope:

- Add WeChat Pay provider behind adapter boundary.
- Use environment-driven configuration.
- Include signature verification, idempotency, retry behavior, and error mapping.
- No hardcoded real credentials.

Verification:

- Sandbox or mock callback tests.
- Signature verification tests.
- Notification idempotency tests.
- Manual sandbox payment flow where available.

### PR 10: 退款

Scope:

- Implement China payment refund flows only after provider payment notifications are stable.
- Preserve audit trail and provider refund identifiers.
- Keep order/refund state transitions consistent with Medusa/Mercur expectations.

Verification:

- Refund success/failure tests.
- Duplicate refund notification tests.
- Manual refund flow.
- Accounting impact review.

### PR 11: 对账

Scope:

- Add reconciliation import or provider statement matching.
- Preserve raw provider records for audit.
- Surface mismatches without automatic destructive correction.

Verification:

- Statement parsing tests.
- Match/mismatch tests.
- Manual reconciliation review flow.

### PR 12: 商家结算

Scope:

- Implement merchant settlement after payment, refund, commission, and reconciliation behavior is stable.
- Do not weaken payout, commission, or permission rules.
- Make settlement state auditable.

Verification:

- Settlement calculation tests.
- Permission/RBAC checks.
- Refund and adjustment scenarios.
- Manual settlement review and export flow.

## Cross-PR Requirements

- Every PR must list files changed, scope, non-goals, verification, and risk.
- Every payment-related PR must state why payment success is backend-notification driven.
- Every provider PR must document signature verification, idempotency, retries, and credential handling.
- Every UI PR must include desktop and mobile checks.
- Do not delete Stripe, Algolia, Resend, or TalkJS.
