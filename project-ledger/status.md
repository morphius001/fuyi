# 项目状态 Ledger

更新时间：2026-05-07 02:30 Asia/Shanghai

## 主线合并状态

- PR A-H 已经合并到 `main`。
- 当前 `origin/main` 最新合并提交：`a945ceb` `[china] PR H Integration runbooks and env template notes`。
- 合并后验证报告：`docs/post-merge-validation-report.md`。
- `origin/main..china/integration-localization` diff 为空，说明拆分 PR 合并后的主线内容与 integration 基线一致。
- 主工作目录 `/home/codex/code/fuyi` 可能仍有本地未提交改动；本轮未在主目录执行 pull、reset 或覆盖操作。

## 当前分支

- 主线基线：`origin/main`
- 最近验证 worktree: `/home/codex/code/fuyi-pr-h-runbooks-cn`
- 账本更新 worktree: `/home/codex/code/fuyi-pr-i-postmerge-cn`
- 目标：MercurJS 中国大陆多商户生鲜/海鲜本地化基础版进入下一阶段数据落地准备

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
