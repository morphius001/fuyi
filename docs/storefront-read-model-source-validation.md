# Storefront Read Model Source 阶段验证

更新时间：2026-05-09 Asia/Shanghai

## 目标

本轮汇总 Storefront adapter 输入源阶段结果，覆盖 PR #267、PR #268、PR #269。验证 home / search / shop 三个方向仍停留在只读 read model / adapter 输入层，没有混入 cart、checkout、订单、支付、退款、结算、佣金、权限、履约、物流、真实排序、广告、竞价、推荐或真实 Provider。

本轮只做 docs-only 验证，不修改 `apps/**` 或 `packages/**`。

## 已完成内容

### 首页输入源

- PR #267 `storefront-home-adapter-real-source`
- 首页 `buildChinaHomeViewModel()` 输入已收束为：
  - `/store/china/markets`
  - `/store/china/discovery`
  - static `home-market` fallback
- 页面视觉布局不变。
- 今日鲜货商品卡仍是只读展示输入，不改变商品详情、加购、库存或结算。

### 搜索输入合同

- PR #268 `storefront-search-read-model-input-contract`
- 新增 `getChinaSearchReadModelInputContract()`。
- 合同明确：
  - query 来自 URL search params。
  - market 只作为 display filter。
  - categories / sellers 只保留消费者可见结果。
  - products 只作为只读卡片输入。
  - search ranking provider、ads、bidding、recommendation、inventory、cart、checkout、order、payment、fulfillment 均 blocked。
- 搜索页行为不变，不接真实搜索 provider。

### 店铺 Membership 输入

- PR #269 `storefront-shop-membership-source`
- 新增 `ChinaShopMembershipInput` 和 `getChinaShopMembershipInputContract()`。
- 店铺 adapter 可接受 seller membership read model 形状：
  - seller id / handle / name
  - market name
  - booth no
  - role
  - status
  - main category names
- 当前店铺页行为不变。
- Membership 只影响展示，不改变权限、订单归属、结算主体或 checkout shipping options。

## 验证结果

本轮已运行：

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn/apps/storefront
/home/codex/.bun/bin/bun run build

cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn
git diff --check
git diff --name-only
```

- Storefront build 通过。
- `git diff --check` 通过。
- 仅保留既有 React Hook dependency warnings。
- 本轮 diff 仅包含任务文件、验证文档、队列和 ledger 文件。
- `docs/visual-qa-artifacts/` 继续作为本地截图目录，不纳入 PR。

## 风险边界

仍未实现：

- 真实市场运营模型写入。
- 真实 seller-market membership API 接入页面。
- 真实搜索排序、广告、竞价、推荐。
- 库存聚合或占用。
- cart mutation。
- checkout shipping options 生效。
- order mutation。
- payment / refund / settlement / commission / payout。
- permission / RBAC。
- fulfillment / logistics / waybill。
- real provider config 或 real credentials。

## 后续建议

下一步可以进入更具体的只读数据源接入：

1. `storefront-home-discovery-source-validation`：确认首页真实 discovery 数据足够支撑类目、店铺和商品卡展示。
2. `storefront-search-discovery-source-binding`：在搜索页输入构造中收束 query / market / category / product 数据源，但仍不接真实搜索 provider。
3. `storefront-shop-membership-source-binding`：店铺页从 seller products metadata 过渡到 membership read model 输入，但仍不改 `ProductCard` 和交易链路。

这些后续任务必须继续保持单 surface、小 PR、只读、可回滚。
