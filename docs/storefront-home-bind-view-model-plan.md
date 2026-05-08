# Storefront 首页绑定 View Model 计划

更新时间：2026-05-08 Asia/Shanghai

## 目标

下一步要把消费者首页从分散的静态展示数据，逐步迁到 `storefront-home-market-shop-v2` view model。这个计划只说明绑定方式，不改页面代码。

首页主路径保持：

1. 选市场
2. 看类目
3. 找店 / 档口
4. 看今日鲜货
5. 进入店铺详情

## 当前基础

已具备：

- `buildChinaDiscoveryReadModel()`
- `buildChinaStorefrontHomeView()`
- `storefront-home-market-shop-v2` template registry id
- Storefront 首页 v2 视觉基础

尚未完成：

- Storefront 首页还没有实际消费 home view model。
- 首页静态数据仍散在前端文件。
- 商品卡输入还没有统一从 Store API 和 discovery bridge 合成。
- B-side 内容隐藏目前是 mapper 层关键词规则，真实上线前需要结构化 audience / business type。

## 绑定输入

后续页面绑定 PR 应只准备三类输入：

### 1. Discovery Read Model

来源：

- `/store/china/discovery`

用途：

- 市场选择
- 类目导航
- 推荐店铺 / 档口

限制：

- 只读。
- 不写 market、seller、category。
- 不影响权限、履约、支付、订单。

### 2. Product Cards

来源：

- `/store/products`
- 后续可由 discovery bridge 组装 seller/product 关系

用途：

- 今日鲜货商品卡

限制：

- 商品卡只展示规格、价格、库存提示。
- 不锁库存。
- 不创建购物车。
- 不创建订单。
- 不决定 checkout shipping options。

### 3. Static Fallback

来源：

- 现有前端静态展示数据

用途：

- discovery API 失败时保持页面可读。
- 空市场、空类目、空商品时给消费者可理解提示。

限制：

- 不再写工程化 `mock`、`fallback`、`metadata` 文案给消费者。
- 不作为生产商品、生产库存或生产价格来源。

## 页面绑定拆分

建议拆为三个小 PR。

### PR 1: Home View Model Adapter

范围：

- 在 Storefront 侧新增轻量 adapter，负责把 discovery / product cards / fallback 输入喂给 mapper。
- 不改首页布局。

验收：

- Storefront build 通过。
- adapter 单测或最小 contract smoke 通过。
- API 失败时可返回 static fallback view。

### PR 2: Home First Screen Binding

范围：

- 首页首屏的市场、类目、推荐店铺读取 home view model。
- 保留旧静态 fallback。
- 不改购物车、结算、商品详情、店铺详情逻辑。

验收：

- `/cn` 桌面首屏无重复搜索框、无重复类目标题。
- 移动端首屏保持 App-like 短首页。
- B-side 供应商不进入首页主路径。

### PR 3: Home Product Cards Binding

范围：

- 今日鲜货商品卡从 view model 读取。
- 商品卡继续只展示规格、价格、库存提示。

验收：

- 商品卡不出现“统一配送能力”这类应该属于店铺头部的文案。
- 商品卡不触发库存占用、购物车、订单或配送方式写入。
- 空商品时展示消费者可理解的空状态。

## B-side 隐藏规则

首页默认不展示：

- 物料供应商
- 配送供应商
- 上游供给
- 种苗批发
- 外地批发商
- 直播主入口

后续如果平台要开放 B-side 内容给特定用户，必须另做：

- 结构化 `audience` / `business_type`
- Admin 配置
- 商户角色审核
- 权限和可见性测试

不能靠页面文案硬塞进消费者首页。

## 验收清单

自动验证：

- `cd apps/storefront && bun run build`
- `git diff --check`

手动 / 浏览器验证：

- `/cn` 桌面首屏。
- `/cn` 移动端首屏。
- discovery API 失败 fallback。
- 空商品 fallback。

安全验证：

- 不修改 checkout / cart。
- 不修改 order / payment / refund。
- 不修改 settlement / commission / payout。
- 不修改 permission / RBAC。
- 不修改 fulfillment / logistics / waybill。

## 回滚

页面绑定 PR 必须保留旧静态 fallback；如线上发现首页异常，可以通过回退 adapter 调用或关闭 view model 输入，恢复静态展示。

## 结论

首页可以开始绑定 view model，但必须分三步：先 adapter，再首屏市场/类目/店铺，最后商品卡。不要一次性重写整页，也不要把 B-side 内容、提货卡、直播或配送规则混到首页主路径。
