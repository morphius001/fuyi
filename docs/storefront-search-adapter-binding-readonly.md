# Storefront 搜索页 Adapter 只读绑定

更新时间：2026-05-08 Asia/Shanghai

## 目标

本轮把消费者搜索页的市场、类目、店铺 / 档口和静态商品样例展示接到 `buildChinaSearchViewModel()` 输出。绑定仍是只读展示，不改变购物车、库存、结算、订单、支付、退款、结算、佣金、打款、权限、履约、物流或真实 Provider。

## 修改范围

```text
apps/storefront/src/app/[locale]/(main)/search/page.tsx
```

## 绑定内容

搜索页现在在服务端页面里构造 `searchViewModel`：

- `query` 用于搜索标题和筛选输入。
- `marketContext` / `resultGroups` 用于市场展示。
- `matchedSellers` 用于店铺 / 档口结果。
- `matchedCategories` 用于类目结果。
- `matchedProducts` 用于静态市场样例商品展示。

真实商品结果仍使用 Store API 返回的 `realProducts` 和 `ProductCard`，本轮不改变真实商品详情和购物车链路。

## 未绑定内容

本轮没有绑定：

- 真实搜索排序
- 广告 / 竞价 / 推荐系统
- 自动询价 / 自动补货 / 自动客服
- checkout shipping options
- cart mutation
- order mutation
- payment
- fulfillment / logistics / waybill

## 安全边界

- Search adapter 只决定展示分组，不占库存。
- 静态市场样例仍标注为样例展示，不进入真实商品详情。
- 真实商品卡仍由 Store API + ProductCard 负责，后续若改商品卡必须另拆 PR。
- 页面不展示 `fallback`、`mock`、`metadata`、`API failed`、`source`、`highRisk` 等内部字段。

## 验证

本轮应验证：

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn/apps/storefront
bun run build

cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn
git diff --check
```

视觉 QA：

- desktop 1440 x 1000 搜索页截图
- mobile 390 x 844 搜索页截图

截图只放 `docs/visual-qa-artifacts/` 本地 QA 目录，不提交。

## 回滚方式

如出现搜索结果展示异常，可在 `apps/storefront/src/app/[locale]/(main)/search/page.tsx` 恢复为直接读取 `marketResults`、`categoryResults`、`shopResults` 和 `productResults` 的原展示数据。Adapter 文件保留，不影响后续重新绑定。
