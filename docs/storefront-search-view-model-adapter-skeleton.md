# Storefront 搜索页 View Model Adapter Skeleton

更新时间：2026-05-08 Asia/Shanghai

## 目标

本轮新增 Storefront 搜索页 view model adapter skeleton，让后续搜索页页面绑定可以先消费一个稳定的本地纯函数输出。本轮不改搜索页面，不新增 API route，不写数据库，也不改变库存、购物车、结算、支付、订单、退款、结算、佣金、打款、权限或履约逻辑。

## 新增文件

```text
apps/storefront/src/app/[locale]/(main)/data/china-search-view-model.ts
```

## Skeleton 内容

新增 `buildChinaSearchViewModel()`，输入：

- query
- marketName
- discovery markets / categories / sellers
- product card input
- static fallback

输出：

- `mode: storefront_search_view`
- `templateId: storefront-search-market-results-v1`
- `locale: zh-CN`
- `currency: CNY`
- `timezone: Asia/Shanghai`
- `readOnly: true`
- `runtimeEnabled: false`
- `canWriteBusinessState: false`

## 搜索语义

- 空 query 不报错，可以返回默认消费者找货结果。
- marketName 只作为市场上下文和筛选输入，不写配送、履约或 checkout shipping options。
- 无结果只显示消费者提示：“没有找到匹配内容，可以换个关键词或切换市场。”
- B-side 内容默认过滤，包括物料供应商、配送供应商、上游供给、种苗批发和外地批发。

## 安全边界

adapter skeleton 不做：

- 页面布局绑定
- 搜索排序 / 广告 / 竞价 / 推荐 runtime
- 库存占用
- 购物车创建
- checkout shipping options 写入
- 订单创建
- 支付状态修改
- 退款状态修改
- 结算 / 佣金 / 打款
- 权限 / RBAC
- 履约 / 物流 / 面单
- 真实 Provider 配置

## Fallback

当 discovery 或 products 不可用时，adapter 返回静态 fallback view，并使用消费者可理解文案。

不向消费者暴露 `API`、`fallback`、`mock` 或 `metadata`。

## 验证

本轮应验证：

- `cd apps/storefront && bun run build`
- focused temporary TypeScript check for home / shop / search adapter files
- `git diff --check`

## 下一步

下一步可以做 adapter skeleton validation，验证 home / shop / search 三个 Storefront 本地 adapter skeleton 后，再进入页面绑定计划。页面绑定必须另拆 PR，先从只读展示接入，不直接改购物车、结算、订单或履约入口。
