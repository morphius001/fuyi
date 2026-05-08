# Storefront 搜索页 View Model Mapper

更新时间：2026-05-08 Asia/Shanghai

## 目标

本轮为消费者搜索页新增只读 view model mapper，给后续搜索页模板绑定 PR 使用。它不改 Storefront 页面，不新增 API route，不写数据库，也不改变库存、购物车、结算、支付、订单、退款、结算、佣金、打款、权限或履约逻辑。

## 输出合同

Mapper 输出 `storefront_search_view`，模板 id 固定为 `storefront-search-market-results-v1`，并带上：

- `locale: zh-CN`
- `currency: CNY`
- `timezone: Asia/Shanghai`
- `readOnly: true`
- `runtimeEnabled: false`
- `canWriteBusinessState: false`

搜索页职责：

- 展示消费者搜索关键词。
- 展示市场上下文。
- 展示匹配类目、店铺 / 档口和商品。
- 给出空结果提示。
- 明确哪些数据来自只读 discovery / 商品卡输入，哪些是 fallback。

## 消费端边界

搜索页默认过滤：

- 物料供应商
- 配送供应商
- 上游供给
- 种苗批发
- 外地批发商

这些内容属于商户采购、供应方协作或平台运营能力，不进入消费者默认搜索结果主路径。

## 高风险边界

本 mapper 只读展示，不允许决定或写入：

- inventory reservation
- checkout shipping options
- payment success
- order status
- refund status
- settlement
- commission
- payout
- fulfillment / logistics / waybill
- real search ranking / ads / bidding runtime
- real provider config
- real credentials

搜索商品卡只展示规格、价格和库存提示，不锁库存、不创建购物车、不创建订单。

## 验证

本轮验证重点：

- focused unit test 覆盖搜索模板字段、B-side 内容过滤、空结果 fallback、数据来源和高风险边界。
- 首页 / 店铺 mapper 单测继续通过。
- API lib 既有 read model 单测保持兼容。
- API TypeScript typecheck 通过。
- `git diff --check` 通过。
