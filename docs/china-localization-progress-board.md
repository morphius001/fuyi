# 中国本地化进度板

更新时间：2026-05-05

## 状态总览

| 模块 | 当前状态 | 说明 | 下一步 |
| --- | --- | --- | --- |
| Admin 运营后台 | local-wip | 已完成中国平台运营后台壳、菜单、运营首页、提货卡、运营控制台、市场配置、模块开关和各业务模块只读运营视图 | 视觉确认后再拆后端 feature flag、真实审核、审计日志和 Provider 接入 |
| Vendor 商家后台 | local-wip | 已有中国商家后台壳、菜单、mock 工作台、手机快速上架和 AI 草稿上架骨架 | 视觉确认后再拆真实草稿 API |
| Storefront 前台 | local-wip | 已有爱采购式本地鲜货找货/找店首页和 `/pickup-card` 占位页 | 视觉确认后再做店铺主页和搜索结果页 |
| 提货卡 | done | 已明确为消费者权益提货凭证，不是支付/优惠券；三端 mock UI 已具备 | 后续接后端前先做 API/状态机设计 |
| Mock Provider | done | 已补齐 Chat/SMS/Logistics/Live/AI Listing mock-only skeleton，保持未注册运行时 | 后续如接真实服务必须单独高风险任务 |
| Codegen baseline | done | 已确认 `@acme/api/_generated` 由 `packages/api/.mercur/index.d.ts` 提供，codegen 可重跑且无 diff | 后续 API 路由变化时重跑 codegen |
| 支付/退款/对账/结算 | blocked-serial | 高风险，必须串行 | 等低风险 UI 和 mock 边界稳定后再做 |

## 当前并行 AG

| AG | 方向 | 工作范围 | 输出要求 |
| --- | --- | --- | --- |
| Locke | Admin | `apps/admin/**` | 模块开关/市场能力开关 UI 骨架 |
| Peirce | Vendor | `apps/vendor/**` | 手机快速上架 + AI 上架草稿 UI 骨架 |
| Huygens | Storefront | `apps/storefront/**` | 爱采购式首页细节、配色、移动端可读性 |

## 当前 integration 验证基线

- Admin build：已通过，存在 Vite chunk size warning。
- Vendor build：已通过。
- Storefront build：已通过，存在既有 React hook dependency warnings。
- Storefront dev：`http://127.0.0.1:3101/cn`
- Admin dev：中国后台首页 `http://127.0.0.1:7000/dashboard/cn`
- Vendor dev：`http://127.0.0.1:7001/`

## 后续推荐顺序

1. 做 Admin 真实浏览器视觉验收：运营首页、商品、订单、售后、提货卡、支付对账、结算、营销、客服、风控、系统配置。
2. 做 Admin 后端拆分设计落地：feature flag、market settings、role capabilities、审计日志。
3. 做 Vendor 草稿商品 API 设计落地：手机快速上架和 AI 草稿只进入 draft。
4. 做 Storefront 真实移动端复验：首页、搜索、店铺页、商品详情、购物车、提货卡。
5. 做中国地址后端模型与三端合同：省 / 市 / 区县 / 街道 / 详细地址。

## 第二轮进行中

| 任务 | 状态 | 范围 |
| --- | --- | --- |
| `storefront-shop-page-mock` | done | 消费者店铺/档口主页 mock |
| `storefront-search-results-mock` | done | 消费者搜索结果 mock |
| `admin-market-settings-backend-design` | done | 市场配置、模块开关、能力视图后端设计 |
| `vendor-draft-product-api-design` | done | 手机快速上架和 AI 草稿 API 设计 |
| `china-address-ui-baseline` | done | Storefront 中国大陆地址 UI、账单地址文案和地址展示顺序，build 已通过 |
| `storefront-product-detail-zhcn-mock` | done | 商品详情页今日价、规格、商家档口和本地履约信息 UI mock，build 已通过 |
| `storefront-cart-checkout-copy-polish` | done | 购物车/结算页中文文案、本地履约提示、支付异步通知安全提示，build 已通过 |
| `admin-feature-flag-api-design` | done | 后台模块开关 API 合同、能力视图、审计与幂等策略，文档 diff 检查通过 |
| `integration-review-and-split-plan` | done | 当前 integration worktree 拆 PR 方案、风险边界和验证基线，文档 diff 检查通过 |
| `visual-qa-admin-vendor-storefront` | done | Vendor/Storefront 截图成功；Admin headless 未登录只能看到 login；提货卡移动端有裁切风险；文档 diff 检查通过 |
| `storefront-category-and-product-list-polish` | done | Storefront 分类/商品列表页本地市场找货语境、商品卡和空/加载态中文化，build 已通过 |
| `storefront-pickup-card-mobile-polish` | done | 提货卡移动端容器、文案和表单换行 polish，Storefront build 已通过 |
| `admin-authenticated-visual-qa` | done | Admin/API 可达；用户截图确认登录后后台可见；Browser Use 插件无法接管登录态；已记录规格模板 key 暴露和 i18n hook 风险 |
| `admin-i18n-hook-polish` | done | Admin 中国后台自定义组件统一接入 `useChinaAdminTranslation()`，修复 `chinaAdmin.*` key 暴露风险，Admin lint/build 通过 |
| `vendor-mobile-quick-listing-visual-qa` | done | Vendor 移动端可访问；首屏偏菜单总览，快速上架工作台需要后续移动端 polish |
| `admin-vendor-component-split-plan` | done | Admin/Vendor 大文件组件拆分计划已完成，建议先拆 Vendor 数据、Shell 和移动端 |
| `vendor-component-data-extract` | done | Vendor mock 数据和类型抽离到 `apps/vendor/src/china/data/vendorMockData.ts`，Vendor build 已通过 |
| `vendor-mobile-shell-polish` | done | Vendor 390px 首屏优先展示快速上架、AI 草稿和关键待办，Vendor build 已通过 |
| `admin-ops-console-split` | done | Admin 运营控制台 mock 数据和 primitive 组件抽离到 `china-ops`，Admin build 已通过 |
| `admin-module-open-control-polish` | done | Admin 模块开放控制、市场能力、商户/供应方角色和真实服务安全边界表达已强化，Admin build 已通过 |
| `vendor-shop-decoration-shell` | done | Vendor 店铺/档口装修工作台、消费者预览、资质/公告/今日鲜货/直播状态占位已完成，Vendor build 已通过 |
| `storefront-home-market-density-polish` | done | Storefront 首页进一步加强市场/档口/今日行情/快速找货信息密度，提货卡保持独立入口，Storefront build 已通过 |
| `visual-qa-round-8` | done | Vendor 桌面/移动截图完成；Storefront Windows 访问 3101 阻塞，Admin headless 无登录态/渲染错误，已记录 |
| `storefront-home-data-extract` | done | Storefront 首页静态 mock 数据抽离到本地数据文件，Storefront build 已通过 |
| `vendor-shop-decoration-api-design` | done | Vendor 店铺/档口装修 API、模型、审核、预览、资质、商品分组、公告、直播状态、权限和审计设计文档已完成，文档 diff 检查通过 |
| `admin-feature-flag-backend-split` | done | Admin 模块开放控制后端落地拆分方案已完成，覆盖能力视图、幂等、审计、回滚和三端消费边界 |
| `storefront-dev-server-access-fix` | done | Storefront `3101` Windows 访问已恢复 200；改用普通 `next dev`，并做移动端搜索区/Header 宽度 polish |
| `storefront-mobile-commerce-layout-polish` | done | Storefront 移动端按常见电商模式调整为搜索优先、横向类目/市场快捷入口，隐藏桌面侧栏并收口横向溢出；Storefront build 和 390px 截图通过 |

## 第三轮 Admin 全模块只读运营壳

| 任务 | 状态 | 范围 |
| --- | --- | --- |
| `admin-order-pages-ops-mock` | done | 订单管理拆分为全部、待付款、待发货、待收货、已完成、已关闭、异常订单；强调支付以后端异步通知为准 |
| `admin-after-sales-pages-ops-mock` | done | 售后管理拆分为退款申请、退货退款、平台介入、售后原因；只读展示，不触发真实退款 |
| `admin-payment-reconciliation-pages-ops-mock` | done | 支付流水、退款流水、对账单、异常账单；强调验签、幂等、可重试，不接真实支付 |
| `admin-settlement-pages-ops-mock` | done | 待结算、已结算、佣金规则、提现申请；只读展示，不发起真实打款或提现 |
| `admin-marketing-pages-ops-mock` | done | 优惠券、满减、秒杀、首页 Banner、推荐位；提货卡保持独立模块，不进入优惠券/抵扣逻辑 |
| `admin-message-pages-ops-mock` | done | 用户会话、商户会话、平台公告、投诉记录；不接真实微信、TalkJS、IM 或短信 |
| `admin-risk-pages-ops-mock` | done | 商户、商品、订单、提货卡风险和操作日志；只读预警，不冻结、不下架、不改订单/支付/退款/权限 |
| `admin-system-config-pages-ops-mock` | done | 平台资料、备案、证照、协议、支付/短信/物流/IM 配置模板；不写真实密钥 |
| `admin-status-message-i18n-dedupe` | done | 合并 Admin `status.message` 重复翻译键，补齐客服/公告状态的已处理、草稿、已关闭文案，避免页面露 `chinaAdmin.*` key |
| `admin-pickup-card-dashboard-layout-polish` | done | 提货卡看板改为消费者提货链路、核心指标横排、提货处理队列、运营概览和异常提醒的紧凑后台布局；仍为 mock-only，不接真实卡密/核销/发货 |
| `admin-shell-toolbar-position-polish` | done | Admin 页面头部搜索/待办/消息/管理员工具组固定到右上角，避免落在标题下方中间影响阅读 |
| `admin-pickup-card-i18n-polish` | done | 提货卡页面新增布局文案迁移到 `zh-CN/en` i18n，不散落硬编码运营文案 |
| `admin-custom-ui-i18n-scan` | done | 扫描 Admin 自定义组件/路由/菜单固定 `chinaAdmin.*` key，确认 `zh-CN` 无缺失；剩余中文主要为 mock 表格数据 |
| `admin-pickup-card-data-extract` | done | 提货卡看板 mock 数据和 key 列表抽离到 `china-admin-pickup-card-data.ts`，组件只保留布局渲染 |
| `admin-dashboard-data-extract` | done | Admin 运营首页指标、待办、风险、快捷入口和职责说明 key 列表抽离到 `china-admin-dashboard-data.ts` |
| `admin-spec-template-data-extract` | done | 商品规格模板页面摘要、模板行、字段行、三端边界和状态颜色抽离到 `china-admin-spec-template-data.ts`，组件只保留后台布局渲染 |
| `admin-page-shell-sections-split` | done | 通用只读运营页面拆出模块概览、筛选条、摘要卡、只读列表和占位边界组件，降低后续订单/售后/财务/营销页面联动风险 |
| `admin-sidebar-sections-extract` | done | Admin 侧边栏分区配置抽离到 `china-admin-sidebar-sections.ts`，为后续后端能力视图控制模块开放/隐藏预留边界 |
| `admin-menu-helpers-extract` | done | Admin 菜单元数据补充按分组 key 和页面查找分组 helper，页面组件不再自行遍历菜单结构 |
| `admin-icon-maps-extract` | done | Dashboard 和提货卡指标图标映射抽离到 `china-admin-icon-maps.ts`，让菜单文件只负责路由/菜单元数据 |
| `admin-table-primitives-extract` | done | 通用只读运营表格类型、普通 cell、状态 cell 和通用列抽离到 `china-admin-table-primitives.ts`，为后续按业务域拆分 mock 表格数据做准备 |
| `admin-table-columns-extract` | done | Admin 通用只读运营表格的各业务列定义抽离到 `china-admin-table-columns.ts`，数据文件只保留 mock 行数据和表格选择逻辑 |
| `admin-table-core-rows-extract` | done | 商品、订单、售后、支付基础 mock 行数据抽离到 `china-admin-table-core-rows.ts`，为后续按业务域拆分只读运营数据做准备 |
| `admin-table-support-rows-extract` | done | 结算、营销、消息、风控、系统配置基础 mock 行数据抽离到 `china-admin-table-support-rows.ts`，继续保持支付/结算/风控只读占位边界 |
| `admin-table-merchant-rows-extract` | done | 商户基础 mock 行数据抽离到 `china-admin-table-merchant-rows.ts`，便于后续接入市场、档口、商户类型和能力开关真实 API |
| `admin-readonly-table-density-polish` | done | 通用只读运营列表从大块详情卡改为桌面紧凑表格、移动端紧凑卡片，减少提货卡/订单/售后等页面纵向占用 |
| `admin-page-shell-density-polish` | done | 通用页面壳顶部说明、安全边界、筛选和摘要区域压缩为更适合国内运营后台的密集布局 |
| `admin-table-data-safe-aggregator` | done | 表格数据聚合器恢复为干净 UTF-8 文件，各高风险业务域先走基础 mock fallback；后续页面级 mock 表格需按域逐个恢复 |
| `admin-order-table-overrides-restore` | done | 订单管理 6 个细分页 mock 表格恢复到 `china-admin-table-order-tables.ts`，保持只读展示并强调支付以后端异步通知为准 |
| `admin-after-sales-table-overrides-restore` | done | 售后管理 4 个细分页 mock 表格恢复到 `china-admin-table-after-sales-tables.ts`，保持只读展示，不触发真实退款或订单改写 |
| `admin-payment-table-overrides-restore` | done | 支付与对账 4 个细分页 mock 表格恢复到 `china-admin-table-payment-tables.ts`，强调验签、幂等、可重试和异步通知为准 |
| `admin-settlement-table-overrides-restore` | done | 结算管理 4 个细分页 mock 表格恢复到 `china-admin-table-settlement-tables.ts`，保持只读展示，不触发真实打款、提现、佣金计算或结算状态变更 |
| `admin-marketing-table-overrides-restore` | done | 营销中心 6 个细分页 mock 表格恢复到 `china-admin-table-marketing-tables.ts`，提货卡不归入优惠券/满减/折扣/支付链路，物料采购不进入消费者首页 |
| `admin-message-table-overrides-restore` | done | 客服与消息 4 个细分页 mock 表格恢复到 `china-admin-table-message-tables.ts`，区分消费者客服、商户运营、平台公告和投诉记录，不接真实 IM/短信/微信 |
| `admin-risk-table-overrides-restore` | done | 风控 6 个细分页 mock 表格恢复到 `china-admin-table-risk-tables.ts`，只读预警和审计占位，不冻结、不下架、不处罚、不改订单/退款/支付/权限 |
| `admin-settings-table-overrides-restore` | done | 系统配置 9 个细分页 mock 表格恢复到 `china-admin-table-settings-tables.ts`，只做配置模板和安全边界展示，不写真实密钥、不接真实服务 |
| `admin-merchant-table-overrides-restore` | done | 商户管理 5 个细分页 mock 表格恢复到 `china-admin-table-merchant-tables.ts`，覆盖市场、档口、跨市场、商户类型、店铺主页和物料供应商边界 |
| `admin-product-table-overrides-restore` | done | 商品管理 6 个细分页 mock 表格恢复到 `china-admin-table-product-tables.ts`，覆盖鲜活海鲜、果蔬、市场物料、规格模板、品牌和禁售规则占位 |
| `admin-operations-console-coverage-audit` | done | 平台运营 3 个细分页确认走专门 `ChinaAdminOperationsConsole`，已覆盖模块开关、市场能力、商户角色能力、Provider 准备度和只读开关边界 |
| `admin-pickup-card-table-overrides-restore` | done | 提货卡除看板外 8 个细分页 mock 表格恢复到 `china-admin-table-pickup-card-tables.ts`，强调提货卡是实体卡提货权益，不进入优惠券/购物车支付链路 |
| `admin-page-coverage-doc` | done | 新增 `docs/admin-china-page-coverage.md`，汇总中国后台页面入口、渲染方式、mock 数据文件和真实能力接入前的安全边界 |
| `vendor-page-coverage-doc` | done | 新增 `docs/vendor-china-page-coverage.md`，汇总商家后台单页壳、41 个页面入口、B 端供应链能力和真实能力接入前的安全边界 |
| `china-platform-architecture-traceability` | done | 更新 `docs/china-platform-architecture-map.md`，补充端到端分层图、当前可追溯矩阵和后续接真实能力的建议顺序 |
| `china-backend-data-contract-map` | done | 新增 `docs/china-backend-data-contract-map.md`，把市场、档口、商户类型、模块开关、店铺装修、商品草稿、提货卡和 B 端供应链拆成后端数据契约与高风险禁区 |
| `integration-pr-split-release-order` | done | 更新 `docs/integration-review-and-split-plan.md`，把当前 WIP 拆成 docs、架构合同、Admin、Vendor、Storefront、Mock Provider、API 配置模板和后端合同的上线顺序与验收门槛 |
| `integration-pr-file-manifest` | done | 新增 `docs/integration-pr-file-manifest.md`，按 PR A-H 明确当前 WIP 文件归属、暂不提交目录、验证命令和提交顺序 |
| `integration-pr-a-preflight` | done | 新增 `docs/integration-pr-a-preflight.md`，预检 Codex workflow/task memory 第一批提交范围、排除项、风险扫描结果和 start-dev 脚本边界 |
| `integration-pr-b-preflight` | done | 新增 `docs/integration-pr-b-preflight.md`，预检架构合同文档第二批提交范围、可选视觉 QA 文档、排除项和密钥/格式风险 |
| `integration-pr-c-admin-preflight` | done | 新增 `docs/integration-pr-c-admin-preflight.md`，预检 Admin 中国运营后台 UI/mock 文件范围、拆分建议、高风险禁区和 lint/build 结果 |
| `integration-pr-d-vendor-preflight` | done | 新增 `docs/integration-pr-d-vendor-preflight.md`，预检 Vendor 中国商家后台 UI/mock 文件范围、B 端供应链边界、拆分建议和 lint/build 结果 |
| `integration-pr-e-storefront-discovery-preflight` | done | 新增 `docs/integration-pr-e-storefront-discovery-preflight.md`，预检 Storefront 找市场/找店/找货、店铺页、提货卡独立入口和本地市场图片资源 |
| `integration-pr-f-storefront-checkout-detail-preflight` | done | 新增 `docs/integration-pr-f-storefront-checkout-detail-preflight.md`，预检 Storefront 商品详情、地址、购物车、结算文案文件范围和敏感 checkout 函数边界 |
| `integration-pr-g-mock-provider-preflight` | done | 新增 `docs/integration-pr-g-mock-provider-preflight.md`，预检 Mock Chat/SMS/Logistics/Live/AI Provider skeleton、未注册运行时边界、密钥扫描和单测结果 |
| `integration-pr-h-api-config-preflight` | done | 新增 `docs/integration-pr-h-api-config-preflight.md`，预检 API 配置模板、`CODEX_DATABASE_URL`、中国 seed、开发占位值和上线 release gate |
| `integration-pr-preflight-summary` | done | 新增 `docs/integration-pr-preflight-summary.md`，汇总 PR A-H 可准备状态、验证结果、warning、release gate、人工确认点和下一步 staging 清单建议 |
| `integration-pr-a-staging-commands` | done | 新增 `docs/integration-pr-a-staging-commands.md`，只列 PR A 显式 staging 命令、排除项、误 stage 回退和 staged 后检查，不执行 staging |
| `integration-pr-b-staging-commands` | done | 新增 `docs/integration-pr-b-staging-commands.md`，只列 PR B/B2 显式 staging 命令、排除项、误 stage 回退和 staged 后检查，不执行 staging |
| `integration-pr-c-admin-staging-commands` | done | 新增 `docs/integration-pr-c-admin-staging-commands.md`，只列 PR C Admin 整体或 C1-C4 拆分 staging 命令、排除项和 staged 后检查，不执行 staging |
| `integration-pr-d-vendor-staging-commands` | done | 新增 `docs/integration-pr-d-vendor-staging-commands.md`，只列 PR D Vendor staging 命令、review 分组、排除项和 staged 后检查，不执行 staging |
| `integration-pr-e-storefront-discovery-staging-commands` | done | 新增 `docs/integration-pr-e-storefront-discovery-staging-commands.md`，只列 PR E Storefront discovery staging 命令、排除 PR F checkout/cart/address 文件和 staged 后检查，不执行 staging |
| `integration-pr-f-storefront-checkout-detail-staging-commands` | done | 新增 `docs/integration-pr-f-storefront-checkout-detail-staging-commands.md`，只列 PR F 商品详情、地址、购物车、结算文案 staging 命令、排除 PR E discovery 文件和 staged 后检查，不执行 staging |
| `integration-pr-g-mock-provider-staging-commands` | done | 新增 `docs/integration-pr-g-mock-provider-staging-commands.md`，只列 PR G Mock Provider skeleton staging 命令、排除运行时注册/真实密钥/业务逻辑文件和 staged 后检查，不执行 staging |
| `integration-pr-h-api-config-staging-commands` | done | 新增 `docs/integration-pr-h-api-config-staging-commands.md`，只列 PR H API 配置模板和 seed 安全 staging 命令、release gate 检查和 staged 后检查，不执行 staging |
| `integration-pr-a-submit-readiness` | done | 新增 `docs/integration-pr-a-submit-readiness.md`，复核 PR A 工作流/任务记忆范围、排除项、验证结果和后续最小提交流程，不执行 staging |
| `integration-pr-b-submit-readiness` | done | 新增 `docs/integration-pr-b-submit-readiness.md`，复核 PR B 架构/数据契约核心文档、可选视觉 QA 文档、C-H 跟随文档和最小提交流程，不执行 staging |
| `integration-pr-c-admin-submit-readiness` | done | 新增 `docs/integration-pr-c-admin-submit-readiness.md`，复核 PR C Admin 中国运营后台 UI/mock 范围、排除项、lint/build 结果和拆分风险，不执行 staging |
| `integration-pr-d-vendor-submit-readiness` | done | 新增 `docs/integration-pr-d-vendor-submit-readiness.md`，复核 PR D Vendor 中国商家后台 UI/mock 范围、B 端供应链边界、lint/build 结果和拆分风险，不执行 staging |
| `integration-pr-e-storefront-discovery-submit-readiness` | done | 新增 `docs/integration-pr-e-storefront-discovery-submit-readiness.md`，复核 PR E Storefront 消费者发现链路范围、PR F 排除项、lint/build warnings 和业务边界，不执行 staging |
| `integration-pr-f-storefront-checkout-detail-submit-readiness` | done | 新增 `docs/integration-pr-f-storefront-checkout-detail-submit-readiness.md`，复核 PR F 商品详情/地址/购物车/结算文案范围、敏感 checkout 函数扫描和支付安全边界，不执行 staging |
| `integration-pr-g-mock-provider-submit-readiness` | done | 新增 `docs/integration-pr-g-mock-provider-submit-readiness.md`，复核 PR G Mock Provider skeleton 范围、未注册运行时扫描、API typecheck 和单测结果，不执行 staging |
| `integration-pr-h-api-config-submit-readiness` | done | 新增 `docs/integration-pr-h-api-config-submit-readiness.md`，复核 PR H API 配置模板和 seed 安全范围、密钥扫描、release gate 和中风险边界，不执行 staging |
| `integration-submit-control-panel` | done | 新增 `docs/integration-submit-control-panel.md`，汇总 PR A-H 提交口令、顺序、固定步骤、全局禁令和关键风险门槛，不执行 staging |
| `browser-smoke-qa-current` | done | 新增 `docs/visual-qa-browser-smoke-current.md`，记录 Admin/Vendor/Storefront 本地烟测、Storefront 500 原因、只重启 Storefront 后恢复 200 和截图产物 |

第三轮验证：

- `git diff --check -- apps/admin/src/lib/china-admin-table-data.ts apps/admin/src/i18n/zh-CN.json apps/admin/src/i18n/en.json`：通过。
- `bun --cwd apps/admin lint`：通过。
- `bun --cwd apps/admin build`：通过，仍有既有 Vite chunk size warning。
- `status.message` 中 `pending / processing / resolved / draft / closed / exception` 中英文解析检查：通过。
- 提货卡看板 layout polish 后 `bun --cwd apps/admin lint`、`bun --cwd apps/admin build` 和相关文件 `git diff --check`：通过。
- Admin 头部工具区右上角定位和提货卡 i18n polish 后 `bun --cwd apps/admin lint`、`bun --cwd apps/admin build` 和相关文件 `git diff --check`：通过。
- Admin 自定义组件/路由/菜单固定翻译 key 扫描：147 个固定 key，`zh-CN` 缺失 0 个。
- 提货卡 mock 数据抽离后 `git diff --check`、`bun --cwd apps/admin lint`、`bun --cwd apps/admin build`：通过。
- Admin 运营首页 mock 数据抽离后 `git diff --check`、`bun --cwd apps/admin lint`、`bun --cwd apps/admin build`：通过。
- 商品规格模板 mock 数据抽离后 `git diff --check`、`bun --cwd apps/admin lint`、`bun --cwd apps/admin build`：通过。
- 通用只读运营页面区块拆分后 `git diff --check`、`bun --cwd apps/admin lint`、`bun --cwd apps/admin build`：通过。
- 侧边栏分区配置抽离后 `git diff --check`、`bun --cwd apps/admin lint`、`bun --cwd apps/admin build`：通过。
- 菜单 helper 抽离后 `git diff --check`、`bun --cwd apps/admin lint`、`bun --cwd apps/admin build`：通过。
- 指标图标映射抽离后 `git diff --check`、`bun --cwd apps/admin lint`、`bun --cwd apps/admin build`：通过。
- 表格 primitive 抽离后 `git diff --check`、`bun --cwd apps/admin lint`、`bun --cwd apps/admin build`：通过。
- 表格列定义抽离后 `git diff --check`、`bun --cwd apps/admin lint`、`bun --cwd apps/admin build`：通过。
- 核心交易表格行数据抽离后 `git diff --check`、`bun --cwd apps/admin lint`、`bun --cwd apps/admin build`：通过。
- 运营支撑表格行数据抽离后 `git diff --check`、`bun --cwd apps/admin lint`、`bun --cwd apps/admin build`：通过。
- 商户基础表格行数据抽离后 `git diff --check`、`bun --cwd apps/admin lint`、`bun --cwd apps/admin build`：通过。
- 通用只读运营列表密度优化后 `git diff --check`、`bun --cwd apps/admin lint`、`bun --cwd apps/admin build`：通过。
- 通用页面壳密度优化后 `git diff --check`、`bun --cwd apps/admin lint`、`bun --cwd apps/admin build`：通过。
- 表格数据聚合器恢复后 `git diff --check`、`bun --cwd apps/admin lint`、`bun --cwd apps/admin build`：通过。
- 订单细分页 mock 表格恢复后 `git diff --check`、`bun --cwd apps/admin lint`、`bun --cwd apps/admin build`：通过。
- 售后细分页 mock 表格恢复后 `git diff --check`、`bun --cwd apps/admin lint`、`bun --cwd apps/admin build`：通过。
- 支付/对账细分页 mock 表格恢复后 `git diff --check`、`bun --cwd apps/admin lint`、`bun --cwd apps/admin build`：通过。
- 结算细分页 mock 表格恢复后 `git diff --check`、`bun --cwd apps/admin lint`、`bun --cwd apps/admin build`：通过。
- 营销中心细分页 mock 表格恢复后 `git diff --check`、`bun --cwd apps/admin lint`、`bun --cwd apps/admin build`：通过。
- 客服与消息细分页 mock 表格恢复后 `git diff --check`、`bun --cwd apps/admin lint`、`bun --cwd apps/admin build`：通过。
- 风控细分页 mock 表格恢复后 `git diff --check`、`bun --cwd apps/admin lint`、`bun --cwd apps/admin build`：通过。
- 系统配置细分页 mock 表格恢复后 `git diff --check`、`bun --cwd apps/admin lint`、`bun --cwd apps/admin build`：通过。
- 商户管理和商品管理细分页 mock 表格恢复后 `git diff --check`、`bun --cwd apps/admin lint`、`bun --cwd apps/admin build`：通过。
- 平台运营专门控制台覆盖审计、提货卡细分页 mock 表格恢复后 `git diff --check`、`bun --cwd apps/admin lint`、`bun --cwd apps/admin build`：通过。
- Admin 页面覆盖文档新增后 `git diff --check`、`bun --cwd apps/admin lint`、`bun --cwd apps/admin build`：通过。
- Vendor 页面覆盖文档新增后 `git diff --check`、`bun --cwd apps/vendor lint`、`bun --cwd apps/vendor build`：通过。
- 中国平台架构图补充后尾随空白检查和服务状态检查：通过。
- 后端数据契约地图新增后尾随空白检查和服务状态检查：通过。
- 集成 PR 拆分和上线迁移顺序补充后尾随空白检查和服务状态检查：通过。
- 第一批可提交文件清单新增后尾随空白检查和服务状态检查：通过。
- PR A 预检文档新增后尾随空白检查、PR A 范围 `git diff --check` 和服务状态检查：通过。
- PR B 预检文档新增后尾随空白检查、`git diff --check -- docs` 和服务状态检查：通过。
- PR C Admin 预检文档新增后尾随空白检查、相关 docs `git diff --check` 和服务状态检查：通过；Admin `lint`、`build`、`git diff --check -- apps/admin` 已通过。
- PR D Vendor 预检文档新增后尾随空白检查、相关 docs `git diff --check` 和服务状态检查：通过；Vendor `lint`、`build`、`git diff --check -- apps/vendor` 已通过。
- PR E Storefront 发现链路预检文档新增后尾随空白检查、相关 docs `git diff --check` 和服务状态检查：通过；Storefront `lint`、`build`、`git diff --check -- apps/storefront` 已通过，仍有既有 React Hook dependency warnings。
- PR F Storefront 商品详情/地址/购物车/结算预检文档新增后尾随空白检查、相关 docs `git diff --check` 和服务状态检查：通过；Storefront `lint`、`build`、`git diff --check -- apps/storefront` 已通过，敏感函数扫描已记录。
- PR G Mock Provider 预检文档新增后尾随空白检查、相关 docs `git diff --check` 和服务状态检查：通过；API typecheck、provider diff-check、运行时未注册扫描、NPM/Jest 单测 8/8 已通过。
- PR H API 配置模板和 seed 预检文档新增后尾随空白检查、相关 docs `git diff --check` 和服务状态检查：通过；API typecheck、PR H 范围 `git diff --check` 已通过，`supersecret` / localhost 等开发占位已记录为 release gate。
- PR A-H 总预检摘要新增后尾随空白检查、相关 docs `git diff --check` 和服务状态检查：通过。
- PR A staging 命令清单新增后尾随空白检查、相关 docs `git diff --check`、staged 文件检查和服务状态检查：通过；未执行 staging。
- PR B staging 命令清单新增后尾随空白检查、相关 docs `git diff --check`、staged 文件检查和服务状态检查：通过；未执行 staging。
- PR C Admin staging 命令清单新增后尾随空白检查、相关 docs `git diff --check`、staged 文件检查和服务状态检查：通过；未执行 staging。
- PR D Vendor staging 命令清单新增后尾随空白检查、相关 docs `git diff --check`、staged 文件检查和服务状态检查：通过；未执行 staging。
- PR E Storefront discovery staging 命令清单新增后尾随空白检查、相关 docs `git diff --check`、staged 文件检查和服务状态检查：通过；未执行 staging。
- PR F Storefront checkout/detail staging 命令清单新增后尾随空白检查、相关 docs `git diff --check`、staged 文件检查和服务状态检查：通过；未执行 staging。
- PR G Mock Provider staging 命令清单新增后尾随空白检查、相关 docs `git diff --check`、staged 文件检查和服务状态检查：通过；未执行 staging。
- PR H API config staging 命令清单新增后尾随空白检查、相关 docs `git diff --check`、staged 文件检查和服务状态检查：通过；未执行 staging。
- PR A 提交前复核文档新增后尾随空白检查、相关 docs `git diff --check`、staged 文件检查和服务状态检查：通过；未执行 staging。
- PR B 提交前复核文档新增后尾随空白检查、相关 docs `git diff --check`、staged 文件检查和服务状态检查：通过；未执行 staging。
- PR C Admin 提交前复核文档新增后尾随空白检查、相关 docs `git diff --check`、Admin lint/build、staged 文件检查和服务状态检查：通过；未执行 staging。
- PR D Vendor 提交前复核文档新增后尾随空白检查、相关 docs `git diff --check`、Vendor lint/build、staged 文件检查和服务状态检查：通过；未执行 staging。
- PR E Storefront discovery 提交前复核文档新增后尾随空白检查、相关 docs `git diff --check`、Storefront lint/build、staged 文件检查和服务状态检查：通过；未执行 staging。
- PR F Storefront checkout/detail 提交前复核文档新增后尾随空白检查、相关 docs `git diff --check`、Storefront lint/build、敏感函数扫描、staged 文件检查和服务状态检查：通过；未执行 staging。
- PR G Mock Provider 提交前复核文档新增后尾随空白检查、相关 docs `git diff --check`、API typecheck、单测 8/8、运行时未注册扫描、staged 文件检查和服务状态检查：通过；未执行 staging。
- PR H API config 提交前复核文档新增后尾随空白检查、相关 docs `git diff --check`、API typecheck、实际 API 文件密钥扫描、高风险文件名扫描、staged 文件检查和服务状态检查：通过；未执行 staging。
- 提交控制台文档新增后尾随空白检查、相关 docs `git diff --check`、staged 文件检查和服务状态检查：通过；未执行 staging。
- 浏览器烟测记录新增后尾随空白检查、相关 docs `git diff --check`、staged 文件检查和服务状态检查：通过；未执行 staging。
- 消费端移动首页和商品卡 polish 后 `git diff --check`、`bun --cwd apps/storefront lint`、`bun --cwd apps/storefront build`：通过；Storefront dev server 已在 build 后重启，`curl -I http://127.0.0.1:3101/cn` 返回 200；仍有既有 React Hook dependency warnings。
- Storefront 电脑端首页搜索入口收敛后 `git diff --check`、`bun --cwd apps/storefront lint`、`bun --cwd apps/storefront build`：通过；顶部保留唯一主搜索，右侧“提交找货线索”改为买鲜流程，快速找货改为常买场景，build 后已重启 Storefront dev server，`curl -I http://127.0.0.1:3101/cn` 返回 200。
- Storefront 电脑端首页版面重排后 `git diff --check`、`bun --cwd apps/storefront lint`、`bun --cwd apps/storefront build`：通过；撤掉页面内重复桌面头部和右侧杂卡，主区改为左类目/市场 + 右侧大主视觉两栏，容器放宽到 1680px；build 后已重启 Storefront dev server，`curl -I http://127.0.0.1:3101/cn` 返回 200。
- Storefront 电脑端头尾对齐 polish 后 `git diff --check`、`bun --cwd apps/storefront lint`、`bun --cwd apps/storefront build`：通过；Header、Navbar、Footer 统一为 1680px 容器和同一左右边界，Header 从居中 logo 改为左 logo + 市场副标题，Footer 从三张卡片改为平台信息 + 三列链接，备案信息居中收尾；build 后已重启 Storefront dev server，`curl -I http://127.0.0.1:3101/cn` 返回 200。
- Storefront 参考国内电商首页结构后 `git diff --check`、`bun --cwd apps/storefront lint`、`bun --cwd apps/storefront build`：通过；参考百度爱采购、京东/京东生鲜、1688 等常见结构，把搜索移动到 Header 主行，Navbar 第二行只保留分类和频道入口，减少头部空白和重复搜索；build 后已重启 Storefront dev server，`curl -I http://127.0.0.1:3101/cn` 返回 200。
- Storefront 首屏清晰度 polish 后 `git diff --check`、`bun --cwd apps/storefront lint`、`bun --cwd apps/storefront build`：通过；首屏主卡只保留“今日鲜货开市”、两个主按钮、三个关键指标和市场说明，行情表/流程从首屏移出；左侧附近市场长列表收成当前市场卡，避免撑高首屏和造成大块空白；build 后已重启 Storefront dev server，`curl -I http://127.0.0.1:3101/cn` 返回 200。
- Storefront 国内平台门户感 polish 后 `git diff --check`、`bun --cwd apps/storefront lint`、`bun --cwd apps/storefront build`：通过；首屏改成三栏门户结构，左侧类目和当前市场，中间今日鲜货主 banner，右侧今日服务、买鲜步骤和买家保障，让消费者第一眼知道平台怎么逛、怎么下单和看什么保障；build 后已重启 Storefront dev server，`curl -I http://127.0.0.1:3101/cn` 返回 200。
- Storefront 三栏门户面板撤回后 `git diff --check`、`bun --cwd apps/storefront lint`：通过；撤掉右侧“今日服务/买鲜步骤/买家保障”面板，回到更克制的左类目 + 主 banner 两栏，后续首页大改必须先出结构稿再动代码。
- Storefront 按设计稿调整后 `git diff --check`、`bun --cwd apps/storefront lint`、`bun --cwd apps/storefront build`：通过；按生成设计稿改为左侧类目、中间今日鲜货主 banner、右侧单一当前市场信息卡；导航补齐市场频道、档口推荐、今日到货、提货卡、售后保障；不再放右侧步骤/保障堆叠；build 后已重启 Storefront dev server，`curl -I http://127.0.0.1:3101/cn` 返回 200。
- Storefront 首页标题去重后：保留导航栏“全部类目”，删除左侧类目卡片内重复的蓝色标题；同步清理移动端搜索里的“今日价”残留文案，避免消费者首屏看到无效提示词。
- Storefront 首页档口卡参考国内店铺橱窗结构后：档口推荐从纯运营信息卡改为“店铺头像 / 店名 / 进店按钮 / 三个商品缩略图 / 价格”的消费者浏览卡；仅使用 mock 展示数据，不接真实商品、订单、库存或配送逻辑。
- Storefront 首页右侧参考国内平台欢迎卡后：首屏右栏从说明型“当前市场”改为“欢迎登录 / 发布找货需求 / 商家入驻 / 当前市场状态”的行动入口卡；仅作为前台导航入口，不接真实登录、询价、入驻审核或供应商业务逻辑。
- Storefront 首页橱窗图重复感 polish 后：店铺橱窗和今日鲜货列表继续使用同一 mock 市场图资产，但通过不同 `object-position` 裁切和商品标签降低复制感；后续真实商品图应由后台商品媒体读取。
- Storefront 移动端 Header 压缩后：移动端顶部品牌栏从桌面式高度收紧为更接近 App 的紧凑栏，汉堡按钮和移动端 logo 同步缩小；桌面端 Header 高度保持不变。
- Storefront 搜索页和档口页消费者文案 polish 后：移除用户端可见的 `mock`、`占位`、`不接 API` 等开发提示，搜索页改为“相关鲜货 / 相关档口 / 买鲜提示”，档口页改为正常资质、履约和价格库存提示；不接真实搜索、商品、库存、订单或支付逻辑。
- Storefront `/categories` 市场频道化后：将原始“全部商品 + ProductListing”承接页改为中国本地市场频道，展示可选市场、市场类目、档口推荐和今日到货；仅使用前台 mock 展示数据，不接真实搜索、商品、库存、订单、支付或履约逻辑。
- Storefront 本地鲜货商品详情承接后：为首页/市场页/搜索页的本地鲜货 mock 数据补充 `/products/<handle>` 详情承接页，展示商品图、参考价、档口、市场、到货、鲜度、履约和购买说明；搜索页“选规格”和市场页鲜货卡改为进入该详情页；不接真实加购、订单、库存、支付或履约逻辑。
- 服务状态：API 9000、Admin 7000、Vendor 7001、Storefront 3101 均正常。

第三轮未做：

- 未接真实支付、退款、对账、结算、佣金、权限、短信、IM、物流、电子面单或直播服务。
- 未写入真实 app id、merchant id、token、access key、secret、私钥或证书。
- 未做真实浏览器登录态截图验收；仍需用户在已登录浏览器中逐页确认排版。

## 风险雷达

- 模块开关不能只靠前端隐藏，后端接入前只能标注为 mock/占位。
- AI 上架不能直接发布商品，必须保留商户确认步骤。
- 提货卡不能进入 checkout/payment/coupon/cart discount 链路。
- 物料供应商、配送供应商、自营商户、养殖户/种植户/外地批发商需要类型和准入规则，不能混在普通消费者商品流里。
- 直播、IM、短信、物流、快递打印都只能先做 mock/provider boundary，不能接真实服务。
- Admin 登录态视觉 QA 需要用户浏览器或可复用登录态，headless 截图当前只能验证 login。
- Storefront 提货卡移动端已做第一轮裁切 polish；仍建议用户在真实浏览器里滑动确认。
- 含中文源码不要用 PowerShell `Get-Content` / `Set-Content` 做机械搬运；优先 `apply_patch` 或 WSL UTF-8 工具，避免乱码。
