# Storefront 店铺页 View Model Adapter Skeleton

更新时间：2026-05-08 Asia/Shanghai

## 目标

本轮新增 Storefront 店铺 / 档口页 view model adapter skeleton，让后续店铺页页面绑定可以先消费一个稳定的本地纯函数输出。本轮不改店铺页面，不新增 API route，不写数据库，也不改变购物车、结算、支付、订单、退款、结算、佣金、打款、权限或履约逻辑。

## 新增文件

```text
apps/storefront/src/app/[locale]/(main)/data/china-shop-view-model.ts
```

## Skeleton 内容

新增 `buildChinaShopViewModel()`，输入：

- seller handle
- seller discovery view
- market context
- product ids
- product card input
- static fallback

输出：

- `mode: storefront_seller_view`
- `templateId: storefront-shop-stall-v2`
- `locale: zh-CN`
- `currency: CNY`
- `timezone: Asia/Shanghai`
- `readOnly: true`
- `runtimeEnabled: false`
- `canWriteBusinessState: false`
- `fulfillmentHint.placement: shop_header`
- `fulfillmentHint.affectsCheckoutShippingOptions: false`

## 安全边界

adapter skeleton 不做：

- 页面布局绑定
- 购物车创建
- 库存占用
- checkout shipping options 写入
- 订单创建
- 支付状态修改
- 退款状态修改
- 结算 / 佣金 / 打款
- 权限 / RBAC
- 履约 / 物流 / 面单
- 真实直播 / IM
- 真实提货卡兑换
- 真实 Provider 配置

## B-side 直达页

如果输入 seller 属于物料、配送供应商、上游、种苗或外地批发等 B-side 类型，adapter 输出：

```text
visibility = role_gated_preview_only
consumerFacing = false
```

它不代表消费者首页或搜索主路径可见。真实开放前仍需要结构化 `audience` / `business_type`、Admin 配置、商户角色审核和权限测试。

## Fallback

当 seller、market 或 products 不可用时，adapter 返回静态 fallback view，并使用消费者可理解文案：

```text
店铺商品展示待后台更新。
```

不向消费者暴露 `API`、`fallback`、`mock` 或 `metadata`。

## 验证

本轮应验证：

- `cd apps/storefront && bun run build`
- focused temporary TypeScript check for the adapter file
- `git diff --check`

## 下一步

下一步可以实现 search adapter skeleton，或先做 adapter skeleton validation。店铺页面绑定必须另拆 PR，且先只绑定店铺头部，不直接重写商品卡和交易入口。
