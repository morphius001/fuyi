# Storefront 店铺页绑定 View Model 计划

更新时间：2026-05-08 Asia/Shanghai

## 目标

下一步要把消费者店铺 / 档口页逐步绑定到 `storefront-shop-stall-v2` view model。这个计划只说明绑定方式，不改页面代码。

店铺页主职责：

1. 展示店铺 / 档口身份
2. 展示市场、档口号、主营类目和经营状态
3. 在店铺头部展示配送、自提、营业时间和公告
4. 展示店铺商品卡
5. 显示提货卡独立入口和直播状态 badge

## 当前基础

已具备：

- `buildChinaStorefrontSellerView()`
- `storefront-shop-stall-v2` template registry id
- Storefront 店铺 / 档口页 v2 视觉基础
- `/store/china/sellers/:handle/products` 只读 seller product ids API

尚未完成：

- 店铺页还没有实际消费 shop view model。
- 店铺页商品卡和店铺头部数据仍有静态 fallback。
- 市场营业时间、公告、履约配置尚未从真实结构化模型读取。
- B-side supplier shop 的可见性还没有真实权限 / audience / business type。

## 绑定输入

### 1. Seller View

来源：

- `/store/china/discovery`
- `/store/china/sellers/:handle/products`
- 后续真实 seller read model

用途：

- 店铺名
- handle
- market
- booth
- 主营类目
- seller summary

限制：

- 只读。
- 不写 seller。
- 不改变权限、订单归属、结算主体或履约事实。

### 2. Market Context

来源：

- 中国市场只读合同
- 后续真实 market read model

用途：

- 市场名称
- 营业时间
- 市场公告
- 市场配送说明

限制：

- 只作为店铺页展示上下文。
- 不写 checkout shipping options。
- 不写真实配送单、运单或面单。

### 3. Product Cards

来源：

- Store API products
- seller product ids

用途：

- 展示当前店铺可见商品
- 规格、价格、库存提示

限制：

- 商品卡不放“提供统一配送能力”这类店铺级文案。
- 商品卡不占库存。
- 商品卡不创建购物车或订单。
- 商品卡不决定配送方式。

### 4. Static Fallback

来源：

- 现有店铺页静态展示数据

用途：

- API 失败时保留可读页面。
- seller 不存在或商品为空时给消费者提示。

限制：

- 不把静态数据当生产商品、生产库存或生产价格。
- 消费者文案不能出现工程化 `mock`、`fallback`、`metadata`。

## 页面绑定拆分

建议拆为三个小 PR。

### PR 1: Shop View Model Adapter

范围：

- 新增 Storefront 侧 adapter，把 seller、market context、product cards、fallback 输入喂给 mapper。
- 不改页面布局。

验收：

- Storefront build 通过。
- adapter 能处理 seller 缺失、market context 缺失和空商品。
- 不触碰 checkout / cart / order。

### PR 2: Shop Header Binding

范围：

- 店铺头部读取 view model 的 seller、marketContext、fulfillmentHint。
- 配送、自提、营业时间、公告统一放在店铺头部。
- 直播只显示 status badge。

验收：

- 店铺页头部清楚显示市场、档口号、配送/自提规则。
- 商品卡不再承担配送规则解释。
- B-side supplier shop 如进入页面，应标为 role-gated preview 或展示受限说明。

### PR 3: Shop Product Cards Binding

范围：

- 店铺商品区读取 view model 的 products。
- 保留静态 fallback。

验收：

- 只展示当前店铺商品。
- 商品卡只显示规格、价格、库存提示。
- 空商品时展示可理解空状态。
- 不创建购物车、订单、库存占用或履约状态。

## 提货卡和直播

提货卡：

- 店铺页最多显示独立入口。
- 不作为优惠券。
- 不作为储值卡。
- 不作为支付方式。
- 不作为购物车抵扣。

直播：

- 仅作为店铺 status badge 或局部入口。
- 不作为首页主入口。
- 不接真实直播 provider。
- 不接真实 IM。
- 不改变交易事实。

## B-side Supplier Shop

对于物料供应商、配送供应商、上游供给、种苗批发、外地批发商：

- 不进入消费者首页主路径。
- 如果用户直接访问店铺 URL，可以展示 `role_gated_preview_only` 的受限预览。
- 真正开放前必须补：
  - 结构化 audience / business type
  - Admin 可见性配置
  - 商户角色审核
  - 权限和运营日志
  - Storefront 可见性测试

## 验收清单

自动验证：

- `cd apps/storefront && bun run build`
- `git diff --check`

手动 / 浏览器验证：

- 普通生鲜 / 海鲜档口页。
- 水果蔬菜店铺页。
- B-side supplier 直接访问页。
- 空商品页。
- API 失败 fallback。

安全验证：

- 不修改 checkout / cart。
- 不修改 order / payment / refund。
- 不修改 settlement / commission / payout。
- 不修改 permission / RBAC。
- 不修改 fulfillment / logistics / waybill。
- 不接真实直播 / IM / 提货卡兑换。

## 回滚

页面绑定 PR 必须保留旧静态 fallback；如线上店铺页异常，可以先关闭 adapter 调用或回退到静态店铺数据，不影响 checkout、订单、支付或履约。

## 结论

店铺页可以开始绑定 view model，但先做 adapter，再绑定店铺头部，最后绑定商品卡。配送、自提、营业时间和公告必须归属店铺头部；商品卡只负责商品展示。
