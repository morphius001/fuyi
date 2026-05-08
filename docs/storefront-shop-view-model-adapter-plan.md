# Storefront 店铺页 View Model Adapter 计划

更新时间：2026-05-08 Asia/Shanghai

## 目标

下一步店铺 / 档口页真正绑定 mapper 前，应先新增一个 Storefront 侧 adapter。这个 adapter 只负责把 Storefront 已有 seller、product ids、products、market context 和 static fallback 整理成 `buildChinaStorefrontSellerView()` 的输入，不改页面布局。

本计划只写边界，不新增代码。

## 建议文件位置

后续实现 PR 可考虑：

```text
apps/storefront/src/app/[locale]/(main)/data/china-shop-view-model.ts
apps/storefront/src/app/[locale]/(main)/data/__tests__/china-shop-view-model.test.ts
```

如果当前 Storefront 没有前端单测基础，可以先放纯函数并用 build + HTTP smoke 验证，避免引入新依赖。

## Adapter 输入

### Seller Handle

来源：

- route params

用途：

- 查找当前店铺 / 档口。

失败策略：

- handle 不存在时，返回 `not_found` 或静态 fallback view，由页面决定显示 404 还是空状态。
- 不创建 seller。
- 不改权限。

### Seller Product Ids

来源：

- `/store/china/sellers/:handle/products`

用途：

- 限定当前店铺商品范围。

失败策略：

- API 失败时，回退静态店铺商品展示。
- 返回为空时，显示空商品状态。

限制：

- 只读。
- 不写 seller-product relation。
- 不改变订单归属或结算主体。

### Products

来源：

- `/store/products`

用途：

- 组装当前店铺商品卡。

限制：

- 商品卡只展示规格、价格、库存提示。
- 不占库存。
- 不创建 cart。
- 不创建 order。
- 不决定 shipping option。

### Market Context

来源：

- discovery read model
- market readonly contract
- 后续真实 market read model

用途：

- 市场名称
- 档口号
- 营业时间
- 公告
- 配送 / 自提说明

限制：

- 只放在店铺头部。
- 不写 checkout shipping options。
- 不写履约单、运单或面单。

### Static Fallback

来源：

- 当前店铺页静态展示数据。

用途：

- seller API 或 product API 失败时保持页面可读。
- B-side supplier 直达页可以显示受限预览。

限制：

- 不把静态数据当生产商品、生产库存或生产价格。
- 消费者文案不能出现工程化 `mock`、`fallback`、`metadata`。

## Adapter 输出

输出应直接是：

```ts
ChinaStorefrontSellerView
```

并保持：

- `templateId = storefront-shop-stall-v2`
- `readOnly = true`
- `runtimeEnabled = false`
- `canWriteBusinessState = false`
- `locale = zh-CN`
- `currency = CNY`
- `timezone = Asia/Shanghai`
- `fulfillmentHint.placement = shop_header`
- `fulfillmentHint.affectsCheckoutShippingOptions = false`

## 合成顺序

建议顺序：

1. 从 route params 读取 seller handle。
2. 读取 seller product ids。
3. 读取 Store API products。
4. 读取或合成 seller discovery view。
5. 读取 market context。
6. 过滤 products 到当前 seller。
7. 调用 `buildChinaStorefrontSellerView({ seller, products, markets })`。
8. 如果 seller/product/market 任一失败，补 static fallback 输入。
9. 返回 view model 给页面。

## 特殊场景

### Seller 不存在

建议：

- adapter 返回明确空状态或 not found 结果。
- 页面不要展示其他店铺商品冒充当前店铺。

### 无商品

建议：

- 返回空 products。
- 保留店铺头部。
- 显示“该店铺商品展示待后台更新”。

### B-side Supplier 直达页

建议：

- 允许 adapter 返回 `visibility = role_gated_preview_only`。
- 页面显示受限预览或引导登录 / 商户认证。
- 不进入消费者首页推荐和搜索主路径。

## 错误处理

adapter 不应让页面整体崩溃。

建议策略：

- seller product ids 失败：使用静态店铺商品 fallback。
- products 失败：返回空商品或静态商品卡。
- market context 失败：保留 seller，显示市场信息待后台更新。

消费者文案：

- 可以写“店铺商品展示待后台更新”。
- 可以写“配送和自提信息以店铺公告为准”。
- 不写“API 失败”。
- 不写“fallback”。
- 不写“mock”。

## 测试建议

若不引入新依赖，先做：

- 纯函数输入输出单测，如果现有 Storefront test runner 可用。
- 否则在实现 PR 中跑 `cd apps/storefront && bun run build`。
- 页面绑定 PR 再补浏览器截图。

核心测试场景：

- 普通 seller + products + market context。
- seller product ids 为空。
- market context 缺失。
- B-side supplier 直达页。
- products API 失败 fallback。

## 禁止事项

adapter PR 不允许：

- 改店铺页布局。
- 改购物车。
- 改结算。
- 改订单。
- 改支付。
- 改退款。
- 改结算、佣金、打款。
- 改权限。
- 改履约、物流、面单。
- 接真实直播 / IM。
- 接真实提货卡兑换。
- 接真实 Provider。

## 验收

实现 PR 最低验收：

- `cd apps/storefront && bun run build`
- `git diff --check`
- 普通店铺页可打开。
- 空商品页可读。
- B-side supplier 直达页不进入消费者默认主路径。
- 商品卡不承担配送规则解释。

## 回滚

adapter 实现必须保留旧静态店铺数据分支。若线上 seller/product/market 数据异常，可以快速切回静态 fallback，不影响 cart、checkout、order 或 payment。
