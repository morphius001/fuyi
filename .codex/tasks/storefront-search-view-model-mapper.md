# storefront-search-view-model-mapper

## 目标

新增 Storefront 搜索页 view model mapper，让后续搜索页模板绑定有稳定只读数据合同。

本任务只做 mapper、类型、focused tests 和文档记录，不改页面。

## 允许修改

- `packages/api/src/lib/china-read-models.ts`
- `packages/api/src/lib/__tests__/**`
- `docs/storefront-search-view-model-mapper.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- `apps/**`
- `packages/api/src/api/**`
- DB / migration / seed
- checkout、cart、order、payment、refund、settlement、commission、payout、permission、fulfillment 运行逻辑
- 真实搜索排序、广告、竞价、推荐系统
- 真实 Provider、真实密钥、真实外部服务接入

## Mapper 要求

- 输出 `storefront-search-market-results-v1` 对应的搜索只读 view model。
- 默认 `locale=zh-CN`、`currency=CNY`、`timezone=Asia/Shanghai`。
- 搜索结果只负责展示市场、类目、店铺 / 档口和商品结果。
- 默认过滤物料供应商、配送供应商、上游供给、种苗批发、外地批发等 B 端采购/供给内容。
- 市场上下文只作为过滤和展示提示，不写入配送规则。
- 商品卡只展示规格、价格和库存提示，不占用库存、不创建购物车、不创建订单。
- 输出必须标记 `readOnly=true`、`runtimeEnabled=false`、`canWriteBusinessState=false`。

## 验证

- `cd packages/api && bun test src/lib/__tests__/storefront-search-view-model-mapper.unit.spec.ts`
- `cd packages/api && bun test src/lib/__tests__/storefront-home-view-model-mapper.unit.spec.ts`
- `cd packages/api && bun test src/lib/__tests__/storefront-shop-view-model-mapper.unit.spec.ts`
- `cd packages/api && bun test src/lib/__tests__/china-read-models.unit.spec.ts`
- `./node_modules/.bin/tsc --noEmit -p packages/api/tsconfig.json`
- `git diff --check`

## 交付要求

- 不自动提交，除非用户明确要求或当前连续执行队列已授权。
- 不 push，除非用户明确要求或当前连续执行队列已授权。
- 完成后记录修改文件、验证结果、风险点和下一步建议。
