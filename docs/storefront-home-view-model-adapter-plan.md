# Storefront 首页 View Model Adapter 计划

更新时间：2026-05-08 Asia/Shanghai

## 目标

下一步首页真正绑定 mapper 前，应先新增一个 Storefront 侧 adapter。这个 adapter 只负责把 Storefront 已有数据源整理成 `buildChinaStorefrontHomeView()` 的输入，不改页面布局。

本计划只写边界，不新增代码。

## 建议文件位置

后续实现 PR 可考虑：

```text
apps/storefront/src/app/[locale]/(main)/data/china-home-view-model.ts
apps/storefront/src/app/[locale]/(main)/data/__tests__/china-home-view-model.test.ts
```

如果当前 Storefront 没有前端单测基础，可以先放纯函数并用现有 build 验证，避免引入新依赖。

## Adapter 输入

### Discovery Input

来源：

- `/store/china/discovery`

字段用途：

- `markets` -> `marketSelector`
- `categories` -> `categoryNav`
- `sellers` -> `featuredSellers`

失败策略：

- 网络失败、返回为空或结构不匹配时，使用静态 fallback discovery。
- 页面文案只写“展示数据待后台更新”，不要露出 API / fallback / metadata。

### Product Card Input

来源：

- `/store/products`
- 后续 seller/product relation bridge

字段用途：

- `id`
- `title`
- `handle`
- `sellerId`
- `sellerName`
- `market`
- `booth`
- `priceText`
- `specText`
- `stockText`

限制：

- 只读展示。
- 不锁库存。
- 不创建 cart。
- 不创建 order。
- 不写 shipping option。

### Static Fallback Input

来源：

- 当前首页静态市场、类目、店铺、商品展示数据。

用途：

- API 不可用时保持首页可读。
- 空商品时显示静态展示样例或空状态。

限制：

- 不把静态数据标成真实库存、真实销量或真实可发货事实。

## Adapter 输出

输出应直接是：

```ts
ChinaStorefrontHomeView
```

并保持：

- `templateId = storefront-home-market-shop-v2`
- `readOnly = true`
- `runtimeEnabled = false`
- `canWriteBusinessState = false`
- `locale = zh-CN`
- `currency = CNY`
- `timezone = Asia/Shanghai`

## 合成顺序

建议顺序：

1. 读取 discovery。
2. 读取 product cards。
3. 标准化 product card 展示字段。
4. 调用 `buildChinaStorefrontHomeView({ discovery, products })`。
5. 如果 discovery / products 均不可用，传入静态 fallback discovery / products。
6. 返回 view model 给页面。

## 错误处理

adapter 不应 throw 给页面导致首页崩溃。

建议策略：

- discovery 失败：记录本地 dev warning，返回 fallback discovery。
- products 失败：返回空 products 或 fallback products。
- discovery 和 products 都失败：返回带 `fallbackNotice` 的 view model。

消费者文案：

- 可以写“首页展示数据待后台更新”。
- 不写“API 失败”。
- 不写“fallback”。
- 不写“mock”。

## 测试建议

若不引入新依赖，先做：

- 纯函数输入输出单测，如果现有 Storefront test runner 可用。
- 否则在实现 PR 中跑 `cd apps/storefront && bun run build`。
- 页面绑定 PR 再补浏览器截图。

核心测试场景：

- discovery 成功 + products 成功。
- discovery 成功 + products 为空。
- discovery 失败 + static fallback。
- B-side supplier 不进入首页主路径。

## 禁止事项

adapter PR 不允许：

- 改首页布局。
- 改购物车。
- 改结算。
- 改订单。
- 改支付。
- 改退款。
- 改结算、佣金、打款。
- 改权限。
- 改履约、物流、面单。
- 接真实搜索、推荐、广告、直播、IM、提货卡兑换或 Provider。

## 验收

实现 PR 最低验收：

- `cd apps/storefront && bun run build`
- `git diff --check`
- `/cn` 页面仍可打开。
- 首页首屏不出现 B-side 供应商主路径。
- 静态 fallback 保留。

## 回滚

adapter 实现必须保留旧静态数据分支。若线上 discovery 或 products 数据异常，可快速切回静态 fallback，不影响 cart、checkout、order 或 payment。
