# 项目状态 Ledger

更新时间：2026-05-08 19:38 Asia/Shanghai

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
- 队列下一项：`pickup-card-consumer-flow-plan`。
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
