# Storefront Visibility Copy Polish

更新时间：2026-05-08 23:18 Asia/Shanghai

## 结论

Storefront 消费者侧文案已做小范围 polish：去掉部分过于工程化的 `API`、`metadata`、`fallback`、`mock` 表述，改为消费者更容易理解的“展示数据”“后台展示配置”“演示占位”和“以结算页为准”。

## 范围

本轮只修改消费者侧文案：

- 搜索页：店铺/档口、类目和市场说明改为消费者视角；明确物料、配送供应商和上游供给不进入消费者商品流。
- 店铺页：配送/自提说明改为商家后台展示配置，最终履约和运费以结算页为准。
- 提货卡页：`mock` 改为“演示占位”，继续明确不接真实卡密、兑换或支付。

## 安全边界

本轮未修改：

- checkout。
- cart。
- order。
- payment。
- refund。
- settlement。
- commission。
- payout。
- permission。
- fulfillment runtime。
- 真实提货卡兑换。
- 真实直播、IM、物流或 Provider。

## 验证

- Storefront build。
- `git diff --check`。
- 后续可 smoke `/cn`、`/cn/search`、`/cn/sellers/a-hai-xian-huo-dang`、`/cn/pickup-card`。
