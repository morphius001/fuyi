# Round 32 Next Stage Plan

更新时间：2026-05-07 Asia/Shanghai

## 当前结论

第三十一轮自动队列已清空。市场、商户、档口、公告、营业时间、配送 profile 的数据模型已经完成到“可本地 dry-run、可测试、可只读读取”的阶段，但还没有进入生产 migration 注册、生产 seed、Admin 写接口或真实履约生效。

下一阶段不应该直接做支付、退款、结算、权限或真实配送。建议先把 market membership 的真实数据链路做成可验证、可回滚、只读优先的串行路线。

## 现在可以继续做的任务

### 低风险 docs-only

1. `preprod-market-membership-dry-run-checklist`
   - 目标：把预发可丢弃数据库 dry-run 的连接条件、备份、执行、回滚、验收和退出条件写清楚。
   - 不执行真实数据库命令。

2. `admin-browser-qa-readiness`
   - 目标：等待用户登录 Admin 后，按清单做截图 QA。
   - 当前仍是 `blocked-manual`，不能伪造。

3. `market-membership-registration-plan`
   - 目标：规划何时注册 migration/module，如何回滚，如何避免影响 checkout/order/fulfillment。
   - 只写设计和门禁。

### 可自动执行的低风险代码任务

1. `market-membership-repository-integration-test`
   - 用本地 disposable DB 验证 repository reader 对真实表查询的 ready/empty/missing-table 三态。
   - 只使用 `fuyi_market_membership_dry_run_*` 临时库。
   - 不注册生产 migration。

2. `admin-market-readonly-api-db-qa`
   - 只测 Admin market readonly API 对 DB/read model 的 ready/empty/fallback。
   - 不改 Admin UI、不加写接口。

3. `storefront-market-readonly-api-db-qa`
   - 只测 Storefront markets API 对 DB/read model 的 ready/empty/fallback。
   - 不改 checkout、不接真实搜索 provider。

## 必须等用户或环境条件的任务

1. `admin-market-membership-browser-qa`
   - 需要用户已登录 Admin 的 Codex App 浏览器。
   - 验证 ready / empty / fallback 三态截图。

2. `preprod-market-membership-dry-run`
   - 需要明确预发 disposable DB。
   - 必须确认该 DB 可删除、可重建、没有生产数据。

3. `real-migration-registration`
   - 高风险串行。
   - 必须在本地和预发 dry-run 都通过后才进入。

## 不应该现在自动做的任务

- 真实生产 migration 注册。
- production seed。
- Admin 写接口或模块开关真实生效。
- 商户真实配送规则写入。
- 真实支付、退款、结算、佣金、权限、真实履约。
- 微信支付、支付宝、短信、IM、物流、直播、AI provider 真实接入。

## 建议 PR 顺序

1. PR BL：第三十二轮规划、架构图和上线门禁。
2. PR BM：预发 DB dry-run checklist，docs-only。
3. PR BN：本地 disposable DB repository integration test。
4. PR BO：Admin readonly API DB QA。
5. PR BP：Storefront readonly API DB QA。
6. PR BQ：Admin logged-in browser QA，只有用户已登录后执行。
7. PR BR：真实 migration registration plan review，docs-only。
8. PR BS：migration registration implementation，高风险串行，必须单独确认。

## 验收标准

- 每个 PR 都要说明 changed files、scope、non-goals、verification、risk notes。
- 只读任务必须证明不影响 checkout、订单、支付、退款、结算、佣金、权限或真实履约。
- 浏览器 QA 必须有真实截图路径和 URL，不允许文字代替截图。
- 数据库任务必须说明目标库是 disposable，且有 down/cleanup 结果。
