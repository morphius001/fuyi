# storefront-shop-template-v2

## 目标

落地 Storefront 店铺 / 档口主页 v2 的第一版消费者文案和展示边界，让配送、自提、营业时间、公告归属店铺头部，商品区只负责帮助消费者判断是否购买。

## 允许修改

- `apps/storefront/src/app/[locale]/(main)/sellers/[handle]/page.tsx`
- `docs/storefront-shop-template-v2.md`
- `.codex/queue.md`
- `project-ledger/status.md`
- `project-ledger/handoff.md`
- `project-ledger/changelog.md`

## 禁止修改

- `packages/api/**`
- `apps/admin/**`
- `apps/vendor/**`
- `package.json`
- `bun.lock`
- `.env`
- 真实密钥
- checkout、cart、order、payment、refund、settlement、commission、payout、permission、fulfillment runtime

## 实现要求

- 店铺头部展示市场、档口号、营业状态、公告和配送 / 自提方式。
- 商品卡只展示图片、名称、规格、价格、库存/供应状态和进入详情路径。
- 商品卡不把配送方式写成商品核心能力。
- 直播只保留为店铺状态，不接真实直播、IM、打赏或直播交易。
- 页面文案面向消费者，避免暴露 `API`、`metadata`、`mock`、`安全边界` 等工程化词。
- 不接真实客服、物流、提货卡兑换、库存扣减、订单、支付或履约服务。

## 验证

```bash
cd apps/storefront && bun run build
cd apps/storefront && bun run lint
git diff --check
curl -s -o /tmp/fuyi-shop.html -w "%{http_code}\n" http://127.0.0.1:3101/cn/sellers/a-hai-xian-huo-dang
```

还需要保存桌面和移动端截图到 `docs/visual-qa-artifacts/`，但截图产物不纳入提交。

## 提交规则

验证通过后可以提交、推送并创建 PR。PR 必须说明本轮未改交易链路和高风险业务逻辑。
