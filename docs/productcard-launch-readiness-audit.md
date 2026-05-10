# ProductCard Launch Readiness Audit

更新时间：2026-05-10 Asia/Shanghai

## 结论

ProductCard 主购买链路可以进入上线前 QA，但仍有一个必须跟进的阻断风险：商品详情页的“同档口更多鲜货”会经 `HomeProductSection` / `HomeProductsCarousel` 优先使用 `prod.seller?.products`，该路径的 `Product[]` 不一定包含 `variants.calculated_price`。在它被确认回退到 Store API 完整商品对象、或明确降级为不可加购展示前，不能把 ProductCard 全面标记为上线 ready。

硬边界不变：真正可点击、可进入详情、可加购的商品卡只接受 Store API / Medusa 商品事实；商品发现 read model 的 `priceText`、`stockText`、`sourceTags` 和 fallback 商品只能作为展示提示，不能决定价格、库存、可买性、履约、订单、支付、结算、佣金或权限。

本轮只做审计和上线清单，不修改运行时代码。

## 审计范围

核心文件：

- `apps/storefront/src/components/organisms/ProductCard/ProductCard.tsx`
- `apps/storefront/src/lib/helpers/get-product-price.ts`
- `apps/storefront/src/lib/data/products.ts`
- `apps/storefront/src/components/organisms/ProductsList/ProductsList.tsx`
- `apps/storefront/src/components/organisms/HomeProductsCarousel/HomeProductsCarousel.tsx`
- `apps/storefront/src/components/sections/HomeProductSection/HomeProductSection.tsx`
- `apps/storefront/src/components/sections/ProductDetailsPage/ProductDetailsPage.tsx`
- `apps/storefront/src/components/molecules/ProductListingProductsView/ProductListingProductsView.tsx`
- `apps/storefront/src/app/[locale]/(main)/search/page.tsx`
- `apps/storefront/src/app/[locale]/(main)/sellers/[handle]/page.tsx`
- `apps/storefront/src/app/[locale]/(main)/data/china-product-discovery-input-contract.ts`

## 当前事实来源

### ProductCard

`ProductCard` 接受 `HttpTypes.StoreProduct | Product`，展示以下字段：

- `product.title`
- `product.handle`
- `product.thumbnail`
- `product.tags`
- `product.seller`
- `product.variants[].calculated_price`

价格通过 `getProductPrice()` 从 variant `calculated_price` 中取 cheapest price，并用 `convertToLocale()` 格式化。没有使用商品发现 `priceText`、`stockText` 或 `sourceTags` 来计算价格。

### Store API 商品列表

`listProducts()` 调用 `/store/products`，请求字段包含：

- `*variants.calculated_price`
- `+variants.inventory_quantity`
- `*seller`
- `*variants`
- `*attribute_values`

它按 region / country code 获取商品，并过滤 `seller.store_status === "SUSPENDED"` 的商品。当前 ProductCard 的真实可加购列表来自这条 Store API 链路。

### 使用点

确认的真实 ProductCard 使用点：

| Surface | 使用方式 | 上线判断 |
| --- | --- | --- |
| Search `真实商品结果 / 可加购商品` | `realProducts.map(product => <ProductCard />)` | 通过 Store API 获取，允许进入详情和购物车 |
| Seller mobile `今日可买` | `realProducts.slice(0, 4).map(product => <ProductCard />)` | 通过 seller product ids + Store API 获取 |
| Seller desktop `今日可买` | `realProducts.slice(0, 8).map(product => <ProductCard />)` | 通过 seller product ids + Store API 获取 |
| ProductsList | `HttpTypes.StoreProduct[]` | Store API 商品列表 |
| ProductListingProductsView | `HttpTypes.StoreProduct[]` | Store API 商品列表 |
| HomeProductsCarousel 首页路径 | `listProducts()` | Store API 商品列表 |
| ProductDetailsPage 同档口更多鲜货 | `prod.seller?.products -> HomeProductSection -> HomeProductsCarousel` | 阻断风险：`Product[]` 可能缺少 variants/calculated price，必须回退 Store API 完整商品或降级为不可加购展示 |

## 阻断风险

### ProductDetailsPage 同档口更多鲜货

当前路径：

```text
ProductDetailsPage
-> HomeProductSection products={prod.seller?.products}
-> HomeProductsCarousel sellerProducts={products.slice(0, 4)}
-> ProductCard product={product}
```

风险：

- `prod.seller?.products` 类型是 `Product[]`，不一定带 `variants.calculated_price`。
- `HomeProductsCarousel` 在 `sellerProducts.length` 非空时优先使用 `sellerProducts`，不会优先使用刚刚通过 `listProducts()` 获取的 Store API 完整商品。
- ProductCard 对缺少 calculated price 的商品会显示“价格待确认”。这本身不会改交易状态，但如果该区域被用户理解成真实可加购 ProductCard，会削弱上线判断。

上线前必须二选一：

- 修复：让同档口更多鲜货按 handle 回查 Store API 完整商品，并只向 ProductCard 传入带 variants/calculated price 的商品对象。
- 降级：把同档口更多鲜货改成明确的不可加购展示区，不使用 ProductCard，不展示为真实购买入口。

在完成其中一项前，ProductCard 不能标记为全站 ready。

## 商品发现展示边界

Storefront 商品发现相关字段包括：

- `source`
- `sourceTags`
- `priceText`
- `specText`
- `stockText`
- `sellerHandle`
- `market`
- `booth`

这些字段仅用于首页、搜索页、店铺页的“今日鲜货 / 相关鲜货展示 / 档口参考”这类展示模块。它们不得作为以下事实来源：

- ProductCard price。
- Variant price。
- Inventory quantity。
- Add-to-cart eligibility。
- Shipping option。
- Cart total。
- Order state。
- Payment state。
- Refund state。
- Settlement / commission / payout。
- Permission / RBAC。
- Fulfillment / logistics / waybill。

`china-product-discovery-input-contract.ts` 已明确：真实商品卡继续走 Store API 和 ProductCard，不由 adapter 改写交易事实；`priceText` 和 `stockText` 是展示字段，真实价格、库存和配送以商品详情、购物车和结算链路为准。

## 上线 Go 条件

ProductCard 进入上线 QA 前必须满足：

- ProductCard 输入为 Store API 商品或等价的完整商品对象，包含 handle、title、thumbnail、variants 和 calculated price。
- 没有使用 product discovery `priceText` 覆盖 ProductCard price。
- 没有使用 product discovery `stockText` 判断可买性。
- 没有使用 `sourceTags` 做用户画像、订单、支付、库存或结算判断。
- 搜索页、店铺页的可加购区块继续用真实 Store API 商品，样例区块不能提供真实加购入口。
- 商品详情页仍是规格、数量、价格和加入购物车的实际确认位置。
- 商品详情页“同档口更多鲜货”不得把缺少 variants/calculated price 的 seller products 当作真实可加购 ProductCard；必须先回查 Store API 完整商品或降级为不可加购展示。

## No-Go

出现以下任一情况必须停止：

- 把 `priceText` 当作真实价格写入 ProductCard。
- 把 `stockText` 当作库存占用或售罄判断。
- 使用 `sourceTags` 或 fallback source 影响商品可买性。
- 从静态样例商品直接跳真实 cart / checkout。
- 在 ProductCard 中新增支付、结算、履约或权限判断。
- ProductCard 自行调用 add-to-cart，绕过商品详情规格确认。
- 商品详情页同档口轮播继续把不完整 `Product[]` 当作真实 ProductCard，同时又被标记为上线 ready。

## QA 清单

手工 QA 建议覆盖：

- 首页：今日鲜货展示字段不出现假加购按钮；进入真实购买路径时仍经商品详情。
- 搜索页：有真实商品时，“可加购商品”区显示真实 ProductCard；无真实商品时只展示样例提示。
- 店铺页：`今日可买` 使用当前 seller 的真实商品；`档口今日参考 / 常卖鲜货` 仅展示参考字段。
- 商品详情页：价格、规格、数量、seller、配送提示均以 Store API / 详情页状态为准。
- 商品详情页：同档口更多鲜货如果仍显示 ProductCard，必须确认每个卡片来自 Store API 完整商品并显示真实 calculated price；否则只能展示不可加购参考内容。
- 购物车：从详情页加购后 cart item 的商品名、价格、数量、币种为 CNY。

## 后续小 PR

1. `cart-checkout-launch-safety-audit`
   - 审计 cart、checkout、address、shipping method、payment session 调用点。
   - 不改 mutation 语义。

2. `productdetails-related-products-store-api-guard`
   - 修复或降级商品详情页同档口更多鲜货。
   - 不改 ProductCard add-to-cart 语义。

3. `productcard-launch-qa-runbook`
   - 可选，补充截图路径、HTTP smoke 和用户验收用例。

4. `productcard-display-source-guard`
   - 仅在发现 ProductCard 被错误输入 display-only 商品时才实现 guard。
   - 必须保持不改变 add-to-cart 语义。

## 本 PR 验证

```bash
grep -R -n 'ProductCard' apps/storefront/src/app apps/storefront/src/components apps/storefront/src/lib | sort
grep -R -n 'sourceTags\|store_product_table\|priceText\|stockText' apps/storefront/src/app/[locale]/\(main\) apps/storefront/src/components | head -n 180
cd apps/storefront && /home/codex/.bun/bin/bun run build
git diff --check
```

预期：

- Storefront build 通过，允许保留既有 React Hook dependency warnings。
- `git diff --check` 无输出。
