# 项目状态 Ledger

更新时间：2026-05-09 05:45 Asia/Shanghai

## 主线合并状态

- PR A-H 已经合并到 `main`。
- 当前 `origin/main` 最新合并提交：`a945ceb` `[china] PR H Integration runbooks and env template notes`。
- PR I post-merge handoff 已合并到 `main`，最新主线提交：`12bbde0` `[china] PR I Post-merge validation handoff`。
- PR J next data task files 已合并到 `main`，最新主线提交：`f8f4b69` `[china] PR J Next data task files`。
- PR K market data model plan 已合并到 `main`，最新主线提交：`36ad4cc` `[china] PR K Market data model plan`。
- PR L admin module config read model 已合并到 `main`，最新主线提交：`e2808b6` `[china] PR L Admin module config read model`。
- PR M vendor draft product plan 已合并到 `main`，最新主线提交：`eaf4955` `[china] PR M Vendor draft product plan`。
- PR N storefront discovery bridge 已合并到 `main`，最新主线提交：`a4a0b49` `[china] PR N Storefront discovery bridge`。
- 合并后验证报告：`docs/post-merge-validation-report.md`。
- `origin/main..china/integration-localization` diff 为空，说明拆分 PR 合并后的主线内容与 integration 基线一致。
- 主工作目录 `/home/codex/code/fuyi` 可能仍有本地未提交改动；本轮未在主目录执行 pull、reset 或覆盖操作。

## 当前分支

- 主线基线：`origin/main`
- 最近验证 worktree: `/home/codex/code/fuyi-pr-h-runbooks-cn`
- 账本更新 worktree: `/home/codex/code/fuyi-pr-i-postmerge-cn`
- 目标：MercurJS 中国大陆多商户生鲜/海鲜本地化基础版进入下一阶段数据落地准备

## 下一阶段任务文件

- `.codex/tasks/market-data-model-implementation-plan.md`
- `.codex/tasks/admin-module-config-read-model.md`
- `.codex/tasks/vendor-draft-product-readwrite-plan.md`
- `.codex/tasks/storefront-real-discovery-bridge.md`

下一阶段先做真实数据模型、只读配置模型、草稿商品读写计划和 Storefront discovery bridge 的拆分设计；在任务文件明确允许前，不直接修改 `apps/**` 或 `packages/**`。

## 第十三轮进度

- `market-data-model-implementation-plan`: done，新增 `docs/market-data-model-implementation-plan.md`，明确市场、商户、档口、商户类型、公告、营业时间和配送 profile 的真实数据模型落地顺序。
- `admin-module-config-read-model`: done，新增 `docs/admin-module-config-read-model.md`，明确 Admin 模块开关只读配置模型、四类视图、合成顺序、PR L1-L7 和高风险边界。
- `vendor-draft-product-readwrite-plan`: done，新增 `docs/vendor-draft-product-readwrite-plan.md`，明确手机快速上架、规格模板、AI mock suggestion、审核候选和真实商品创建的分层。
- `storefront-real-discovery-bridge`: done，新增 `docs/storefront-real-discovery-bridge.md`，明确消费者首页、搜索、店铺页从 mock/read-only 过渡到真实 discovery read model 的桥接阶段。
- 第十三轮 docs-only 队列已清空；下一轮进入小范围只读 skeleton 前，需要继续避免交易链路混入。

## 第十四轮进度

- `api-read-model-skeleton`: done，新增 `packages/api/src/lib/china-read-models.ts` 和单元测试，把 discovery、module config capability view、vendor product draft 的只读模型先做成纯 builder。
- 现有 `/store/china/discovery` 改为调用 read model builder；输出语义保持只读，不影响 checkout、订单、支付、退款、结算、佣金、权限或履约。
- `storefront-discovery-view-shape`: done，新增 Storefront home/search/seller view shape builder，后续前端可按稳定合同读取，不重做 UI。
- `vendor-draft-product-skeleton`: done，新增未注册 `packages/api/src/modules/china-product-drafts/**` skeleton，覆盖草稿、AI suggestion、审核候选和审计记录；不新增 route、不写库、不创建真实商品。
- `admin-config-readonly-api`: done，新增 `/admin/china/module-configs` 和 `/admin/china/module-configs/effective` 只读 GET endpoints，返回 static read model 和 effective capability view；不保存、不发布、不生效。
- 第十四轮队列已清空。

## 第十五轮进度

- `api-post-merge-validation`: done，新增 `docs/api-post-merge-validation.md`。
- PR O-R 合并后验证通过：API typecheck、3 组单元测试 16/16、Medusa build。
- `real-model-next-pr-plan`: done，新增 `docs/real-model-next-pr-plan.md`，明确下一轮 PR U-Z 的真实模型/API route 顺序和高风险门禁。
- 第十五轮队列已清空；下一项建议为 `market-read-model-module-skeleton`。

## 第一百零五轮 Storefront Adapter 页面绑定收口

- `storefront-adapter-binding-sequence-plan`: done，已规划 home / shop / search adapter 页面绑定顺序。
- `storefront-home-adapter-binding-readonly`: done，首页首屏市场 / 类目 / 店铺展示已读取 `buildChinaHomeViewModel()`。
- `storefront-shop-header-adapter-binding-readonly`: done，店铺头部市场 / 档口 / 公告 / 履约提示已读取 `buildChinaShopViewModel()`。
- `storefront-search-adapter-binding-readonly`: done，搜索页 query、市场 / 类目 / 店铺 / 静态商品样例结果已读取 `buildChinaSearchViewModel()`。
- `storefront-home-product-cards-binding-readonly`: done，首页“今日鲜货 / 今日上新 / 推荐档口商品缩略卡”已读取 home view model 的商品展示字段。
- `storefront-shop-product-cards-binding-readonly`: done，店铺页“档口今日参考 / 常卖鲜货”已读取 shop view model 的商品展示字段。
- `storefront-adapter-binding-validation`: done，已汇总 PR #260-#264 的只读绑定状态、验证范围、风险边界和回滚方式。
- 验证通过：Storefront build、`git diff --check`；本轮没有修改 `apps/**` 或 `packages/**` 业务代码。
- 当前阶段不改变 cart、checkout、订单、支付、退款、结算、佣金、打款、权限、履约、物流、真实排序、广告、竞价或推荐 runtime。

## 第一百零六轮 Storefront Read Model 数据源规划

- `storefront-read-model-data-source-plan`: done，新增 `docs/storefront-read-model-data-source-plan.md`。
- 本轮只做 docs-only 规划，不修改 `apps/**` 或 `packages/**`。
- 规划将 Storefront adapter 下一阶段输入拆为 market read model、seller membership read model 和 product discovery read model。
- 后续 PR 建议：首页 adapter 输入收束、搜索 read model 输入合同、店铺 membership 输入过渡、最终 source validation。
- 验证通过：`git diff --check`。
- 当前阶段仍不改变 cart、checkout、订单、支付、退款、结算、佣金、打款、权限、履约、物流、真实排序、广告、竞价或推荐 runtime。

## 第一百零七轮 Storefront 首页数据源收束

- `storefront-home-adapter-real-source`: done，新增 `docs/storefront-home-adapter-real-source.md`。
- 首页 `buildChinaHomeViewModel()` 输入现在并行读取 markets API 和 discovery API。
- `markets` 优先来自 `/store/china/markets`，类目和档口优先来自 `/store/china/discovery`，静态 `home-market` 保留为 adapter fallback。
- 验证通过：Storefront build、首页 HTTP smoke、桌面/移动截图、`git diff --check`；仅保留既有 React Hook dependency warnings。
- 本轮不修改 `packages/api/**`，不改变 cart、checkout、订单、支付、退款、结算、佣金、打款、权限、履约、物流、真实排序、广告、竞价或推荐 runtime。
- `storefront-search-read-model-input-contract`: done，新增搜索 adapter 输入合同，明确 query / market / categories / sellers / products 的只读来源和 blocked runtime；Storefront build 和 `git diff --check` 通过。
- `storefront-shop-membership-source`: done，新增店铺 adapter membership 输入形状和合同；Storefront build 和 `git diff --check` 通过；不修改店铺页、`ProductCard`、`packages/api/**` 或交易/履约链路。
- `storefront-read-model-source-validation`: done，docs-only 汇总 PR #267-#269 的 read model source 阶段验证；Storefront build 和 `git diff --check` 通过；本轮不修改 `apps/**` 或 `packages/**`。
- `storefront-search-discovery-source-binding`: done，搜索页输入构造收束为 discovery / markets / products + static fallback；Storefront build 和 `git diff --check` 通过，不接真实搜索 provider 或交易/履约链路。
- `storefront-shop-membership-source-binding`: done，店铺页把 market detail membership / seller metadata 合成为 shop adapter membership 输入；真实商品卡仍走 Store API / `ProductCard`，不改交易或履约链路。
- `storefront-source-binding-validation`: done，docs-only 汇总 PR #271/#272 的搜索 discovery 与店铺 membership source binding 状态；不修改 `apps/**` 或 `packages/**`。
- `storefront-product-discovery-input-contract`: done，新增 Storefront 商品发现输入共享只读合同，覆盖首页鲜货、搜索商品结果、店铺真实商品和店铺参考商品；不改页面、Store API 或交易链路。
- `storefront-read-model-source-phase-rollup`: done，docs-only 汇总 PR #267-#274 的 Storefront read model source 阶段状态和下一步高风险边界。
- `storefront-product-discovery-api-plan`: done，docs-only 规划未来 `/store/china/product-discovery` 只读 API、read model builder、Storefront client 和分 surface binding 顺序。
- `product-discovery-read-model-builder`: done，新增 API 纯 TypeScript 商品发现只读 read model builder 和 focused tests；不新增 route、不读 DB、不改 Storefront。
- `product-discovery-store-api-readonly`: done，新增 `/store/china/product-discovery` 只读 GET route、helpers 和 focused tests；只读 open seller / seller product links / published products，不写业务状态。
- `storefront-product-discovery-client`: done，新增 Storefront 商品发现只读 fetcher 和空 fallback；不接页面、不改 `ProductCard` 或交易链路。
- `product-discovery-readonly-validation`: done，docs-only 汇总 PR #277-#279 的商品发现 builder / Store API / Storefront client 验证和后续页面绑定边界。

## 第十六轮进度

- `market-read-model-module-skeleton`: done，新增未注册 `packages/api/src/modules/china-market-read-model/**` skeleton，覆盖市场、档口关系、商户角色、公告、营业时间和配送 profile 的只读 service。
- `market-read-model-static-adapter`: done，新增 static adapter，把默认市场和 seller metadata 转成 market read model seed；仍不新增 route、不接 migration、不影响 checkout。
- `market-readonly-store-api`: done，新增 Store 端中国市场只读 API，覆盖市场列表、市场详情和市场档口列表；不新增写接口、不影响 checkout。
- `admin-market-readonly-api`: done，新增 Admin 端中国市场只读 API，覆盖市场列表和详情；不新增写接口、不改变权限。
- 第十六轮队列已清空。

## 第十七轮进度

- `market-api-post-merge-validation`: done，新增 `docs/market-api-post-merge-validation.md`。
- PR U-X 合并后验证通过：API typecheck、2 组单元测试 8/8、Medusa build。
- `storefront-connect-market-readonly-api-plan`: done，新增 `docs/storefront-connect-market-readonly-api-plan.md`，规划 Storefront 分阶段接入 markets API。
- 第十七轮队列已清空；下一项建议为 `storefront-market-client`。

## 第十八轮进度

- `storefront-market-client`: done，新增 Storefront 中国市场只读 API client/fetcher，不改页面布局、不影响 checkout。
- `admin-market-readonly-ui-plan`: done，新增 `docs/admin-market-readonly-ui-plan.md`，规划 Admin 只读 markets API 接入 UI。
- 第十八轮队列已清空；下一项建议为 `admin-market-client`。

## 已跑通

- 本地服务：
  - API: `http://127.0.0.1:9000`
  - Admin: `http://127.0.0.1:7000/dashboard/cn`
  - Vendor: `http://127.0.0.1:7001/`
  - Storefront: `http://127.0.0.1:3101/cn`
- Store API 商品列表：`/store/products?country_code=cn&limit=5` 返回 200。
- 购物车 smoke：
  - 创建 CN 区域购物车成功
  - 添加本地商品成功，币种为 `cny`
  - 返回 1 个 seller shipping group、2 个 shipping options
  - 添加配送方式成功，最终 total 为 80，`shipping_methods=1`

## 本轮已收口

- API seed 已补齐中国本地 demo seller、CNY variant price、seller shipping options。
- API seed 已将默认 demo 商品更新为中国本地鲜货语义，保留原 handle 以维持前端链接稳定。
- Storefront 已移除会误导的假购物车和假结算页。
- Storefront 静态搜索/档口页不再显示假数量、假金额或直接跳真实结算。
- Storefront 无购物车访问 `/cn/checkout` 会提前 307 到 `/cn/cart`。
- Storefront 搜索页已优先展示 Store API 真实商品，静态市场鲜货降级为样例展示。
- Storefront 搜索页静态店铺、市场、类目和鲜货卡已明确标注为样例，不再提供假商品详情/选规格入口。
- Storefront 商家页已优先展示 Store API 真实商品，静态档口商品降级为展示样例。
- Storefront `listProducts()` 已修正：列表查询不再因响应缺少 `seller` 对象或过深 seller 字段而吞掉真实商品。
- Admin 高风险 mock-only 行操作、顶部搜索/待办/消息/默认导出/新建等入口已禁用并加只读提示。
- Vendor 高风险“确认接单/确认到货/确认报价/批量打印”等措辞已降级为查看占位；普通商户快速上架不再写“物料供应商自接单”。
- API 新增中国本地化能力矩阵只读契约，覆盖多市场、商户类型、物料供应商、配送供应商、直播、提货卡、快递打印、移动端快速上架、AI 上架草稿、上游供给和高风险支付/结算边界。
- 新增 Storefront/Vendor 公开只读能力视图和 Admin 登录态能力视图；不写库、不启用真实权限、不改变订单/支付/退款/结算/佣金/履约逻辑。
- Vendor 首页新增“后端能力契约”区块，优先读取 `/store/china/vendor-capabilities`；读取失败时明确回退本地静态矩阵。
- `.codex/scripts/start-dev.sh` 启动 Vendor 时注入 `VITE_MEDUSA_BACKEND_URL` 和 `VITE_MEDUSA_PUBLISHABLE_KEY`，本地重启后 Vendor 能读取能力契约。
- Admin 模块开关页新增“后端能力契约”区块，优先读取登录态 `/admin/china/capabilities`；读取失败或未登录时明确回退只读 mock 开关说明。
- `.codex/scripts/start-dev.sh` 启动 Admin 时注入 `VITE_MEDUSA_BACKEND_URL`，避免重启后 Admin 无法定位本地 API。
- API 新增 Storefront 发现数据只读契约 `/store/china/discovery`，店铺来自 `seller` 表，类目来自 `product_category` 表，市场暂时作为静态配置契约返回。
- Storefront 搜索页读取 `/store/china/discovery`，店铺/档口和类目从只读发现数据展示；市场区块改为“市场配置”，不再写成纯样例。
- API seed 为 demo seller 写入市场、档口、主营类目、资质、公告和履约方式 metadata。
- Storefront 商家页优先读取 `/store/china/sellers/:handle/products` 返回的 seller metadata 展示市场、档口、配送/自提规则；读取不到时回退静态 profile。
- Seed link helper 补强重复 link 幂等处理，并增加 email fallback，避免重启 WSL/旧数据残留后重复创建 demo seller。
- API seed 将原 demo product category 从服装占位本地化为 `鲜活蟹类`、`鲜活虾类`、`冰鲜鱼类`、`贝类净养`，保留原 handle 以免破坏已有链接。
- Storefront discovery 只读接口只返回 active category；上一轮误建的临时中文 handle 类目已由 seed 标记 inactive，不再出现在前台发现数据里。
- Storefront 结算收货地址、账单地址和账户地址表单的字段顺序调整为中国地址阅读顺序：省 / 市 / 区县街道 / 详细地址 / 邮编 / 国家地区。
- Storefront 账户地址表单修正“收货人姓”字段错误绑定，避免姓氏校验错误显示到名字字段。
- `.codex/tasks/china-address-ui-baseline.md` 已重写为 UTF-8 中文任务文件，避免后续 agent 读取乱码任务说明。
- 新增 `project-ledger/architecture-map.md`，固化三端 + API 当前架构图、数据流、完成状态、风险边界和第十轮建议队列。
- 新增第十轮任务文件：市场模型、Admin 模块配置合同、Vendor 履约配置、integration release readiness。
- 完成 `docs/market-model-backend-design.md`，明确多市场、跨市场商户、档口、营业时间、公告、配送规则和供应商角色的后端设计边界。
- 完成 `docs/admin-module-config-contract-design.md`，明确 Admin 模块开关从只读 contract 到真实配置存储、审计、幂等、回滚和分阶段生效的合同边界。
- 完成 `docs/vendor-fulfillment-config-design.md`，明确市场统一配送、商家自配送、自提、配送供应商和未来 checkout 接入的安全边界。
- 完成 `docs/integration-release-readiness.md`，明确当前 integration 不适合整体合并，应拆为 Codex 工作流、API 只读契约、Storefront、Admin、Vendor、Mock provider 和设计文档等低风险 PR 组。
- 新增第十一轮 docs-only staging 准备任务 `integration-pr-staging-index`，用于把后续 PR A-G 的文件候选、验证命令和禁止混入内容固化成索引。
- 完成 `docs/integration-pr-staging-index.md`，后续 staging 可按 PR A-G 精确挑文件。

## 验证结果

- `cd apps/storefront && bun run build` 通过；仍有项目既有 React Hook lint warning。
- `cd apps/admin && bun run build` 通过。
- `cd apps/admin && bun run lint` 通过。
- `cd apps/vendor && bun run build` 通过。
- `cd apps/vendor && bun run lint` 通过。
- 核心页面 smoke：
  - `/cn` 200
  - `/cn/search` 200
  - `/cn/sellers/a-hai-xian-huo-dang` 200
  - `/dashboard/cn` 200
  - vendor `/` 200
- 搜索页 smoke：`/cn/search` 返回 200，页面包含真实商品结果、样例边界文案和 demo 商品 `Medusa Sweatpants`。
- 商家页 smoke：`/cn/sellers/a-hai-xian-huo-dang` 返回 200，页面包含真实商品区、档口样例区和 demo 商品 `Medusa Sweatpants`。
- API seed 运行通过：使用 Node PATH 直接执行 `medusa exec ./src/scripts/seed.ts` 成功。
- API build 通过：使用 Node PATH 直接执行 `medusa build` 成功。
- Store API 商品 smoke：`/store/products?country_code=cn&region_id=reg_cn_local` 返回 `鲜活梭子蟹`、`皮皮虾`、`东海小黄鱼`、`花蛤净养装`。
- 前台缓存刷新后，`/cn/search` 和 `/cn/products/sweatpants` 已显示本地鲜货名；`/cn/products/sweatpants` 显示 `东海小黄鱼`。
- 中文鲜货购物车 smoke：`东海小黄鱼` 加入购物车成功，subtotal 为 39，币种 `cny`，返回 `本地统一配送` 和 `档口自行配送` 两个配送选项。
- 新增 `.codex/scripts/seed-api.sh`，固定用 Node 方式执行 Medusa seed，避开当前 WSL 下 `bun run seed` 的 source-map 异常。
- `.codex/scripts/seed-api.sh` 运行通过。
- 新增只读 Store API：`/store/china/sellers/:handle/products`，按已开放商家 handle 返回 seller 和 product ids。
- Storefront 商家页已从“全站真实商品”收口为“当前档口 product ids 对应的真实商品”。
- Seed 已把中国 demo seller handle 对齐为 `a-hai-xian-huo-dang`，并兼容旧 handle `ahai-seafood-stall` 自动迁移。
- Seller product ids smoke：`/store/china/sellers/a-hai-xian-huo-dang/products` 返回 4 个 product ids。
- 商家页 seller 过滤 smoke：`/cn/sellers/a-hai-xian-huo-dang` 显示当前档口 Store API 商品和本地鲜货名。
- Vendor 首页新增供应方角色开通矩阵，明确普通商品商户、物料供应商、配送供应商、养殖户/种植户、种苗供应商、外地批发商的开通边界。
- `packages/api/.mercur/index.d.ts` 已由 API build/codegen 更新，包含 `/store/china/sellers/:handle/products` 路由类型。
- 清理 Storefront `.next` 缓存并重启 3101 后，`/cn`、`/cn/search`、`/cn/sellers/a-hai-xian-huo-dang`、`/cn/products/sweatpants` 均为 200。
- API capability route types 已更新，包含 `/admin/china/capabilities`、`/store/china/capabilities`、`/store/china/vendor-capabilities`。
- API `tsc --noEmit -p packages/api/tsconfig.json` 通过。
- API `medusa build` 通过。
- 本地 API 重启后，带 publishable key 访问 `/store/china/capabilities` 返回 200，包含 `shop_first_discovery`、`pickup_card_entry`、`market_delivery_options`。
- 本地 API 重启后，带 publishable key 访问 `/store/china/vendor-capabilities` 返回 200，包含 `mobile_quick_listing`、`materials_procurement`、`delivery_supplier_orders`、`waybill_printing`。
- 未登录访问 `/admin/china/capabilities` 返回 401，符合 Admin 登录态边界。
- Vendor `bun run lint` 通过。
- Vendor `bun run build` 通过。
- 重启 Vendor 7001 后，`http://127.0.0.1:7001/` 返回 200。
- 未安装 Playwright，未引新依赖做浏览器截图；本轮以 build、lint、HTTP smoke 和 capability API smoke 验收。
- Admin 模块开关页接入只读 capability contract，并保留无登录态/读取失败时的本地只读 mock 边界提示。
- Admin `bun run lint` 通过。
- Admin `bun run build` 通过。
- Admin 模块开关页 HTTP smoke：`/dashboard/cn/operations/module-switches` 返回 200。
- 未登录访问 `/admin/china/capabilities` 返回 401，符合 Admin 登录态边界。
- API `tsc --noEmit -p packages/api/tsconfig.json` 通过。
- API `medusa build` 通过，generated route types 已更新。
- Storefront `bun run build` 通过；仍有项目既有 React Hook warning。
- 本地 API 重启后，带 publishable key 访问 `/store/china/discovery` 返回 200，包含 `read_only_discovery`、`seller_and_category_tables`、`a-hai-xian-huo-dang`。
- Storefront `/cn/search?q=梭子蟹` 返回 200，页面包含 `真实商品结果`、`店铺 / 档口`、`相关档口`、`市场配置`、`真实类目`、`阿海鲜活档`。
- `.codex/scripts/seed-api.sh` 通过，demo seller metadata 已写入。
- API `tsc --noEmit -p packages/api/tsconfig.json` 通过。
- Storefront `bun run build` 通过；仍有项目既有 React Hook warning。
- Seller API smoke：`/store/china/sellers/a-hai-xian-huo-dang/products` 带 publishable key 返回 200，包含 `market_name`、`booth_no`、`fulfillment_methods`、`三门海鲜市场`、`市场统一配送`。
- Seller page smoke：`/cn/sellers/a-hai-xian-huo-dang` 返回 200，页面包含 `来自商家 metadata`、`配送/自提来自商家只读配置`、`A区 18号`、`市场统一配送`。
- `.codex/scripts/seed-api.sh` 通过，demo 类目已更新为中文 active 类目。
- API `tsc --noEmit -p packages/api/tsconfig.json` 通过。
- API `medusa build` 通过。
- Storefront `bun run build` 通过；仍有项目既有 React Hook warning。
- 重启 API 后，`/store/china/discovery` 返回 200，类目只包含 `鲜活蟹类`、`鲜活虾类`、`冰鲜鱼类`、`贝类净养` 四个 active demo 类目。
- Discovery 负向检查通过：旧英文类目名和上一轮临时 `xian-huo-*` / `bing-xian-*` / `bei-lei-*` handles 不再出现在返回类目里。
- Storefront `/cn` 返回 200，`/cn/search?q=%E6%A2%AD%E5%AD%90%E8%9F%B9` 返回 200。
- Storefront `bun run build` 通过；仍有项目既有 React Hook warning。
- 重启 Storefront 3101 后，`/cn/cart` 返回 200；无购物车访问 `/cn/checkout` 和 `/cn/checkout?step=address` 均返回 307 到购物车，符合无 cart 提前跳转边界。
- `.codex/tasks/china-address-ui-baseline.md` UTF-8 读取正常，`git diff --check` 通过。
- 全栈验证通过：API `tsc --noEmit` + `medusa build`、Admin `lint` + `build`、Vendor `lint` + `build`、Storefront `build` 均通过。
- Storefront build 后已重启 3101，`/cn` 返回 200；四个本地服务状态均为 OK。
- `git diff --check -- docs/market-model-backend-design.md project-ledger .codex/queue.md` 通过。
- `git diff --check -- docs/admin-module-config-contract-design.md project-ledger .codex/queue.md` 通过。
- `git diff --check -- docs/vendor-fulfillment-config-design.md project-ledger .codex/queue.md` 通过。
- `git diff --check -- docs/integration-release-readiness.md project-ledger .codex/queue.md` 通过。
- `git diff --check -- docs/integration-pr-staging-index.md .codex/queue.md .codex/tasks/integration-pr-staging-index.md project-ledger` 通过。
- 核心 ledger 编码复查通过：`AGENTS.md`、`.codex/queue.md`、`project-ledger/**`、`docs/china-localization-task-list.md`、`docs/integration-release-readiness.md` 均为 UTF-8，常见 mojibake 模式未命中。
- 重启后本地服务恢复验证通过：API `http://localhost:9000/health` 返回 200，Admin `http://localhost:7000/dashboard/login` 返回 200，Admin 登录 POST 返回 200。
- `.codex/scripts/start-dev.sh` 已把 Admin/Vendor 本地后端地址切到 `http://localhost:9000`，避免 Windows 浏览器访问 `127.0.0.1:9000` 时出现 `Failed to fetch`。
- 本地测试 Admin 账号 `admin@fuyi.local` 已可登录；密码仅用于本地测试，不写入仓库文档。
- 已安装 WSL 浏览器 QA 必需系统库 `libnspr4`、`libnss3`、`libasound2t64` 和中文字体 `fonts-noto-cjk`，Playwright 截图不再出现中文方块。
- Admin 登录态视觉 QA 通过：`/dashboard/cn/operations/market-capabilities` 可进入，页面包含中国后台壳、市场配置、统一配送/自行配送和 mock/只读边界说明，未发现 `Failed to fetch`。
- `.codex/scripts/start-dev.sh` 已为 API dev server 注入本地 CORS 默认值，覆盖 Admin、Vendor、Storefront 的 `localhost` 和 `127.0.0.1` 开发源。
- `admin-market-membership-browser-qa` 登录态补测通过：`/admin/china/markets` 返回 200，市场详情页展示三门海鲜市场、阿海鲜活档、A区 18号、配送 profile 和只读边界；无保存/发布/生效按钮，无 `Failed to fetch`，无 `chinaAdmin.*` key 泄漏。
- `round34-post-admin-qa-validation` 已记录 PR #77/#78 合并后的本地验证结果。
- `preprod-dry-run-operator-pack` 已完成，预发 disposable DB dry-run 的 Go/No-Go、变量模板、日志目录、rollback 和退出标准已固化为文档。
- `round36-safe-next-execution-map` 已完成，下一阶段 Gate 1-5 和高风险串行边界已固化为文档。
- `local-preprod-sim-dry-run` 已完成：本机 WSL disposable DB `fuyi_market_membership_dry_run_preprod_sim_20260507130339` 上 migration up/down、fixture、约束拒绝、rollback 和无残留复查均通过。
- `payment-notification-idempotency-plan` 已完成：以 docs-only 方式固化中国本地支付通知验签、幂等、重试、审计和后续 PR 拆分；未接真实支付 Provider，未修改交易链路。
- `payment-notification-contract-docs` 已完成：以 docs-only 方式固化支付通知 normalized envelope、event type、signature result、idempotency key、raw payload 安全和 return/notify URL 边界。
- `mock-payment-notification-skeleton-plan` 已完成：以 docs-only 方式规划未注册 mock skeleton 的文件边界、fake signature、fake payload、幂等 key 和单元测试清单。
- `mock-payment-notification-skeleton` 已完成：新增未注册 mock-only skeleton 和单元测试，不接 runtime，不改变 checkout、order、payment、refund、settlement、commission 或 permission。
- `payment-notification-inbox-model-design` 已完成：以 docs-only 方式设计 inbox / event log、唯一约束、状态流转、dry-run 和后续 PR 拆分。
- `payment-notification-inbox-local-dry-run` 已完成：本地 disposable DB `fuyi_payment_notification_inbox_dry_run_20260507133751` 验证 inbox/event log up/down、约束和 rollback 通过，临时库已删除并复查无残留。
- `payment-notification-inbox-migration-skeleton` 已完成：新增未注册 migration skeleton，不修改 `medusa-config.ts`，不接 runtime；本地 dry-run 脚本再次通过，临时库 `fuyi_payment_notification_inbox_dry_run_20260507134145` 已删除并复查无残留。
- `payment-inbox-dry-run-from-skeleton` 已完成：dry-run 脚本已改为从未注册 migration skeleton 提取 up/down SQL；本地 disposable DB `fuyi_payment_notification_inbox_dry_run_20260507134820` 验证通过，临时库已删除并复查无残留。
- `payment-notification-idempotency-harness` 已完成：本地 harness 验证通过，串联 mock 单测、inbox dry-run、未注册检查和 staged 禁止范围检查；临时库 `fuyi_payment_notification_inbox_dry_run_20260507135217` 已删除并复查无残留。
- `payment-notification-edge-case-tests` 已完成：补齐 missing signature、malformed JSON、non-CNY payload 和 weak idempotency source 单测；mock payment notification 单测 10/10 通过。
- `payment-notification-inbox-repository` 已完成：新增未注册 in-memory repository 和单元测试，不连接数据库，不改变交易状态；payment notification 单测 14/14 通过，API typecheck 通过。
- `payment-notification-post-merge-validation` 已完成：harness 通过、API typecheck 通过、runtime grep 无注册、临时库 `fuyi_payment_notification_inbox_dry_run_20260507140449` 已删除并复查无残留。
- `payment-notification-state-guard-plan` 已完成：docs-only 规划状态机守卫，明确 guard 不直接写 payment/order，前端 return URL 不写成功状态。
- `payment-notification-state-guard-contract` 已完成：新增纯函数 guard contract 和单元测试，不调用 payment workflow，不改变交易状态；payment notification 单测 21/21 通过，API typecheck 通过。
- `payment-notification-harness-full-tests` 已完成：idempotency harness 现在运行 payment notification 全量单测集合；验证 21/21 通过，临时库 `fuyi_payment_notification_inbox_dry_run_20260507141523` 已删除并复查无残留。
- `payment-workflow-command-adapter-plan` 已完成：docs-only 规划 workflow command adapter DTO 和映射，不实现 adapter，不调用 payment workflow。
- `payment-workflow-command-contract` 已完成：新增纯函数 command mapper，不调用 payment workflow，不改变交易状态；payment notification 单测 25/25 通过，API typecheck 通过。
- `payment-harness-command-mapper` 已完成：idempotency harness 已覆盖 command mapper 单测；验证 25/25 通过，临时库 `fuyi_payment_notification_inbox_dry_run_20260507142712` 已删除并复查无残留。
- `payment-notification-round55-validation` 已完成：harness 25/25、API typecheck、runtime grep 无注册、临时库 `fuyi_payment_notification_inbox_dry_run_20260507142917` 已删除并复查无残留。
- `payment-notification-event-log-actions-plan` 已完成：docs-only 规划 event log action 白名单扩展，不改 migration，不接 runtime。
- `payment-event-log-actions-migration-skeleton` 已完成：未注册 migration skeleton 和本地 dry-run 已覆盖 command/workflow/manual-review audit action，不接 runtime，不改变交易状态。
- `payment-command-mapper-audit-tests` 已完成：新增 command decision -> event log audit action 纯函数，不写 DB，不调用 payment workflow。
- `payment-command-audit-post-merge-validation` 已完成：harness 31/31、API typecheck、runtime grep 无注册、dry-run 临时库无残留。
- `payment-runtime-disabled-plan` 已完成：docs-only 规划 runtime 默认关闭、mock-only webhook 门禁、workflow 执行前置条件和回滚策略。
- `mock-payment-webhook-inbox-route-plan` 已完成：docs-only 规划 mock webhook inbox-only route，不新增 API route，不接 runtime。
- `payment-inbox-repository-db-contract-plan` 已完成：docs-only 规划 DB repository 合同，不写实现，不连接数据库。
- `payment-inbox-repository-interface` 已完成：新增 repository contract 和 error classifier，不写 DB adapter，不接 webhook route。
- `payment-runtime-disabled-config-skeleton` 已完成：新增 runtime config parser 纯函数，默认 disabled，只允许 mock modes，不接 runtime。
- `payment-notification-skeleton-stage-validation` 已完成：harness 41/41、API typecheck、runtime grep 无注册、dry-run 临时库无残留。
- `payment-inbox-repository-db-adapter-skeleton-plan` 已完成：docs-only 规划 DB adapter skeleton，不写实现，不连接数据库。
- `payment-inbox-repository-db-adapter-skeleton` 已完成：新增注入式 DB adapter skeleton 和 mocked transaction 单测，不创建数据库连接，不接 webhook route。
- `payment-db-adapter-post-merge-validation` 已完成：harness 46/46、API typecheck、runtime grep 无注册、dry-run 临时库无残留。
- `payment-inbox-repository-disposable-db-test-plan` 已完成：docs-only 规划本地 disposable DB integration test，不连接数据库，不写测试。
- `payment-inbox-repository-disposable-db-test-script` 已完成：新增本地 disposable DB 验证脚本，不连接预发/生产，不新增 webhook route。
- `payment-repository-disposable-db-script-validation` 已完成：repository disposable DB script 3/6 row count 验证通过，harness 46/46，无残留，runtime grep 无注册。
- `mock-webhook-inbox-only-route-readiness` 已完成：docs-only 记录 route 前置条件和仍未满足项，不新增 API route。
- `mock-webhook-route-response-contract` 已完成：新增 response mapper 纯函数和单元测试，不新增 API route，不接 runtime。
- `mock-webhook-route-request-contract` 已完成：新增 request mapper 纯函数和单元测试，把 raw body/header/secret 规整为 normalizer input；harness 57/57、API typecheck、runtime grep 和 disposable DB 无残留复查均通过。
- `mock-webhook-request-post-merge-validation` 已完成：记录 PR #120 合并后的 harness、typecheck、runtime grep 和 disposable DB 无残留验证。
- `mock-webhook-handler-composition-plan` 已完成：docs-only 规划未来 handler 组合顺序，不新增 handler、route、runtime、DB 连接或 workflow 调用。
- `mock-webhook-handler-composition-harness-plan` 已完成：docs-only 规划纯函数 composition harness，不新增 handler、route、runtime、DB 连接或 workflow 调用。
- `mock-webhook-composition-helper` 已完成：新增未注册纯函数 composition helper 和单测；harness 65/65、API typecheck、runtime grep 和 DB 残留复查均通过。
- `mock-webhook-composition-error-tests` 已完成：补齐 repository receive/appendEvent 错误映射和单测；harness 69/69、API typecheck 通过。
- `mock-webhook-composition-post-validation` 已完成：记录 PR #124/#125 合并后的 harness、typecheck、runtime grep 和 DB 无残留验证。
- `mock-webhook-handler-skeleton-plan` 已完成：docs-only 规划未注册 handler skeleton 边界，不新增 route 或 runtime。
- `mock-webhook-handler-skeleton` 已完成：新增未注册 handler skeleton 和单测；harness 73/73、API typecheck、runtime grep 和 DB 无残留复查通过。
- `mock-webhook-handler-post-validation` 已完成：记录 PR #128 合并后的 harness、typecheck、runtime grep 和 DB 无残留验证。
- `mock-webhook-local-route-disabled-plan` 已完成：docs-only 规划未来默认关闭 route 接入条件，不新增 route。
- `mock-webhook-local-route-disabled-skeleton` 已完成：新增默认 disabled Admin route skeleton；harness 75/75、API typecheck 和 DB 无残留复查通过。
- `mock-webhook-disabled-route-post-validation` 已完成：记录 PR #131 合并后验证；runtime 入口检查只命中新 disabled route。
- `mock-webhook-local-route-inmemory-plan` 已完成：docs-only 规划 local-only in-memory smoke，不接 DB 或 workflow。
- `mock-webhook-local-route-inmemory-skeleton` 已完成：Admin route 增加 local-only in-memory 分支；harness 78/78、API typecheck 和 DB 无残留复查通过。
- `mock-webhook-inmemory-route-post-validation` 已完成：记录 PR #134 合并后验证；runtime 正式入口仍只有 Admin mock webhook route。
- `mock-webhook-local-route-smoke-script-plan` 已完成：docs-only 规划本地 route smoke 脚本，不新增脚本。
- `mock-webhook-route-auth-boundary-review` 已完成：docs-only 记录 Admin route 不适合作为真实 provider callback 的路径风险。
- `mock-webhook-route-path-migration-plan` 已完成：docs-only 规划 neutral provider callback route 路径和后续 PR 拆分，不新增 route 或 runtime。
- `mock-webhook-neutral-route-disabled-skeleton` 已完成：新增 neutral mock webhook route disabled skeleton，不读取 body，不调用 handler，不连接 DB 或 workflow。
- `mock-webhook-neutral-route-disabled-post-validation` 已完成：记录 PR #139 合并后 harness 80/80、API typecheck、runtime 入口检查和 DB 无残留验证。
- `mock-webhook-neutral-route-inmemory-plan` 已完成：docs-only 规划 neutral route local-only in-memory 分支，不修改 runtime。
- `mock-webhook-neutral-route-inmemory-skeleton` 已完成：neutral route 新增 local-only in-memory 分支，默认/prod disabled，不连接 DB 或 workflow。
- `mock-webhook-neutral-route-inmemory-post-validation` 已完成：记录 PR #142 合并后 harness 83/83、API typecheck、runtime 入口检查和 DB 无残留验证。
- `mock-webhook-neutral-route-smoke-script-plan` 已完成：docs-only 规划 neutral route 本地 smoke 脚本，不新增脚本。
- `mock-webhook-neutral-route-smoke-script` 已完成：新增本地 neutral route smoke 脚本，支持 auto/disabled/local-inmemory/production-disabled 模式。
- `mock-webhook-neutral-route-smoke-validation` 已完成：记录 PR #145 合并后 disabled smoke、harness 83/83 和 DB 无残留验证。
- `mock-webhook-neutral-local-inmemory-devserver-plan` 已完成：docs-only 规划临时 dev server 运行 local-inmemory smoke，不新增脚本。
- `mock-webhook-neutral-local-inmemory-devserver-script` 已完成：新增临时 API dev server smoke wrapper，不修改现有服务或 `.env`；neutral route 已补齐框架已解析 JSON body 读取兜底。
- `mock-webhook-neutral-local-inmemory-smoke-validation` 已完成：记录 PR #148 合并后 local-inmemory smoke、harness 84/84、9100 端口清理和 DB 无残留验证。
- `mock-webhook-admin-route-deprecation-plan` 已完成：docs-only 规划旧 Admin mock route 降级为 disabled-only，neutral route 作为唯一 mock provider callback 演进路径。
- `mock-webhook-admin-route-disabled-only` 已完成：旧 Admin mock webhook route 降级为 disabled-only，不再读取 body、不处理 signature、不构造 in-memory repository、不调用 handler；neutral route 继续作为唯一 mock provider callback 演进路径。
- `mock-webhook-admin-route-disabled-validation` 已完成：记录 PR #151 合并后 harness 83/83、API typecheck、runtime grep 和 disposable DB 无残留验证。
- `mock-webhook-db-backed-route-plan` 已完成：docs-only 规划 neutral mock webhook route 接 DB-backed inbox skeleton 的分层、feature flag、repository resolver、测试清单和 PR 拆分。
- `mock-webhook-db-backed-route-resolver-plan` 已完成：docs-only 规划 route-level repository resolver contract、disabled fallback、local disposable injection 和后续 resolver contract PR。
- `mock-webhook-db-backed-route-resolver-contract` 已完成：新增 resolver 纯 helper 和 mocked tests，并纳入 payment notification harness；不接 route、不连接 DB、不调用 workflow。
- `mock-webhook-db-backed-route-local-script-plan` 已完成：docs-only 规划 neutral route local disposable DB smoke wrapper，不新增脚本、不改 route。
- `mock-webhook-db-backed-route-local-script` 已完成：新增 local disposable DB preflight smoke wrapper，验证 migration up/down、临时 API disabled route 和无残留；不改 route runtime。
- `mock-webhook-db-backed-route-skeleton` 已完成：neutral route 增加 local DB resolver skeleton；repository unavailable 时仍 disabled、不读 body、不写库、不调用 workflow。
- `mock-webhook-db-backed-route-transaction-plan` 已完成：docs-only 规划 route-level transaction client injection、local-only DB adapter、accepted/duplicate smoke 和后续串行 PR。
- `mock-webhook-db-client-contract-plan` 已完成：docs-only 规划 local disposable Postgres adapter contract、SQL 映射、错误映射和 mocked tests；仍不接 route。
- `mock-webhook-db-client-contract` 已完成：新增 local disposable Postgres adapter skeleton 和 mocked unit tests；不接 route、不连接真实 DB、不调用 workflow。
- `mock-webhook-db-client-contract-validation` 已完成：记录 PR #161 合并后的 harness 16/105、API typecheck、runtime grep 和 DB/端口无残留验证。
- `mock-webhook-db-backed-route-local-accepted-plan` 已完成：docs-only 规划 neutral route 接 local adapter 的 accepted/duplicate/rejected smoke；仍不执行 workflow。
- `mock-webhook-db-backed-route-local-accepted` 已完成：neutral route 接入 local-only disposable Postgres adapter，accepted/duplicate smoke 通过；仍不执行 workflow、不改变交易状态。
- 子 AG 复核后已补强：event log id 使用短前缀 + hash、smoke 固定 9110、dry-run DB 名使用严格白名单、临时 payload 目录纳入 cleanup。
- `mock-webhook-db-backed-route-local-rejected-smoke` 已完成：missing signature、invalid signature、non-CNY local DB rejected smoke 均通过，拒绝路径不写 inbox/event log；non-CNY 当前按既有 contract 返回 `PAYLOAD_INVALID`。
- `mock-webhook-db-backed-route-post-validation` 已完成：PR #164/#165 合并后 harness、accepted/duplicate/rejected smoke、typecheck、runtime grep 和 DB/9110 无残留均通过。
- `mock-webhook-db-backed-route-runtime-gate-plan` 已完成：docs-only 规划 runtime gate Go/No-Go、feature flags、回滚和 PR 拆分；仍不执行 workflow。
- `payment-notification-runtime-gate-contract` 已完成：新增 runtime gate 纯函数和单测；默认 blocked，不接 route、不执行 workflow。
- `payment-notification-db-runtime-preflight` 已完成：docs-only 规划 local/preprod disposable DB preflight、migration readiness 和 No-Go 条件。
- `payment-notification-preprod-disposable-db-checklist` 已完成：docs-only 准备外部 disposable preprod DB Go/No-Go 和执行清单；未连接数据库。
- `payment-notification-preprod-disposable-db-script-plan` 已完成：docs-only 规划未来脚本参数、安全检查、输出格式和失败处理；未新增脚本。
- `payment-notification-preprod-disposable-db-script` 已完成：新增默认不连接外部 DB 的脚本 skeleton，只支持计划输出和输入校验。
- `payment-preprod-db-script-post-validation` 已完成：记录 PR #171/#172 合并后验证，确认脚本仍不连接外部 DB。
- `payment-provider-adapter-contract-plan` 已完成：docs-only 规划 Provider / Adapter 合同、notify/return URL 边界和后续 mock/支付宝/微信支付拆分。
- `mock-china-payment-provider-contract` 已完成：新增未注册 mock provider contract 和单元测试，不接 checkout runtime。
- `mock-payment-provider-registry-contract` 已完成：新增 provider registry 纯函数 contract，默认 disabled，production blocked，并要求显式非生产 `nodeEnv`。
- `mock-payment-provider-registry-validation` 已完成：记录 harness 19/128、typecheck、runtime grep 未注册和 DB 无残留。
- `mock-provider-runtime-gate-validation-plan` 已完成：docs-only 规划 provider / registry / runtime gate / preprod DB gate 组合验证。
- `mock-provider-runtime-gate-composition-tests` 已完成：新增 registry + runtime gate 纯函数组合测试。
- `mock-provider-runtime-readiness-report` 已完成：记录 harness 20/133、typecheck、runtime grep 未注册和 DB 无残留。
- `mock-provider-runtime-readiness-checklist` 已完成：docs-only 整理 mock provider runtime 前 Go / No-Go 清单。
- `mock-provider-runtime-design` 已完成：docs-only 设计 mock provider runtime wiring 和安全边界。
- `mock-provider-runtime-disabled-skeleton-plan` 已完成：docs-only 规划 disabled route skeleton 和测试清单。
- `mock-provider-runtime-disabled-skeleton` 已完成：新增 disabled route skeleton 和单测，不读 body、不接 DB、不执行 workflow。
- `mock-provider-runtime-disabled-validation` 已完成：记录 harness 21/137、typecheck、runtime grep 未注册和 DB 无残留。
- `mock-provider-runtime-local-inbox-only-plan` 已完成：docs-only 规划 local disposable DB inbox-only runtime。
- `mock-provider-runtime-local-inbox-only-skeleton` 已完成：mock provider route 在严格本地 disposable DB gate 下可写 inbox/event log，默认/生产/缺门禁仍 disabled，不读 body，不执行 payment workflow。
- `mock-provider-runtime-local-inbox-only-validation` 已完成：记录 PR #187 合并后 harness、API typecheck、runtime grep 和 DB 无残留验证。
- `mock-provider-runtime-local-smoke-script-plan` 已完成：docs-only 规划 provider route local disposable DB smoke wrapper。
- `mock-provider-runtime-local-smoke-script` 已完成：新增 provider route local disposable DB smoke wrapper，不连接预发/生产，不执行 payment workflow。
- `mock-provider-runtime-local-smoke-script` 补强：临时 API 的 `CODEX_DATABASE_URL` 现在所有模式都指向 disposable DB；普通 app DB 只作为 schema-only 来源。
- `mock-provider-runtime-local-smoke-script` 补强：失败输出不再打印 raw event metadata 或临时 API log 内容；stop 逻辑记录监听 PID 并只清理本脚本启动的临时进程。
- `mock-provider-runtime-local-smoke-validation` 已完成：PR #190 合并后四种 smoke、harness、API typecheck、未注册 grep 和 DB/9120 无残留验证通过。
- `mock-provider-runtime-preprod-smoke-plan` 已完成：只规划 disposable preprod DB smoke 的门禁、禁止输入、执行阶段和后续拆分，不连接外部数据库。
- `mock-provider-runtime-preprod-smoke-script` 已完成：新增默认不连接外部 DB 的 skeleton，只支持 print-plan / validate-inputs-only。
- `mock-provider-runtime-preprod-smoke-script-validation` 已完成：PR #193 合并后 print-plan、安全示例 validate-only、forbidden arg 拒绝和 diff check 通过。
- `blocked-external-boundary-rollup` 已完成：记录支付 provider runtime 外部 DB 阻塞边界和下一批安全方向。
- `china-platform-non-payment-backlog` 已完成：整理非支付方向下一批低风险 docs-only PR 队列。
- `market-domain-readiness-review` 已完成：确认市场域已有 read-only 基础，但真实运营模型、商户档口关系、配送 profile、公告营业时间和上游供应关系仍待合同化。
- `market-domain-contract-docs` 已完成：定义真实市场域实体、关系、角色、配送 profile 和高风险边界。
- `market-domain-read-model-contract` 已完成：新增市场域只读合同 view shape 和 focused unit tests。
- `market-domain-read-model-contract-validation` 已完成：PR #199 合并后 focused unit test、API typecheck 和 diff check 通过。
- `merchant-role-capability-readiness` 已完成：整理普通商户、物料供应商、配送供应商、养殖户/种植户、种苗供应商和外地批发商角色矩阵。
- `merchant-role-capability-contract` 已完成：新增商户角色能力只读 TypeScript contract，明确可见性、能力和高风险串行边界。
- `vendor-mobile-draft-product-readiness` 已完成：梳理手机快速上架、规格模板、AI suggestion、审核候选和真实商品创建分离边界。
- `vendor-mobile-draft-product-contract` 已完成：新增手机快速上架草稿只读 TypeScript contract，明确字段、阶段和高风险阻塞项。
- `shop-decoration-readonly-plan` 已完成：规划商家主页装修只读模型和 Storefront/Vendor/Admin 三端展示边界。
- `shop-decoration-readonly-contract` 已完成：新增商家主页装修只读 TypeScript contract，明确模块和高风险阻塞边界。
- `logistics-and-waybill-boundary-plan` 已完成：规划统一配送、自配送、自提、配送供应商和快递面单打印边界。
- `logistics-and-waybill-readonly-contract` 已完成：新增物流/面单只读 TypeScript contract，明确 checkout、履约、面单和云打印阻塞边界。
- `pickup-card-consumer-flow-plan` 已完成：重梳消费者持卡提货流程，明确不是优惠券、支付方式或储值卡。
- `pickup-card-consumer-flow-contract` 已完成：新增消费者提货流程只读 TypeScript contract，明确不创建 payment/order 且不影响 cart total。
- `live-commerce-readonly-plan` 已完成：规划直播只读状态、店铺展示、Provider 和高风险边界。
- `live-commerce-readonly-contract` 已完成：新增直播只读 TypeScript contract，明确店铺展示位置和真实直播/IM/交易阻塞边界。
- `non-payment-readonly-contracts-validation` 已完成：6 组 focused tests、API typecheck 和 diff check 通过。
- `readonly-contracts-export-index` 已完成：建立非支付只读 contracts 三端可读范围和禁止误用索引。
- `admin-readonly-contracts-panel-plan` 已完成：规划 Admin 平台能力只读总览面板和 UI PR 边界。
- `vendor-readonly-contracts-panel-plan` 已完成：规划 Vendor 我的能力边界只读面板和 UI PR 边界。
- `storefront-readonly-contracts-visibility-plan` 已完成：规划消费者侧只读 contract 可见性、隐藏规则和 UI PR 边界。
- `readonly-contracts-ui-planning-validation` 已完成：三端只读合同 UI 规划收口，下一轮可进入 UI PR。
- `admin-readonly-contracts-panel-ui` 已完成：Admin 新增 `/dashboard/cn/operations/capability-contracts` 能力合同总览只读页面；未新增后端 route，未改变交易链路或权限。
- `vendor-readonly-contracts-panel-ui` 已完成：Vendor 新增“我的能力边界”只读面板和导航项；未新增后端 route，未提供发布、发货、打印、兑换、开播、结算或权限动作。
- `storefront-visibility-copy-polish` 已完成：消费者侧搜索页、店铺页和提货卡页文案已改为更适合消费者理解的展示/演示口径；未修改 checkout 或交易链路。
- `readonly-contracts-ui-validation` 已完成：Admin lint/build、Vendor lint/build、Storefront build 和 `git diff --check` 通过；Storefront 仅保留既有 React Hook warning。
- 第九十五轮队列已清空。
- `ui-template-system-plan` 已完成：规划三端模板系统，明确界面可模板化替换，但数据合同、交易链路和高风险边界保持稳定。
- `storefront-template-contract-plan` 已完成：规划消费者端首页、搜索、店铺、商品、提货卡和移动端模板合同，不改页面。
- `admin-template-contract-plan` 已完成：规划平台运营后台首页、菜单、市场、商户、商品、提货卡、营销、客服、直播、风控和系统配置模板合同，不改页面。
- `vendor-template-contract-plan` 已完成：规划商户后台角色化模板、手机快速上架、AI 草稿、店铺装修、物料供应商、配送供应商和上游供给模板合同，不改页面。
- `template-registry-readonly-contract` 已完成：新增纯 TypeScript 三端模板注册表只读合同和 focused unit tests；不接 route、不接 DB、不注册 runtime。
- `template-system-validation` 已完成：Template registry focused unit test、API typecheck、Admin lint、Vendor lint 和 `git diff --check` 通过。
- 第九十六轮队列已清空。
- `template-preview-backlog` 已完成：规划第九十七轮模板预览 backlog 和实现门槛，不改页面或 runtime。
- `storefront-home-template-v2-plan` 已完成：规划消费者首页 v2 模板预览，明确市场/店铺/今日鲜货主路径、移动端 App-like 布局和隐藏 B 端能力。
- `storefront-shop-template-v2-plan` 已完成：规划店铺/档口主页 v2 模板预览，明确配送方式属于店铺/档口能力，商品卡只做轻提示。
- `admin-dashboard-template-v2-plan` 已完成：规划平台运营首页 v2 模板预览，明确顶部工具靠右、首屏密度、KPI/待办/风险和 mock 数据边界。
- `vendor-role-workspace-template-v2-plan` 已完成：规划商户角色工作台 v2 模板预览，明确普通商户、物料供应商、配送供应商和上游供给的工作台边界。
- `template-preview-validation` 已完成：Template registry focused unit test 和 `git diff --check` 通过，第九十七轮规划均为 docs-only。
- 第九十七轮队列已清空。
- `storefront-home-template-v2` 已完成：消费者首页 v2 第一版已落地，主路径收口为市场、档口、今日鲜货；桌面/移动截图、Storefront build/lint、HTTP smoke 和 diff check 通过。
- `storefront-shop-template-v2` 已完成：店铺 / 档口页 v2 第一版已把配送、自提、营业时间和公告放回店铺能力语境，去掉消费者页面上的工程化说明。
- `admin-dashboard-template-v2` 已完成：Admin 平台运营首页 v2 第一版已收紧 KPI，新增数据来源条和近期重点模块，保持只读展示。
- `vendor-role-workspace-template-v2` 已完成：Vendor 首页新增角色工作台模板 v2 只读预览，区分普通商户、果蔬商户、物料供应商、配送供应商、上游供给、种苗供应商和外地批发商。
- `template-preview-v2-validation` 已完成：四个 template v2 surface 合并后验证结果、风险和下一轮方向已记录。
- `template-registry-surface-binding-plan` 已完成：规划三端从 template registry v2 / stable view model 读取模板的职责边界和 PR 顺序。
- `storefront-template-data-source-plan` 已完成：规划 Storefront 首页、搜索和店铺页从静态展示数据迁到 home/search/shop view model mapper 与只读 API。
- 第九十九轮可自动执行 docs-only 队列已清空；`vendor-role-workspace-visual-qa` 仍为 `blocked-manual`。
- `template-registry-v2-contract` 已完成：四个 v2 template ids 已纳入未注册只读 registry contract，仍不接 route、不接 DB、不改页面。
- 第一百轮进度：`template-registry-v2-contract`、`storefront-home-view-model-mapper`、`storefront-shop-view-model-mapper` 和 `template-registry-v2-validation` 均已完成；第一百轮 contract / mapper 队列清空。
- 第一百零一轮进度：`storefront-search-view-model-mapper` 已完成；下一项建议为 `storefront-home-bind-view-model-plan`，先 docs-only 规划页面绑定。
- 第一百零一轮进度：`storefront-home-bind-view-model-plan` 已完成；下一项建议为 `storefront-shop-bind-view-model-plan`，先 docs-only 规划店铺页绑定。
- 第一百零一轮进度：`storefront-shop-bind-view-model-plan` 已完成；第一百零一轮队列清空，下一步建议进入 template binding validation 或 adapter plan。
- 第一百零二轮进度：`storefront-template-binding-validation` 已完成；下一项建议为 `storefront-home-view-model-adapter-plan`。
- 第一百零二轮进度：`storefront-home-view-model-adapter-plan` 已完成；下一项建议为 `storefront-shop-view-model-adapter-plan`。
- 第一百零二轮进度：`storefront-shop-view-model-adapter-plan` 已完成；第一百零二轮队列清空，下一步建议进入 adapter plan validation。
- 第一百零三轮进度：`storefront-adapter-plan-validation` 已完成；下一项建议为 `storefront-search-view-model-adapter-plan`。
- 第一百零三轮进度：`storefront-home-view-model-adapter-skeleton` 已完成；页面尚未绑定，下一项建议补 `storefront-search-view-model-adapter-plan` 或实现 shop adapter skeleton。
- 第一百零三轮进度：`storefront-search-view-model-adapter-plan` 已完成；下一项建议为 `storefront-shop-view-model-adapter-skeleton` 或 adapter skeleton validation。
- 第一百零三轮进度：`storefront-adapter-skeleton-validation` 已完成；下一项建议为 `storefront-shop-view-model-adapter-skeleton`。
- 第一百零三轮进度：`storefront-shop-view-model-adapter-skeleton` 已完成；页面尚未绑定，下一项建议为 search adapter skeleton 或 adapter skeleton validation。
- 第一百零三轮进度：`storefront-search-view-model-adapter-skeleton` 已完成；home / shop / search 三个 Storefront 本地 adapter skeleton 已齐，下一项建议做 adapter skeleton validation v2。
- 第一百零四轮进度：`storefront-adapter-skeleton-validation-v2` 已完成；下一项建议先做 `storefront-adapter-binding-sequence-plan`，再进入只读页面绑定。
- 第一百零五轮进度：`storefront-adapter-binding-sequence-plan` 已完成；下一项建议做 `storefront-home-adapter-binding-readonly`，只绑定首页首屏市场 / 类目 / 店铺数据。
- 第一百零五轮进度：`storefront-home-adapter-binding-readonly` 已完成；下一项建议做 `storefront-shop-header-adapter-binding-readonly`。
- 第一百零五轮进度：`storefront-shop-header-adapter-binding-readonly` 已完成；下一项建议做 `storefront-search-adapter-binding-readonly`。
- 第一百零五轮进度：`storefront-search-adapter-binding-readonly` 已完成；下一项建议做 `storefront-home-product-cards-binding-readonly`。
- 第一百零五轮进度：`storefront-home-product-cards-binding-readonly` 已完成；下一项建议做 `storefront-shop-product-cards-binding-readonly`。
- 第一百零五轮进度：`storefront-shop-product-cards-binding-readonly` 已完成；Storefront adapter 页面绑定队列已清空，下一项建议做绑定验证收口。
- `mock-provider-runtime-preprod-smoke-execution` 仍为 `blocked-external`。
- `payment-notification-preprod-disposable-db-execution` 仍为 `blocked-external`。

## 仍需注意

- Storefront 首页、市场频道仍主要是静态展示壳，不是完整真实店铺 API。
- Storefront 商家页已通过只读 seller product ids API 做当前档口过滤。
- 本地 seed 现在会覆盖示例商品标题、描述、图片和 CNY 价格；上线前仍要换成真实后台商品数据，不应把 seed 当生产商品来源。
- Vendor 已读取 `/store/china/vendor-capabilities` 的只读 capability view，但它仍不是权限控制；真实菜单显隐和商户类型生效规则还没有接入。
- Admin 模块开关页已读取 `/admin/china/capabilities` 的只读 capability view，但它仍不是权限控制；真实开关存储、审计和生效规则还没有实现。
- Storefront 搜索页已能展示真实商品，并已接只读发现 API；市场仍是配置契约，不是数据库市场模型。
- Storefront discovery API 不做搜索排序、距离、库存聚合或真实市场运营配置；这些要等后续真实模型。
- Demo 类目仍只是 seed 数据；上线后应由后台真实类目维护，不把 seed 当生产类目来源。
- 地址 UI 本轮只调整展示顺序和校验错误绑定，不改变 `setAddresses`、cart、order、payment、shipping option 或真实地址模型。
- 商家页履约信息现在只是只读展示，不会影响 checkout shipping options、真实运费、发货、物流或订单状态。
- Admin/Vendor 仍是中国本地化 UI 基础版，不能当作真实审核、结算、配送、提货卡、直播或供应商系统。
- 支付、退款、结算、佣金、权限逻辑仍未做真实中国化改造，后续必须串行高风险任务处理。
- 当前工作区仍有大量未跟踪的历史任务文档和视觉 QA 产物，提交时必须按 PR 范围精确 stage。
- 仍有其他未跟踪 `.codex/tasks/*.md` 可能存在编码或是否纳入版本库的问题，后续需要按任务逐个整理，避免一次性混入。
- 市场模型当前仍是设计文档；真实模块、migration、Admin 写接口、商户角色生效和配送规则影响 checkout 都必须后续串行拆 PR。
- Admin 模块开关当前仍是设计文档 + 只读 contract；真实配置落库、draft 写接口、菜单生效、权限生效和高风险业务生效必须分阶段拆 PR。
- Vendor 履约配置当前仍是设计文档；任何影响 checkout shipping options、cart total、订单履约、物流状态或快递打印的实现都必须单独串行任务。
- 当前 integration 范围很大，不能作为一个大 PR 直接合并；必须按 `docs/integration-release-readiness.md` 拆 PR。
- 队列已到拆 PR / staging 准备边界；真实支付、退款、结算、佣金、权限、配送生效和模块开关生效都不能在当前低风险队列里继续混改。
- 后续 staging 时仍必须精确 stage；第十一轮索引只解决“怎么拆”，不代表自动纳入所有未跟踪文档。
- Codex in-app Browser Use 当前仍受系统级 `拒绝访问` 限制；本轮采用本地 Playwright 兜底生成登录态截图。
- `preprod-disposable-db-dry-run-execution` 仍是 `blocked-external`，不能自动连接预发或生产 DB。
- 没有 disposable preprod DB 前，自动队列只能继续 docs-only 计划或本地 disposable rehearsal，不得进入真实 migration、Admin 写接口或 runtime switch。
- 本地模拟不等于真实预发 dry-run；真实 `preprod-disposable-db-dry-run-execution` 仍需外部 disposable preprod DB、备份和回滚确认。
- 支付通知计划仍只是文档；Mock PaymentProvider runtime、真实支付宝、微信支付、退款、对账、商家结算、佣金和权限必须继续单独串行处理。
- 当前 mock payment notification skeleton 只用于测试和后续 adapter 评审；它没有注册 provider，也没有 inbox/model、runtime switch 或支付状态推进能力。
- 支付通知 inbox 目前仍是设计文档；没有 migration、repository、runtime、状态推进或真实 Provider 接入。
- 支付通知 inbox migration 目前只是 skeleton；尚未注册为生产 migration，不能直接用于预发或生产。

## Round 234 更新

- `storefront-home-product-discovery-source-binding`: done，首页“今日鲜货 / 首页商品展示字段”优先读取商品发现只读 client 的真实 `store_product_table` 结果，空结果回退静态鲜货。
- 本轮不修改 `ProductCard`、搜索页、店铺页、`packages/api/**`、cart、checkout、订单、支付、退款、结算、佣金、打款、权限、履约、物流或真实 Provider。
- 验证通过：Storefront build、`git diff --check`、子智能体只读复核；Storefront build 仅保留既有 React Hook dependency warnings。

## Round 235 更新

- `storefront-search-product-discovery-source-binding`: done，搜索页“相关鲜货展示 / 市场样例”优先读取商品发现只读 client 的真实 `store_product_table` 且带 seller handle 的结果，空结果回退静态 `productResults`。
- 真实可加购商品继续走 Store API / `ProductCard`，本轮不修改首页、店铺页、`packages/api/**`、cart、checkout、订单、支付、退款、结算、佣金、打款、权限、履约、物流或真实 Provider。
- 验证通过：Storefront build、`git diff --check`、子智能体只读复核；Storefront build 仅保留既有 React Hook dependency warnings。

## Round 236 更新

- `storefront-shop-product-discovery-source-binding`: done，店铺页“档口今日参考 / 常卖鲜货”优先读取商品发现只读 client 的当前 seller handle `store_product_table` 结果，空结果回退静态 `shop.products`。
- 真实可加购商品继续走 seller product ids + Store API / `ProductCard`，本轮不修改首页、搜索页、`packages/api/**`、cart、checkout、订单、支付、退款、结算、佣金、打款、权限、履约、物流或真实 Provider。
- 验证通过：Storefront build、`git diff --check`、子智能体只读复核；Storefront build 仅保留既有 React Hook dependency warnings。

## Round 237 更新

- `storefront-product-discovery-binding-validation`: done，docs-only 汇总 PR #281-#283 的 Storefront 商品发现只读页面绑定状态。
- 首页、搜索页和店铺页均只消费商品发现展示字段；真实可加购商品继续走 Store API / `ProductCard`。
- 本轮不修改 `apps/**` 或 `packages/**`，不改变 cart、checkout、订单、支付、退款、结算、佣金、打款、权限、履约、物流或真实 Provider。
- 验证通过：Storefront build、`git diff --check`、子智能体 docs-only 只读复核；Storefront build 仅保留既有 React Hook dependency warnings。

## Round 238 更新

- `storefront-product-discovery-phase-rollup`: done，docs-only 汇总 PR #277-#284 的商品发现 read model 阶段状态。
- 当前已形成 builder -> Store API readonly route -> Storefront client -> 首页 / 搜索 / 店铺展示绑定链路。
- 下一阶段只能继续 QA runbook、observability plan 或 next-data plan；真实搜索排序、广告、竞价、推荐、库存占用、购物车、checkout、订单、支付、退款、结算、佣金、权限、履约或物流必须单独高风险串行。
- 验证通过：Storefront build、`git diff --check`、子智能体 docs-only 只读复核；Storefront build 仅保留既有 React Hook dependency warnings。

## Round 239 更新

- `storefront-product-discovery-qa-runbook`: done，docs-only 新增商品发现只读绑定人工 QA runbook。
- Runbook 覆盖首页、搜索页、店铺页的真实商品发现、fallback、无商品结果、失败判定和截图证据。
- 本轮不修改 `apps/**` 或 `packages/**`，不改变 cart、checkout、订单、支付、退款、结算、佣金、打款、权限、履约、物流或真实 Provider。
- 验证通过：Storefront build、`git diff --check`、子智能体 docs-only 只读复核；Storefront build 仅保留既有 React Hook dependency warnings。

## Round 240 更新

- `product-discovery-observability-plan`: done，docs-only 规划商品发现只读链路未来可观测字段和 debug flow。
- 计划只允许低风险聚合字段：surface、source、item count、filter keys、fallback used 和 API status。
- 不接真实日志 provider，不记录用户隐私、订单、支付、退款、结算、佣金、权限或真实 provider 凭据。
- 验证通过：Storefront build、`git diff --check`、子智能体 docs-only 只读复核；Storefront build 仅保留既有 React Hook dependency warnings。

## Round 241 更新

- `storefront-discovery-next-data-plan`: done，docs-only 规划 Storefront discovery 下一轮只读数据质量要求。
- 覆盖 market、seller membership、category 和 product discovery 的最小字段、质量要求、验收顺序和阻断工作。
- 本轮不修改 `apps/**` 或 `packages/**`，不新增 migration、API route、写接口或 runtime。
- 验证通过：Storefront build、`git diff --check`、子智能体 docs-only 只读复核；Storefront build 仅保留既有 React Hook dependency warnings。

## Round 242 更新

- `storefront-discovery-data-inventory`: done，docs-only 盘点当前 Storefront discovery 只读链路字段。
- Inventory 覆盖 market、seller membership、discovery categories 和 product discovery 的已具备字段、metadata 依赖、缺口和安全下一步。
- 本轮不修改 `apps/**` 或 `packages/**`，不新增脚本、不读写数据库、不新增 route 或 runtime。
- 验证通过：Storefront build、`git diff --check`、子智能体 docs-only 只读复核；Storefront build 仅保留既有 React Hook dependency warnings。

## Round 243 更新

- `product-discovery-source-tags`: done，商品发现只读 read model 增加非敏感 `sourceTags`。
- `sourceTags` 仅包含 response source、item count、product row count、seller context count、fallback、filter keys 和 display-only 标记。
- 本轮不接真实日志 provider，不记录用户隐私、订单、支付、退款、结算、佣金、权限或真实 provider 凭据。
- 验证通过：focused unit test、API typecheck、Storefront build、`git diff --check`、子智能体只读复核；Storefront build 仅保留既有 React Hook dependency warnings。

## Round 244 更新

- `product-discovery-source-tags-validation`: done，docs-only 汇总 PR #290 的 sourceTags 验证和隐私边界。
- 记录 focused unit test、API typecheck、Storefront build、`git diff --check` 和子智能体复核均已通过。
- 下一步 dev-only debug banner 必须单独 PR，且只能在开发环境或显式 debug flag 下显示非敏感 source tags。
- 验证通过：Storefront build、`git diff --check`、子智能体 docs-only 只读复核；Storefront build 仅保留既有 React Hook dependency warnings。

## Round 245 更新

- `storefront-discovery-status-sync`: done，docs-only 同步 PR #277-#291 的 Storefront discovery / product discovery 主线状态。
- 当前安全下一步仅限 docs-only debug banner plan、audience field plan 或后续 validation。
- 不得自动进入真实搜索排序、广告、推荐、库存占用、购物车、checkout、订单、支付、退款、结算、佣金、权限、履约、物流、真实 provider、Admin 写接口或 migration。
- 验证通过：Storefront build、`git diff --check`、子智能体 docs-only 只读复核；Storefront build 仅保留既有 React Hook dependency warnings。

## Round 246 更新

- `china-launch-high-risk-sequence-plan`: done，docs-only 建立上线高风险串行推进图。
- 覆盖 ProductCard、cart、checkout、订单、支付通知、支付 workflow、真实支付 provider、退款、对账、结算、佣金、打款、权限、履约、物流和面单。
- 当前结论：可以继续推进上线，但必须按小 PR 串行；不能把交易、资金、权限和履约 runtime 混在一个大改里。
- 本轮不修改 `apps/**` 或 `packages/**` runtime，不注册 migration，不接真实 provider，不改变 cart、checkout、订单、支付、退款、结算、佣金、权限、履约或物流状态。
- 验证要求：Storefront build、`git diff --check`、子智能体 docs-only 复核。

## Round 247 更新

- `productcard-launch-readiness-audit`: done，docs-only 审计 ProductCard 上线前事实来源。
- 当前结论：搜索页、店铺页等主购买链路的真实可加购 ProductCard 继续以 Store API / Medusa product、variant 和 calculated price 为准；product discovery 的 `priceText`、`stockText`、`sourceTags` 和 fallback 只能用于展示。
- 审计发现阻断风险：商品详情页“同档口更多鲜货”经 `prod.seller?.products -> HomeProductsCarousel` 可能把缺少 variants/calculated price 的 `Product[]` 传给 ProductCard；上线前必须回查 Store API 完整商品或降级为不可加购展示。
- 本轮不修改 `apps/**` 或 `packages/**` runtime，不改变 add-to-cart、cart、checkout、订单、支付、退款、结算、佣金、权限、履约或物流行为。
- 验证要求：ProductCard 使用点 grep、product discovery 展示字段 grep、Storefront build、`git diff --check`、子智能体复核。

## Round 248 更新

- `productdetails-related-products-store-api-guard`: done，修复商品详情页同档口更多鲜货的 ProductCard 输入边界。
- `HomeProductsCarousel` 现在只把 Store API 回查到、且带 `variants.calculated_price` 的商品传给 ProductCard；`sellerProducts` 仅作为 handle 查询条件。
- 如果回查不到完整商品，保留既有空态，不把不完整 seller product 伪装成真实可加购 ProductCard。
- 本轮不修改 ProductCard add-to-cart、cart、checkout、订单、支付、退款、结算、佣金、权限、履约或物流行为。
- 验证要求：Storefront build、`git diff --check`、子智能体复核。

## Round 249 更新

- `cart-checkout-launch-safety-audit`: done，docs-only 审计 cart / checkout 上线前安全边界。
- 当前结论：现有 Medusa Store API + Stripe / manual test payment 可作为本地 QA 基线，但中国支付 provider 不能复用前端确认后直接 `placeOrder()` 的模式。
- 阻断项已记录：Stripe 前端确认路径、manual test payment、gift card zero total、地址/手机号、配送方式和 payment notification runtime gate。
- 本轮不修改 `apps/**` 或 `packages/**` runtime，不改变 `setAddresses`、`setShippingMethod`、`initiatePaymentSession`、`placeOrder`、cart、checkout、订单、支付、退款、结算、佣金、权限、履约或物流行为。
- 验证要求：敏感调用点 grep、Storefront build、`git diff --check`、子智能体复核。

## Round 250 更新

- `payment-risk-register`: done，docs-only 建立支付、退款、对账、结算、佣金、打款和权限上线风险登记表。
- 当前结论：资金状态推进仍受 disposable preprod DB、migration rehearsal、payment notification runtime、workflow execution adapter、真实 provider sandbox 和 RBAC/ownership guard 阻塞。
- 风险登记覆盖 PAY、REF、REC、SET、COM、PAYOUT、PERM 和 LOG 风险项，并明确 Go / No-Go。
- 本轮不修改 `apps/**` 或 `packages/**` runtime，不连接外部 DB，不注册 migration，不接真实 provider，不改变订单、支付、退款、结算、佣金、权限、履约或物流状态。
- 验证要求：`git diff --check`、子智能体复核。

## Round 251 更新

- `permission-rbac-launch-matrix`: done，docs-only 建立上线前权限 / RBAC / 资源归属矩阵。
- 矩阵覆盖 Platform operator、Market operator、Seller owner/staff、Delivery supplier、Customer 和 System job。
- 明确 capability view 只能用于只读提示和入口降级，不能替代 RBAC、seller ownership、market ownership、order/payment/refund/settlement 权限。
- 本轮不修改 `apps/**` 或 `packages/**` runtime，不实现权限中间件、route guard、写接口或状态变更。
- 验证要求：`git diff --check`、子智能体复核。

## Round 252 更新

- `fulfillment-logistics-runtime-gate-plan`: done，docs-only 建立履约 / 物流 / 面单 runtime gate。
- Gate 覆盖展示层、配置合同、mock provider、checkout shipping option adapter、fulfillment creation、shipment tracking 和 waybill provider。
- 明确只读配送展示不能直接改 checkout shipping options，真实 provider 不能改支付、退款、结算、佣金或权限状态。
- 本轮不修改 `apps/**` 或 `packages/**` runtime，不创建 fulfillment/shipment/tracking/waybill，不接真实物流 provider。
- 验证要求：`git diff --check`、子智能体复核。

## Round 253 更新

- `payment-provider-production-hardening-plan`: done，docs-only 建立支付宝 / 微信支付 Provider 生产加固计划。
- 已参考官方微信支付商户文档、微信支付 API v3 官方 SDK、支付宝开放平台与签名文档。
- 计划覆盖密钥/证书、notify_url / return_url、验签、解密、幂等、sandbox、disabled-by-default、日志脱敏、回滚和发布门禁。
- 本轮不修改 `apps/**` 或 `packages/**` runtime，不接真实 provider，不写真实密钥，不注册 migration，不执行 payment workflow。
- 验证要求：`git diff --check`。

## Round 254 更新

- `payment-runtime-external-readiness-review`: done，docs-only 复核 payment runtime 外部执行 readiness。
- 当前结论：仍为 `blocked-external`；缺 disposable preprod DB host/port/user/name、备份 owner、回滚 owner、操作 owner、连接授权和可丢弃/可回滚确认。
- `.codex/scripts/payment-notification-preprod-disposable-db-smoke.sh` 当前只支持 `--print-plan` 与 `--validate-inputs-only`，不会连接外部 DB。
- 本轮不修改 `apps/**` 或 `packages/**` runtime，不连接外部 DB，不注册 migration，不接真实 provider，不执行 payment workflow。
- 验证通过：`--print-plan`、`git diff --check`。

## Round 255 更新

- `alipay-provider-sandbox-contract`: done，docs-only 定义支付宝 Provider sandbox contract。
- 合同覆盖 provider id、配置 key 名、create payment、notify normalize、verify、return_url、fake notify test matrix 和 No-Go。
- 明确支付宝 `notify_url` 才是支付状态候选入口，`return_url` 只能展示 pending；不能接 checkout、不能写真实密钥、不能执行 payment workflow。
- 本轮不修改 `apps/**` 或 `packages/**` runtime，不接支付宝 SDK，不注册 migration，不连接外部 DB。
- 验证要求：`git diff --check`。

## Round 256 更新

- `wechat-pay-provider-sandbox-contract`: done，docs-only 定义微信支付 Provider sandbox contract。
- 合同覆盖 provider id、配置 key 名、create payment、notify normalize、verify/decrypt、return_url、fake notify test matrix 和 No-Go。
- 明确微信支付支付状态候选入口只能是后端 `notify_url` 异步通知，必须验签、解密、幂等、可重试，并写入 inbox / event log。
- 本轮不修改 `apps/**` 或 `packages/**` runtime，不接微信支付 SDK，不注册 migration，不连接外部 DB，不执行 payment workflow。
- 验证要求：`git diff --check`。

## Round 257 更新

- `provider-secret-config-template`: done，docs-only 整理中国本地支付 Provider secret/config key 模板。
- 模板覆盖 shared runtime gate、支付宝、微信支付、环境矩阵、日志脱敏、轮换、回滚和 No-Go。
- 本轮不修改 `.env`、`.env.template`、`apps/**` 或 `packages/**` runtime，不写真实密钥，不接 SDK，不接 checkout，不执行 payment workflow。
- 验证要求：`git diff --check`。

## Round 258 更新

- `wechat-pay-provider-disabled-adapter-skeleton`: done，新增未注册微信支付 disabled adapter skeleton。
- Adapter 只暴露配置 key 名和 secret reference key 名，所有 create/query/close/verify/normalize 操作均返回 blocked decision。
- 本轮不注册 Medusa payment provider，不新增 API route，不修改 `packages/api/medusa-config.ts`，不接 SDK，不读真实 secret，不接 checkout，不执行 payment workflow。
- 验证要求：focused unit test、API typecheck、payment notification harness、`git diff --check`、子智能体复核。

## Round 259 更新

- `wechat-pay-provider-disabled-adapter-validation`: done，记录 PR #305 合并后的主线验证。
- 验证通过：focused WeChat unit test 5/5、API typecheck、payment notification harness 22 suites / 148 tests、disposable DB dry-run、runtime registration grep、`git diff --check`。
- 当前 WeChat Pay adapter 仍未注册、不接 route、不接 checkout、不接 SDK、不读真实 secret、不执行 payment workflow。

## Round 260 更新

- `alipay-provider-disabled-adapter-skeleton`: done，新增未注册支付宝 disabled adapter skeleton。
- Adapter 只暴露配置 key 名和 secret reference key 名，所有 create/query/close/verify/normalize 操作均返回 blocked decision。
- 本轮不注册 Medusa payment provider，不新增 API route，不修改 `packages/api/medusa-config.ts`，不接 SDK，不读真实 secret，不接 checkout，不执行 payment workflow。
- 验证要求：focused unit test、API typecheck、payment notification harness、`git diff --check`、子智能体复核。

## Round 261 更新

- `alipay-provider-disabled-adapter-validation`: done，记录 PR #307 合并后的主线验证。
- 验证通过：focused Alipay unit test 5/5、API typecheck、payment notification harness 23 suites / 153 tests、disposable DB dry-run、runtime registration grep、`git diff --check`。
- 当前 Alipay adapter 仍未注册、不接 route、不接 checkout、不接 SDK、不读真实 secret、不执行 payment workflow。

## Round 262 更新

- `wechat-pay-provider-fake-notify-test-plan`: done，docs-only 规划微信支付 fake notify / test vector 阶段。
- 计划覆盖 fake raw notification、fake decrypted resource、verification helper、normalize helper、test matrix、Go / No-Go 和后续 PR 拆分。
- 本轮不修改 `packages/**` 或 `apps/**` runtime，不接 SDK，不读真实 secret，不接 checkout，不执行 payment workflow。
- 验证要求：`git diff --check`、子智能体复核。

## Round 263 更新

- `alipay-provider-fake-notify-test-plan`: done，docs-only 规划支付宝 fake notify / test vector 阶段。
- 计划覆盖 fake form、canonicalization、verification helper、normalize helper、test matrix、Go / No-Go 和后续 PR 拆分。
- 本轮不修改 `packages/**` 或 `apps/**` runtime，不接 SDK，不读真实 secret，不接 checkout，不执行 payment workflow。
- 验证要求：`git diff --check`、子智能体复核。

## Round 264 更新

- `provider-disabled-adapter-rollup-validation`: done，汇总 PR #303-#310 支付 Provider sandbox / disabled adapter / fake notify plan 阶段。
- 验证通过：payment notification harness 23 suites / 153 tests、API typecheck、runtime registration grep、`git diff --check`。
- 当前支付宝 / 微信支付仍未注册、不接 route、不接 checkout、不接 SDK、不读真实 secret、不执行 payment workflow。
- 下一步只能进入 fake fixture / pure contract，不应直接接 SDK 或 checkout。

## Round 265 更新

- `wechat-pay-fake-notify-fixtures`: done，新增微信支付 fake-only notify vector。
- Fixture 只包含 fake raw body、fake encrypted resource、fake decrypted resource、expected idempotency key 和 payload digest。
- 本轮不实现验签、解密或归一化，不新增 route，不接 SDK，不读真实 secret，不接 checkout，不执行 payment workflow。
- 验证要求：focused unit test、API typecheck、payment harness、`git diff --check`、子智能体复核。

## Round 266 更新

- `alipay-fake-notify-fixtures`: done，新增支付宝 fake-only notify vector。
- Fixture 只包含 fake form、expected canonical keys / digest、expected idempotency key 和 payload digest；canonical payload 明确排除 `sign` 和 `sign_type`。
- 本轮不实现 canonicalization helper、验签或归一化，不新增 route，不接 SDK，不读真实 secret，不接 checkout，不执行 payment workflow。
- 验证通过：focused unit test 4/4、API typecheck、payment harness 25 suites / 161 tests、`git diff --check`、子智能体复核。

## Round 267 更新

- `provider-fake-notify-contract-validation`: done，汇总 PR #309-#313 的 fake notify plan / fixtures 阶段。
- 验证通过：payment harness 25 suites / 161 tests、API typecheck、runtime registration grep、sensitive credential grep、`git diff --check`。
- 当前支付宝 / 微信支付仍只具备 fake-only notification vectors，不接 SDK、不接 checkout、不注册 provider、不执行 payment workflow。
- 下一步只能进入 verifier / normalizer 纯函数合同，不应直接接真实 route、SDK、checkout、退款、结算、佣金、履约或物流。

## Round 268 更新

- `wechat-pay-notification-verifier-contract`: done，新增微信支付 fake notify verifier 纯函数合同。
- 合同校验 fake raw notification header、trusted fake serial、expected fake signature、timestamp tolerance 和 encrypted resource algorithm。
- 本轮不实现真实 RSA 验签、不解密、不接 SDK、不读真实 secret、不接 checkout、不执行 payment workflow。
- 验证要求：focused unit test、API typecheck、payment harness、`git diff --check`、子智能体复核。

## Round 269 更新

- `alipay-notification-verifier-contract`: done，新增支付宝 fake notify verifier 纯函数合同。
- 合同校验 `sign`、`sign_type=RSA2`、expected app id、expected seller id、expected fake signature 和 expected canonical payload。
- Canonical payload 排除 `sign` 和 `sign_type`，不输出 canonical payload 明文。
- 本轮不实现真实 RSA 验签、不接 SDK、不读真实 secret、不接 checkout、不执行 payment workflow。
- 验证要求：focused unit test、API typecheck、payment harness、`git diff --check`、子智能体复核。

## Round 270 更新

- `wechat-pay-notification-normalizer-contract`: done，新增微信支付 fake notify normalizer 纯函数合同。
- 合同把 verified fake notification + fake decrypted resource 映射为 `ChinaPaymentNotificationEnvelope`。
- 校验 expected app id、expected mch id、trade state、CNY currency、amount 和 order / transaction reference。
- 本轮不解密、不接 SDK、不写 inbox、不接 checkout、不执行 payment workflow。
- 验证要求：focused unit test、API typecheck、payment harness、runtime grep、`git diff --check`、子智能体复核。

## Round 271 更新

- `alipay-notification-normalizer-contract`: done，新增支付宝 fake notify normalizer 纯函数合同。
- 合同把 verified fake notification + fake form 映射为 `ChinaPaymentNotificationEnvelope`。
- 校验 expected app id、expected seller id、trade status、CNY currency、amount 和 order / trade / notify reference。
- 本轮不接 SDK、不写 inbox、不接 checkout、不执行 payment workflow。
- 验证要求：focused unit test、API typecheck、payment harness、runtime grep、`git diff --check`、子智能体复核。

## Round 272 更新

- `payment-provider-verifier-normalizer-validation`: done，汇总 PR #315-#318 的 verifier / normalizer 合同阶段。
- 验证通过：payment harness 29 suites / 194 tests、API typecheck、runtime grep、`git diff --check`。
- 当前支付宝 / 微信支付仍只具备 fake-only vectors / verifier / normalizer，不接 SDK、不接 checkout、不注册 provider、不执行 payment workflow。
- 下一步只能进入 inbox-only route gate，不应直接接真实 SDK、checkout、workflow、退款、结算、佣金、履约或物流。

## Round 273 更新

- `payment-runtime-inbox-only-route-gate`: done，审计现有 mock payment runtime inbox-only route gate。
- 验证通过：payment harness 29 suites / 194 tests、API typecheck、route high-risk grep、`git diff --check`。
- 当前 route 仍默认关闭，只允许 mock/local DB 或 local in-memory rehearsal，不接支付宝 / 微信支付真实 provider、不接 checkout、不执行 payment workflow。
- 下一步只能进入 mock inbox-only route plan / local rehearsal，不应直接接 SDK、真实 provider route、checkout、退款、结算、佣金、履约或物流。

## Round 274 更新

- `payment-runtime-inbox-only-route-plan`: done，规划 mock provider route local inbox-only rehearsal。
- 下一步只允许 fake payload、fake local secret、local disposable DB / local in-memory route rehearsal。
- 仍不注册 Medusa payment provider，不接支付宝 / 微信支付 SDK、不读真实 secret、不接 checkout、不执行 payment workflow。
- 验证要求：payment harness、API typecheck、route high-risk grep、`git diff --check`。

## Round 275 更新

- `payment-runtime-inbox-only-route-local-rehearsal`: done，补充 mock provider route local inbox-only focused tests。
- 新增 local DB port mismatch blocked、invalid signature rejected，以及 accepted / duplicate / rejected response redaction / no workflow / no checkout / no state command 断言。
- 本轮只改 focused tests、docs、task 和 ledger，不修改 route runtime，不接真实 provider、checkout 或 payment workflow。
- 验证要求：provider route focused test、payment harness、API typecheck、route high-risk grep、`git diff --check`、子智能体复核。

## Round 276 更新

- `refund-runtime-risk-gate-plan`: done，docs-only 建立退款 runtime 风险门禁和后续 PR 顺序。
- 后续退款必须先过 command contract、amount guard、provider request idempotency、refund notification inbox、manual review、permission / audit gate。
- 本轮不新增 refund route，不接支付宝 / 微信支付 refund API，不调用 workflow，不改 order / payment / refund / settlement / commission / payout / permission / fulfillment / logistics runtime。
- 验证要求：`git diff --check`、`git diff --name-only`、子智能体复核。

## Round 277 更新

- `refund-command-contract-plan`: done，docs-only 定义退款命令合同和 non-executable decision 边界。
- 合同覆盖 actor、ownership、payment snapshot、refund snapshot、block codes、reason codes 和 audit metadata。
- 下一步只允许 `refund-amount-guard-contract` 纯函数 + tests，且输出仍必须不可执行。
- 本轮不新增 TypeScript runtime、不新增 route、不写 DB、不接 provider、不执行 workflow、不改变资金或订单状态。

## Round 278 更新

- `refund-amount-guard-contract`: done，新增退款金额 guard 纯函数和 focused tests。
- 覆盖金额、币种、支付状态、provider、seller / market ownership、Admin RBAC、Vendor seller ownership、reason / audit note、pending conflict 和 idempotency replay。
- 输出始终 `executable: false`；本轮不新增 route、不写 DB、不接 provider refund API、不执行 workflow、不改变资金或订单状态。
- 验证要求：focused unit test、API typecheck、payment harness、runtime grep、`git diff --check`、子智能体复核。

## Round 279 更新

- `refund-request-idempotency-plan`: done，docs-only 规划退款请求三层幂等。
- 区分 local command idempotency、provider request idempotency 和 provider notification idempotency；request accepted 不等于 refund succeeded。
- 本轮不新增 runtime、不新增 route、不写 DB、不接 provider refund API、不执行 workflow、不改变资金或订单状态。
- 验证要求：`git diff --check`、status/name-only/untracked 范围确认、子智能体复核。

## Round 280 更新

- `refund-request-idempotency-contract`: done，新增退款请求幂等 key 纯函数和 focused tests。
- 覆盖 local command key、provider refund request key、Asia/Shanghai day bucket、key 分叉、规范化和敏感值排除。
- 本轮不新增 route、不写 DB、不接 provider refund API、不执行 workflow、不输出 refund success、不改变资金或订单状态。
- 验证要求：focused unit test、API typecheck、payment harness、runtime grep、`git diff --check`、子智能体复核。

## Round 281 更新

- `refund-notification-contract-plan`: done，docs-only 规划退款通知 verifier / normalizer 合同。
- 覆盖 `refund.succeeded` / `refund.failed`、providerRefundId、signature、amount / currency / reference matching、notification idempotency 和 failure matrix。
- 本轮不新增 runtime、不新增 route、不写 DB、不接 provider SDK、不执行 workflow、不改变资金或订单状态。
- 验证要求：`git diff --check`、status/name-only/untracked 范围确认、子智能体复核。

## Round 282 更新

- `refund-notification-fake-fixtures`: done，新增退款通知 fake-only fixtures 和 focused tests。
- 覆盖 `refund.succeeded` / `refund.failed`、providerRefundId、refund notification idempotency key、raw payload digest 和敏感 / executable 字段负断言。
- 本轮不实现 verifier / normalizer，不新增 route、不写 DB、不接 provider refund API、不执行 workflow、不改变资金或订单状态。
- 验证通过：focused unit test 4/4、API typecheck、payment harness 32 suites / 219 tests、runtime grep 和 `git diff --check`。
- runtime grep 只命中既有 event type / migration check、fake fixture / tests 和负断言；未发现 route、provider refund API、workflow command 或退款状态写入。
- 提交前仍需子智能体只读复核。

## Round 283 更新

- `refund-notification-verifier-contract`: done，新增退款通知 fake-only verifier 纯函数和 focused tests。
- 覆盖 fake signature、algorithm、provider、event id/type、providerRefundId、CNY currency 和 positive minor amount。
- 输出始终 `fixtureOnly: true` / `executable: false`；`verified: true` 只代表 fake verifier 合同通过，不代表真实退款成功。
- 本轮不实现 normalizer，不新增 route、不写 DB、不接 provider refund API、不执行 workflow、不改变资金或订单状态。
- 验证通过：focused unit test 12/12、API typecheck、payment harness 33 suites / 231 tests、runtime grep 和 `git diff --check`。
- runtime grep 只命中 focused test 负断言；未发现 route、provider refund API、workflow command 或退款状态写入。
- 提交前仍需子智能体只读复核。

## Round 284 更新

- `refund-notification-normalizer-contract`: done，新增退款通知 fake-only normalizer 纯函数和 focused tests。
- 覆盖 verified signature、provider、event id/type、idempotency key、providerRefundId、merchant order ref、payment session、provider transaction、CNY 和 requested amount。
- 输出标准 envelope 但仍 `fixtureOnly: true` / `executable: false`；envelope 只作为后续 inbox / guard 输入合同，不代表退款成功。
- 本轮不新增 route、不写 DB、不接 provider refund API、不执行 workflow、不改变资金或订单状态。
- 验证通过：focused unit test 11/11、API typecheck、payment harness 34 suites / 242 tests、runtime grep 和 `git diff --check`。
- runtime grep 只命中 focused test 负断言；未发现 route、provider refund API、workflow command 或退款状态写入。
- 提交前仍需子智能体只读复核。

## Round 285 更新

- `refund-manual-review-audit-plan`: done，docs-only 规划退款人工复核和审计事件合同。
- 覆盖 manual review 触发条件、decision 形状、audit action allowlist、metadata、Admin / Vendor / System job RBAC 与 ownership gate，以及 settlement / commission / payout block。
- 本轮不新增 TypeScript runtime、不新增 route、不写 DB、不接 provider refund API、不执行 workflow、不改变资金或订单状态。
- 验证要求：`git diff --check`、`git diff --name-only`、untracked 范围确认、子智能体复核。

## Round 286 更新

- `payment-refund-runtime-gate-validation`: done，docs-only 汇总 payment / refund runtime gate 验证。
- 验证通过：API typecheck、payment notification harness 34 suites / 242 tests、disposable DB dry-run、高风险 grep 和 `git diff --check`。
- grep 显示 `china-payment-notification` 仍未注册到 `medusa-config.ts`；高风险命中仅为既有 event log action enum / migration allowlist、focused tests 负断言和既有 mock payment route imports。
- 当前结论仍是 No-Go to real refund runtime；不接真实支付宝 / 微信支付 payment 或 refund API、不执行 workflow、不改 checkout / order / payment / refund / settlement / commission / payout / permission / fulfillment / logistics runtime。
- 下一步建议只进入 `refund-manual-review-audit-contract`、`refund-audit-event-allowlist-contract` 或 `refund-inbox-state-transition-plan` 这类不可执行合同 / docs-only 任务。

## Round 287 更新

- `refund-manual-review-audit-contract`: done，新增退款 manual review audit 纯函数和 focused tests。
- 覆盖 accepted guard、blocked guard、manual review guard、explicit risk signals、digest conflict、settlement / payout lock 和 redaction policy。
- 输出始终 `fixtureOnly: true` / `executable: false`，并强制 `blockRuntimeMutation: true`；不生成 provider refund request，不输出 refund success mutation。
- 本轮不新增 route、不写 DB、不接 provider refund API、不执行 workflow、不改变资金或订单状态。
- 验证通过：focused unit test 7/7、API typecheck、payment harness 35 suites / 249 tests、runtime grep 和 `git diff --check`。
- runtime grep 只命中 focused test 负断言；未发现 route、provider refund API、workflow command 或退款状态写入。
- 提交前仍需子智能体只读复核。

## Round 288 更新

- `refund-audit-event-allowlist-contract`: done，新增退款 audit event allowlist 纯函数和 focused tests。
- 允许 command / guard / notification / manual review / runtime mutation blocked / settlement blocked 审计动作。
- 明确禁止 `refund_state_mutated`、`refund_workflow_executed`、`provider_refund_request_sent`、`settlement_adjusted`、`commission_adjusted`、`payout_adjusted`。
- 本轮不写 DB、不注册 migration、不新增 route、不接 provider refund API、不执行 workflow、不改变资金或订单状态。
- 验证通过：focused unit test 7/7、API typecheck、payment harness 36 suites / 256 tests、runtime grep 和 `git diff --check`。
- runtime grep 中源码命中 `providerRefundRequest` / `refundStateMutation` 是 executable metadata denylist；其余命中为 focused test fixture / 负断言，未发现 route、provider refund API、workflow command 执行或退款状态写入。
- 提交前仍需子智能体只读复核。

## Round 289 更新

- `refund-inbox-state-transition-plan`: done，docs-only 规划退款通知 inbox 状态机和 owner 边界。
- 覆盖 proposed states、allowed transitions、notification idempotency、duplicate replay、digest conflict、provider callback / repository / guard / manual review / state owner / settlement owner 分工、audit action mapping、failure matrix 和 Go / No-Go。
- 明确 inbox state、normalized envelope、manual review decision 和 audit event 都不能代表退款成功。
- 本轮不新增 runtime、route、DB repository、migration 注册、provider refund API、workflow、checkout / order / payment / refund / settlement / commission / payout / permission / fulfillment / logistics 状态写入。
- 验证要求：`git diff --check`、`git diff --name-only`、untracked 范围确认、子智能体复核。

## Round 290 更新

- `refund-inbox-state-transition-contract`: done，新增退款 inbox state transition 纯函数合同和 focused tests。
- 覆盖 signature verified、terminal rejected、normalized、duplicate same digest、duplicate digest conflict、guard checked / resolved、manual review resolved、runtime mutation blocked 和 audit-only processed。
- 所有输出固定 `blockRuntimeMutation: true`、`stateMutationAllowed: false`、`fixtureOnly: true`、`executable: false`。
- `refund.succeeded` envelope 只能进入 inbox `normalized` 状态，不代表退款成功；accepted guard 只能进入 `state_owner_pending`，不能执行 workflow。
- 本轮不新增 route、不写 DB、不注册 migration、不接 provider refund API、不执行 workflow、不改变 checkout / order / payment / refund / settlement / commission / payout / permission / fulfillment / logistics runtime。
- 验证要求：focused unit test、API typecheck、payment harness、runtime grep、`git diff --check`、子智能体复核。

## Round 291 更新

- `refund-runtime-gate-validation-v2`: done，docs-only 汇总退款 runtime gate 第二版验证。
- 覆盖 refund amount guard、request idempotency、notification verifier / normalizer、manual review audit、audit event allowlist 和 inbox state transition contract。
- 验证结论仍是 No-Go to real refund runtime：没有真实 refund route、DB-backed refund inbox runtime、provider refund API、workflow execution、退款状态写入、结算、佣金或打款联动。
- 验证要求：API typecheck、payment harness、registration grep、high-risk runtime grep、`git diff --check`、子智能体复核。

## Round 292 更新

- `refund-inbox-repository-plan`: done，docs-only 规划退款 inbox repository。
- 覆盖 repository owner / non-owner、method contract、transaction boundary、idempotency / duplicate replay / digest conflict、event log consistency、error mapping、metadata redaction、manual review 和 settlement / commission / payout block。
- 明确 repository 不是退款成功事实表，不能调用 provider API、workflow 或写 order / payment / refund / settlement / commission / payout 状态。
- 验证要求：`git diff --check`、`git diff --name-only`、untracked 范围确认、子智能体复核。

## Round 293 更新

- `refund-inbox-repository-interface`: done，新增退款 inbox repository interface-only 合同和 pure error classifier。
- 覆盖 receive result、append event、mark verified / normalized / guard checked / manual review required / runtime mutation blocked / audit-only processed / terminal rejected、get by idempotency key 和 provider refund id。
- Error classifier 覆盖 duplicate、manual_review、retryable、terminal 和 unknown；unknown 不默认 success。
- 本轮不写 DB adapter、不接 route、不注册 migration、不调用 provider refund API 或 workflow、不改变 checkout / order / payment / refund / settlement / commission / payout / permission / fulfillment / logistics runtime。
- 验证要求：focused unit test、API typecheck、payment harness、runtime grep、`git diff --check`、子智能体复核。

## Round 294 更新

- `refund-inbox-repository-db-adapter-skeleton-plan`: done，docs-only 规划未来 refund inbox DB adapter skeleton。
- 覆盖文件边界、adapter 职责 / 非职责、mocked DB client tests、transaction requirements、error mapping、metadata redaction、runtime grep guard 和后续 PR 顺序。
- 明确未来 skeleton 也只能使用 injected transaction / mocked DB client，不能创建连接、读取 env、注册 module、接 route、调用 provider API 或 workflow。
- 验证要求：`git diff --check`、`git diff --name-only`、untracked 范围确认、子智能体复核。

## Round 295 更新

- `refund-inbox-repository-db-adapter-skeleton`: done，新增退款 inbox mocked DB adapter skeleton 和 focused tests。
- 覆盖 receive、duplicate same digest、duplicate digest conflict、signature verified、normalized、manual review required、runtime mutation blocked、audit-only processed、terminal rejected 和查询方法。
- metadata 顶层和嵌套敏感 / 可执行字段会被清洗；event log write failure 不被吞掉。
- 本轮不连接真实 DB、不读取 env、不注册 migration/module、不接 route、不调用 provider refund API 或 workflow、不改变 checkout / order / payment / refund / settlement / commission / payout / permission / fulfillment / logistics runtime。
- 验证要求：focused unit test、API typecheck、payment harness、runtime grep、`git diff --check`、子智能体复核。

## Round 296 更新

- `refund-inbox-repository-disposable-db-dry-run-plan`: done，见 `docs/refund-inbox-repository-disposable-db-dry-run-plan.md`。
- 本轮只做 docs-only local disposable DB dry-run 计划，定义后续脚本的 DB 命名、host guard、schema 来源、fixture、rollback / drop 和无残留检查。
- 计划覆盖 `provider + idempotency_key` 唯一约束、same digest duplicate no-op、different digest manual review / conflict、CNY / positive amount、refund audit action allowlist、禁止动作 rejection 和 metadata redaction。
- 本轮不新增脚本、不连接 DB、不修改 `apps/**` 或 `packages/**`，不注册 migration/module，不接 route、provider refund API 或 workflow，不改变 checkout / order / payment / refund / settlement / commission / payout / permission / fulfillment / logistics runtime。
- 验证要求：`git diff --check`、`git diff --name-only`、status/untracked 范围确认、子智能体复核。

## Round 297 更新

- `refund-inbox-repository-disposable-db-dry-run`: done，见 `docs/refund-inbox-repository-disposable-db-dry-run.md`。
- 新增 `.codex/scripts/refund-inbox-repository-disposable-db-dry-run.sh`，只连接本地 disposable PostgreSQL DB，默认 DB 名为 `fuyi_refund_inbox_repository_dry_run_<timestamp>`。
- 脚本从未注册 shared inbox migration skeleton 提取 up/down SQL，在 disposable DB 内追加 refund-only positive amount、event action allowlist 和 metadata redaction 约束；不修改真实 migration。
- dry-run 覆盖 fake `refund.succeeded` inbox row、unique idempotency、same digest duplicate no-op、different digest conflict manual review、forbidden action rejection、non-CNY / zero amount rejection、metadata redaction、down SQL 和 drop DB 无残留。
- 本轮不修改 `apps/**` 或 `packages/**` runtime，不注册 migration/module，不新增 route，不调用 provider refund API 或 workflow，不改变 checkout / order / payment / refund / settlement / commission / payout / permission / fulfillment / logistics 状态。
- 验证要求：dry-run 脚本、`git diff --check`、name-only/status/untracked 范围确认、子智能体复核。

## Round 298 更新

- `refund-inbox-route-plan`: done，见 `docs/refund-inbox-route-plan.md`。
- 本轮只做 docs-only route gate 计划；不新增 route，不修改 `apps/**` 或 `packages/**` runtime，不注册 migration/module，不连接 DB，不调用 provider refund API 或 workflow。
- 计划定义未来 fake/local inbox-only route 的 path 草案、runtime gate、request / response contract、accepted / duplicate / digest conflict / rejected 语义、response redaction 和测试矩阵。
- 明确 route response、inbox accepted、duplicate、manual review 和 audit event 都不能代表退款成功；refund state mutation、settlement、commission、payout、permission、fulfillment 和 logistics 继续阻断。
- 验证要求：`git diff --check`、name-only/status/untracked 范围确认、子智能体复核。

## Round 299 更新

- `refund-inbox-disabled-route-skeleton-plan`: done，见 `docs/refund-inbox-disabled-route-skeleton-plan.md`。
- 本轮只做 docs-only disabled route skeleton 计划；不新增 route，不修改 `apps/**` 或 `packages/**` runtime，不注册 migration/module，不连接 DB。
- 计划定义未来 disabled skeleton 的文件范围、默认 disabled response、production blocked response、method handling、response redaction 和 focused tests。
- 未来 skeleton 必须不读 body、不验签、不 normalize、不生成 idempotency key、不调 verifier / normalizer / repository / provider refund API / workflow、不写 inbox 或 event log。
- disabled route 不能表达 inbox accepted、duplicate 或 refund success；settlement、commission、payout、permission、fulfillment 和 logistics 继续阻断。
- 验证要求：`git diff --check`、name-only/status/untracked 范围确认、子智能体复核。

## Round 300 更新

- `refund-inbox-disabled-route-skeleton`: done，见 `docs/refund-inbox-disabled-route-skeleton.md`。
- 新增 `packages/api/src/api/china/refund-inbox/mock/route.ts` 和 focused route tests。
- `POST /china/refund-inbox/mock` 默认返回 disabled；`NODE_ENV=production` 返回 production blocked；`GET` 返回 405。
- 当前 route 不读 body、不验签、不 normalize、不计算 digest、不生成 idempotency key、不连接 DB、不调 verifier / normalizer / repository / provider refund API / workflow、不写 inbox 或 event log。
- Focused tests 覆盖默认 disabled、mock env requested 仍 disabled、production blocked、GET 405 和 response redaction；payment notification harness 已纳入该 route test。
- 本轮不注册 migration/module，不改变 checkout / order / payment / refund / settlement / commission / payout / permission / fulfillment / logistics runtime。
- 验证要求：focused route unit test、API typecheck、payment harness、runtime grep、`git diff --check`、子智能体复核。

## Round 301 更新

- `refund-inbox-disabled-route-validation`: done，见 `docs/refund-inbox-disabled-route-validation.md`。
- PR #347 合并后验证通过：focused route test 4/4、API typecheck、payment notification harness 40 suites / 284 tests、payment inbox DB dry-run row count 2|9 且 down/drop cleanup 通过。
- Runtime grep 仅命中 focused route test 的负断言和 must-not-read fixture，未发现 provider refund request、workflow、checkout 或状态写入命令。
- 当前 `/china/refund-inbox/mock` 仍 disabled-only，不读取 body、不连接 DB、不调用 verifier / normalizer / repository / provider refund API / workflow、不写 inbox 或 event log。
- 下一步只能进入 `refund-inbox-local-inbox-only-route-plan` 或 repository rehearsal plan；仍不能接真实 refund runtime、settlement、commission、payout、permission、fulfillment 或 logistics。

## Round 302 更新

- `refund-inbox-local-inbox-only-route-plan`: done，见 `docs/refund-inbox-local-inbox-only-route-plan.md`。
- 本轮只做 docs-only plan；不修改 `apps/**` 或 `packages/**` runtime，不改 route 行为，不连接 DB，不写 inbox。
- 计划定义未来 fake/local inbox-only route 的 env gate、mock provider gate、local disposable DB / in-memory gate、fake payload contract、response contract、redaction、test matrix、verification 和 rollback。
- 明确 accepted / duplicate / manual review response 都不能代表退款成功；provider refund API、workflow、refund state mutation、settlement、commission、payout、permission、fulfillment 和 logistics 继续 No-Go。
- 下一步若实现 `refund-inbox-local-inbox-only-route`，必须继续 fake/local、inbox/audit-only、production blocked，并跑 harness、refund disposable DB dry-run、typecheck 和 runtime grep。

## Round 303 更新

- `refund-inbox-local-inbox-only-route`: done，见 `docs/refund-inbox-local-inbox-only-route.md`。
- `/china/refund-inbox/mock` 现在支持 fake/local in-memory inbox-only：显式 env gate 通过后读取 fake body、验证 fake signature、normalize fake refund notification、写入进程内 refund inbox repository。
- 默认仍 disabled；production / preprod / staging blocked；local DB route wiring 仍 disabled。
- Focused route tests 覆盖 9 个场景：默认 disabled、缺少 local repository disabled、production blocked、GET 405、accepted、duplicate、digest conflict manual review、missing signature rejected、non-CNY rejected。
- 当前实现不连接 DB、不注册 module/migration、不调用 provider refund API、不执行 payment/refund workflow、不写 refund success state、不改变 settlement、commission、payout、permission、fulfillment 或 logistics。
- 验证要求：focused route unit test、API typecheck、payment harness、refund disposable DB dry-run、runtime grep、`git diff --check`、子智能体复核。

## Round 304 更新

- `refund-inbox-local-inbox-only-route-validation`: done，见 `docs/refund-inbox-local-inbox-only-route-validation.md`。
- PR #350 合并后验证通过：focused route test 9/9、API typecheck、payment notification harness 40 suites / 289 tests、payment inbox DB dry-run 2|9、refund inbox DB dry-run 1|8 且 down/drop cleanup 通过。
- Runtime grep 仅命中 focused route test 的负断言和 must-not-read fixture，未发现 provider refund request、workflow、checkout 或状态写入命令。
- 当前 `/china/refund-inbox/mock` 仍只支持 fake/local in-memory inbox-only；local DB route wiring、真实 Provider、workflow 和 refund success state 仍未启用。
- 下一步建议进入 `refund-inbox-local-db-route-plan` 或 repository rehearsal plan，继续保持 no-runtime-mutation gate。

## Round 305 更新

- `refund-inbox-local-db-route-plan`: done，见 `docs/refund-inbox-local-db-route-plan.md`。
- 本轮只做 docs-only plan；不修改 `apps/**` 或 `packages/**` runtime，不连接 DB，不改 route 行为。
- 计划定义未来 local disposable DB route 的 env gate、DB URL / name / actual connection validation、schema prerequisites、repository adapter scope、response contract、test matrix、verification 和 rollback。
- 明确 local DB route 仍只能 fake provider / fake secret / disposable DB / inbox-audit-only；accepted、duplicate、manual review 仍不能代表退款成功。
- 仍 No-Go：真实 Provider refund notify、provider refund request、workflow execution、refund success state、settlement、commission、payout、permission、fulfillment、logistics、预发/生产 DB。

## Round 306 更新

- `refund-inbox-local-db-route`: done，见 `docs/refund-inbox-local-db-route.md`。
- `/china/refund-inbox/mock` 现在支持 fake/local disposable DB-backed inbox-only gate：`mock_local_db_inbox_only` + `CHINA_REFUND_INBOX_LOCAL_DB=true` + local disposable DB URL/name + fake secret。
- route 会在读取 body 前校验 actual `current_database()`、server host 和 port；production / prod / preprod / staging blocked。
- 新增 `createLocalRefundInboxPostgresClient()`，只接受 refund dry-run DB 前缀，把 refund-only state / actor 映射到当前 shared inbox DB 安全值，并递归 redacts event metadata。
- Focused tests 覆盖 local DB missing、remote host、DB name mismatch、accepted、duplicate、digest conflict manual review、response redaction 和 local client mapping。
- 验证通过：focused route + local PG client tests 2 suites / 33 tests、API typecheck、payment notification harness 40 suites / 300 tests、payment DB dry-run `2|9`、refund DB dry-run `1|8`、runtime grep 和 `git diff --check`。
- 当前仍不注册 module/migration，不接真实 Provider refund API，不执行 workflow，不写退款成功状态，不改变 settlement、commission、payout、permission、fulfillment 或 logistics。

## Round 307 更新

- `refund-inbox-local-db-route-validation`: done，见 `docs/refund-inbox-local-db-route-validation.md`。
- PR #353 合并后验证通过：focused route + local PG client tests 2 suites / 33 tests、API typecheck、payment notification harness 40 suites / 301 tests、payment DB dry-run `2|9`、refund DB dry-run `1|8`。
- Runtime grep 只命中 route test 负断言和 local client redaction denylist；未发现可执行 provider refund request、workflow、state mutation、settlement / commission / payout 调整或 checkout 调用。
- 当前 refund inbox local DB route 仍只是 fake/local disposable DB-backed inbox-only rehearsal；accepted、duplicate、manual review 不代表退款成功。
- 下一步建议进入 `refund-inbox-repository-real-db-adapter-rehearsal-plan`，继续先 docs-only 规划。

## Round 308 更新

- `refund-inbox-repository-real-db-adapter-rehearsal-plan`: done，见 `docs/refund-inbox-repository-real-db-adapter-rehearsal-plan.md`。
- 本轮只做 docs-only plan；不修改 `apps/**` 或 `packages/**` runtime，不连接 DB，不注册 module/migration，不新增 route。
- 计划将 real DB adapter rehearsal 限定为本地 disposable PostgreSQL，验证 repository / SQL adapter 的真实 SQL 行为。
- 明确当前 refund state / actor DB-safe mapping 只是 rehearsal 兼容层；未来真实 schema 仍需单独 migration / constraint PR。
- 仍 No-Go：预发/生产 DB、真实 provider refund notify、provider refund request、workflow、refund success state、settlement、commission、payout、permission、fulfillment、logistics。

## Round 309 更新

- `refund-inbox-repository-real-db-adapter-rehearsal`: done，见 `docs/refund-inbox-repository-real-db-adapter-rehearsal.md`。
- 新增 `.codex/scripts/refund-inbox-repository-real-db-adapter-rehearsal.sh`，只连接本地 disposable PostgreSQL，默认 DB 名 `fuyi_refund_inbox_real_adapter_dry_run_<timestamp>`。
- 脚本验证 fake refund inbox row、DB-safe status / actor mapping、same digest duplicate、different digest conflict、manual review event、forbidden action rejection、metadata redaction、failed subtransaction rollback、down SQL 和 drop DB 无残留。
- 验证通过：real-adapter rehearsal positive run `1|8`、unsafe DB name guard、production env guard、focused local client + refund repository tests 2 suites / 24 tests、API typecheck、payment notification harness 40 suites / 301 tests、payment DB dry-run `2|9`、existing refund DB dry-run `1|8`、`git diff --check`。
- 当前仍不修改 `apps/**` 或 `packages/**` runtime，不注册 migration/module，不新增 route，不接 provider refund API、workflow、refund success state、settlement、commission、payout、permission、fulfillment 或 logistics。

## Round 310 更新

- `refund-inbox-repository-real-db-adapter-rehearsal-validation`: done，见 `docs/refund-inbox-repository-real-db-adapter-rehearsal-validation.md`。
- PR #356 合并后验证通过：real-adapter rehearsal positive run `1|8`、unsafe DB name guard、production env guard、focused local client + refund repository tests 2 suites / 24 tests、API typecheck、payment notification harness 40 suites / 301 tests、payment DB dry-run `2|9`、existing refund DB dry-run `1|8`、`git diff --check`。
- 验证结束后工作区无 runtime diff。
- 当前仍只是 local disposable DB rehearsal；真实 refund schema / constraint migration 必须单独规划。
- 下一步建议进入 `refund-schema-constraint-migration-plan`，继续 docs-only。

## Round 311 更新

- `refund-schema-constraint-migration-plan`: done，见 `docs/refund-schema-constraint-migration-plan.md`。
- 本轮只规划未来真实 migration 的约束扩展，不修改 `apps/**`、`packages/**` runtime，不修改 migration，不连接 DB。
- 计划覆盖 current shared payment-first schema 不匹配点、future processing status / refund audit action / actor / amount / metadata redaction / index strategy、PR 拆分顺序和 verification matrix。
- 当前仍 No-Go：真实 refund provider、workflow、refund success state、settlement、commission、payout、permission、fulfillment 或 logistics。
- 下一步建议进入 `refund-schema-constraint-migration-rehearsal-plan`，继续 docs-only。

## Round 312 更新

- `refund-schema-constraint-migration-rehearsal-plan`: done，见 `docs/refund-schema-constraint-migration-rehearsal-plan.md`。
- 本轮只规划未来 rehearsal script，不新增脚本，不修改真实 migration，不连接 DB，不注册 module。
- 计划定义 `fuyi_refund_schema_constraint_dry_run_` disposable DB guard、constraint SQL rehearsal shape、payment/refund compatibility matrix、metadata redaction helper cleanup 和 rollback 要求。
- 当前仍 No-Go：真实 refund provider、workflow、refund success state、settlement、commission、payout、permission、fulfillment 或 logistics。
- 下一步建议进入 `refund-schema-constraint-migration-rehearsal`，只新增本地 disposable DB 脚本。

## Round 313 更新

- `refund-schema-constraint-migration-rehearsal`: done，见 `docs/refund-schema-constraint-migration-rehearsal.md`。
- 新增 `.codex/scripts/refund-schema-constraint-migration-rehearsal.sh`，只连接本地 disposable PostgreSQL，默认 DB 名 `fuyi_refund_schema_constraint_dry_run_<timestamp>`。
- 脚本验证 base schema apply、proposed constraint expansion、payment compatibility、refund-only status / action / actor、forbidden runtime action rejection、positive amount、metadata redaction、rollback to base schema、down SQL 和 drop DB 无残留。
- 验证通过：schema constraint rehearsal positive run、unsafe DB name guard、production env guard、focused tests 3 suites / 29 tests、API typecheck、payment notification harness 40 suites / 301 tests、payment DB dry-run `2|9`、existing refund real-adapter rehearsal `1|8`、`git diff --check`。
- 当前仍不修改真实 migration，不修改 `apps/**` 或 `packages/**` runtime，不注册 module，不新增 route，不接 provider refund API、workflow、refund success state、settlement、commission、payout、permission、fulfillment 或 logistics。
- 下一步建议做 `refund-schema-constraint-migration-validation`，记录合并后验证；或单独规划真实 migration PR。

## Round 314 更新

- `refund-schema-constraint-migration-validation`: done，见 `docs/refund-schema-constraint-migration-validation.md`。
- PR #360 合并后验证通过：schema constraint rehearsal positive run、unsafe DB name guard、production env guard、focused tests 3 suites / 29 tests、API typecheck、payment notification harness 40 suites / 301 tests、payment DB dry-run `2|9`、existing refund real-adapter rehearsal `1|8`、`git diff --check`。
- 当前仍只是 local disposable DB constraint rehearsal；真实 migration 必须单独 PR，并提供 rollback runbook。
- 当前仍 No-Go：真实 refund provider、workflow、refund success state、settlement、commission、payout、permission、fulfillment 或 logistics。
- 下一步建议进入 `refund-schema-constraint-migration-prereadiness-plan`，继续 docs-only。

## Round 315 更新

- `refund-schema-constraint-migration-prereadiness-plan`: done，见 `docs/refund-schema-constraint-migration-prereadiness-plan.md`。
- 本轮只规划真实 migration PR 前置条件，不修改 `apps/**`、`packages/**` runtime，不修改 migration，不连接 DB，不注册 module。
- 计划覆盖 file/schema/runtime/data gates、operator preflight SQL、rollback runbook、required verification、release sequence 和 Go / No-Go。
- 下一步如进入 `refund-schema-constraint-migration`，仍只能修改 migration skeleton / docs / validation，不能启用 route、provider、workflow 或 refund success state。
- 仍 No-Go：settlement、commission、payout、permission、fulfillment 或 logistics。

## Round 316 更新

- `refund-schema-constraint-migration`: done，见 `docs/refund-schema-constraint-migration.md`。
- 更新未注册 migration skeleton：扩展 refund-only `processing_status`、refund audit actions、`system_job` / `admin` / `vendor` actor、positive amount check、metadata redaction helper / constraint、provider refund 普通索引。
- 更新 `.codex/scripts/refund-schema-constraint-migration-rehearsal.sh`，改为验证当前 migration skeleton 自带约束，而不是临时追加同一套 constraints。
- 更新 `.codex/scripts/refund-inbox-repository-real-db-adapter-rehearsal.sh`，使其验证新 schema 接受 `normalized` 与 `system_job`，同时继续拒绝 provider refund request / workflow / settlement / commission / payout 等危险动作。
- 验证通过：schema constraint rehearsal positive run、unsafe DB name guard、production env guard、focused tests 3 suites / 29 tests、API typecheck、payment notification harness 40 suites / 301 tests、payment DB dry-run `2|9`、existing refund real-adapter rehearsal `1|9`、`git diff --check`。
- 当前仍不注册 module、不新增 route、不接 provider refund API、不执行 workflow、不写 refund success state、不改变 settlement、commission、payout、permission、fulfillment 或 logistics。
- 下一步建议做 `refund-schema-constraint-migration-validation`，记录合并后验证。

## Round 317 更新

- `refund-schema-constraint-migration-validation-v2`: done，见 `docs/refund-schema-constraint-migration-validation-v2.md`。
- PR #363 合并后验证通过：schema constraint rehearsal positive run、unsafe DB name guard、production env guard、focused tests 3 suites / 29 tests、API typecheck、payment notification harness 40 suites / 301 tests、payment DB dry-run `2|9`、existing refund real-adapter rehearsal `1|9`、`git diff --check`。
- 当前 migration skeleton 已扩展，但 module 仍未注册，route / provider / workflow / refund success state 仍未启用。
- 下一步建议进入 `refund-inbox-schema-adapter-unmapped-state-plan`，先规划 local PG client 是否移除 DB-safe mapping。
- 仍 No-Go：settlement、commission、payout、permission、fulfillment 或 logistics。

## Round 318 更新

- `refund-inbox-schema-adapter-unmapped-state-plan`: done，见 `docs/refund-inbox-schema-adapter-unmapped-state-plan.md`。
- 本轮只规划 local PG client / refund inbox adapter 去除 DB-safe state / actor mapping，不修改 `apps/**`、`packages/**` runtime，不连接 DB，不注册 module。
- 计划覆盖 current mapping、future adapter scope、new schema / old schema compatibility、verification matrix、required commands 和 rollback。
- 下一步如进入 `refund-inbox-schema-adapter-unmapped-state`，仍只能改 local PG client / tests / rehearsal，不得启用 route、provider、workflow 或 refund success state。
- 仍 No-Go：settlement、commission、payout、permission、fulfillment 或 logistics。

## Round 319 更新

- `refund-inbox-schema-adapter-unmapped-state`: done，见 `docs/refund-inbox-schema-adapter-unmapped-state.md`。
- 更新 `local-postgres-db-client.ts`：refund-only state / actor 原样写入和读回；未知 refund DB status 抛出 `REFUND_DB_INVALID_STATE_TRANSITION`。
- 更新 focused tests 和 refund inbox route local DB fixture，断言 `normalized` 和 `system_job` 不再映射到 payment-first DB-safe values。
- 验证通过：schema constraint rehearsal、focused tests 4 suites / 45 tests、API typecheck、payment notification harness 40 suites / 301 tests、payment DB dry-run `2|9`、existing refund real-adapter rehearsal `1|9`、`git diff --check`。
- 当前仍不注册 module、不新增 route、不接 provider refund API、不执行 workflow、不写 refund success state、不改变 settlement、commission、payout、permission、fulfillment 或 logistics。
- 下一步建议做 `refund-inbox-schema-adapter-unmapped-state-validation`。

## Round 320 更新

- `refund-inbox-schema-adapter-unmapped-state-validation`: done，见 `docs/refund-inbox-schema-adapter-unmapped-state-validation.md`。
- PR #366 合并后验证通过：schema constraint rehearsal、focused tests 4 suites / 45 tests、API typecheck、payment notification harness 40 suites / 301 tests、payment DB dry-run `2|9`、existing refund real-adapter rehearsal `1|9`、`git diff --check`。
- 当前 adapter 原样 state / actor 仍只属于 local disposable DB / mock gate；真实 refund provider、workflow、refund success state 仍未启用。
- 下一步建议进入 `refund-route-runtime-readiness-plan`，继续先规划真实 runtime 前置条件。
- 仍 No-Go：settlement、commission、payout、permission、fulfillment 或 logistics。

## Round 321 更新

- `refund-route-runtime-readiness-plan`: done，见 `docs/refund-route-runtime-readiness-plan.md`。
- 本轮只做 docs-only readiness gate；不修改 `apps/**` 或 `packages/**` runtime，不启用真实 route，不注册 module，不连接 DB。
- 计划明确真实退款通知 route / runtime 当前仍为 No-Go，后续必须先通过 feature flag、provider verification、inbox idempotency、schema / migration、state owner handoff、permission / manual review、finance / fulfillment block、observability 和 rollback gates。
- 建议后续顺序：`refund-route-runtime-readiness-validation` -> provider real verifier plan / contract -> provider inbox-only shadow -> state owner handoff -> reconciliation / settlement plan。
- 仍 No-Go：真实 provider refund request、workflow execution、refund success state mutation、settlement、commission、payout、permission weakening、fulfillment 或 logistics mutation。

## Round 322 更新

- `refund-route-runtime-readiness-validation`: done，见 `docs/refund-route-runtime-readiness-validation.md`。
- PR #368 合并后验证通过：`git diff --check`、`git status --short --branch`、`git diff-tree --no-commit-id --name-status -r HEAD` 和 `git show --stat --oneline --no-renames HEAD`。
- 合并提交文件范围仅为 `.codex/queue.md`、`.codex/tasks/refund-route-runtime-readiness-plan.md`、`docs/refund-route-runtime-readiness-plan.md`、`project-ledger/changelog.md`、`project-ledger/handoff.md`、`project-ledger/status.md`。
- 当前仍无 `apps/**` 或 `packages/**` runtime 变更，真实 refund route / provider / workflow / refund success state 仍未启用。
- 下一步建议进入 `refund-provider-real-verifier-plan`；仍不接 SDK、不写真实密钥、不接 route、不执行 workflow。

## Round 323 更新

- `refund-provider-real-verifier-plan`: done，见 `docs/refund-provider-real-verifier-plan.md`。
- 本轮只做 docs-only provider verifier 规划；不修改 `apps/**` 或 `packages/**` runtime，不接 SDK、不写真实密钥、不新增 route、不写 inbox。
- 计划覆盖微信支付退款结果回调的 header 验签、平台证书 / 公钥选择、`AEAD_AES_256_GCM` 解密、event type 和 idempotency；覆盖支付宝异步通知的 `sign` / `sign_type` canonicalization、产品模式确认、refund request ref 和 amount / currency 校验。
- 下一步建议拆成 `refund-wechat-real-verifier-plan` 与 `refund-alipay-real-verifier-plan`，继续 docs-only provider-specific 细化。
- 仍 No-Go：真实 provider refund request、workflow execution、refund success state mutation、settlement、commission、payout、permission weakening、fulfillment 或 logistics mutation。

## Round 324 更新

- `refund-wechat-real-verifier-plan`: done，见 `docs/refund-wechat-real-verifier-plan.md`。
- 本轮只做 docs-only 微信支付退款 verifier 细化；不修改 `apps/**` 或 `packages/**` runtime，不接 SDK、不写真实密钥、不新增 route、不写 inbox。
- 计划明确后续 contract 文件、输入输出、header 验签、证书 / 公钥选择、`AEAD_AES_256_GCM` 解密、`REFUND.SUCCESS` / `REFUND.ABNORMAL` / `REFUND.CLOSED` 映射、幂等、failure code、fixture / sandbox vector 和 runtime grep。
- 下一步建议进入 `refund-alipay-real-verifier-plan`。
- 仍 No-Go：真实 provider refund request、workflow execution、refund success state mutation、settlement、commission、payout、permission weakening、fulfillment 或 logistics mutation。

## Round 325 更新

- `refund-alipay-real-verifier-plan`: done，见 `docs/refund-alipay-real-verifier-plan.md`。
- 本轮只做 docs-only 支付宝退款 verifier 细化；不修改 `apps/**` 或 `packages/**` runtime，不接 SDK、不写真实密钥、不新增 route、不写 inbox。
- 计划明确支付宝产品模式 gate，不能假设 `alipay.trade.refund` 一定提供独立退款通知；后续 verifier 必须校验 `sign` / `sign_type`、canonical payload、app / seller / order / request ref、金额、币种和 idempotency。
- 下一步建议进入 `refund-provider-real-verifier-plan-validation` 或 `refund-wechat-real-verifier-contract`。
- 仍 No-Go：真实 provider refund request、refund query API、workflow execution、refund success state mutation、settlement、commission、payout、permission weakening、fulfillment 或 logistics mutation。

## Round 326 更新

- `refund-provider-real-verifier-plan-validation`: done，见 `docs/refund-provider-real-verifier-plan-validation.md`。
- PR #370-#372 合并后验证通过：`git diff --check`、`git status --short --branch`、三项 merge commit 的 `git diff-tree --name-status` 和 `git show --stat`。
- 三项 PR 文件范围均为 `.codex/queue.md`、`.codex/tasks/**`、`docs/**`、`project-ledger/**`；没有 `apps/**` 或 `packages/**` runtime 变更。
- 当前仍未接 SDK、真实密钥、route、inbox、provider refund API、refund query API、workflow 或 refund success state。
- 下一步建议进入 `refund-wechat-real-verifier-contract`，第一版只做纯函数 + redacted fixtures + focused tests。

## Round 327 更新

- `refund-wechat-real-verifier-contract`: done，见 `docs/refund-wechat-real-verifier-contract.md`。
- 新增微信支付退款结果回调 verifier 纯函数合同、redacted success / abnormal / closed fixtures 和 focused tests。
- 合同输出始终 `fixtureOnly: true`、`executable: false`；`refund.succeeded` 不代表平台退款成功。
- 本轮不接 SDK、不写真实密钥、不新增 route、不写 inbox、不执行 workflow、不写 refund success state。
- 下一步建议进入 `refund-alipay-real-verifier-contract`。

## Round 328 更新

- `refund-alipay-real-verifier-contract`: done，见 `docs/refund-alipay-real-verifier-contract.md`。
- 新增支付宝退款相关通知 verifier 纯函数合同、redacted refund / trade-only fixtures 和 focused tests。
- 合同输出始终 `fixtureOnly: true`、`executable: false`；trade-only / query-required 场景不代表退款成功。
- 本轮不接 SDK、不写真实密钥、不新增 route、不写 inbox、不执行 workflow、不写 refund success state。
- 下一步建议进入 `refund-provider-real-verifier-contract-validation`。

## Round 329 更新

- `refund-provider-real-verifier-contract-validation`: done，见 `docs/refund-provider-real-verifier-contract-validation.md`。
- PR #374-#375 合并后验证通过：focused WeChat + Alipay refund verifier tests 2 suites / 21 tests、API typecheck、payment notification harness 42 suites / 322 tests、payment DB dry-run `2|9`、`git diff --check`。
- 当前 provider verifier 合同仍只输出 `fixtureOnly: true` / `executable: false`，不接 route、不写 inbox、不执行 workflow、不写 refund success state。
- 下一步建议进入 `refund-provider-inbox-route-plan`，继续先规划 provider inbox-only route shadow。

## Round 330 更新

- `refund-provider-inbox-route-plan`: done，见 `docs/refund-provider-inbox-route-plan.md`。
- 本轮只做 docs-only provider inbox route 规划；不修改 `apps/**` 或 `packages/**` runtime，不新增 route，不连接 DB，不注册 module，不接 SDK，不写真实密钥。
- 计划明确未来 provider route shadow 默认 disabled、production blocked，只能在 local / disposable preprod gate 下写 inbox / audit。
- `accepted`、`duplicate`、`manual_review`、`processed_for_audit_only` 和 `query_required` 均不代表平台退款成功。
- 下一步建议进入 `refund-provider-inbox-route-plan-validation`，先验证本计划 PR 文件范围和安全边界。
- 仍 No-Go：真实 provider refund request、refund query API、workflow execution、refund success state mutation、settlement、commission、payout、permission weakening、fulfillment 或 logistics mutation。

## Round 331 更新

- `refund-provider-inbox-route-plan-validation`: done，见 `docs/refund-provider-inbox-route-plan-validation.md`。
- PR #377 合并后验证通过：`git diff --check`、`git status --short --branch`、`git diff-tree --no-commit-id --name-status -r d4f1fe6` 和 `git show --stat --oneline --no-renames d4f1fe6`。
- 合并提交文件范围仅为 `.codex/queue.md`、`.codex/tasks/refund-provider-inbox-route-plan.md`、`docs/refund-provider-inbox-route-plan.md`、`project-ledger/changelog.md`、`project-ledger/handoff.md`、`project-ledger/status.md`。
- 当前仍无 `apps/**` 或 `packages/**` runtime 变更，provider inbox route shadow 仍未实现或启用。
- 下一步建议进入 `refund-provider-inbox-route-shadow-plan`，继续 docs-only 细化 implementation PR 文件范围和 route gate。
- 仍 No-Go：真实 SDK、真实密钥、provider refund request、refund query API、workflow execution、refund success state mutation、settlement、commission、payout、permission weakening、fulfillment 或 logistics mutation。

## Round 332 更新

- `refund-provider-inbox-route-shadow-plan`: done，见 `docs/refund-provider-inbox-route-shadow-plan.md`。
- 本轮只做 docs-only implementation plan；不修改 `apps/**` 或 `packages/**` runtime，不新增 route，不连接 DB，不注册 module，不接 SDK，不写真实密钥。
- 计划细化后续 route shadow 的 planned files、feature flag contract、request handling order、provider wiring、response redaction helper、test matrix、runtime grep、rollback 和 PR sequence。
- 后续 implementation 仍必须默认 disabled、production blocked、state mutation blocked，只能写 inbox / audit，不能表达平台退款成功。
- 下一步如进入 `refund-provider-inbox-route-shadow`，必须保持 disabled skeleton / local gate / tests 优先。
- 仍 No-Go：provider refund request、refund query API、workflow execution、refund success state mutation、settlement、commission、payout、permission weakening、fulfillment 或 logistics mutation。

## Round 333 更新

- `refund-provider-inbox-route-shadow`: done，见 `docs/refund-provider-inbox-route-shadow.md`。
- 新增支付宝 / 微信支付 refund provider inbox route disabled shadow skeleton、route config parser、safe response redaction helper 和 focused tests。
- 当前 route 默认 disabled；即使 local shadow flags 打开，也返回 disabled，不读取 body、不写 inbox。
- 本轮不连接 DB、不注册 module、不接 SDK、不写真实密钥、不执行 workflow、不写 refund success state。
- 下一步建议进入 `refund-provider-inbox-route-shadow-validation`，验证 focused tests、typecheck、payment harness、runtime grep 和 diff check。
- 仍 No-Go：provider refund request、refund query API、settlement、commission、payout、permission weakening、fulfillment 或 logistics mutation。

## Round 334 更新

- `refund-provider-inbox-route-shadow-validation`: done，见 `docs/refund-provider-inbox-route-shadow-validation.md`。
- PR #380 合并后验证通过：focused route/config/response tests 4 suites / 16 tests、API typecheck、payment harness 42 suites / 322 tests、payment DB dry-run `2|9`、runtime grep 和 `git diff --check`。
- Runtime grep 只命中测试负断言和 response redaction denylist。
- `packages/api/.mercur/index.d.ts` 由 typecheck 刷新后已恢复，未纳入本轮。
- 当前 provider route 仍是 disabled skeleton，不读 body、不写 inbox、不连接 DB、不执行 workflow、不写 refund success state。
- 下一步建议进入 `refund-provider-inbox-route-local-wiring-plan`，先 docs-only 规划 local in-memory inbox wiring。
- 仍 No-Go：真实 SDK、真实密钥、provider refund request、refund query API、settlement、commission、payout、permission weakening、fulfillment 或 logistics mutation。

## Round 335 更新

- `refund-provider-inbox-route-local-wiring-plan`: done，见 `docs/refund-provider-inbox-route-local-wiring-plan.md`。
- 本轮只做 docs-only local wiring plan；不修改 `apps/**` 或 `packages/**` runtime，不连接 DB，不注册 module，不接 SDK，不写真实密钥。
- 计划明确下一步 local wiring 只能在 development + local target + local in-memory + fixture config 下读取 body、调用 verifier contract、写 local inbox。
- 所有 provider event mapping 均不代表平台退款成功；Alipay query-required 仍不得调用 query API。
- 下一步如进入 `refund-provider-inbox-route-local-wiring`，必须先实现 local in-memory repository / normalizer tests。
- 仍 No-Go：provider refund request、refund query API、workflow execution、refund success state mutation、settlement、commission、payout、permission weakening、fulfillment 或 logistics mutation。

## Round 336 更新

- `refund-provider-inbox-route-local-wiring`: done，见 `docs/refund-provider-inbox-route-local-wiring.md`。
- Provider refund inbox route 现在支持 development/local/in-memory/fixture-only wiring；未通过 local gate 时仍不读取 body。
- 新增 local in-memory repository 和 provider route normalizer；route focused tests 覆盖 accepted、duplicate、manual review、Alipay trade-only 和 query-required。
- 本轮不连接 DB、不注册 module、不接 SDK、不写真实密钥、不调用 provider refund API / query API、不执行 workflow、不写 refund success state。
- 下一步建议进入 `refund-provider-inbox-route-local-wiring-validation`。
- 仍 No-Go：settlement、commission、payout、permission weakening、fulfillment 或 logistics mutation。

## Round 337 更新

- `refund-provider-inbox-route-local-wiring-validation`: done，见 `docs/refund-provider-inbox-route-local-wiring-validation.md`。
- PR #383 合并后验证通过：focused tests 6 suites / 29 tests、API typecheck、payment harness 42 suites / 322 tests、payment DB dry-run `2|9`、runtime grep 和 `git diff --check`。
- Runtime grep 只命中测试负断言和 response redaction denylist。
- 当前 provider route 仍只支持 development/local/in-memory/fixture-only wiring；未通过 gate 不读取 body。
- 下一步建议进入 `refund-provider-inbox-route-disposable-db-plan`，先 docs-only 规划 disposable DB wiring。
- 仍 No-Go：真实 SDK、真实密钥、provider refund request、refund query API、workflow execution、refund success state mutation、settlement、commission、payout、permission weakening、fulfillment 或 logistics mutation。

## Round 338 更新

- `refund-provider-inbox-route-disposable-db-plan`: done，见 `docs/refund-provider-inbox-route-disposable-db-plan.md`。
- 本轮只做 docs-only local disposable DB wiring plan；不修改 `apps/**` 或 `packages/**` runtime，不连接预发、生产或普通共享 DB。
- 计划明确下一步 disposable DB wiring 只能在 development + local target + disposable PostgreSQL DB + fixture config 下读取 body、调用 verifier contract、写 inbox / event log。
- 所有 provider event mapping 均不代表平台退款成功；Alipay query-required 仍不得调用 query API。
- 下一步如进入 `refund-provider-inbox-route-disposable-db`，必须先实现 DB gate / existing local PG repository reuse / focused tests / disposable DB rehearsal。
- 仍 No-Go：真实 SDK、真实密钥、provider refund request、refund query API、workflow execution、refund success state mutation、settlement、commission、payout、permission weakening、fulfillment 或 logistics mutation。

## Round 339 更新

- `refund-provider-inbox-route-disposable-db`: done，见 `docs/refund-provider-inbox-route-disposable-db.md`。
- Provider refund inbox route 已支持 development/local/disposable DB/fixture-only wiring；未通过 config / DB gate 时仍不读取 body。
- 新增 provider route local DB resolver，复用 `createLocalRefundInboxPostgresClient()` 和 `DbRefundInboxRepository`，并校验当前 Medusa PG connection 的 DB name、host 和 port。
- 本轮不连接预发/生产 DB、不注册 module、不接 SDK、不写真实密钥、不调用 provider refund API / query API、不执行 workflow、不写 refund success state。
- 验证通过：focused tests 8 suites / 60 tests、API typecheck、payment harness 42 suites / 323 tests、payment DB dry-run `2|9`、refund real-adapter rehearsal `1|9`、runtime grep、`git diff --check` 和子智能体只读复核 No Findings。
- 下一步建议进入 `refund-provider-inbox-route-disposable-db-validation`。
- 仍 No-Go：settlement、commission、payout、permission weakening、fulfillment 或 logistics mutation。

## Round 340 更新

- `refund-provider-inbox-route-disposable-db-validation`: done，见 `docs/refund-provider-inbox-route-disposable-db-validation.md`。
- PR #386 合并后验证通过：合并提交 `2386086b19fd6ff541d551018d041f12c84a76d7` 文件范围符合预期，focused tests 8 suites / 60 tests 通过。
- 当前 provider route 仍只支持 development/local/disposable DB/fixture-only inbox rehearsal；未通过 gate 不读取 body。
- 当前仍无 `apps/**` 改动，无 module registration，无 SDK / 真实密钥 / provider refund request / provider refund query / workflow / refund success state / settlement / commission / payout / permission / fulfillment / logistics mutation。
- 下一步建议进入 `refund-state-owner-handoff-plan`，先 docs-only 规划退款状态 owner 和 workflow handoff。

## Round 341 更新

- `refund-state-owner-handoff-plan`: done，见 `docs/refund-state-owner-handoff-plan.md`。
- 本轮只做 docs-only handoff 规划，不修改 `apps/**` 或 `packages/**` runtime。
- 计划将 provider notification inbox、manual review、platform refund state owner、workflow command adapter 和 reconciliation 分层，明确 route 不得直接写退款成功状态。
- 下一步建议进入 `refund-state-owner-handoff-contract`，只实现纯函数合同和不可执行 decision。
- 仍 No-Go：真实 SDK、真实密钥、provider refund request、refund query API、workflow execution、refund success state mutation、settlement、commission、payout、permission weakening、fulfillment 或 logistics mutation。

## Round 342 更新

- `refund-state-owner-handoff-contract`: done，见 `docs/refund-state-owner-handoff-contract.md`。
- 新增 `evaluateRefundStateOwnerHandoffContract()` 纯函数和 focused tests，输出始终 `executable: false`、`runtimeMutationBlocked: true`、`refundSuccessState: false`。
- 合同只准备 `refund_state_shadow` DTO，不执行 workflow、不写平台退款成功状态。
- 验证通过：focused test 1 suite / 8 tests、API typecheck、payment harness 43 suites / 331 tests、payment DB dry-run `2|9`、runtime grep、`git diff --check` 和子智能体只读复核 No Findings。
- 仍 No-Go：provider refund request、refund query API、settlement、commission、payout、permission weakening、fulfillment 或 logistics mutation。

## Round 343 更新

- `refund-state-owner-handoff-validation`: done，见 `docs/refund-state-owner-handoff-validation.md`。
- PR #389 合并后验证通过：合并提交 `7f9fa473c4e0c29943f1638869e46d1cf1101e59` 文件范围符合预期，focused test 1 suite / 8 tests 通过。
- 当前 handoff contract 仍只输出不可执行 decision / shadow DTO，不执行 workflow、不写 refund success state。
- 下一步建议进入 `refund-workflow-shadow-command-plan`。
- 仍 No-Go：provider refund request、refund query API、settlement、commission、payout、permission weakening、fulfillment 或 logistics mutation。

## Round 344 更新

- `refund-workflow-shadow-command-plan`: done，见 `docs/refund-workflow-shadow-command-plan.md`。
- 本轮只做 docs-only planning，不修改 `apps/**` 或 `packages/**` runtime。
- 计划明确 `refund-workflow-shadow-command-contract` 只能把 handoff decision 映射为不可执行 shadow command DTO / audit event。
- 下一步建议进入 `refund-workflow-shadow-command-contract`，仍不得执行 workflow 或写退款成功状态。
- 仍 No-Go：provider refund request、refund query API、settlement、commission、payout、permission weakening、fulfillment 或 logistics mutation。

## Round 345 更新

- `refund-workflow-shadow-command-contract`: done，见 `docs/refund-workflow-shadow-command-contract.md`。
- 新增 `mapRefundHandoffToWorkflowShadowCommand()` 纯函数和 focused tests，输出始终 `executable: false`、`workflowExecutionAllowed: false`、`runtimeMutationBlocked: true`、`refundSuccessState: false`。
- 合同只准备 `refund_workflow_shadow` DTO 和 audit event，不执行 workflow、不写平台退款成功状态。
- 验证通过：focused test 1 suite / 5 tests、API typecheck、payment harness 44 suites / 336 tests、payment DB dry-run `2|9`、runtime grep、`git diff --check` 和子智能体只读复核 No Findings。
- 仍 No-Go：provider refund request、refund query API、settlement、commission、payout、permission weakening、fulfillment 或 logistics mutation。

## Round 346 更新

- `refund-workflow-shadow-command-validation`: done，见 `docs/refund-workflow-shadow-command-validation.md`。
- PR #392 已合并，merge commit `e77c8c50a515b56250af1a8eb2973b9fce595fe7`。
- 合并后 focused shadow command test 1 suite / 5 tests 通过；文件范围符合预期。
- 当前 shadow command contract 仍只输出不可执行 DTO / audit event，不执行 workflow、不写 refund success state。
- 下一步建议进入 `refund-provider-query-follow-up-plan`，先 docs-only 规划 query follow-up owner 和边界。
- 仍 No-Go：provider refund request、refund query API runtime、settlement、commission、payout、permission weakening、fulfillment 或 logistics mutation。

## Round 347 更新

- `refund-provider-query-follow-up-plan`: done，见 `docs/refund-provider-query-follow-up-plan.md`。
- 本轮只做 docs-only provider query follow-up 规划，不修改 `apps/**` 或 `packages/**` runtime。
- 计划新增 future owner `RefundProviderQueryFollowUpOwner`，第一版仍输出 `providerQueryAllowed=false`、`runtimeMutationBlocked=true`、`refundSuccessState=false`。
- 明确 provider inbox route、state owner handoff 和 workflow shadow command 不得直接调用 provider query API。
- 下一步建议进入 `refund-provider-query-follow-up-contract`，只能新增纯函数合同和 focused tests。
- 仍 No-Go：真实 provider refund request/query、workflow execution、refund success state mutation、settlement、commission、payout、permission weakening、fulfillment 或 logistics mutation。

## Round 348 更新

- `refund-provider-query-follow-up-contract`: done，见 `docs/refund-provider-query-follow-up-contract.md`。
- 新增 `planRefundProviderQueryFollowUp()` 纯函数和 focused tests，输出始终 `executable=false`、`providerQueryAllowed=false`、`runtimeMutationBlocked=true`、`refundSuccessState=false`。
- 合同只准备 `provider_refund_query_shadow` DTO 和 audit event，不调用微信支付 / 支付宝 query API。
- 验证通过：focused test 1 suite / 6 tests、API typecheck、payment harness 45 suites / 342 tests、payment DB dry-run `2|9`、runtime grep、`git diff --check` 和子智能体只读复核 No Findings。
- 仍 No-Go：provider refund request/query runtime、workflow execution、refund success state mutation、settlement、commission、payout、permission weakening、fulfillment 或 logistics mutation。

## Round 349 更新

- `refund-provider-query-follow-up-validation`: done，见 `docs/refund-provider-query-follow-up-validation.md`。
- PR #395 已合并，merge commit `0e30a593c29cb33144e0f96b88e4b6f61b373235`。
- 合并后 focused query follow-up test 1 suite / 6 tests 通过；文件范围符合预期。
- 当前 query follow-up contract 仍只输出不可执行 shadow DTO / audit event，不调用 provider query API、不写 refund success state。
- 下一步建议进入 `refund-provider-query-reconciliation-plan`，先 docs-only 规划 query snapshot 到 reconciliation / manual review 的边界。
- 仍 No-Go：真实 provider refund request/query、workflow execution、refund success state mutation、settlement、commission、payout、permission weakening、fulfillment 或 logistics mutation。

## Round 350 更新

- `refund-provider-query-reconciliation-plan`: done，见 `docs/refund-provider-query-reconciliation-plan.md`。
- 本轮只做 docs-only provider query snapshot reconciliation 规划，不修改 `apps/**` 或 `packages/**` runtime。
- 计划新增 future owner `RefundProviderQueryReconciliationOwner`，第一版只输出不可执行 reconciliation decision / manual review handoff。
- 明确 query snapshot 不能直接写 refund success state、执行 workflow、触发财务/权限/履约/物流 mutation。
- 下一步建议进入 `refund-provider-query-reconciliation-contract`，只能新增纯函数合同和 focused tests。
- 仍 No-Go：真实 provider refund request/query、workflow execution、refund success state mutation、settlement、commission、payout、permission weakening、fulfillment 或 logistics mutation。

## Round 351 更新

- `refund-provider-query-reconciliation-contract`: done，见 `docs/refund-provider-query-reconciliation-contract.md`。
- 新增 `planRefundProviderQueryReconciliation()` 纯函数和 focused tests，输出始终 `executable=false`、`workflowExecutionAllowed=false`、`runtimeMutationBlocked=true`、`refundSuccessState=false`。
- 合同只准备 reconciliation decision / manual review handoff，不调用 provider query API、不写退款成功状态。
- 验证通过：focused test 1 suite / 6 tests、API typecheck、payment harness 46 suites / 348 tests、payment DB dry-run `2|9`、runtime grep 和 `git diff --check`；子智能体复核工具等待超时，下一轮 validation 继续记录文件范围和安全边界。
- 仍 No-Go：真实 provider refund request/query、workflow execution、refund success state mutation、settlement、commission、payout、permission weakening、fulfillment 或 logistics mutation。

## Round 352 更新

- `refund-provider-query-reconciliation-validation`: done，见 `docs/refund-provider-query-reconciliation-validation.md`。
- PR #398 已合并，merge commit `20f02e9221dc4f4492366c0aa696ed0e1a9726b3`。
- 合并后 focused reconciliation test 1 suite / 6 tests 通过；文件范围符合预期。
- 当前 reconciliation contract 仍只输出不可执行 decision / manual review handoff，不调用 provider query API、不写 refund success state。
- 下一步建议进入 `refund-provider-query-local-fixture-contract`，如需 fixtures 只能使用 redacted fake vectors。
- 仍 No-Go：真实 provider refund request/query、workflow execution、refund success state mutation、settlement、commission、payout、permission weakening、fulfillment 或 logistics mutation。

## Round 353 更新

- `refund-provider-query-local-fixture-contract`: done，见 `docs/refund-provider-query-local-fixture-contract.md`。
- 新增 redacted fake provider query snapshot vectors，覆盖 WeChat succeeded、Alipay processing 和 Alipay mismatch。
- Fixtures 固定 `fixtureOnly=true`、`executable=false`、`networkRequestAllowed=false`、`providerQueryAllowed=false`、`runtimeMutationBlocked=true`、`refundSuccessState=false`。
- 验证通过：focused test 1 suite / 3 tests、API typecheck、payment harness 47 suites / 351 tests、payment DB dry-run `2|9`、runtime grep 和 `git diff --check`；子智能体复核工具等待超时，下一轮 validation 继续记录文件范围和安全边界。
- 仍 No-Go：真实 provider refund request/query、workflow execution、refund success state mutation、settlement、commission、payout、permission weakening、fulfillment 或 logistics mutation。

## Round 354 更新

- `refund-provider-query-local-fixture-validation`: done，见 `docs/refund-provider-query-local-fixture-validation.md`。
- PR #400 已合并，merge commit `36b950c0aea958739998296d2d9bc894910be09d`。
- 合并后 focused local fixture test 1 suite / 3 tests 通过；文件范围符合预期；子智能体只读复核 No Findings。
- 当前 fixtures 仍只是 redacted fake vectors，不发网络请求、不调用 provider query API、不写 refund success state。
- 下一步建议进入 `refund-state-mutation-readiness-plan`，只能先规划状态写入 readiness，不直接实现。
- 仍 No-Go：真实 provider refund request/query、workflow execution、refund success state mutation、settlement、commission、payout、permission weakening、fulfillment 或 logistics mutation。

## Round 355 更新

- `refund-state-mutation-readiness-plan`: done，见 `docs/refund-state-mutation-readiness-plan.md`。
- 本轮只做 docs-only readiness / Go-No-Go 规划，不修改 `apps/**` 或 `packages/**` runtime。
- 结论仍是 No-Go to real refund state mutation；已有 inbox / handoff / shadow command / query / reconciliation / fixtures 都仍是不可执行输入。
- 下一步建议进入 `refund-state-mutation-readiness-contract`，只能新增纯函数合同和 focused tests，输出仍保持 `stateMutationAllowed=false`。
- 仍 No-Go：真实 provider refund request/query、workflow execution、refund success state mutation、settlement、commission、payout、permission weakening、fulfillment 或 logistics mutation。

## Round 356 更新

- `refund-state-mutation-readiness-contract`: done，见 `docs/refund-state-mutation-readiness-contract.md`。
- 新增 `evaluateRefundStateMutationReadiness()` 纯函数和 focused tests，输出始终 `executable=false`、`workflowExecutionAllowed=false`、`stateMutationAllowed=false`、`runtimeMutationBlocked=true`、`refundSuccessState=false`。
- 合同只准备 readiness decision / shadow DTO，不执行 workflow、不写退款成功状态。
- 验证通过：focused test 1 suite / 6 tests、API typecheck、payment harness 48 suites / 357 tests、payment DB dry-run `2|9`、runtime grep 和 `git diff --check`；子智能体复核工具等待超时，下一轮 validation 继续记录文件范围和安全边界。
- 仍 No-Go：真实 provider refund request/query、workflow execution、refund success state mutation、settlement、commission、payout、permission weakening、fulfillment 或 logistics mutation。

## Round 357 更新

- `refund-state-mutation-readiness-validation`: done，见 `docs/refund-state-mutation-readiness-validation.md`。
- PR #403 已合并，merge commit `d2f09dd14bf2bea1ee36b68542bf77356ffc2673`。
- 合并后 focused readiness test 1 suite / 6 tests 通过；子智能体指出 rollback gate 覆盖不足后，本轮补充测试并验证 focused readiness test 1 suite / 8 tests、API typecheck、payment harness 48 suites / 359 tests、payment DB dry-run `2|9` 和 `git diff --check` 通过。
- 当前 readiness contract 仍只输出不可执行 decision / shadow DTO，不执行 workflow、不写 refund success state。
- 下一步建议进入 `refund-state-mutation-shadow-command-plan`，只能规划 shadow-only command。
- 仍 No-Go：真实 provider refund request/query、workflow execution、refund success state mutation、settlement、commission、payout、permission weakening、fulfillment 或 logistics mutation。

## Round 358 更新

- `refund-state-mutation-shadow-command-plan`: done，见 `docs/refund-state-mutation-shadow-command-plan.md`。
- 本轮只做 docs-only shadow command 规划，不修改 `apps/**` 或 `packages/**` runtime。
- 计划要求 shadow command 继续固定 `workflowExecutionAllowed=false`、`stateMutationAllowed=false`、`runtimeMutationBlocked=true`、`refundSuccessState=false`。
- `targetState` 只是审计标签，不得映射为平台真实 refund state。
- 下一步建议进入 `refund-state-mutation-shadow-command-contract`，只能新增纯函数合同和 focused tests。
- 仍 No-Go：真实 provider refund request/query、workflow execution、refund success state mutation、settlement、commission、payout、permission weakening、fulfillment 或 logistics mutation。

## Round 359 更新

- `refund-state-mutation-shadow-command-contract`: done，见 `docs/refund-state-mutation-shadow-command-contract.md`。
- 新增 `mapRefundReadinessToStateMutationShadowCommand()` 纯函数和 focused tests，输出始终 `executable=false`、`workflowExecutionAllowed=false`、`stateMutationAllowed=false`、`runtimeMutationBlocked=true`、`refundSuccessState=false`。
- 合同只准备 state shadow command / audit event，不执行 workflow、不写退款成功状态；`targetState` 只作为审计标签。
- 验证通过：focused test 1 suite / 5 tests、API typecheck、payment harness 49 suites / 364 tests、payment DB dry-run `2|9`、runtime grep 和 `git diff --check`；子智能体指出 audit metadata safety flag denylist 不足后已补充并重跑验证，二次复核 No Findings。
- 仍 No-Go：真实 provider refund request/query、workflow execution、refund success state mutation、settlement、commission、payout、permission weakening、fulfillment 或 logistics mutation。

## Round 360 更新

- `refund-state-mutation-shadow-command-validation`: done，见 `docs/refund-state-mutation-shadow-command-validation.md`。
- PR #406 已合并，merge commit `e57ba75879ca4405953ea8ebec1ed9ad889e3bc6`。
- 合并后 focused shadow command test 1 suite / 5 tests、API typecheck、payment harness 49 suites / 364 tests、payment DB dry-run `2|9`、runtime grep 和 `git diff --check` 通过；子智能体复核 No Findings。
- 当前 shadow command contract 仍只输出不可执行 state shadow command / audit event，不执行 workflow、不写 refund success state。
- 下一步建议进入 `refund-state-mutation-operator-approval-plan`，只能规划 operator approval / permission / audit gate。
- 仍 No-Go：真实 provider refund request/query、workflow execution、refund success state mutation、settlement、commission、payout、permission weakening、fulfillment 或 logistics mutation。

## Round 361 更新

- `refund-state-mutation-operator-approval-plan`: done，见 `docs/refund-state-mutation-operator-approval-plan.md`。
- 本轮只规划退款状态写入前 operator approval / permission / audit gate，不修改 `apps/**` 或 `packages/**` runtime。
- 计划要求 operator approval 第一版仍输出 `executable=false`、`workflowExecutionAllowed=false`、`stateMutationAllowed=false`、`runtimeMutationBlocked=true`、`refundSuccessState=false`。
- 明确 system job 只能生成 candidate，vendor 不能批准平台退款状态写入，reviewer 不能与发起 actor 相同。
- 验证通过：`git diff --check`、无 `apps/**` 或 `packages/**` runtime diff；子智能体复核 No Findings。
- 下一步建议进入 `refund-state-mutation-operator-approval-contract`，只能新增不可执行纯函数合同和 focused tests。
- 仍 No-Go：真实 provider refund request/query、workflow execution、refund success state mutation、settlement、commission、payout、permission weakening、fulfillment 或 logistics mutation。

## Round 362 更新

- `refund-state-mutation-operator-approval-contract`: done，见 `docs/refund-state-mutation-operator-approval-contract.md`。
- 新增 `mapRefundShadowCommandToOperatorApproval()` 纯函数和 focused tests，输出始终 `executable=false`、`workflowExecutionAllowed=false`、`stateMutationAllowed=false`、`runtimeMutationBlocked=true`、`refundSuccessState=false`。
- 合同只准备 operator approval candidate / audit event，不执行 workflow、不写退款成功状态；`operatorApprovalRecorded=true` 仅代表不可执行审批候选已记录。
- 验证通过：focused test 1 suite / 6 tests、API typecheck、payment harness 50 suites / 370 tests、payment DB dry-run `2|9`、runtime grep 和 `git diff --check`；子智能体指出 generic provider / finance metadata alias denylist 不足后已补充并重跑验证，二次复核 No Findings。
- 仍 No-Go：真实 provider refund request/query、workflow execution、refund success state mutation、settlement、commission、payout、permission weakening、fulfillment 或 logistics mutation。

## Round 363 更新

- `refund-state-mutation-operator-approval-validation`: done，见 `docs/refund-state-mutation-operator-approval-validation.md`。
- PR #409 已合并，merge commit `4b5bcdc367396b202ec590c884cb52fd5a9ede7a`。
- 合并后 focused operator approval test 1 suite / 6 tests、API typecheck、payment harness 50 suites / 370 tests、payment DB dry-run `2|9`、runtime grep 和 `git diff --check` 通过；子智能体复核 No Findings。
- 当前 operator approval contract 仍只输出不可执行 approval candidate / audit event，不执行 workflow、不写 refund success state。
- 下一步建议进入 `refund-state-mutation-runtime-readiness-validation`，真实 runtime 前再次 Go / No-Go。
- 仍 No-Go：真实 provider refund request/query、workflow execution、refund success state mutation、settlement、commission、payout、permission weakening、fulfillment 或 logistics mutation。

## Round 364 更新

- `refund-state-mutation-runtime-readiness-validation`: done，见 `docs/refund-state-mutation-runtime-readiness-validation.md`。
- 结论：真实 refund success state mutation 仍 No-Go；当前只允许进入 runtime adapter 规划。
- 合同层验证通过：readiness / shadow command / operator approval focused tests 3 suites / 19 tests、API typecheck、payment harness 50 suites / 370 tests、payment DB dry-run `2|9`、runtime grep 和 `git diff --check`；子智能体复核 No Findings。
- No-Go 原因：没有 executable runtime owner、未接 workflow、未定义生产/预发 DB approval write path、未批准 settlement / commission / payout / fulfillment / logistics side-effect contract。
- 下一步建议进入 `refund-state-mutation-runtime-adapter-plan`，只能规划 runtime adapter 边界。
- 仍 No-Go：真实 provider refund request/query、workflow execution、refund success state mutation、settlement、commission、payout、permission weakening、fulfillment 或 logistics mutation。

## Round 365 更新

- `refund-state-mutation-runtime-adapter-plan`: done，见 `docs/refund-state-mutation-runtime-adapter-plan.md`。
- 本轮只规划 future runtime adapter 边界，不修改 `apps/**` 或 `packages/**` runtime。
- 第一版 adapter contract 必须固定 disabled / non-executable：`enabled=false`、`workflowExecutionAllowed=false`、`stateMutationAllowed=false`、`runtimeMutationBlocked=true`、`refundSuccessState=false`。
- 明确 adapter 只能接收 operator approval candidate，不能让 provider inbox / query 直接输入。
- 验证通过：`git diff --check`、无 `apps/**` 或 `packages/**` runtime diff；子智能体复核 No Findings。
- 下一步建议进入 `refund-state-mutation-runtime-adapter-contract`，只能新增 disabled / non-executable adapter contract 和 focused tests。
- 仍 No-Go：真实 provider refund request/query、workflow execution、refund success state mutation、settlement、commission、payout、permission weakening、fulfillment 或 logistics mutation。

## Round 366 更新

- `refund-state-mutation-runtime-adapter-contract`: done，见 `docs/refund-state-mutation-runtime-adapter-contract.md`。
- 新增 `mapOperatorApprovalToRuntimeAdapterDecision()` 纯函数和 focused tests，输出始终 `enabled=false`、`environmentAllowed=false`、`executable=false`、`workflowExecutionAllowed=false`、`stateMutationAllowed=false`、`runtimeMutationBlocked=true`、`refundSuccessState=false`。
- 合同只准备 disabled adapter decision / audit event，不执行 workflow、不写退款成功状态。
- 验证通过：focused test 1 suite / 4 tests、API typecheck、payment harness 51 suites / 374 tests、payment DB dry-run `2|9`、runtime grep；子智能体复核 No Findings。`git diff --check` 在 PR 收口前运行。
- 仍 No-Go：真实 provider refund request/query、workflow execution、refund success state mutation、settlement、commission、payout、permission weakening、fulfillment 或 logistics mutation。

## Round 367 更新

- `refund-state-mutation-runtime-adapter-validation`: done，见 `docs/refund-state-mutation-runtime-adapter-validation.md`。
- PR #413 已合并，merge commit `7852b6c6d16b8db96c6b61fecdf868060ca36e69`。
- 合并后 focused runtime adapter test 1 suite / 4 tests、API typecheck、payment harness 51 suites / 374 tests、payment DB dry-run `2|9`、runtime grep 和 `git diff --check` 通过；子智能体复核 No Findings。
- 当前 runtime adapter contract 仍 disabled / non-executable，不执行 workflow、不写 refund success state。
- 下一步建议进入 `refund-state-mutation-audit-write-plan`，只能规划 audit write local-only / disabled 边界。
- 仍 No-Go：真实 provider refund request/query、workflow execution、refund success state mutation、settlement、commission、payout、permission weakening、fulfillment 或 logistics mutation。

## Round 368 更新

- `refund-state-mutation-audit-write-plan`: done，见 `docs/refund-state-mutation-audit-write-plan.md`。
- 本轮只规划 operator approval candidate 到 audit write 的 local-only / disabled 边界，不修改 `apps/**` 或 `packages/**` runtime。
- 第一版 audit write contract 必须固定 `auditWriteAllowed=false`、`dbWriteAllowed=false`、`workflowExecutionAllowed=false`、`stateMutationAllowed=false`、`runtimeMutationBlocked=true`、`refundSuccessState=false`。
- 明确下一步只能产生 audit write intent，不新增 migration、不连接真实 DB、不执行 workflow、不写 refund success state。
- 验证通过：`git diff --check`、无 `apps/**` 或 `packages/**` runtime diff；子智能体复核 No Findings。
- 下一步建议进入 `refund-state-mutation-audit-write-contract`，只能新增不可执行 audit write intent 纯函数和 focused tests。
- 仍 No-Go：真实 provider refund request/query、workflow execution、refund success state mutation、settlement、commission、payout、permission weakening、fulfillment 或 logistics mutation。

## Round 369 更新

- `refund-state-mutation-audit-write-contract`: done，见 `docs/refund-state-mutation-audit-write-contract.md`。
- 新增 `mapRuntimeAdapterToAuditWriteIntent()` 纯函数和 focused tests，输出始终 `auditWriteAllowed=false`、`dbWriteAllowed=false`、`executable=false`、`workflowExecutionAllowed=false`、`stateMutationAllowed=false`、`runtimeMutationBlocked=true`、`refundSuccessState=false`。
- 合同只准备 disabled audit write intent / audit event，不写 DB、不执行 workflow、不写退款成功状态。
- 验证通过：focused test 1 suite / 4 tests、API typecheck、payment harness 52 suites / 378 tests、payment DB dry-run `2|9`、runtime grep；子智能体指出 metadata secret / DB alias denylist 与 generated audit field override 风险后已修复并重跑验证，二次复核 No Findings。`git diff --check` 在 PR 收口前运行。
- 仍 No-Go：真实 provider refund request/query、workflow execution、refund success state mutation、settlement、commission、payout、permission weakening、fulfillment 或 logistics mutation。

## Round 370 更新

- `refund-state-mutation-audit-write-validation`: done，见 `docs/refund-state-mutation-audit-write-validation.md`。
- PR #416 已合并，merge commit `e29279519df9694f253f84f95ac1d1440f515353`。
- 合并后 focused audit write test 1 suite / 4 tests、API typecheck、payment harness 52 suites / 378 tests、payment DB dry-run `2|9` 和 runtime grep 通过；runtime grep 唯一命中为 sanitizer denylist 字符串 `"executeWorkflow"`，不是调用点。
- 当前 audit write contract 仍 disabled / non-executable，不写 DB、不执行 workflow、不写 refund success state。
- 下一步建议进入 `refund-state-mutation-workflow-adapter-plan`，只能规划 workflow adapter 边界。
- 仍 No-Go：真实 provider refund request/query、workflow execution、refund success state mutation、settlement、commission、payout、permission weakening、fulfillment 或 logistics mutation。

## Round 371 更新

- `refund-state-mutation-workflow-adapter-plan`: done，见 `docs/refund-state-mutation-workflow-adapter-plan.md`。
- 本轮只规划 audit write intent 到 refund workflow command adapter 的边界，不修改 `apps/**` 或 `packages/**` runtime。
- 第一版 workflow adapter contract 必须固定不可执行：`adapterEnabled=false`、`workflowDryRunOnly=true`、`workflowExecutionAllowed=false`、`stateMutationAllowed=false`、`runtimeMutationBlocked=true`、`refundSuccessState=false`。
- 明确 workflow adapter 只能接收 audit write intent，不能让 provider inbox / query / route 直接输入。
- 验证通过：`git diff --check`、无 `apps/**` 或 `packages/**` runtime diff。子智能体复核在 PR 收口前运行。
- 下一步建议进入 `refund-state-mutation-workflow-adapter-contract`，只能新增不可执行纯函数合同和 focused tests。
- 仍 No-Go：真实 provider refund request/query、workflow execution、refund success state mutation、settlement、commission、payout、permission weakening、fulfillment 或 logistics mutation。

## Round 372 更新

- `refund-state-mutation-workflow-adapter-contract`: done，见 `docs/refund-state-mutation-workflow-adapter-contract.md`。
- 新增 `mapAuditWriteIntentToWorkflowAdapterCommand()` 纯函数和 focused tests，输出始终 `adapterEnabled=false`、`environmentAllowed=false`、`executable=false`、`workflowDryRunOnly=true`、`workflowExecutionAllowed=false`、`stateMutationAllowed=false`、`runtimeMutationBlocked=true`、`refundSuccessState=false`。
- 合同只准备 disabled workflow adapter command candidate / audit event，不执行 workflow、不写退款成功状态。
- 验证通过：focused test 1 suite / 4 tests、API typecheck、payment harness 53 suites / 382 tests、payment DB dry-run `2|9`、runtime grep；runtime grep 唯一命中为 sanitizer denylist 字符串 `"executeWorkflow"`，不是调用点。`git diff --check` 在 PR 收口前运行。
- 仍 No-Go：真实 provider refund request/query、workflow execution、refund success state mutation、settlement、commission、payout、permission weakening、fulfillment 或 logistics mutation。

## Round 373 更新

- `refund-state-mutation-workflow-adapter-validation`: done，见 `docs/refund-state-mutation-workflow-adapter-validation.md`。
- PR #419 已合并，merge commit `0806a098f7aafa6188e83d610a817762f8fcf35f`。
- 合并后 focused workflow adapter test 1 suite / 4 tests、API typecheck、payment harness 53 suites / 382 tests、payment DB dry-run `2|9` 和 runtime grep 通过；runtime grep 唯一命中为 sanitizer denylist 字符串 `"executeWorkflow"`，不是调用点。
- 当前 workflow adapter contract 仍 disabled / non-executable，不执行 workflow、不写 refund success state。
- 下一步建议进入 `refund-state-mutation-preprod-dry-run-plan`，只能规划一次性预发 dry-run gate。
- 仍 No-Go：真实 provider refund request/query、workflow execution、refund success state mutation、settlement、commission、payout、permission weakening、fulfillment 或 logistics mutation。

## Round 374 更新

- `refund-state-mutation-preprod-dry-run-plan`: done，见 `docs/refund-state-mutation-preprod-dry-run-plan.md`。
- 本轮只规划真实执行前的一次性预发 dry-run gate，不修改 `apps/**` 或 `packages/**` runtime。
- 第一版 preprod dry-run contract 必须固定不可执行：`preprodDryRunEnabled=false`、`productionExecutionAllowed=false`、`workflowDryRunOnly=true`、`workflowExecutionAllowed=false`、`stateMutationAllowed=false`、`runtimeMutationBlocked=true`、`refundSuccessState=false`。
- 明确 dry-run 不能连接生产 DB、生产 provider、生产 webhook 或生产密钥；dry-run 完成也不能触发财务/权限/履约/物流链路。
- 验证通过：`git diff --check`、无 `apps/**` 或 `packages/**` runtime diff。
- 下一步建议进入 `refund-state-mutation-preprod-dry-run-contract`，只能新增不可执行纯函数合同和 focused tests。
- 仍 No-Go：真实 provider refund request/query、production workflow execution、refund success state mutation、settlement、commission、payout、permission weakening、fulfillment 或 logistics mutation。

## Round 375 更新

- `refund-state-mutation-preprod-dry-run-contract`: done，见 `docs/refund-state-mutation-preprod-dry-run-contract.md`。
- 新增 `mapWorkflowAdapterCommandToPreprodDryRun()` 纯函数和 focused tests，输出始终 `preprodDryRunEnabled=false`、`productionExecutionAllowed=false`、`executable=false`、`workflowDryRunOnly=true`、`workflowExecutionAllowed=false`、`stateMutationAllowed=false`、`runtimeMutationBlocked=true`、`refundSuccessState=false`。
- 合同只准备 disabled preprod dry-run request / audit event，不执行生产 workflow、不写生产退款成功状态。
- 验证通过：focused test 1 suite / 4 tests、API typecheck、payment harness 54 suites / 386 tests、payment DB dry-run `2|9`、runtime grep；runtime grep 唯一命中为 sanitizer denylist 字符串 `"executeWorkflow"`，不是调用点。`git diff --check` 在 PR 收口前运行。
- 仍 No-Go：真实 provider refund request/query、production workflow execution、refund success state mutation、settlement、commission、payout、permission weakening、fulfillment 或 logistics mutation。

## Round 376 更新

- `refund-state-mutation-preprod-dry-run-validation`: done，见 `docs/refund-state-mutation-preprod-dry-run-validation.md`。
- PR #422 已合并，merge commit `df60ff0c83f5273861532bbc1d230d47a9b0016b`。
- 合并后 focused preprod dry-run test 1 suite / 4 tests、API typecheck、payment harness 54 suites / 386 tests、payment DB dry-run `2|9` 和 runtime grep 通过；runtime grep 唯一命中为 sanitizer denylist 字符串 `"executeWorkflow"`，不是调用点。
- 当前 preprod dry-run contract 仍 disabled / non-executable，不执行生产 workflow、不写生产 refund success state。
- 下一步建议进入 `refund-state-mutation-final-go-no-go-plan`，只能做真实状态写入前最终 Go / No-Go 清单。
- 仍 No-Go：真实 provider refund request/query、production workflow execution、refund success state mutation、settlement、commission、payout、permission weakening、fulfillment 或 logistics mutation。

## Round 377 更新

- `refund-state-mutation-final-go-no-go-plan`: done，见 `docs/refund-state-mutation-final-go-no-go-plan.md`。
- 本轮只整理真实退款状态写入前最终 Go / No-Go 清单，不修改 `apps/**` 或 `packages/**` runtime。
- 结论仍 No-Go：现有链路均为 disabled / non-executable 合同链，不能视作上线可执行许可。
- 清单要求真实生产执行前补齐 production feature flag、provider evidence、operator approval persistence、audit write persistence、workflow idempotency / retry / replay、terminal state conflict guard、rollback runbook 和人工复核入口。
- 验证通过：`git diff --check`、无 `apps/**` 或 `packages/**` runtime diff。
- 下一步建议进入 `refund-state-mutation-final-go-no-go-validation`。
- 仍 No-Go：真实 provider refund request/query、production workflow execution、refund success state mutation、settlement、commission、payout、permission weakening、fulfillment 或 logistics mutation。

## Round 378 更新

- `refund-state-mutation-final-go-no-go-validation`: done，见 `docs/refund-state-mutation-final-go-no-go-validation.md`。
- PR #424 已合并，merge commit `c2e46500f78514d077616c3e1606d4b5bcc8c86c`。
- 合并后文件范围验证通过，且无 `apps/**` 或 `packages/**` runtime diff；`git diff --check` 通过。
- 当前最终清单结论仍 No-Go：现有链路均为 disabled / non-executable 合同链，不能视作上线可执行许可。
- 下一步建议进入 `refund-state-mutation-persistence-gap-plan`，只能规划生产持久化差距。
- 仍 No-Go：真实 provider refund request/query、production workflow execution、refund success state mutation、settlement、commission、payout、permission weakening、fulfillment 或 logistics mutation。

## Round 379 更新

- `refund-state-mutation-persistence-gap-plan`: done，见 `docs/refund-state-mutation-persistence-gap-plan.md`。
- 本轮只规划 operator approval、audit write、runtime idempotency / replay / terminal conflict evidence 的生产持久化差距，不修改 `apps/**` 或 `packages/**` runtime。
- 明确生产前必须补齐 approval record、append-only audit log、workflow execution idempotency、retry state machine、duplicate no-op 和 terminal conflict lock。
- 验证通过：`git diff --check`、无 `apps/**` 或 `packages/**` runtime diff。
- 下一步建议进入 `refund-state-mutation-persistence-gap-validation`。
- 仍 No-Go：真实 provider refund request/query、production workflow execution、refund success state mutation、settlement、commission、payout、permission weakening、fulfillment 或 logistics mutation。

## Round 380 更新

- `refund-state-mutation-persistence-gap-validation`: done，见 `docs/refund-state-mutation-persistence-gap-validation.md`。
- PR #426 已合并，merge commit `1b3306979f64b8c8dc3c5879187b367f7b3bb06a`。
- 合并后文件范围验证通过，且无 `apps/**` 或 `packages/**` runtime diff；`git diff --check` 通过。
- 当前 persistence gap plan 仍 docs-only，不能视作上线可执行许可。
- 下一步建议进入 `refund-state-mutation-approval-persistence-plan`，只能规划 operator approval persistence。
- 仍 No-Go：真实 provider refund request/query、production workflow execution、refund success state mutation、settlement、commission、payout、permission weakening、fulfillment 或 logistics mutation。

## Round 381 更新

- `refund-state-mutation-approval-persistence-plan`: done，见 `docs/refund-state-mutation-approval-persistence-plan.md`。
- 本轮只规划 operator approval persistence，不修改 `apps/**` 或 `packages/**` runtime。
- 第一版 persistence contract 仍必须不可执行：`approvalWriteAllowed=false`、`dbWriteAllowed=false`、`productionWriteAllowed=false`、`workflowExecutionAllowed=false`、`stateMutationAllowed=false`、`refundSuccessState=false`。
- 明确 vendor actor 不能批准平台退款状态写入，reviewer 与发起 actor 不能相同，permission evidence 必须来自服务端可信来源。
- 验证通过：`git diff --check`、无 `apps/**` 或 `packages/**` runtime diff。
- 下一步建议进入 `refund-state-mutation-approval-persistence-validation`。
- 仍 No-Go：真实 provider refund request/query、production workflow execution、refund success state mutation、settlement、commission、payout、permission weakening、fulfillment 或 logistics mutation。

## Round 382 更新

- `refund-state-mutation-approval-persistence-validation`: done，见 `docs/refund-state-mutation-approval-persistence-validation.md`。
- PR #428 已合并，merge commit `ea0f489e867a9d9f114e3aa96b52084802510303`。
- 合并后文件范围验证通过，且无 `apps/**` 或 `packages/**` runtime diff；`git diff --check` 通过。
- 当前 approval persistence plan 仍 docs-only，不能视作上线可执行许可。
- 下一步建议进入 `refund-state-mutation-approval-persistence-contract`，只能新增不可执行纯函数合同和 focused tests。
- 仍 No-Go：真实 provider refund request/query、production workflow execution、refund success state mutation、settlement、commission、payout、permission weakening、fulfillment 或 logistics mutation。

## Round 383 更新

- `refund-state-mutation-approval-persistence-contract`: done，见 `docs/refund-state-mutation-approval-persistence-contract.md`。
- 新增 `mapOperatorApprovalToPersistenceIntent()` 纯函数和 focused tests，输出始终 `approvalWriteAllowed=false`、`dbWriteAllowed=false`、`productionWriteAllowed=false`、`workflowExecutionAllowed=false`、`stateMutationAllowed=false`、`runtimeMutationBlocked=true`、`refundSuccessState=false`。
- 合同只准备 disabled approval persistence intent / audit event，不连接生产 DB、不写 approval record。
- 验证通过：focused test 1 suite / 4 tests、API typecheck、payment harness 55 suites / 390 tests、payment DB dry-run `2|9`、runtime grep；runtime grep 唯一命中为 sanitizer denylist 字符串 `"executeWorkflow"`，不是调用点。`git diff --check` 在 PR 收口前运行。
- 仍 No-Go：真实 provider refund request/query、production workflow execution、refund success state mutation、settlement、commission、payout、permission weakening、fulfillment 或 logistics mutation。

## Round 384 更新

- `refund-state-mutation-approval-persistence-contract-validation`: done，见 `docs/refund-state-mutation-approval-persistence-contract-validation.md`。
- PR #430 已合并，merge commit `3ce14e780fd4b03550b9e8483c5fbce3262653ea`。
- 合并后 focused approval persistence test 1 suite / 4 tests、API typecheck、payment harness 55 suites / 390 tests、payment DB dry-run `2|9` 和 runtime grep 通过；runtime grep 唯一命中为 sanitizer denylist 字符串 `"executeWorkflow"`，不是调用点。
- 当前 approval persistence contract 仍 disabled / non-executable，不连接生产 DB、不写 approval record。
- 下一步建议进入 `refund-state-mutation-audit-persistence-plan`，只能规划 audit write persistence。
- 仍 No-Go：真实 provider refund request/query、production workflow execution、refund success state mutation、settlement、commission、payout、permission weakening、fulfillment 或 logistics mutation。

## Round 385 更新

- `refund-state-mutation-audit-persistence-plan`: done，见 `docs/refund-state-mutation-audit-persistence-plan.md`。
- 本轮只规划 audit write persistence，不修改 `apps/**` 或 `packages/**` runtime。
- 第一版 audit persistence contract 仍必须不可执行：`auditWriteAllowed=false`、`dbWriteAllowed=false`、`productionWriteAllowed=false`、`workflowExecutionAllowed=false`、`stateMutationAllowed=false`、`refundSuccessState=false`。
- 明确 audit write failure 必须 fail closed，audit metadata 不能覆盖 safety flags，provider route / query job 不能绕过 audit write 直接执行 workflow。
- 验证通过：`git diff --check`、无 `apps/**` 或 `packages/**` runtime diff。
- 下一步建议进入 `refund-state-mutation-audit-persistence-validation`。
- 仍 No-Go：真实 provider refund request/query、production workflow execution、refund success state mutation、settlement、commission、payout、permission weakening、fulfillment 或 logistics mutation。

## Round 386 更新

- `refund-state-mutation-audit-persistence-validation`: done，见 `docs/refund-state-mutation-audit-persistence-validation.md`。
- PR #432 已合并，merge commit `ac3cda1d0acb792cce828e30190d1144c1e5cedc`。
- 合并后文件范围验证通过，且无 `apps/**` 或 `packages/**` runtime diff；`git diff --check` 通过。
- 当前 audit persistence plan 仍 docs-only，不能视作上线可执行许可。
- 下一步建议进入 `refund-state-mutation-audit-persistence-contract`，只能新增不可执行纯函数合同和 focused tests。
- 仍 No-Go：真实 provider refund request/query、production workflow execution、refund success state mutation、settlement、commission、payout、permission weakening、fulfillment 或 logistics mutation。

## Round 387 更新

- `refund-state-mutation-audit-persistence-contract`: done，见 `docs/refund-state-mutation-audit-persistence-contract.md`。
- 新增 `mapApprovalPersistenceToAuditPersistenceIntent()` 纯函数和 focused tests，输出始终 `auditWriteAllowed=false`、`dbWriteAllowed=false`、`productionWriteAllowed=false`、`workflowExecutionAllowed=false`、`stateMutationAllowed=false`、`runtimeMutationBlocked=true`、`refundSuccessState=false`。
- 合同只准备 disabled audit persistence intent / audit event，不连接生产 DB、不写 audit log。
- 验证通过：focused test 1 suite / 4 tests、API typecheck、payment harness 56 suites / 394 tests、payment DB dry-run `2|9`、runtime grep 和 `git diff --check`；runtime grep 唯一命中为 sanitizer denylist 字符串 `"executeWorkflow"`，不是调用点。
- 仍 No-Go：真实 provider refund request/query、production workflow execution、refund success state mutation、settlement、commission、payout、permission weakening、fulfillment 或 logistics mutation。

## Round 388 更新

- `refund-state-mutation-audit-persistence-contract-validation`: done，见 `docs/refund-state-mutation-audit-persistence-contract-validation.md`。
- PR #434 已合并，merge commit `d74b40ca3e32a93ea95e03897ea312749dc40723`。
- 合并后 focused audit persistence test 1 suite / 4 tests、API typecheck、payment harness 56 suites / 394 tests、payment DB dry-run `2|9` 和 runtime grep 通过；runtime grep 唯一命中为 sanitizer denylist 字符串 `"executeWorkflow"`，不是调用点。
- 当前 audit persistence contract 仍 disabled / non-executable，不连接生产 DB、不写 audit log。
- 下一步建议进入 `refund-state-mutation-runtime-idempotency-plan`，只能规划 runtime idempotency / replay / terminal conflict evidence。
- 仍 No-Go：真实 provider refund request/query、production workflow execution、refund success state mutation、settlement、commission、payout、permission weakening、fulfillment 或 logistics mutation。

## Round 389 更新

- `refund-state-mutation-runtime-idempotency-plan`: done，见 `docs/refund-state-mutation-runtime-idempotency-plan.md`。
- 本轮只规划真实退款状态写入前 workflow execution idempotency key、provider evidence replay key、approval / audit / workflow cross-reference、execution attempt record、duplicate no-op rule、terminal conflict lock 和 retry-safe state machine。
- 未修改 `apps/**` 或 `packages/**` runtime；未新增 route、job、subscriber、migration；未连接生产 DB、不注册 module、不接 SDK、不写真实密钥。
- 验证通过：`git diff --check`、无 `apps/**` 或 `packages/**` runtime diff。
- 下一步建议进入 `refund-state-mutation-runtime-idempotency-validation`。
- 仍 No-Go：真实 provider refund request/query、production workflow execution、refund success state mutation、settlement、commission、payout、permission weakening、fulfillment 或 logistics mutation。

## Round 390 更新

- `refund-state-mutation-runtime-idempotency-validation`: done，见 `docs/refund-state-mutation-runtime-idempotency-validation.md`。
- PR #436 已合并，merge commit `772466c7533b217a06dd228e53a584b3af616b85`。
- 合并后文件范围验证通过，且无 `apps/**` 或 `packages/**` runtime diff；`git diff --check` 通过。
- 当前 runtime idempotency plan 仍 docs-only，不能视作生产 workflow execution 或 refund success state mutation 许可。
- 下一步建议进入 `refund-state-mutation-terminal-conflict-plan`。
- 仍 No-Go：真实 provider refund request/query、production workflow execution、refund success state mutation、settlement、commission、payout、permission weakening、fulfillment 或 logistics mutation。

## Round 391 更新

- `refund-state-mutation-terminal-conflict-plan`: done，见 `docs/refund-state-mutation-terminal-conflict-plan.md`。
- 本轮只规划 terminal conflict lock、evidence digest、duplicate no-op / replay result、terminal digest conflict、operator review 和 runtime boundaries。
- 未修改 `apps/**` 或 `packages/**` runtime；未新增 route、job、subscriber、migration；未连接生产 DB、不注册 module、不接 SDK、不写真实密钥。
- 验证通过：`git diff --check`、无 `apps/**` 或 `packages/**` runtime diff。
- 下一步建议进入 `refund-state-mutation-terminal-conflict-validation`。
- 仍 No-Go：真实 provider refund request/query、production workflow execution、refund success state mutation、settlement、commission、payout、permission weakening、fulfillment 或 logistics mutation。

## Round 392 更新

- `refund-state-mutation-terminal-conflict-validation`: done，见 `docs/refund-state-mutation-terminal-conflict-validation.md`。
- PR #438 已合并，merge commit `06639b976e8ab75dc0508fe07abcc5798aa59604`。
- 合并后文件范围验证通过，且无 `apps/**` 或 `packages/**` runtime diff；`git diff --check` 通过。
- 当前 terminal conflict plan 仍 docs-only，不能视作 terminal conflict lock 或 refund success state mutation 许可。
- 下一步建议进入 `refund-state-mutation-terminal-conflict-contract`，只能新增不可执行纯函数合同和 focused tests。
- 仍 No-Go：真实 provider refund request/query、production workflow execution、refund success state mutation、settlement、commission、payout、permission weakening、fulfillment 或 logistics mutation。

## Round 393 更新

- `refund-state-mutation-terminal-conflict-contract`: done，见 `docs/refund-state-mutation-terminal-conflict-contract.md`。
- 新增 `evaluateRefundStateMutationTerminalConflict()` 纯函数和 focused tests，输出始终 `lockWriteAllowed=false`、`dbWriteAllowed=false`、`productionWriteAllowed=false`、`workflowExecutionAllowed=false`、`stateMutationAllowed=false`、`runtimeMutationBlocked=true`、`refundSuccessState=false`。
- 合同只准备 disabled terminal conflict intent / audit event，不连接生产 DB、不写 terminal lock。
- 验证通过：focused test 1 suite / 5 tests、API typecheck、payment harness 57 suites / 399 tests、payment DB dry-run `2|9`、runtime grep 和 `git diff --check`；runtime grep 唯一命中为 sanitizer denylist 字符串 `"executeWorkflow"`，不是调用点。
- 仍 No-Go：真实 provider refund request/query、production workflow execution、refund success state mutation、settlement、commission、payout、permission weakening、fulfillment 或 logistics mutation。

## Round 394 更新

- `refund-state-mutation-terminal-conflict-contract-validation`: done，见 `docs/refund-state-mutation-terminal-conflict-contract-validation.md`。
- PR #440 已合并，merge commit `780e5039c992f101016976da605978f8f4fe562d`。
- 合并后 focused terminal conflict test 1 suite / 5 tests、API typecheck、payment harness 57 suites / 399 tests、payment DB dry-run `2|9` 和 runtime grep 通过；runtime grep 唯一命中为 sanitizer denylist 字符串 `"executeWorkflow"`，不是调用点。
- 当前 terminal conflict contract 仍 disabled / non-executable，不连接生产 DB、不写 terminal lock。
- 下一步建议进入 `refund-state-mutation-runtime-attempt-plan`，只能规划 workflow attempt persistence schema。
- 仍 No-Go：真实 provider refund request/query、production workflow execution、refund success state mutation、settlement、commission、payout、permission weakening、fulfillment 或 logistics mutation。

## Round 395 更新

- `refund-state-mutation-runtime-attempt-plan`: done，见 `docs/refund-state-mutation-runtime-attempt-plan.md`。
- 本轮只规划 workflow attempt persistence schema、attempt status model、idempotency / replay rules、schema planning notes 和 runtime boundaries。
- 未修改 `apps/**` 或 `packages/**` runtime；未新增 route、job、subscriber、migration；未连接生产 DB、不注册 module、不接 SDK、不写真实密钥。
- 验证通过：`git diff --check`、无 `apps/**` 或 `packages/**` runtime diff。
- 下一步建议进入 `refund-state-mutation-runtime-attempt-validation`。
- 仍 No-Go：真实 provider refund request/query、production workflow execution、refund success state mutation、settlement、commission、payout、permission weakening、fulfillment 或 logistics mutation。

## Round 396 更新

- `refund-state-mutation-runtime-attempt-validation`: done，见 `docs/refund-state-mutation-runtime-attempt-validation.md`。
- PR #442 已合并，merge commit `de3c950a6a4fac86feb47f7801bb23cc9459a3cc`。
- 合并后文件范围验证通过，且无 `apps/**` 或 `packages/**` runtime diff；`git diff --check` 通过。
- 当前 runtime attempt plan 仍 docs-only，不能视作 workflow attempt persistence 或 production workflow execution 许可。
- 下一步建议进入 `refund-state-mutation-runtime-attempt-contract`，只能新增不可执行纯函数合同和 focused tests。
- 仍 No-Go：真实 provider refund request/query、production workflow execution、refund success state mutation、settlement、commission、payout、permission weakening、fulfillment 或 logistics mutation。

## Round 397 更新

- `refund-state-mutation-runtime-attempt-contract`: done，见 `docs/refund-state-mutation-runtime-attempt-contract.md`。
- 新增 `mapTerminalConflictToRuntimeAttemptIntent()` 纯函数和 focused tests，输出始终 `attemptWriteAllowed=false`、`dbWriteAllowed=false`、`productionWriteAllowed=false`、`workflowExecutionAllowed=false`、`stateMutationAllowed=false`、`runtimeMutationBlocked=true`、`refundSuccessState=false`。
- 合同只准备 disabled runtime attempt intent / audit event，不连接生产 DB、不写 workflow attempt。
- 验证通过：focused test 1 suite / 5 tests、API typecheck、payment harness 58 suites / 404 tests、payment DB dry-run `2|9`、runtime grep 和 `git diff --check`；runtime grep 唯一命中为 sanitizer denylist 字符串 `"executeWorkflow"`，不是调用点。
- 仍 No-Go：真实 provider refund request/query、production workflow execution、refund success state mutation、settlement、commission、payout、permission weakening、fulfillment 或 logistics mutation。

## Round 398 更新

- `refund-state-mutation-runtime-attempt-contract-validation`: done，见 `docs/refund-state-mutation-runtime-attempt-contract-validation.md`。
- PR #444 已合并，merge commit `48c5b8a0623632563d8965a59445ea96c3478aa2`。
- 合并后 focused runtime attempt test 1 suite / 5 tests、API typecheck、payment harness 58 suites / 404 tests、payment DB dry-run `2|9` 和 runtime grep 通过；runtime grep 唯一命中为 sanitizer denylist 字符串 `"executeWorkflow"`，不是调用点。
- 当前 runtime attempt contract 仍 disabled / non-executable，不连接生产 DB、不写 workflow attempt。
- 下一步建议进入 `refund-state-mutation-production-execution-go-no-go`，重新评估生产执行前置条件。
- 仍 No-Go：真实 provider refund request/query、production workflow execution、refund success state mutation、settlement、commission、payout、permission weakening、fulfillment 或 logistics mutation。

## Round 399 更新

- `refund-state-mutation-production-execution-go-no-go`: done，见 `docs/refund-state-mutation-production-execution-go-no-go.md`。
- 结论仍 No-Go：当前合同链均为 disabled / non-executable，仍缺真实 production feature flag / kill switch、approval persistence、audit persistence、runtime attempt persistence、terminal conflict lock、workflow dry-run 和 rollback rehearsal。
- 本轮未修改 `apps/**` 或 `packages/**` runtime；未新增 route、job、subscriber、migration；未连接生产 DB、不注册 module、不接 SDK、不写真实密钥。
- 验证通过：`git diff --check`、无 `apps/**` 或 `packages/**` runtime diff。
- 下一步建议进入 `refund-state-mutation-production-execution-go-no-go-validation`。
- 仍 No-Go：真实 provider refund request/query、production workflow execution、refund success state mutation、settlement、commission、payout、permission weakening、fulfillment 或 logistics mutation。

## Round 400 更新

- `refund-state-mutation-production-execution-go-no-go-validation`: done，见 `docs/refund-state-mutation-production-execution-go-no-go-validation.md`。
- PR #446 已合并，merge commit `39c34647cfd36d7975a5a1221f7b648c6fd73c0e`。
- 合并后文件范围验证通过，且无 `apps/**` 或 `packages/**` runtime diff；`git diff --check` 通过。
- 当前 production execution 结论仍 No-Go。
- 下一步建议进入 `refund-state-mutation-production-feature-flag-plan`。
- 仍 No-Go：真实 provider refund request/query、production workflow execution、refund success state mutation、settlement、commission、payout、permission weakening、fulfillment 或 logistics mutation。

## Round 401 更新

- `refund-state-mutation-production-feature-flag-plan`: done，见 `docs/refund-state-mutation-production-feature-flag-plan.md`。
- 本轮只规划 global kill switch、environment gate、provider / market scope gate、operation mode gate、ownership、runtime behavior 和 verification。
- 未修改 `apps/**` 或 `packages/**` runtime；未新增 route、job、subscriber、migration；未连接生产 DB、不注册 module、不接 SDK、不写真实密钥。
- 验证通过：`git diff --check`、无 `apps/**` 或 `packages/**` runtime diff。
- 下一步建议进入 `refund-state-mutation-production-feature-flag-validation`。
- 仍 No-Go：真实 provider refund request/query、production workflow execution、refund success state mutation、settlement、commission、payout、permission weakening、fulfillment 或 logistics mutation。

## Round 402 更新

- `refund-state-mutation-production-feature-flag-validation`: done，见 `docs/refund-state-mutation-production-feature-flag-validation.md`。
- PR #448 已合并，merge commit `63c063ecad4ad993ce13db02cc24df229376a2a0`。
- 合并后文件范围验证通过，且无 `apps/**` 或 `packages/**` runtime diff；`git diff --check` 通过。
- 当前 production feature flag plan 仍 docs-only，不能视作生产开关或 production workflow execution 许可。
- 下一步建议进入 `refund-state-mutation-production-feature-flag-contract`，只能新增不可执行纯函数合同和 focused tests。
- 仍 No-Go：真实 provider refund request/query、production workflow execution、refund success state mutation、settlement、commission、payout、permission weakening、fulfillment 或 logistics mutation。

## Round 403 更新

- `refund-state-mutation-production-feature-flag-contract`: done，见 `docs/refund-state-mutation-production-feature-flag-contract.md`。
- 新增 `evaluateRefundStateMutationProductionFeatureFlag()` 纯函数和 focused tests，输出始终 `featureFlagExecutionAllowed=false`、`productionExecutionAllowed=false`、`workflowExecutionAllowed=false`、`stateMutationAllowed=false`、`runtimeMutationBlocked=true`、`refundSuccessState=false`。
- 合同只准备 disabled feature flag decision / audit event，不实现生产开关。
- 验证通过：focused test 1 suite / 5 tests、API typecheck、payment harness 59 suites / 409 tests、payment DB dry-run `2|9`、runtime grep 和 `git diff --check`；runtime grep 唯一命中为 sanitizer denylist 字符串 `"executeWorkflow"`，不是调用点。
- 仍 No-Go：真实 provider refund request/query、production workflow execution、refund success state mutation、settlement、commission、payout、permission weakening、fulfillment 或 logistics mutation。

## Round 404 更新

- `refund-state-mutation-production-feature-flag-contract-validation`: done，见 `docs/refund-state-mutation-production-feature-flag-contract-validation.md`。
- PR #450 已合并，merge commit `31216e2e525a72838bac0f1b9c9b11970d2dcc77`。
- 合并后 focused production feature flag test 1 suite / 5 tests、API typecheck、payment harness 59 suites / 409 tests、payment DB dry-run `2|9` 和 runtime grep 通过；runtime grep 唯一命中为 sanitizer denylist 字符串 `"executeWorkflow"`，不是调用点。
- 当前 production feature flag contract 仍 disabled / non-executable，不实现生产开关。
- 下一步建议进入 `refund-state-mutation-approval-persistence-schema-plan`，只能规划真实 approval persistence schema。
- 仍 No-Go：真实 provider refund request/query、production workflow execution、refund success state mutation、settlement、commission、payout、permission weakening、fulfillment 或 logistics mutation。

## Round 405 更新

- `refund-state-mutation-approval-persistence-schema-plan`: done，见 `docs/refund-state-mutation-approval-persistence-schema-plan.md`。
- 本轮只规划 approval persistence schema、event log、unique key、reviewer separation、permission / ownership evidence 和 replay read model。
- 未修改 `apps/**` 或 `packages/**` runtime；未新增 route、job、subscriber、migration；未连接生产 DB、不注册 module、不接 SDK、不写真实密钥。
- 验证通过：`git diff --check`、无 `apps/**` 或 `packages/**` runtime diff。
- 下一步建议进入 `refund-state-mutation-approval-persistence-schema-validation`。
- 仍 No-Go：真实 provider refund request/query、production workflow execution、refund success state mutation、settlement、commission、payout、permission weakening、fulfillment 或 logistics mutation。
