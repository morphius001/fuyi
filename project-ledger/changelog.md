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
- 重启后恢复本地开发服务，并修正 `.codex/scripts/start-dev.sh` 的 Admin/Vendor 本地 API 地址为 `http://localhost:9000`，解决 Windows 浏览器登录页 `Failed to fetch`。
- 补齐 WSL Playwright 浏览器 QA 依赖和中文字体，生成 Admin 登录态市场配置页截图与 JSON 检查结果。
- Admin 登录态 QA 通过：`/dashboard/cn/operations/market-capabilities` 可访问，页面包含中国后台壳、市场配置、配送能力和只读 mock 边界，未出现 `Failed to fetch`。
