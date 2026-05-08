# Storefront Adapter Skeleton Validation V2

更新时间：2026-05-08 Asia/Shanghai

## 验证范围

本轮验证 Storefront 首页、店铺页和搜索页三个本地 view model adapter skeleton。

覆盖文件：

```text
apps/storefront/src/app/[locale]/(main)/data/china-home-view-model.ts
apps/storefront/src/app/[locale]/(main)/data/china-shop-view-model.ts
apps/storefront/src/app/[locale]/(main)/data/china-search-view-model.ts
```

本轮不改页面组件，不新增 API route，不写数据库，不改变库存、购物车、结算、支付、订单、退款、结算、佣金、打款、权限或履约逻辑。

## 合同确认

| Adapter | 输出模板 | 页面绑定 | 运行时状态 |
| --- | --- | --- | --- |
| Home | `storefront-home-market-shop-v2` | 未绑定 | read-only skeleton |
| Shop | `storefront-shop-stall-v2` | 未绑定 | read-only skeleton |
| Search | `storefront-search-market-results-v1` | 未绑定 | read-only skeleton |

三个 adapter 均保持：

- `locale = zh-CN`
- `currency = CNY`
- `timezone = Asia/Shanghai`
- `readOnly = true`
- `runtimeEnabled = false`
- `canWriteBusinessState = false`

## 安全边界

验证确认本轮没有新增或修改：

- Storefront 页面组件 / layout 绑定
- `packages/api/**`
- API route
- DB / migration / seed
- checkout / cart
- inventory reservation
- order
- payment
- refund
- settlement / commission / payout
- permission / RBAC
- fulfillment / logistics / waybill
- real provider config
- real credentials
- 搜索排序 / 广告 / 竞价 / 推荐 runtime

## 验证命令

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn/apps/storefront
bun run build

cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn
./node_modules/.bin/tsc --project /tmp/storefront-adapters-tsconfig.json
grep -RIn 'from .*packages/api\|@acme/api\|china-read-models' apps/storefront/src/app/'[locale]'/'(main)'/data/china-*-view-model.ts || true
git diff --check
```

## 结果

- Storefront build：通过。
- Home / shop / search adapter focused TypeScript check：通过。
- 后端 runtime import grep：未发现 `packages/api`、`@acme/api` 或后端 `china-read-models` 导入。
- `git diff --check`：通过。

Storefront build 仍有既有 React Hook dependency warning。本轮只验证 adapter skeleton，不扩大范围修复这些历史 warning。

## 剩余风险

- 三个 adapter 仍未绑定页面，消费者实际页面仍需要后续单 surface PR 才会消费这些 view model。
- B-side 过滤当前是 skeleton 级关键词启发式，真实上线前应改为结构化 `audience` / `business_type` / `role` 字段。
- Search adapter 的 market context 已筛选店铺和商品，但真实市场、距离、排序、广告、竞价和推荐仍未实现。
- Adapter 内部 `source`、`fallbackUsed`、`fallbackNotice` 只供开发和后续绑定判断；页面绑定时不得把内部 fallback / mock / metadata 直接展示给消费者。

## 下一步

下一步建议进入页面绑定前的最后一轮计划：

1. `storefront-adapter-binding-sequence-plan`：规划 home / shop / search 三个 adapter 绑定到页面的 PR 顺序。
2. `storefront-home-adapter-binding-readonly`：只绑定首页首屏市场 / 类目 / 店铺数据，不改购物车和订单入口。
3. `storefront-shop-adapter-binding-readonly`：只绑定店铺头部与商品卡只读数据，不改 checkout shipping options。
4. `storefront-search-adapter-binding-readonly`：只绑定搜索结果只读数据，不接真实排序、广告或竞价。
