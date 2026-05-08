# Storefront 首页商品卡 Adapter 只读绑定

更新时间：2026-05-09 Asia/Shanghai

## 目标

本轮把消费者首页的“今日鲜货”商品卡展示字段接到 `buildChinaHomeViewModel()` 输出。绑定仍是只读展示，不改变商品详情、购物车、库存、结算、订单、支付、退款、结算、佣金、打款、权限、履约、物流或真实 Provider。

## 修改范围

```text
apps/storefront/src/app/[locale]/(main)/page.tsx
```

## 绑定内容

首页现在把本地 `freshProducts` 作为商品展示输入传给 `buildChinaHomeViewModel()`，并从 `homeViewModel.freshProducts` 派生首页商品卡展示字段：

- 商品标题
- 规格文案
- 价格文案
- 库存提示
- 所属店铺
- 所属市场
- 档口号

移动端“今日鲜货”、桌面推荐档口里的商品缩略卡和桌面“今日上新”都读取同一组只读展示字段。商品入口仍然指向搜索页，不新增商品详情或加购动作。

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

- Home adapter 只决定首页展示字段，不占库存。
- 商品卡展示不作为价格、库存、配送或结算承诺。
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

- desktop 1440 x 1000 首页截图
- mobile 390 x 844 首页截图

截图只放 `docs/visual-qa-artifacts/` 本地 QA 目录，不提交。

## 回滚方式

如首页商品卡展示异常，可在 `apps/storefront/src/app/[locale]/(main)/page.tsx` 恢复为直接读取 `freshProducts` 的原展示数据。Adapter 文件保留，不影响后续重新绑定。
