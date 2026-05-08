# Storefront 店铺 Membership 数据源输入

更新时间：2026-05-09 Asia/Shanghai

## 目标

本轮执行 `docs/storefront-read-model-data-source-plan.md` 中的 PR JH，让 Storefront 店铺 adapter 先支持 seller membership read model 输入形状。后续店铺页可以从 seller metadata 过渡到结构化 market membership 数据源。

本轮不改店铺页页面，不改 `ProductCard`，不修改 API，不新增 route，不新增 migration，不改变加购、购物车、订单、结算、支付、退款、结算、佣金、打款、权限、库存占用、履约、物流、直播、IM、提货卡兑换或 Provider runtime。

## 修改范围

```text
apps/storefront/src/app/[locale]/(main)/data/china-shop-view-model.ts
```

## 新增输入

新增：

```ts
ChinaShopMembershipInput
getChinaShopMembershipInputContract()
```

Membership 输入字段：

- `sellerId`
- `sellerHandle`
- `sellerName`
- `marketName`
- `boothNo`
- `role`
- `status`
- `mainCategoryNames`
- `summary`

## 数据源顺序

店铺 adapter seller 输入顺序：

```text
seller membership -> seller metadata -> static fallback
```

后续页面接入时建议优先传入 membership read model，再保留 seller metadata 和 static fallback。当前实现保持现有页面行为不变。

## 安全边界

Membership 输入只影响店铺展示 view model：

- 不改变权限。
- 不改变订单归属。
- 不改变结算主体。
- 不改变 checkout shipping options。
- 不创建购物车。
- 不创建或修改订单。
- 不创建履约单、配送单、运单或面单。

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
- 本轮没有修改店铺页页面、`ProductCard`、`packages/api/**` 或交易 / 履约链路。

## 回滚方式

如后续发现 membership 字段命名不合适，可回滚 `ChinaShopMembershipInput`、`getChinaShopMembershipInputContract()` 和 membership-to-seller 映射逻辑。当前页面没有强依赖该输入，回滚不会影响店铺页展示、`ProductCard`、cart、checkout、订单、支付、退款、结算、佣金、权限、履约或物流。
