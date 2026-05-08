# Storefront 首页 View Model Mapper

更新时间：2026-05-08 Asia/Shanghai

## 目标

本轮为消费者首页新增只读 view model mapper，给后续模板绑定 PR 使用。它不改 Storefront 页面，不新增 API route，不写数据库，也不改变购物车、结算、支付、订单、退款、结算、佣金、打款、权限或履约逻辑。

## 输出合同

Mapper 输出 `storefront_home_view`，模板 id 固定为 `storefront-home-market-shop-v2`，并带上：

- `locale: zh-CN`
- `currency: CNY`
- `timezone: Asia/Shanghai`
- `readOnly: true`
- `runtimeEnabled: false`
- `canWriteBusinessState: false`

首页消费者路径固定为：

1. 选市场
2. 看类目
3. 找店 / 档口
4. 看今日鲜货
5. 进入店铺详情

## 数据来源

- `marketSelector` 来自中国市场只读合同，当前可使用静态市场合同兜底。
- `categoryNav` 来自 category discovery read model。
- `featuredSellers` 来自 seller discovery read model。
- `freshProducts` 当前只作为只读商品卡输入，后续页面绑定时再从 Store API / discovery bridge 注入。
- `serviceLinks` 仍为静态只读入口，包括提货卡、售后服务、商家入驻。

当 discovery 为空时，mapper 会标记对应 `dataSources[].fallbackUsed=true`，并给出消费者可理解的兜底提示。

## 消费端边界

以下内容默认不进入消费者首页主路径：

- 物料供应商
- 配送供应商
- 上游供给
- 种苗批发
- 外地批发商
- 直播主入口

这些能力后续应在商户后台、平台后台或店铺详情局部区域中按权限和配置展示，不应挤进首页核心找货链路。

## 高风险边界

本 mapper 只读展示，不允许决定或写入：

- checkout shipping options
- payment success
- order status
- refund status
- settlement
- commission
- payout
- fulfillment / logistics / waybill
- real provider config
- real credentials

支付成功仍必须以后端异步通知为准；提货卡保持独立入口，不作为优惠券、储值卡、支付方式或购物车抵扣。

## 验证

本轮验证重点：

- focused unit test 覆盖首页模板字段、消费者路径、B-side 内容过滤、fallback 标记和高风险边界。
- API lib 既有 read model 单测保持兼容。
- API TypeScript typecheck 通过。
- `git diff --check` 通过。
