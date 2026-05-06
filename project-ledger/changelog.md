# Changelog

## 2026-05-06

- `128d4f5` API seed 创建可见中国 demo seller/products。
- `2b1713b` API seed 补齐 CNY variant prices。
- `8e4a1ee` API seed 补齐中国 seller shipping options。
- `1cdd5f8` Storefront 移除 mock cart 和 mock checkout path。
- `3e84cb9` Storefront 降低静态搜索/档口页交易误导。
- `da26f29` Admin 禁用 mock-only actions。
- `cd59a1a` Vendor 澄清 mock action boundaries。
- `d233fc8` Storefront 无 cart checkout 提前 redirect。
- `c99adb1` Storefront 搜索页优先展示真实 Store API 商品。
- `ecd31d2` Storefront 商家页优先展示真实 Store API 商品，静态档口商品降级为样例展示。
- `637d69e` Storefront 搜索页静态结果降级为样例，不再提供假商品详情/选规格入口。
- API seed 将默认 demo 商品更新为中国本地鲜货语义，保留原 handle 以维持链接稳定。

## 验收记录

- Storefront build 通过。
- Admin build/lint 通过。
- Vendor build/lint 通过。
- API products smoke 通过。
- Cart + shipping smoke 通过。
- Search page real-products smoke 通过。
- Seller page real-products smoke 通过。
- Search page sample-boundary smoke 通过。
- API seed 通过，Node 方式执行 `medusa exec ./src/scripts/seed.ts`。
- API build 通过，Node 方式执行 `medusa build`。
- Store API 与前台搜索/商品详情中文鲜货数据 smoke 通过。
- 中文鲜货购物车 smoke 通过：`东海小黄鱼` 可加入购物车，返回 CNY subtotal 和本地配送选项。
- 新增 `.codex/scripts/seed-api.sh`，用 Node 方式稳定执行 API seed，并验证通过。
- 新增 `/store/china/sellers/:handle/products` 只读 API，商家页按当前档口 product ids 展示真实商品。
- Seed seller handle 对齐前台 `a-hai-xian-huo-dang`，兼容旧 handle 自动迁移。
- Seller product ids API、商家页 seller 过滤、API tsc、API build、Storefront build 验证通过。
- Vendor 首页新增供应方角色开通矩阵，明确普通商户和物料/配送/上游/种苗/外地批发商角色边界；Vendor lint/build 通过。
- API generated route types 更新；清理 Storefront `.next` 缓存后首页、搜索、商家页、商品详情 smoke 通过。
- 新增中国本地化能力矩阵只读 API：`/store/china/capabilities`、`/store/china/vendor-capabilities`、`/admin/china/capabilities`。
- 能力矩阵覆盖多市场、商户类型、物料供应商、配送供应商、直播、提货卡、快递打印、移动端快速上架、AI 上架草稿、商家装修、上游供给和支付/结算高风险边界。
- API tsc/build 通过；Store/Vendor capability endpoints 带 publishable key 返回 200；Admin capability endpoint 未登录返回 401。
- Vendor 首页接入只读 capability view，并保留无 key/读取失败时的本地静态矩阵回退。
- 启动脚本为 Vendor 注入本地 API 地址和 publishable key；Vendor lint/build 和 7001 HTTP smoke 通过。
- Admin 模块开关页接入登录态只读 capability view，并保留未登录/读取失败时的只读 mock 边界提示；Admin lint/build 和页面 HTTP smoke 通过。
- 新增 `/store/china/discovery` 只读发现 API，Storefront 搜索页店铺/档口和类目改读 discovery 数据，市场保留为配置契约。
- API tsc/build、Storefront build、discovery curl smoke、`/cn/search?q=梭子蟹` HTTP smoke 通过。
- Demo seller seed 写入市场/档口/履约 metadata，商家页优先读取 seller metadata 展示配送/自提规则；seed 幂等补强后通过。
- API tsc、Storefront build、seller API/page smoke 通过。
- Demo product category seed 从服装占位本地化为生鲜类目，discovery 只返回 active 类目；seed、API tsc/build、Storefront build 和 discovery/search smoke 通过。
- Storefront 地址表单按中国地址顺序调整字段展示，并修正账户地址姓氏错误绑定；Storefront build 和 checkout/cart smoke 通过。
- 重写 `.codex/tasks/china-address-ui-baseline.md` 为 UTF-8 中文任务文件，避免后续 agent 读取乱码。
- 完成 integration worktree 全栈验证：API、Admin、Vendor、Storefront 构建/检查通过，并恢复 3101 dev 服务。
- 新增 `project-ledger/architecture-map.md` 和第十轮任务文件，完成 `docs/market-model-backend-design.md` 多市场模型设计。
- 完成 `docs/admin-module-config-contract-design.md`，明确模块开关配置存储、审计、幂等、回滚和高风险串行边界。
- 完成 `docs/vendor-fulfillment-config-design.md`，明确商家履约配置与 checkout/shipping option 的安全分层。
# 2026-05-07

- 完成 `docs/integration-release-readiness.md`。
- 将第十轮 `integration-release-readiness` 标记为 done。
- 记录 integration 不适合作为单个大 PR 合并，后续必须拆为 Codex 工作流、API 只读契约、Storefront、Admin、Vendor、Mock provider 和设计文档 PR。
- 记录高风险串行边界：支付、退款、对账、结算、佣金、权限、真实配送生效、Admin 模块开关真实落库和 checkout shipping options 生效。
- 新增第十一轮 docs-only staging 准备任务，准备生成 PR A-G staging 索引。
- 完成 `docs/integration-pr-staging-index.md`，记录 PR A-G 的候选文件、验证命令和禁止混入范围。
- PR A-H 已拆分合并到 `main`，覆盖 Codex 工作流、API 只读契约、Storefront、Admin、Vendor、Mock provider skeleton、架构文档和本地运行手册。
- 合并后验证通过：API typecheck/build、Mock provider unit test、Admin lint/build、Vendor lint/build、Storefront build。
- 新增 `docs/post-merge-validation-report.md`，记录已合并 PR、验证命令、残留 warning、临时 WSL GitHub 代理清理状态和下一阶段高风险边界。
- 新增第十三轮任务文件：市场数据模型落地计划、Admin 模块开关只读模型、Vendor 快速上架草稿读写计划、Storefront 真实发现数据桥接计划。
- 完成 `docs/market-data-model-implementation-plan.md`，把市场、商户、档口、商户类型、公告、营业时间和配送 profile 的真实数据落地拆成 K1-K8。
- 完成 `docs/admin-module-config-read-model.md`，把 Admin 模块开关从静态 capability contract 到只读配置模型的落地拆成 L1-L7。
- 完成 `docs/vendor-draft-product-readwrite-plan.md`，把快速上架草稿、规格模板、AI mock suggestion、平台审核候选和真实商品创建拆成 M1-M8。
- 完成 `docs/storefront-real-discovery-bridge.md`，把 Storefront 首页、搜索、店铺页从 mock/read-only 到真实 market/seller/category/product read model 的桥接拆成 N1-N7。
- 完成 `api-read-model-skeleton`，新增 API 只读 read model builder 和单元测试，现有 discovery route 改为调用 builder，保持不触碰交易链路。
- 完成 `storefront-discovery-view-shape`，新增 Storefront home/search/seller view shape builder 和单元测试，不修改前端 UI。
- 完成 `vendor-draft-product-skeleton`，新增未注册 Vendor product draft skeleton service 和单元测试，不创建真实商品。
- 完成 `admin-config-readonly-api`，新增 Admin 模块配置只读 GET endpoints 和默认 static read model，不提供写入。
- 完成 `api-post-merge-validation`，记录 PR O-R 合并后 API typecheck、单元测试和 Medusa build 通过。
- 完成 `real-model-next-pr-plan`，固化下一轮真实模型/API route 的 PR U-Z 拆分和风险门禁。
- 完成 `market-read-model-module-skeleton`，新增未注册 China market read model skeleton service 和单元测试，不新增 migration 或 route。
- 完成 `market-read-model-static-adapter`，新增 static adapter，将默认市场和 seller metadata 包装成 market read model seed。
- 完成 `market-readonly-store-api`，新增 Store 端中国市场只读 API，不影响 checkout 或交易链路。
- 完成 `admin-market-readonly-api`，新增 Admin 端中国市场只读 API，不保存配置、不改变权限。
- 完成 `market-api-post-merge-validation`，记录 PR U-X 合并后 API typecheck、市场 read model 单测和 Medusa build 通过。
- 完成 `storefront-connect-market-readonly-api-plan`，规划 Storefront market client、首页、搜索和店铺页分阶段接入只读 markets API。
- 完成 `storefront-market-client`，新增 Storefront 中国市场只读 API fetcher，不接页面布局。
- 完成 `admin-market-readonly-ui-plan`，规划 Admin market client 和市场只读页接入顺序。
