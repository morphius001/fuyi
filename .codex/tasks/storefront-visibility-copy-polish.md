# storefront-visibility-copy-polish

## 目标

收口消费者侧只读能力文案，确保 Storefront 只展示买东西、进店判断、提货和履约说明相关信息，不把后台配置、供应商接单或高风险交易边界暴露成消费者可操作能力。

## 允许修改

- `apps/storefront/**`
- `.codex/tasks/storefront-visibility-copy-polish.md`
- `.codex/queue.md`
- `docs/storefront-visibility-copy-polish.md`
- `project-ledger/**`

## 禁止修改

- `packages/api/**`
- `apps/admin/**`
- `apps/vendor/**`
- checkout、cart、order、payment、refund、settlement、commission、payout、permission、fulfillment runtime
- 真实提货卡兑换、真实直播、真实物流、真实 Provider
- 新依赖、真实密钥

## 文案规则

- 消费者端不要出现过多工程化词：API、metadata、fallback、mock。
- 可使用“展示数据”“后台展示配置”“演示占位”“以结算页为准”等消费者能理解的表达。
- 提货卡保持独立入口，不作为首页主推荐、支付方式、优惠券、余额或购物车抵扣。
- 直播最多作为店铺/档口状态，不作为首页主入口。
- 物料供应商、配送供应商、养殖户/种植户、种苗供应商和外地批发商默认不进入消费者商品流，除非它们同时开通普通商品商户角色。

## 验证

- `cd apps/storefront && bun run build`
- `git diff --check`
- 后续可 smoke `/cn`、`/cn/search`、`/cn/sellers/a-hai-xian-huo-dang`、`/cn/pickup-card`。
