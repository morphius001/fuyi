# China Service Providers Mock Boundary

This directory contains mock-only provider contracts and in-memory implementations for China-local service integrations.

Current providers:

- `MockChatProvider`
- `MockSmsProvider`
- `MockLogisticsProvider`
- `MockLiveProvider`
- `MockAiListingProvider`

Important boundaries:

- This directory is not registered in `packages/api/medusa-config.ts`.
- Do not add this directory to `packages/api/medusa-config.ts` in this phase.
- Do not import these providers from API routes, workflows, subscribers, jobs, or links as runtime behavior.
- The exports are intended for unit tests, demos, and adapter boundary review only.
- It must not change runtime payment, order, refund, settlement, commission, payout, fulfillment, or permission behavior.
- It must not call real Tencent IM, Easemob, Aliyun SMS, Tencent SMS, Kuaidi100, Cainiao, object storage, or CDN services.
- It must not call real live streaming, push-stream, content moderation, speech recognition, OCR, vision, or AI model services.
- AI listing output must stay in draft form and must require merchant confirmation before any future real product create/update action.
- Live output must stay as a mock preview/session state and must not change product, order, payment, settlement, commission, or permission state.
- It must not contain real credentials, app ids, merchant ids, private keys, webhook secrets, or production credentials.
- All state is in memory and intended for tests, demos, and future adapter design only.
- Real providers must be introduced in separate adapter/provider files through explicit provider selection, environment-driven configuration, signature/callback verification where applicable, retry semantics, error mapping, and audit persistence.

If a future task needs production behavior, create a separate high-risk task and keep it serial.
