# China Payment Notification Skeleton

This module is mock-only and intentionally unregistered.

Boundaries:

- Do not register this module in `packages/api/medusa-config.ts`.
- Do not call it from checkout, payment, order, refund, settlement, commission, payout, permission, workflow, subscriber, job, route, or link runtime code.
- Do not store real Alipay, WeChat Pay, merchant, certificate, private key, app id, webhook token, or production credentials here.
- Do not use frontend return URLs as payment success truth.
- Mock notification output must stay as normalized envelopes and unit-test fixtures until a dedicated high-risk task introduces an inbox/model and runtime switch.

The current exports only support fake signed payload normalization for tests and future adapter review.

`migrations/Migration20260507000200.ts` is a skeleton only. It is not registered in `medusa-config.ts` in this phase and must not be applied to production or preprod without a separate approved high-risk task.
