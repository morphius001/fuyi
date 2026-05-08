# storefront-shop-view-model-mapper

## 目标

新增 Storefront 店铺 / 档口页 view model mapper，让后续 `storefront-shop-stall-v2` 页面绑定有稳定只读数据合同。

本任务只做 mapper、类型、focused tests 和文档记录，不改页面。

## 允许修改

- `packages/api/src/lib/china-read-models.ts`
- `packages/api/src/lib/__tests__/**`
- `docs/storefront-shop-view-model-mapper.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- `apps/**`
- `packages/api/src/api/**`
- DB / migration / seed
- checkout、cart、order、payment、refund、settlement、commission、payout、permission、fulfillment 运行逻辑
- 真实 Provider、真实密钥、真实直播、真实 IM、真实物流或真实提货卡兑换

## Mapper 要求

- 输出 `storefront-shop-stall-v2` 对应的店铺只读 view model。
- 默认 `locale=zh-CN`、`currency=CNY`、`timezone=Asia/Shanghai`。
- 店铺页要把配送、自提、营业时间、市场公告等归到店铺 / 档口头部能力，不放在商品卡里决定。
- 商品卡只展示规格、价格和库存提示，不创建购物车、订单或履约状态。
- 提货卡保持独立入口，不作为优惠券、支付方式或购物车抵扣。
- 直播只作为店铺状态 badge，不作为首页主入口或交易事实来源。
- B-side 供应商店铺可被标记为 `role_gated_preview_only`，但不得默认进入消费者主路径。
- 输出必须标记 `readOnly=true`、`runtimeEnabled=false`、`canWriteBusinessState=false`。

## 验证

- `cd packages/api && bun test src/lib/__tests__/storefront-shop-view-model-mapper.unit.spec.ts`
- `cd packages/api && bun test src/lib/__tests__/china-read-models.unit.spec.ts`
- `./node_modules/.bin/tsc --noEmit -p packages/api/tsconfig.json`
- `git diff --check`

## 交付要求

- 不自动提交，除非用户明确要求或当前连续执行队列已授权。
- 不 push，除非用户明确要求或当前连续执行队列已授权。
- 完成后记录修改文件、验证结果、风险点和下一步建议。
