# MercurJS China Localization Project

This is a Mercur marketplace project built on MedusaJS v2. The active product goal is:

MercurJS 中国大陆多商户电商平台本地化改造.

Default working language for agents is zh-CN. Keep user-facing planning, audit notes, and task summaries in Simplified Chinese unless the user asks otherwise.

## Project Defaults

- Locale: zh-CN
- Currency: CNY
- Time zone: Asia/Shanghai
- Phone number: 中国大陆手机号, prefer E.164 storage when backend contracts require normalized values
- Address model: 中国大陆省 / 市 / 区县 / 街道 / 详细地址, with room for postal code, contact name, and mobile phone
- Dates and times: display in Asia/Shanghai; avoid ambiguous relative dates in docs and operator flows

## Architecture

- Foundation: MedusaJS v2 headless commerce
- Marketplace layer: MercurJS
- Language: TypeScript strict
- Pattern: block-based modules, workflows, API routes, links, subscribers, and UI extensions

Project structure:

```text
packages/api/         Backend API, modules, workflows, links, subscribers
apps/admin/           Admin dashboard / platform operator panel
apps/vendor/          Seller dashboard / merchant portal
blocks.json           Mercur block aliases and registries
docs/                 Project-local Codex and China localization planning docs
```

## Environment Expectations

- Work inside the WSL Linux filesystem, for example `/home/codex/code/fuyi`.
- Do not work from `/mnt/c` for this project because dependency installs, file watching, and worktree operations are slower and less reliable there.
- Prefer Node 24 via `.nvmrc` unless the project later adds a stricter documented requirement.
- Use the package manager declared by `package.json`. At the time of this setup, it declares `bun@1.3.13`.
- Do not introduce new dependencies during planning or audit tasks.
- Every implementation task must include explicit verification steps.

## CLI Commands

```bash
bun run dev
bun run build
bun run lint
bun run check-types
bun run format
bunx @mercurjs/cli add <block-name>
bunx @mercurjs/cli search -q "commission"
bunx @mercurjs/cli codegen
```

Development servers:

- Backend API: `http://localhost:9000`
- Admin Panel: `http://localhost:7000`
- Seller Panel: `http://localhost:7001`

## General Rules

- 不要直接修改 Mercur / Medusa core.
- Do not directly modify Mercur core or Medusa core.
- Prefer local extension points, adapters, providers, blocks, modules, workflows, and configuration.
- 不要删除 Stripe、Algolia、Resend、TalkJS.
- Do not delete Stripe, Algolia, Resend, or TalkJS integrations. China-local alternatives should be additive, switchable, and adapter-based.
- Do not write real production secrets, app ids, private keys, merchant ids, webhook tokens, SMS credentials, IM credentials, or logistics credentials.
- Use mock providers or clearly marked templates for first-pass China integrations.
- Keep PRs small enough for Codex App worktrees and parallel subagents to review independently.
- Preserve existing business behavior unless the task explicitly asks for a localized replacement and includes verification.

## Storefront China UX Rules

- Use zh-CN copy and CNY prices by default.
- Prefer domestic ecommerce information architecture: search-first discovery, category navigation, product cards with price/promotions/sales cues, sticky purchase actions on mobile, and clear after-sales entry points.
- Address forms should follow China order: province, city, district/county, street/town, detailed address.
- Phone fields should validate mainland China mobile formats where the product scope says mainland-only.
- Avoid changing checkout, order, refund, payout, commission, payment, or permission logic without a dedicated high-risk task.
- UI localization tasks must include desktop and mobile verification.

## Admin Panel China Ops Rules

- Treat Admin Panel as the platform operator backend.
- Prefer dense, operational layouts over marketing-style pages.
- Chinese menu labels should support common marketplace operations: 商品, 订单, 商家, 用户, 营销, 内容, 财务, 售后, 风控, 设置.
- Keep workflows auditable. Important state changes should expose operator-visible status, timestamps, and failure reasons where existing APIs support them.
- Do not weaken RBAC, permission, audit, payout, settlement, refund, or commission rules.

## Seller Panel China Merchant Rules

- Treat Seller Panel as the merchant backend.
- Chinese menu labels should support common seller workflows: 首页, 商品, 订单, 售后, 店铺, 营销, 客服, 财务, 设置.
- Optimize for repeated merchant operations: list scanning, bulk-friendly layouts, clear status filters, and mobile-readable tables where applicable.
- Do not change settlement, payout, refund, commission, permission, or order ownership behavior without a dedicated high-risk task.

## Payment Safety Rules

- 支付成功必须以后端异步通知为准，不能以前端跳转或返回页为准.
- 支付通知必须验签、幂等、可重试.
- Payment success must be determined by backend asynchronous provider notification, not by frontend return URL alone.
- Payment notifications must verify signatures before changing payment state.
- Payment notification handling must be idempotent.
- Payment notification handling must be retry-safe and preserve enough provider event data for debugging.
- Frontend payment result pages may display pending states, but must not be the source of truth.
- Refunds, reconciliation, merchant settlement, payout, and commission changes are high-risk serial work and must not be parallelized casually.

## Provider And Adapter Rules

- China-local integrations must use provider or adapter boundaries.
- Start with mock providers before real WeChat Pay, Alipay, SMS, IM, or logistics integrations.
- Keep provider configuration environment-driven and documented.
- Never hardcode real credentials.
- Provider implementations must define expected webhook/notification verification, idempotency keys, retry behavior, and error mapping before production use.
- Preserve existing Stripe, Algolia, Resend, and TalkJS paths unless a task explicitly creates a switchable adapter.

## Phase 1 Scope

Allowed in phase 1:

- Environment inspection
- Repository structure audit
- Documentation updates
- Worktree and branch planning
- PR/task planning
- Mock-provider design notes
- Non-business configuration guidance

Not allowed in phase 1:

- Business logic changes
- Storefront, Admin Panel, or Seller Panel behavior changes
- Payment, order, refund, payout, commission, or permission logic changes
- Real WeChat Pay, Alipay, SMS, IM, or logistics integration
- New dependencies
- Real secrets or production credentials

## Verification Requirement

每个任务必须包含验证步骤.

Every future task and PR must include:

- Files changed
- Scope and non-goals
- Manual or automated verification steps
- Risk notes, especially for payment, order, refund, payout, commission, and permission areas
- Rollback or feature-flag guidance when behavior changes

## Documentation

- Mercur docs: https://docs.mercurjs.com
- Mercur MCP: https://docs.mercurjs.com/mcp
- Mercur llms.txt: https://docs.mercurjs.com/llms.txt
- Project setup: `docs/codex-app-setup.md`
- China audit plan: `docs/china-localization-audit-plan.md`
- Worktree plan: `docs/china-worktree-plan.md`
- Task list: `docs/china-localization-task-list.md`
