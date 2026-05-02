# China Localization Audit Plan

本文档用于第一轮中国大陆本地化审计。目标是识别改造范围、风险边界和 PR 拆分，不直接修改业务代码。

## Audit Goals

- Identify zh-CN localization gaps.
- Identify CNY, Asia/Shanghai, mainland mobile phone, and China address gaps.
- Identify Storefront, Admin Panel, and Seller Panel UX gaps for domestic ecommerce workflows.
- Identify provider/adapter boundaries for chat, payment, notification, logistics, and search.
- Separate low-risk UI/localization work from high-risk payment, refund, reconciliation, payout, commission, and permission work.

## Non-Goals

- No business logic changes.
- No real WeChat Pay, Alipay, SMS, IM, or logistics integration.
- No new dependencies.
- No production credentials.
- No direct Mercur or Medusa core edits.
- No changes to payment, order, refund, payout, commission, or permission behavior during audit.

## Audit Areas

### Repository And Environment

- Confirm WSL Linux path and worktree readiness.
- Confirm Node, nvm, Bun, npm, and Corepack availability.
- Confirm package scripts and workspace structure.
- Confirm Mercur and Medusa package versions.

### Storefront UX

The current repository snapshot does not include an `apps/storefront` workspace. Storefront audit should first confirm where the storefront lives or whether it must be added later as a separate app/worktree.

When a storefront exists, audit:

- zh-CN copy coverage.
- CNY price display.
- Mobile product listing, product detail, cart, and checkout ergonomics.
- China address form sequence.
- Mainland phone validation expectations.
- Search, category, promotion, and after-sales entry points.

### Admin Panel

Audit `apps/admin` for:

- Navigation structure and Chinese menu labels.
- Operator workflows for products, orders, merchants, users, marketing, content, finance, after-sales, risk control, and settings.
- Table density, filters, status labels, and failure-state clarity.
- RBAC and permission-sensitive surfaces that must not be weakened.

### Seller Panel

Audit `apps/vendor` for:

- Navigation structure and Chinese menu labels.
- Merchant workflows for dashboard, products, orders, after-sales, store, marketing, customer service, finance, and settings.
- Bulk operation readiness and mobile-readable layouts.
- Settlement, payout, refund, commission, and order ownership boundaries that must remain unchanged.

### China Address

Audit expected data and UI needs for:

- Province
- City
- District/county
- Street/town
- Detailed address
- Contact name
- Mainland mobile phone
- Postal code where useful

Do not change persistence models during audit. Document the future extension point and migration risk.

### Chat Provider

Audit existing TalkJS usage and identify a switchable `ChatProvider` boundary. First implementation should be mock-only.

Do not delete TalkJS. Do not connect a real domestic IM provider in phase 1.

### Payment Provider

Audit existing payment provider extension points and notification handling requirements.

Payment rules:

- Frontend return URL is not proof of payment success.
- Backend asynchronous notification is the source of truth.
- Notifications must be signature-verified.
- Notifications must be idempotent.
- Notifications must be retry-safe.
- Provider payloads and state transitions must be auditable.

Do not implement real Alipay or WeChat Pay during audit.

## Deliverables

Each audit result should include:

- Files inspected
- Findings
- Risk level
- Suggested PR
- Verification steps
- Open questions

## Suggested First-Round Parallel Audits

- Storefront / missing storefront audit
- Admin Panel localization audit
- Seller Panel localization audit
- China address audit
- Chat provider boundary audit

Keep payment provider audit separate and serial unless it is strictly read-only.

