# Storefront China Page Coverage

更新时间：2026-05-15 Asia/Shanghai

## 范围

本文件记录 Storefront 中国大陆本地化当前覆盖面、真实数据边界和上线前必须验证的点。它只描述消费者端 UI / 只读展示 / 交易入口边界，不批准支付、退款、结算、佣金、打款、权限、履约或物流写路径上线。

## 当前已覆盖页面

| 页面 | 路径 | 当前状态 | 上线边界 |
| --- | --- | --- | --- |
| 首页 | `/` | 国内生鲜市场语境、市场/档口/今日鲜货入口、移动端底部导航 | 需要真实后端数据与移动端视觉 QA |
| 搜索 | `/search` | 支持 Store API 真实商品与市场样例区分；样例不进入真实商品详情 | 需要真实商品、seller metadata、搜索空态验证 |
| 分类/档口导航 | `/categories`、`/categories/[category]` | 按市场、分类、档口组织入口 | 需要真实分类、市场、档口数据验证 |
| 店铺页 | `/sellers/[handle]` | 店铺、档口、商品与售后文案本地化 | 需要真实 seller handle、营业时间、售后规则验证 |
| 商品详情 | `/products/[handle]` | 商品详情继续使用 Store API 商品事实 | 需要真实价格、库存、规格、履约信息验证 |
| 购物车 | `/cart` | 国内履约与售后文案；支付成功以后端通知为准 | 不得把前端返回页当支付成功依据 |
| 结算 | `/checkout` | 保留真实下单入口 | 上线前必须验证 payment providers、shipping options、订单提交与异步支付通知 |
| 提货卡 | `/pickup-card` | 本地化展示入口 | 当前不代表真实卡券核销能力 |
| 用户中心 | `/user/*` | 账户、订单、地址、售后、消息等入口 | 需要登录态、多角色和移动端视觉 QA |

## 当前已收口的误导点

- 首页右侧入口已从“发布找货需求”改为“搜索鲜货档口”，避免让用户误以为已有找货需求提交流。
- Footer 不再输出 `#` 链接、`support@example.com`、假 ICP 备案号或“示例公司”生产文案。
- 未接入的客服、公众号、邮箱入口以“待接入 / 待配置”展示，并指向已有本地页面，不伪装成已上线渠道。

## 上线前必须验证

- 桌面与移动端视觉 QA：首页、搜索、分类、店铺、商品详情、购物车、结算、用户中心。
- 真实后端数据：商品、价格、库存、seller metadata、market metadata、shipping options、payment providers。
- 交易链路：订单提交、支付 pending / success / failed 展示、后端异步支付通知、售后入口。
- 生产配置：真实 Store API URL、publishable key、支付 provider 配置、客服/备案/企业资质信息；不得把 `.env.local.example` 中的 placeholder 当生产配置。

## 非目标

- 不在本文件中批准真实支付成功状态写入。
- 不在本文件中批准退款成功状态 mutation。
- 不在本文件中批准 settlement / commission / payout / permission / fulfillment / logistics 写路径。
