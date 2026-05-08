# China Template Registry Read Model

Readonly contract skeleton for China-localized UI templates.

This module is intentionally not registered as runtime infrastructure. It only
defines a stable view shape for future Storefront, Admin, and Vendor template
work.

It must not decide permissions, feature flags, payment success, orders, refunds,
settlements, commissions, payouts, checkout shipping options, fulfillment,
provider configuration, or real credentials.

The contract includes v2 preview template ids for:

- `storefront-home-market-shop-v2`
- `storefront-shop-stall-v2`
- `admin-dashboard-ops-v2`
- `vendor-role-workspace-v2`

These ids remain read-only descriptors. They do not enable runtime template
switching, menu permissions, business feature flags, checkout behavior, or
provider integrations.
