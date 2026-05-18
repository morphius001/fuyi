# China Payment Notification Module

This module is registered for migration discovery and isolated review-query-surface
read-path validation, but it remains runtime-restricted.

Boundaries:

- Do not call it from checkout, payment, order, refund, settlement, commission, payout, permission, workflow, subscriber, job, route, or link runtime code.
- Do not store real Alipay, WeChat Pay, merchant, certificate, private key, app id, webhook token, or production credentials here.
- Do not use frontend return URLs as payment success truth.
- Mock notification output must stay as normalized envelopes and unit-test fixtures until a dedicated high-risk task introduces an inbox/model and runtime switch.
- Registered migrations are only for schema discovery and isolated/local rehearsal. They are not approval to write production refund state or run workflow mutation logic.

The current exports only support fake signed payload normalization for tests and future adapter review.

`migrations/Migration20260507000200.ts`, `Migration20260512000300.ts`, and `Migration20260514000100.ts`
must still be validated with disposable/local rehearsal before any broader runtime
adoption.
