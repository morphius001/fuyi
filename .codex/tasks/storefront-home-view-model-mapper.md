# storefront-home-view-model-mapper

## 目标

新增 Storefront 消费者首页 view model mapper，让后续首页模板绑定时有稳定的只读数据合同。

本任务只做 mapper、类型、focused tests 和文档记录，不改页面。

## 允许修改

- `packages/api/src/lib/china-read-models.ts`
- `packages/api/src/lib/__tests__/**`
- `docs/storefront-home-view-model-mapper.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- `apps/**`
- `packages/api/src/api/**`
- `packages/api/src/modules/china-payment-notification/**`
- checkout、cart、order、payment、refund、settlement、commission、payout、permission、fulfillment 运行逻辑
- 真实 Provider、真实密钥、真实外部服务接入

## Mapper 要求

- 输出 `storefront-home-market-shop-v2` 对应的首页只读 view model。
- 默认 `locale=zh-CN`、`currency=CNY`、`timezone=Asia/Shanghai`。
- 消费者首页主路径保持：选市场、看类目、找店/档口、看今日鲜货、进店铺详情。
- 提货卡只作为 secondary / independent 入口，不进入普通商品支付抵扣逻辑。
- 直播不作为首页主入口，只作为后续店铺状态。
- 物料供应商、配送供应商、上游供给、种苗批发、外地批发商默认不进入消费者首页主路径。
- 输出必须标记 `readOnly=true`、`runtimeEnabled=false`、`canWriteBusinessState=false`。
- 输出必须保留高风险边界说明：checkout shipping options、payment success、order、refund、settlement、commission、payout、fulfillment、Provider config 等均为 blocked serial work。

## 验证

- `cd packages/api && bun test src/lib/__tests__/storefront-home-view-model-mapper.unit.spec.ts`
- `cd packages/api && bun test src/lib/__tests__/china-read-models.unit.spec.ts`
- `./node_modules/.bin/tsc --noEmit -p packages/api/tsconfig.json`
- `git diff --check`

## 交付要求

- 不自动提交，除非用户明确要求或当前连续执行队列已授权。
- 不 push，除非用户明确要求或当前连续执行队列已授权。
- 完成后记录修改文件、验证结果、风险点和下一步建议。
