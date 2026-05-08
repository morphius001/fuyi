# Storefront Product Discovery QA Runbook

更新时间：2026-05-09 Asia/Shanghai

## Purpose

本 runbook 用于人工验证 Storefront 商品发现只读绑定。它覆盖首页、搜索页和店铺页，但不把商品发现字段当作真实价格、库存、履约、订单、结算、佣金、权限或支付事实。

## Preconditions

- Storefront 能成功 build。
- Store API 可访问。
- 本地或测试环境具备至少一个 open seller 和 published product 时，可验证真实商品发现路径。
- 无商品或 API fallback 场景可通过空数据环境、临时禁用 API 访问或观察 client fallback 行为验证。
- 不使用真实微信支付、支付宝、短信、IM、物流或直播 provider。

## Surface Matrix

| Surface | URL | Expected readonly source | Fallback |
| --- | --- | --- | --- |
| 首页今日鲜货 | `/{locale}` | `retrieveChinaProductDiscovery({ limit: 8 })` 的 `store_product_table` items | 静态 `freshProducts` |
| 搜索相关鲜货展示 | `/{locale}/search?q=...` | `retrieveChinaProductDiscovery({ query, market, limit: 8 })` 的 `store_product_table` items 且必须有 `sellerHandle` | 静态 `productResults` |
| 店铺档口参考 | `/{locale}/sellers/{handle}` | `retrieveChinaProductDiscovery({ sellerHandle, limit: 8 })` 的当前 seller `store_product_table` items | 静态 `shop.products` |

## Checks

### 首页

- 页面首屏能正常渲染市场、类目、档口和今日鲜货。
- 商品发现有真实商品时，今日鲜货文案展示商品标题、规格、价格提示、库存提示、商家名和档口信息。
- 商品发现无结果或 API fallback 时，今日鲜货仍展示静态鲜货，不出现空白卡片或运行时报错。
- 点击首页今日鲜货仍进入搜索页，不直接创建购物车或订单。

### 搜索页

- 真实可加购商品区域仍显示 Store API + `ProductCard` 结果。
- “相关鲜货展示 / 市场样例”可展示商品发现字段，但按钮仍是“进店”和“样例展示”语义。
- 没有 `sellerHandle` 的商品发现项不应生成进店链接。
- 无搜索词时页面可显示“今日鲜货”文案，但 adapter 不用该默认文案二次过滤商品发现结果。
- 无商品发现结果时，市场样例回退静态 `productResults`。

### 店铺页

- 真实可加购商品区域仍由 seller product ids、Store API 和 `ProductCard` 渲染。
- “档口今日参考 / 常卖鲜货”可展示当前 seller 的商品发现字段。
- 非当前 seller handle 的商品发现项不应进入当前店铺参考商品。
- 无商品发现结果时，店铺参考商品回退静态 `shop.products`。
- 店铺履约提示仍只展示，不影响 checkout shipping options。

## Failure Criteria

以下情况应阻止继续发布：

- 商品发现字段替代了真实 `ProductCard` 可加购商品路径。
- 页面点击展示卡后直接修改 cart、checkout、订单、支付、退款、结算、佣金、权限、履约或物流状态。
- API fallback 造成首页、搜索页或店铺页主商品展示区域空白且无提示。
- 搜索页进店链接使用 seller id 而不是 seller handle。
- 店铺页展示了其他 seller handle 的商品发现结果。

## Evidence To Capture

- Storefront build 输出。
- `git diff --check` 输出。
- 首页、搜索页、店铺页各一张桌面截图。
- 首页、搜索页、店铺页各一张移动截图。
- 若截图写入 `docs/visual-qa-artifacts/`，必须保持本地 QA 产物，不纳入 PR。

## Rollback

- 首页异常：回滚 `storefront-home-product-discovery-source-binding`。
- 搜索页异常：回滚 `storefront-search-product-discovery-source-binding`。
- 店铺页异常：回滚 `storefront-shop-product-discovery-source-binding`。
- 全阶段异常：按 `docs/storefront-product-discovery-phase-rollup.md` 的 PR 顺序回滚。

回滚不应影响 cart、checkout、order、payment、refund、settlement、commission、permission、fulfillment 或 logistics runtime。
