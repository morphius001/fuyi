# productcard-launch-readiness-audit

## 目标

完成 ProductCard 上线前审计，确认可加购商品卡继续以 Store API / Medusa 商品、variant 和 calculated price 为事实来源，商品发现只读字段不能越权决定价格、库存、可买性、履约、订单、支付、结算或权限。

## 范围

- 审计 `ProductCard` 的输入和价格来源。
- 审计 Storefront 各处 `ProductCard` 使用点。
- 审计 product discovery / view model 展示字段与真实 ProductCard 的边界。
- 形成上线 Go / No-Go 和后续 QA 清单。

## 非目标

- 不修改 `apps/**` 或 `packages/**` runtime。
- 不改变 add-to-cart、cart、checkout、order、payment、refund、settlement、commission、permission、fulfillment 或 logistics 行为。
- 不接真实库存占用、搜索排序、广告、推荐或 provider。

## 验证

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn
grep -R -n 'ProductCard' apps/storefront/src/app apps/storefront/src/components apps/storefront/src/lib | sort
grep -R -n 'sourceTags\|store_product_table\|priceText\|stockText' apps/storefront/src/app/[locale]/\(main\) apps/storefront/src/components | head -n 180

cd apps/storefront
/home/codex/.bun/bin/bun run build

cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn
git diff --check
```

## 交付

- `docs/productcard-launch-readiness-audit.md`
- ledger / queue 更新

