# Storefront 首页 View Model Adapter Skeleton

更新时间：2026-05-08 Asia/Shanghai

## 目标

本轮新增 Storefront 首页 view model adapter skeleton，让后续首页页面绑定可以先消费一个稳定的本地纯函数输出。本轮不改首页页面，不新增 API route，不写数据库，不改变购物车、结算、支付、订单、退款、结算、佣金、打款、权限或履约逻辑。

## 新增文件

```text
apps/storefront/src/app/[locale]/(main)/data/china-home-view-model.ts
```

## Skeleton 内容

新增 `buildChinaHomeViewModel()`，输入：

- discovery read model
- product card input
- static fallback

输出：

- `mode: storefront_home_view`
- `templateId: storefront-home-market-shop-v2`
- `locale: zh-CN`
- `currency: CNY`
- `timezone: Asia/Shanghai`
- `readOnly: true`
- `runtimeEnabled: false`
- `canWriteBusinessState: false`

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
- 真实搜索 / 推荐 / 广告
- 真实直播 / IM
- 真实提货卡兑换
- 真实 Provider 配置

## B-side 默认过滤

首页 adapter 默认过滤以下消费者首页不应出现的内容：

- 物料
- 包装
- 泡沫箱
- 冰袋
- 冰块
- 配送供应商
- 上游
- 种苗
- 外地批发

当前仍是关键词启发式，真实数据接入前应补结构化 `audience` / `business_type` 字段。

## Fallback

当 discovery 或 products 不可用时，adapter 返回静态 fallback view，并使用消费者可理解文案：

```text
首页展示数据待后台更新。
```

不向消费者暴露 `API`、`fallback`、`mock` 或 `metadata`。

## 验证

本轮应验证：

- `cd apps/storefront && bun run build`
- `git diff --check`

## 下一步

下一步可以实现 Storefront shop adapter skeleton 或先补 search adapter plan。首页页面绑定必须另拆 PR，且只绑定一个 surface。
