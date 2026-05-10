# ProductDetails Related Products Store API Guard

更新时间：2026-05-10 Asia/Shanghai

## 目标

商品详情页“同档口更多鲜货”之前会把 `prod.seller?.products` 传给 `HomeProductSection`，再由 `HomeProductsCarousel` 在 `sellerProducts.length` 非空时优先传给 `ProductCard`。这条路径的 `Product[]` 不一定包含 `variants.calculated_price`，不适合作为真实可加购 ProductCard 输入。

本轮把 `sellerProducts` 降级为 handle 查询条件，ProductCard 只接 Store API 回查到的完整商品。

## 改动

文件：

- `apps/storefront/src/components/organisms/HomeProductsCarousel/HomeProductsCarousel.tsx`

调整：

- `sellerProducts` 继续用于非首页路径的 handle 查询。
- `displayableProducts` 改为只来自 `listProducts()` 返回的 Store API `products`。
- 只有具备 handle、title、thumbnail 且至少一个 variant 带 `calculated_price` 的商品才进入 ProductCard。
- 如果回查不到完整商品，则展示既有空态“暂无可展示商品”，不再把不完整 seller product 伪装成可加购卡片。

## 安全边界

本轮没有修改：

- ProductCard 内部价格计算。
- 商品详情页规格选择。
- add-to-cart。
- cart。
- checkout。
- order。
- payment。
- refund。
- settlement / commission / payout。
- permission / RBAC。
- fulfillment / logistics / waybill。

## 上线判断

通过后，ProductCard 的关键可加购使用点满足：

- 搜索页真实商品结果：Store API 商品。
- 店铺页今日可买：seller product ids + Store API 商品。
- 列表页和商品列表组件：Store API 商品。
- 商品详情页同档口更多鲜货：seller product handles + Store API 回查商品。

Product discovery 的 `priceText`、`stockText`、`sourceTags` 和 fallback 商品仍只作为展示字段，不进入 ProductCard 交易事实。

## 验证

```bash
cd apps/storefront && /home/codex/.bun/bin/bun run build
git diff --check
```

预期：

- Storefront build 通过，允许保留既有 React Hook dependency warnings。
- `git diff --check` 无输出。

## 回滚

回滚本 PR 会恢复 `HomeProductsCarousel` 对 `sellerProducts` 的直接展示。若回滚，ProductCard 上线审计中的“商品详情页同档口更多鲜货”阻断风险也会恢复，不能标记为全站 ready。

