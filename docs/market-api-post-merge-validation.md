# Market API Post Merge Validation

更新时间：2026-05-07 Asia/Shanghai

## 结论

PR U-X 已经合并到 `main`，市场 read model skeleton、static adapter、Store readonly API、Admin readonly API 的合并后验证通过。

当前市场能力仍然是只读/read model 层：

- 不新增真实 migration。
- 不新增写 API。
- 不影响 checkout shipping options。
- 不影响订单、支付、退款、结算、佣金、权限或履约。

## 已合并 PR

- PR #23: `[china] PR U Market read model skeleton`
- PR #24: `[china] PR V Market read model static adapter`
- PR #25: `[china] PR W Store market readonly API`
- PR #26: `[china] PR X Admin market readonly API`

当前验证基线：

- `origin/main`: `e368157` `[china] PR X Admin market readonly API`
- Worktree: `/home/codex/code/fuyi-pr-y-market-validation-cn`

## 验证命令

```bash
./node_modules/.bin/tsc --noEmit -p packages/api/tsconfig.json
cd packages/api && TEST_TYPE=unit ./node_modules/.bin/jest src/modules/china-market-read-model/__tests__/market-read-model-service.unit.spec.ts src/lib/__tests__/china-read-models.unit.spec.ts --runInBand
cd packages/api && ./node_modules/.bin/medusa build
```

## 验证结果

- API TypeScript typecheck 通过。
- Unit tests 通过：2 个 test suites，8 个 tests。
- Medusa build 通过。
- Build 期间未留下需要提交的 generated type diff。

## 新增只读 API

Store:

- `GET /store/china/markets`
- `GET /store/china/markets/:slug`
- `GET /store/china/markets/:slug/sellers`

Admin:

- `GET /admin/china/markets`
- `GET /admin/china/markets/:id`

这些 API 目前读取 static market read model adapter 和现有 seller metadata。后续可以替换为真实 market module，但响应边界应保持只读和 display-only，直到专门业务 PR 接入 runtime。

## 下一步建议

下一步不要直接改 UI，先做：

1. `storefront-connect-market-readonly-api-plan`
   - 规划 Storefront 首页、搜索、店铺页何时接 `/store/china/markets*`。
   - 不直接改 `apps/storefront/**`。

2. `admin-connect-market-readonly-api-plan`
   - 规划 Admin 市场管理页如何接 `/admin/china/markets*`。
   - 不直接改权限或保存逻辑。

3. `market-real-migration-design`
   - 开始真实 migration 设计，但仍先文档。

## 风险边界

不能混入：

- market 配置写 API。
- seller membership 写 API。
- checkout shipping options 生效。
- 运费计算。
- 订单履约。
- 支付、退款、对账、结算、佣金。
- RBAC/permission。
- 真实物流、快递打印、短信、IM、直播或 AI 服务。
