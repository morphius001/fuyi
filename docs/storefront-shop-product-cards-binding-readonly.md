# Storefront 店铺页商品卡 Adapter 只读绑定

更新时间：2026-05-09 Asia/Shanghai

## 目标

本轮把消费者店铺页的“档口今日参考 / 常卖鲜货”样例商品卡展示字段接到 `buildChinaShopViewModel()` 输出。绑定仍是只读展示，不改变真实商品详情、购物车、库存、结算、订单、支付、退款、结算、佣金、打款、权限、履约、物流或真实 Provider。

## 修改范围

```text
apps/storefront/src/app/[locale]/(main)/sellers/[handle]/page.tsx
```

## 绑定内容

店铺页现在把当前店铺的本地样例商品展示输入传给 `buildChinaShopViewModel()`，并从 `shopViewModel.products` 派生店铺商品卡展示字段：

- 商品标题
- 规格文案
- 价格文案
- 库存提示
- 商品提示
- 商品标签

移动端“档口今日参考”和桌面“常卖鲜货”读取同一组只读展示字段。真实商品结果仍使用 Store API 返回的 `realProducts` 和 `ProductCard`，本轮不改变真实商品详情和购物车链路。

## 未绑定内容

本轮没有绑定：

- 真实商品排序
- 广告 / 竞价 / 推荐系统
- 库存占用
- cart mutation
- order mutation
- checkout shipping options
- payment
- fulfillment / logistics / waybill

## 安全边界

- Shop adapter 只决定店铺页展示字段，不占库存。
- 样例商品卡不作为价格、库存、配送或结算承诺。
- 真实加购、规格选择、运费和配送方式仍以后续商品详情页、购物车和结算页的既有链路为准。
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

- desktop 1440 x 1000 店铺页截图
- mobile 390 x 844 店铺页截图

截图只放 `docs/visual-qa-artifacts/` 本地 QA 目录，不提交。

## 回滚方式

如店铺页样例商品卡展示异常，可在 `apps/storefront/src/app/[locale]/(main)/sellers/[handle]/page.tsx` 恢复为直接读取 `shop.products` 的原展示数据。Adapter 文件保留，不影响后续重新绑定。
