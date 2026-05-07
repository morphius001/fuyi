# China Market Platform Architecture Map

更新时间：2026-05-07 Asia/Shanghai

## 思维导图

```mermaid
mindmap
  root((Fuyi 中国本地多市场平台))
    市场
      市场资料
        名称
        省市区
        地址
        营业状态
      营业时间
        周期
        开市闭市
        节假日后续
      公告
        消费者公告
        商户公告
        配送公告
      配送能力
        市场自提
        商户自配
        市场统一配送
        配送供应商
    商户
      普通档口
        海鲜水产
        水果蔬菜
        冻品干货
      物料供应商
        泡沫箱
        包装箱
        冰袋
        冰块
      配送供应商
        同城配送
        冷链配送
        快递打印后续
      上游供应商
        养殖户
        种植户
        种苗批发
        外地批发商
    消费端 Storefront
      首页
        找市场
        找店
        今日鲜货
      店铺页
        档口信息
        配送方式
        直播状态占位
      搜索页
        市场上下文
        商品列表
        店铺结果
      提货卡
        独立入口
        不放首页主路径
    商户端 Vendor
      首页
        市场归属
        档口信息
        待办
      快速上架
        手机端轻流程
        规格模板
        AI 草稿占位
      店铺装修
        店铺主页
        档口展示
      物流客服
        配送能力只读
        公告只读
    平台后台 Admin
      市场管理
        市场只读详情
        商户档口归属
        配送 profile
        公告营业时间
      模块开关
        市场级
        商户类型级
        只读优先
      审核风控
        商户入驻
        商品审核
        提货卡风险
      财务风控
        支付
        退款
        结算
        佣金
    Provider 边界
      Mock 优先
        Chat
        SMS
        Logistics
        Live
        AI Listing
      真实接入后置
        微信支付
        支付宝
        短信
        IM
        物流
```

## 当前数据链路

```mermaid
flowchart LR
  A["china-market-membership migration skeleton"] --> B["Local disposable DB dry-run"]
  B --> C["Repository rows fixture"]
  C --> D["Market read model adapter"]
  D --> E["Vendor market context builder"]
  E --> F["GET /vendor/china/market-context"]
  D --> G["Admin/Store/Market readonly APIs"]
  F --> H["Vendor readonly UI fallback aware"]
  G --> I["Admin/Storefront readonly UI fallback aware"]

  J["Admin browser QA"] -. blocked-manual .-> I
  K["Preprod disposable DB dry-run"] -. not started .-> B
  L["Real migration registration"] -. high risk serial .-> A
```

## 状态总览

| 区域                      | 当前状态                                  | 下一步                         |
| ------------------------- | ----------------------------------------- | ------------------------------ |
| Market membership schema  | migration skeleton + local dry-run passed | 预发 disposable DB checklist   |
| Repository adapter        | unit tests passed                         | 本地 DB integration test       |
| Vendor context route      | read-only route + DB QA passed            | 保持只读，后续做真实登录态 QA  |
| Admin market view         | readonly view exists                      | 登录态浏览器 QA                |
| Storefront market read    | readonly API/client 已有                  | DB QA 后再考虑 UI 真实数据替换 |
| Payment/refund/settlement | 未进入                                    | 高风险串行，不自动做           |
| Real providers            | mock-only skeleton                        | 真实接入后置                   |

## 核心原则

- 消费端先找市场、找店，再看商品。
- 配送方式属于市场和档口上下文，不应在商品卡上喧宾夺主。
- 物料/配送供应商是商户类型能力，不应放在消费者首页主路径。
- 提货卡是独立消费入口，不是优惠券、满减券、折扣券、储值卡或支付方式。
- AI 上架只能生成草稿建议，不能直接创建真实商品。
- 支付成功以后端异步通知为准，必须验签、幂等、可重试。
