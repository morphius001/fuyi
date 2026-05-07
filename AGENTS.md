# MercurJS China Localization Project

This is a Mercur marketplace project built on MedusaJS v2. The active product goal is:

MercurJS 中国大陆本地生鲜供应链与多商户经营平台本地化改造.

The product direction is a switchable-market local fresh food and seafood marketplace. It is centered on markets, shops/stalls, and role-based workspaces. It supports consumer fresh-goods purchasing and pickup-card fulfillment, merchant operations, mobile/AI quick listing, shop decoration, market-supply procurement, materials suppliers, delivery suppliers, farmers, growers, seedling suppliers, and out-of-town wholesalers that connect directly with merchants. The platform operator manages markets, role onboarding, credentials, module switches, fulfillment, pickup cards, risk, and data.

Default working language for agents is zh-CN. Keep user-facing planning, audit notes, and task summaries in Simplified Chinese unless the user asks otherwise.

## Project Defaults

- Locale: zh-CN
- Currency: CNY
- Time zone: Asia/Shanghai
- Phone number: 中国大陆手机号, prefer E.164 storage when backend contracts require normalized values
- Address model: 中国大陆省 / 市 / 区县 / 街道 / 详细地址, with room for postal code, contact name, and mobile phone
- Dates and times: display in Asia/Shanghai; avoid ambiguous relative dates in docs and operator flows

## Product Domain Principles

- 平台是可切换市场的通用平台，不要写死单一市场。示例可使用“三门海鲜市场”，但 UI、文案和任务设计必须支持多市场切换.
- 市场有自己的配送规则、营业时间、公告、自提规则和服务范围.
- 商户属于市场；商户有档口号/市场位置；一个商户可以跨多个市场经营.
- 普通经营商户包括：海鲜档口、冻品商户、干货商户、水果蔬菜商户.
- 物料供应商和配送供应商需要单独管理，不要简单混入普通经营商户.
- 物料采购是商户端 B 端能力，不面向普通消费者主链路。物料包括泡沫箱、包装箱、冰袋、冰块、周转筐、胶带、标签等.
- 允许物料供应商自己接单；配送供应商也需要独立服务/接单工作台.
- 上游供给方包括养殖户、种植户、种苗供应商、外地批发商。它们用于对接商户，先以采购需求、报价、合作关系、到货/到苗计划为主，不要做成消费者购物链路.
- 角色工作台应支持按平台开通的模块显示。后续模块开关包括：水果蔬菜、市场物料、配送供应商、上游货源、种苗批发、外地批发商、提货卡、AI 快速上架.
- 店铺/档口主页装修是核心能力：店铺头图、公告、今日鲜货、商品分组、资质展示、配送说明和预览.
- 直播是核心经营能力：消费者可看市场/店铺/档口直播，商户可预留直播管理、直播商品、直播公告和回放入口，平台可审核直播间、内容、违规和推荐位。第一阶段只做 mock/placeholder，不接真实直播、IM、推流或支付.
- 手机端快速上架是核心商户能力：拍照/常卖模板/今日价/库存/规格/配送或自提/一键草稿或上架.
- AI 一句话上架必须先生成草稿并由商户确认，不允许早期直接自动正式上架.
- 快递打印/电子面单是商户端物流能力，第一阶段只能做 mock/placeholder。不要接真实快递100、菜鸟、顺丰、京东物流或云打印，不要生成真实运单号，不要真实确认发货或修改订单状态.
- 交易概念必须区分：消费者订单、提货单、商户物料订单、配送服务单、货源采购单、种苗采购单.
- 合规证照需要预留：营业执照、食品经营许可、产地证明、检测报告、冷链资质、配送资质、种苗经营资质、养殖/种植证明.

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

## Local Vs Production Configuration

- 不要在业务代码中硬编码仅适用于本机的 URL、端口、账号、路径、mock 开关或 provider 配置。
- 本地开发默认值必须可以被环境变量覆盖；生产、测试、预发环境必须通过环境变量显式配置。
- 本地排查登录、CORS、cookie、端口、WSL 转发或 provider mock 时，完成后必须说明哪些是 local-only，哪些可进入生产配置。
- Admin 后端地址应优先读取 `VITE_MEDUSA_BACKEND_URL`，本地默认值可以指向 `http://127.0.0.1:9000`，但上线必须替换为真实后端域名。
- 上线前必须审计 `.env*`、Vite/Next config、CORS、cookie/session 域名、feature flag、provider adapter 开关，确保没有把 `localhost`、`127.0.0.1`、mock credential 或 mock provider 当成生产配置。
- 每个涉及配置的任务，最终输出必须包含本地值、上线应设置的环境变量、生产影响和回滚方式。

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

## Codex Task File Execution Rules

- 开始连续任务前，优先读取 `.codex/memory.md`、`project-ledger/status.md`、`project-ledger/tasks.md`、`project-ledger/handoff.md`、`memory/learned-rules.md` 和相关 `.codex/tasks/<task>.md`.
- 如果用户说“继续”，先读取 `project-ledger/status.md`、`project-ledger/tasks.md`、`project-ledger/handoff.md`、`memory/learned-rules.md` 和当前任务相关文件，再判断下一步。
- 如果用户说“执行下一个任务”，优先读取 `project-ledger/tasks.md`；如果任务来自旧队列，再读取 `.codex/queue.md`。
- 如果用户说“执行 xxx”或“执行任务 xxx”，先在 `.codex/tasks/` 查找对应 markdown 文件，例如 `.codex/tasks/xxx.md`.
- 执行任务前必须读取 `AGENTS.md` 和对应 task 文件.
- 如果用户说“开始”、“继续”、“按照你的来”、“你来操作”、“任务完成了就继续下一轮”等连续执行指令，主 agent 应进入自动队列模式.
- 自动队列模式下：每完成一个任务并通过该任务要求的验证后，立即读取 `.codex/queue.md`，选择下一个未完成且未标记 `local-wip` 或 `done` 的任务继续执行.
- 自动队列模式只在以下情况暂停：队列没有可执行任务、验证失败、遇到安全边界/高风险串行任务、需要用户视觉确认、任务会触碰禁止范围，或用户明确说停止/暂停/不要自己动手.
- 自动队列模式中，阶段性更新要简短说明“当前任务、验证结果、下一任务”，不要每一轮都要求用户回复“继续”.
- 默认不要自动 commit.
- 默认不要 push.
- 默认不要创建 PR.
- 默认不要运行 `git reset --hard`, `git merge`, `git rebase`, `git pull`, `git worktree remove`，除非任务文件明确允许.
- 完成后只输出修改文件、验证结果、风险点和下一步建议.
- 如果任务文件和用户当前指令冲突，以用户当前指令为准.
- 如果任务文件和 `AGENTS.md` 冲突，以 `AGENTS.md` 的安全边界为准.
- 如果用户说“执行下一个任务”，读取 `.codex/queue.md`，选择第一个未完成且未标记 `local-wip` 或 `done` 的任务.
- 每次完成实质任务后，更新 `project-ledger/changelog.md` 和 `project-ledger/handoff.md`；沉淀出的长期规则写入 `memory/learned-rules.md`，UI / 产品决策写入 `memory/ui-decisions.md`.

## Storefront China UX Rules

- Use zh-CN copy and CNY prices by default.
- Storefront is consumer-facing and should be market/shop-first, not a generic product-only mall.
- Prefer discovery by market, shop/stall, fresh categories, today's arrivals, pickup-card fulfillment, and local delivery/self-pickup.
- Storefront may reserve market live/shop live entrances for today's fresh goods, stall tours, and live product recommendations. Do not connect real live streaming or IM in low-risk UI tasks.
- Search should support goods, shops, stalls, markets, and categories.
- Product/shop cards should show shop name, market, stall number where relevant, today's price, freshness/cold-chain tags, delivery/self-pickup capability, and trust cues.
- Do not expose merchant-only market-supply procurement as a normal consumer purchase flow.
- Pickup cards are consumer fulfillment credentials: users verify a card, see the entitled goods/package, confirm address/self-pickup time, and submit a pickup request. Do not model pickup cards as payment, discount, wallet balance, or shopping-cart tender.
- Address forms should follow China order: province, city, district/county, street/town, detailed address.
- Phone fields should validate mainland China mobile formats where the product scope says mainland-only.
- Avoid changing checkout, order, refund, payout, commission, payment, or permission logic without a dedicated high-risk task.
- UI localization tasks must include desktop and mobile verification.

## Admin Panel China Ops Rules

- Treat Admin Panel as the platform operator backend.
- Prefer dense, operational layouts over marketing-style pages.
- Chinese menu labels should support platform operations for markets, merchants, suppliers, goods, orders, pickup cards, delivery, credentials, risk, data, and module switches.
- Admin must distinguish ordinary merchants, materials suppliers, delivery suppliers, farmers/growers, seedling suppliers, and out-of-town wholesalers.
- Admin should manage market configuration placeholders: market list, operating hours, announcements, delivery rules, stall numbers, service ranges, and merchant-market binding.
- Admin pickup-card management owns card types, batches, card numbers, redemption records, fulfillment risk, freezing/voiding, and operation logs. It must not present pickup cards as coupons or payments.
- Admin should reserve live-stream operations placeholders: live room review, live content risk, featured live slots, complaint records, and replay/content takedown. Do not connect real streaming platforms in low-risk tasks.
- Keep workflows auditable. Important state changes should expose operator-visible status, timestamps, and failure reasons where existing APIs support them.
- Do not weaken RBAC, permission, audit, payout, settlement, refund, or commission rules.

## Seller Panel China Merchant Rules

- Treat Seller Panel as a role-based operations workspace for merchants and approved suppliers.
- Chinese menu labels should support merchant workflows: 首页, 商品, 订单, 物流, 售后, 客服, 店铺装修, 市场物料, 上游货源, 数据, 财务, 设置.
- Vendor UI should show market context, stall number, multi-market hints, market announcements, operating hours, and delivery rule summaries.
- Vendor UI should reserve separate workspaces or module-gated entries for materials suppliers, delivery suppliers, farmers/growers, seedling suppliers, and out-of-town wholesalers.
- Market-supply procurement is merchant-facing only; it must be clearly separated from consumer shopping.
- Vendor UI should reserve live-commerce placeholders: start live placeholder, live product selection, live announcements, live orders/consultation placeholders, and replay management. Do not connect real live streaming, IM, or payment services.
- Mobile quick listing and AI one-sentence listing should create drafts or mock previews first, with explicit merchant confirmation before any future real listing action.
- Shop decoration is part of seller operations and should include homepage modules, product groups, announcements, credentials, delivery notes, and preview placeholders.
- Logistics should reserve express printing/e-waybill placeholders: pending print orders, waybill preview, printer settings, print history, and batch printing. These must not call real logistics APIs or mutate real order states in low-risk UI tasks.
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
