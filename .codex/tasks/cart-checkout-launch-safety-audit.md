# cart-checkout-launch-safety-audit

## 目标

完成 cart / checkout 上线前安全审计，明确当前可 QA 的既有 Medusa 购物车/结算路径，以及中国本地支付、订单、配送、退款、结算、佣金和权限上线前必须阻断的条件。

## 范围

- cart 创建、加购、更新、删除、region / CNY 基线。
- checkout 无 cart redirect。
- address、shipping method、payment session、place order 调用点。
- Stripe / manual payment 既有前端完成路径的中国支付风险。
- 上线 Go / No-Go、smoke 和后续 PR 顺序。

## 非目标

- 不修改 `apps/**` 或 `packages/**` runtime。
- 不改变 `setAddresses`、`setShippingMethod`、`initiatePaymentSession`、`placeOrder` 语义。
- 不接支付宝、微信支付、真实退款、真实对账、结算、佣金、权限、履约或物流。
- 不注册 payment migration，不执行 payment workflow。

## 验证

```bash
grep -R -n 'setAddresses\|setShippingMethod\|initiatePaymentSession\|placeOrder\|completeCart' apps/storefront/src/app/[locale]/\(checkout\) apps/storefront/src/app/[locale]/\(main\)/cart apps/storefront/src/components/sections/Cart* apps/storefront/src/lib/data | head -n 240

cd apps/storefront
/home/codex/.bun/bin/bun run build

cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn
git diff --check
```

## 交付

- `docs/cart-checkout-launch-safety-audit.md`
- ledger / queue 更新

