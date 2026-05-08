# Template Preview Backlog

更新时间：2026-05-08 Asia/Shanghai

## 目标

第九十六轮已经把三端模板系统、模板合同和只读 registry 固化。第九十七轮建议进入“可预览、可回滚、可验证”的模板实现前准备。

本轮仍只做 docs/queue/ledger，不修改页面和后端 runtime。

## 原则

每个模板实现 PR 之前必须写清楚：

- `template_id`
- 面向 surface：Storefront / Admin / Vendor
- 页面或场景
- 读取的 view model contract
- 隐藏或禁用的 B 端/高风险能力
- 桌面端验证方式
- 移动端验证方式
- 回滚方式

模板实现不允许顺手修改：

- checkout
- cart
- order
- payment
- refund
- settlement
- commission
- payout
- permission
- fulfillment
- provider config
- real credentials

## 第九十七轮建议队列

1. `storefront-home-template-v2-plan`

   目标：规划消费者首页 v2 模板预览，不改页面。

   必须明确：

   - 首页以市场、店铺/档口、今日鲜货和搜索为主。
   - 删除重复搜索和重复类目标题。
   - 物料供应商、配送供应商和上游供给不进首页主路径。
   - 提货卡只保留独立入口，不放成首页主业务流。
   - 直播最多作为店铺卡片状态。
   - 移动端首页像 App，短、清楚、少堆叠。

2. `storefront-shop-template-v2-plan`

   目标：规划店铺/档口主页 v2 模板预览，不改页面。

   必须明确：

   - 店铺是消费者端核心。
   - 市场、档口号、营业状态、公告、配送/自提方式放在店铺头部。
   - 商品卡只保留商品决策信息，配送方式作为店铺能力提示。
   - 店铺装修和直播状态在店铺页展示，不进入首页主入口。

3. `admin-dashboard-template-v2-plan`

   目标：规划平台运营首页 v2 模板预览，不改页面。

   必须明确：

   - 运营看板、待办、风险提醒、快捷入口和数据来源说明。
   - 顶部工具靠右，不挤在标题中间。
   - 首页卡片密度适合国内后台。
   - 不把 mock 指标当真实交易事实。
   - 不替代 RBAC、审计、支付、退款、结算、佣金或履约。

4. `vendor-role-workspace-template-v2-plan`

   目标：规划商户角色工作台 v2 模板预览，不改页面。

   必须明确：

   - 普通商户、物料供应商、配送供应商、上游供给角色分开。
   - 手机快速上架和 AI 草稿只是草稿/审核候选。
   - 店铺装修 preview 不改变商品、库存、价格、订单和履约。
   - 配送供应商接单必须另走权限、履约和结算边界。

5. `template-preview-validation`

   目标：验证第九十七轮规划和队列清晰，不修改 runtime。

   建议执行：

   - `git diff --check`
   - docs/queue/ledger 范围检查
   - 子 agent 审查各模板是否有越界描述

## 之后的实现门槛

等上述 plan 完成后，才建议进入小范围页面实现：

- Storefront 首页 v2：只改首页，不碰 checkout。
- Storefront 店铺页 v2：只改店铺页，不碰商品详情/购物车。
- Admin dashboard v2：只改首页壳和静态展示，不碰真实操作。
- Vendor role workspace v2：只改展示壳，不碰真实发布、发货、结算。

每个实现 PR 必须有：

- 桌面截图。
- 移动截图。
- 关键页面 smoke。
- build/lint。
- 回滚说明。

## 本轮结论

下一步不急着继续“凭感觉改页面”。先把模板预览 backlog 立起来，后续每个页面改动都有模板 id 和验收边界。这样视觉可以继续打磨，数据合同和上线风险不会失控。
