# China Market Membership Migration Skeleton

This folder contains the first database migration skeleton for China-local market membership data.

## Runtime Boundary

- Not registered in `packages/api/medusa-config.ts`.
- No service is exported to existing routes.
- No seed data is inserted.
- No Admin, Vendor, or Storefront UI is changed.
- No checkout, order, payment, refund, payout, settlement, commission, permission, or fulfillment behavior is changed.

## Tables

- `china_market`
- `china_market_membership`
- `china_seller_role`
- `china_market_announcement`
- `china_market_business_hour`
- `china_market_delivery_profile`

## Guardrails

- Foreign keys to Mercur or Medusa core tables are intentionally deferred so this PR does not couple lifecycle rules before the real read repository is reviewed.
- Booth number uniqueness is intentionally not enforced yet. Existing data must be audited before adding a partial unique index because one seller can operate across multiple markets and legacy mock data may be incomplete.
- Delivery profile rows are display and configuration records only. They do not create shipping options, mutate checkout, or confirm delivery.
- Role rows describe China-local business role hints only. They are not RBAC permissions.
- Membership rows include `stall_name` and `merchant_type_keys` so Vendor/Admin read-only views can display stall identity and business type without inferring permissions.

## Next Step

The next PR should add a read-only repository adapter that can map these tables into the existing China market read model without switching live routes yet.
