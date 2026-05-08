# Storefront 搜索 Read Model 输入合同

更新时间：2026-05-09 Asia/Shanghai

## 目标

本轮执行 `docs/storefront-read-model-data-source-plan.md` 中的 PR JG，明确 Storefront 搜索 adapter 的 query / market / category / seller / product 输入合同。该合同为后续搜索数据源收束做准备，但本轮不改搜索页渲染，不接真实搜索 provider，不修改 API 或数据库。

## 修改范围

```text
apps/storefront/src/app/[locale]/(main)/data/china-search-view-model.ts
```

## 新增合同

新增：

```ts
getChinaSearchReadModelInputContract()
```

合同固定：

- `version: storefront-search-input-contract-v1`
- `readOnly: true`
- `runtimeEnabled: false`

## 输入来源

### Query

- 来源：URL search params。
- 标准化：trim + lowercase。
- 只影响展示筛选，不写业务状态。

### Market

- 来源顺序：URL market param -> discovery market -> static fallback。
- 作用：display filter only。
- 不写 checkout shipping options，不改变配送、履约或运费。

### Categories

- 来源顺序：discovery categories -> static fallback。
- 只展示消费者可见类目。
- 不展示物料、配送供应商、上游供给、种苗批发或外地批发目录。

### Sellers

- 来源顺序：discovery sellers -> static fallback。
- 只展示消费者可见店铺 / 档口。
- 不改变权限、订单归属、结算主体或商户后台菜单。

### Products

- 来源顺序：Store products -> static fallback。
- 只作为搜索页只读商品卡输入。
- 不占库存，不创建购物车，不创建订单，不改变价格或配送事实来源。

## 阻塞 runtime

合同明确阻塞：

- search ranking provider
- ads / bidding
- recommendation engine
- inventory reservation
- cart mutation
- checkout shipping options
- order mutation
- payment
- fulfillment

这些必须继续作为独立高风险或单独 provider 任务处理。

## 验证

本轮已运行：

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn/apps/storefront
/home/codex/.bun/bin/bun run build

cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn
git diff --check
```

- Storefront build 通过。
- `git diff --check` 通过。
- 仅保留既有 React Hook dependency warnings。
- 本轮没有修改搜索页页面、`packages/api/**` 或交易 / 履约链路。

## 回滚方式

如后续发现合同字段命名不合适，可回滚 `getChinaSearchReadModelInputContract()` 和相关类型导出。该函数当前没有接入页面运行路径，回滚不会影响搜索页展示、cart、checkout、订单、支付、退款、结算、佣金、权限、履约或物流。
