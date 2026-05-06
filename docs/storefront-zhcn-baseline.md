# Storefront 中文化基线

日期：2026-05-03

本文件记录 `storefront-zhcn-baseline` 的范围、非目标和验证要求。目标是让 `apps/storefront` 具备中国大陆买家端的第一版 zh-CN/CNY 展示基线，同时保持 checkout、订单、支付、退款、结算、佣金和权限逻辑不变。

后续真实发现数据桥接见 `docs/storefront-real-discovery-bridge.md`。Storefront UI 模板可以继续优化，但消费者主链路保持“选市场 / 找店铺 / 看鲜货 / 加购物车 / 结算”。提货卡、直播、物料采购、配送供应商和自提配送配置不能混进消费者首页主信息流。

## 范围

- 前台目录确认：`apps/storefront` 是当前 monorepo 唯一买家端 storefront。
- 默认本地化：默认区域兜底为 `cn`，价格格式默认使用 `zh-CN`，环境模板的站点名称和说明使用 Fuyi 中文描述。
- 核心页面文案：首页、导航、搜索、类目、商品列表、商品详情、购物车、结账、登录注册、地址和页脚使用 zh-CN 基线文案。
- CNY 展示约定：价格格式化默认使用 `zh-CN`；类目/Algolia 货币兜底从 `usd` 调整为 `cny`。
- 国内电商 UX 基线：商品详情移动端增加粘性加入购物车动作；购物车结算按钮在移动端保持更明显的底部动作入口；地址和手机号文案按中国大陆习惯展示。

## 非目标

- 不修改 checkout 状态机、下单、支付确认、退款、结算、佣金或权限逻辑。
- 不新增真实微信支付、支付宝、短信、物流或 IM 集成。
- 不删除 Stripe、Algolia、Resend、TalkJS 相关路径。
- 不提交真实密钥、商户号、AppID、私钥、Webhook token 或生产环境配置。

## 风险说明

- 本次只改前端展示和表单提示，支付成功仍不应以前端返回页作为业务事实。后续支付本地化必须单独做 provider/adapter 设计，并以后端异步通知、验签、幂等和可重试为准。
- 注册/地址表单加入中国大陆手机号提示与校验，若后续业务需要支持港澳台或海外手机号，应通过配置或区域策略放宽。
- Storefront 仍依赖后端 region/country 数据；如果后端没有 `cn` region，默认重定向和页面数据会继续依赖现有 region fallback。

## 验证步骤

1. 确认 `apps/storefront` 存在，且没有其他买家端 storefront 目录。
2. 运行 `bun run lint:storefront`。
3. 运行 `bun run build:storefront`。
4. 本地启动 storefront，桌面和移动端检查：
   - 首页 `/cn`
   - 搜索和类目 `/cn/categories`
   - 商品详情 `/cn/products/<handle>`
   - 购物车 `/cn/cart`
   - 结账入口 `/cn/checkout?step=address`

## 回滚建议

- 若只需回滚文案和 UX 基线，可回滚本 PR 中 `apps/storefront` 的展示层改动和本文件。
- 若上线后发现 `cn` region 不存在，应优先修正后端 region 或环境变量；短期可将 `NEXT_PUBLIC_DEFAULT_REGION` 回滚到当前可用 country code。
- 支付、订单、退款、结算、佣金和权限问题不要通过回滚本中文化基线修复，应进入对应高风险串行任务。
