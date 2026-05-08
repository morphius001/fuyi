# storefront-shop-membership-source-binding

## 目标

把 Storefront 店铺页的 `buildChinaShopViewModel()` 输入从单纯 seller metadata 过渡到结构化 membership 输入：

- 优先读取 `/store/china/markets/:slug` 返回的 `memberships`。
- 找到当前 seller handle / seller id 对应的 membership 后，传入 `membership` 字段。
- 找不到 membership 时，继续使用 seller metadata / 静态 profile 作为只读 fallback。

## 范围

允许修改：

- `apps/storefront/src/app/[locale]/(main)/sellers/[handle]/page.tsx`
- 本任务文件
- `docs/storefront-shop-membership-source-binding.md`
- `.codex/queue.md`
- `project-ledger/changelog.md`
- `project-ledger/handoff.md`
- `project-ledger/status.md`

不允许修改：

- `packages/api/**`
- `ProductCard` 组件
- cart / checkout / order / payment / refund / settlement / commission / payout / permission / fulfillment / logistics 相关逻辑
- 真实支付、短信、IM、物流、直播或搜索 provider

## 实现要求

- 店铺页继续保留 `seller` 输入，避免静态 fallback 和 seller metadata 路径丢失。
- `membership` 只作为 `buildChinaShopViewModel()` 的展示输入。
- `membership.status` 不能作为真实权限、营业状态、结算主体或订单归属依据。
- `membership.role` 只作为只读展示 tag 输入，不驱动菜单、权限或 checkout。
- 真实商品仍然来自 seller products API + Store products + `ProductCard`。

## 验证

- `cd apps/storefront && /home/codex/.bun/bin/bun run build`
- `git diff --check`
- 子智能体只读复核 diff，确认未触碰高风险路径。

## 回滚

回滚本 PR 后，店铺页仍会使用之前的 seller metadata / static profile 路径构造 shop adapter 输入。
