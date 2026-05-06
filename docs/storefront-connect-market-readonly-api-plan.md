# Storefront Connect Market Readonly API Plan

更新时间：2026-05-07 Asia/Shanghai

## 结论

Storefront 可以开始接入 Store 中国市场只读 API，但应该分两步走：

1. 先在数据层定义 fetcher 和 view model adapter，不改页面布局。
2. 再让首页、搜索、店铺页逐步使用 market API，保持 UI 可回滚。

本计划不修改 `apps/**`，不改变 checkout、支付、订单、退款、结算、佣金、权限或履约逻辑。

## 可用 API

- `GET /store/china/markets`
- `GET /store/china/markets/:slug`
- `GET /store/china/markets/:slug/sellers`
- `GET /store/china/discovery`
- `GET /store/china/sellers/:handle/products`

## 接入顺序

### PR AA: Storefront Market Client

范围：

- 在 Storefront 数据层新增 client/fetcher。
- 读取 `/store/china/markets*`。
- 不改页面。

验证：

```bash
cd apps/storefront && bun run build
```

风险：

- 低。只新增读取函数。

### PR AB: Home Uses Market Readonly Data

范围：

- 首页市场选择和推荐档口读取 `/store/china/markets`。
- 保留原 discovery fallback。
- 不重做视觉模板。

非目标：

- 不放提货卡主模块。
- 不放物料采购/配送供应商到消费者首页前排。

### PR AC: Search Uses Market Context

范围：

- 搜索页增加 market context。
- 店铺结果和商品结果继续分区。
- 不接真实搜索 provider。

### PR AD: Seller Page Uses Market Detail

范围：

- 店铺页读取 market detail 和 seller products。
- 配送/自提说明放在店铺层。
- 直播只作为 seller status badge。

### PR AE: Visual Template Pass

范围：

- 数据接入稳定后，再调整首页/搜索/店铺模板。
- 可继续对照国内批发和本地生活平台信息密度。

非目标：

- 不改数据合同。
- 不改 checkout。

## Fallback 策略

如果 markets API 失败：

- 首页回退 `/store/china/discovery`。
- 搜索页继续显示商品/店铺 discovery。
- 店铺页继续回退 seller metadata。
- 页面必须显示可用内容，不应该因为 markets API 失败白屏。

## 数据合同稳定项

不要随 UI 变动改这些含义：

- `market.id`
- `market.slug`
- `membership.sellerId`
- `membership.boothNo`
- `seller.handle`
- `product.id`
- `deliveryProfiles` 仅展示，不影响 checkout。

## 禁止混入

- cart total。
- checkout shipping options。
- 支付结果。
- 订单状态。
- 退款。
- 结算、佣金、payout。
- 权限或菜单真实显隐。
- 真实客服、直播、物流、AI、支付 provider。

## 下一步

下一步可创建 `storefront-market-client` 任务文件，并在独立 PR 中只实现 Storefront 数据 client，不碰页面布局。
