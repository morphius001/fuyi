# Codex Task Queue

当用户说“执行下一个任务”时，读取本文件，选择第一个未完成且未标记 `local-wip` 或 `done` 的任务。

当用户说“开始”、“继续”、“任务完成了就继续下一轮”等连续执行指令时，主 agent 进入自动队列模式：一个任务验证通过后，立即回到本文件选择下一个可执行任务，直到队列清空、验证失败、遇到安全边界、需要视觉确认，或用户明确要求暂停。

## Local WIP

- `codegen-baseline`: done，`@acme/api/_generated` 已确认由 `packages/api/.mercur/index.d.ts` 提供，`bunx @mercurjs/cli codegen` 可重跑且无 diff。
- `admin-shell`: local-wip，已经本地完成，暂不作为队列下一项。
- `admin-market-module-switches`: local-wip，模块开关、市场配置、商户类型开关 UI 骨架已合入 integration，等待视觉确认。
- `vendor-shell`: local-wip，已经本地完成，暂不作为队列下一项。
- `vendor-quick-listing-ai-draft`: done，手机快速上架、规格模板、单位拆分和 AI 草稿结构化预览已合入 integration；Vendor lint/build 通过，截图自动化因本地无 Playwright/Chromium 未执行。
- `storefront-zhcn-baseline`: local-wip，首页已经进入爱采购式本地鲜货门户优化，等待视觉确认和下一轮细节合入。
- `storefront-shop-and-search-polish`: local-wip，爱采购式搜索/找店首页细节和 `/pickup-card` 占位页已合入 integration。
- `pickup-card-architecture`: done，架构文档已完成，后续拆三端 mock UI。
- `pickup-card-mock-ui`: done，Storefront 独立提货入口、Vendor 提货履约页、Admin 卡种/批次/履约/风控 mock 视图已具备。
- `mock-service-providers`: done，Provider 边界文档已完成，后续拆 skeleton。
- `provider-skeleton-baseline`: done，已补齐 MockChat/SMS/Logistics/Live/AI Listing mock-only skeleton，保持未注册运行时。
- `storefront-shop-page-mock`: done，消费者店铺/档口主页 mock 已完成，首页推荐档口可跳转到 `/sellers/<handle>`。
- `storefront-search-results-mock`: done，消费者搜索结果 mock 已完成，首页搜索进入 `/search?q=...`。
- `admin-market-settings-backend-design`: done，市场配置、模块开关和能力视图后端设计文档已完成。
- `vendor-draft-product-api-design`: done，手机快速上架和 AI 草稿 API 设计文档已完成。
- `china-address-ui-baseline`: done，中国大陆地址 UI 基线已完成，Storefront build 通过。
- `storefront-product-detail-zhcn-mock`: done，商品详情页中国大陆本地鲜货 UI mock 已完成，Storefront build 通过。
- `storefront-cart-checkout-copy-polish`: done，购物车/结算页中文文案和支付安全提示已完成，Storefront build 通过。
- `admin-feature-flag-api-design`: done，后台模块开关 API 合同文档已完成，文档 diff 检查通过。
- `integration-review-and-split-plan`: done，integration 拆 PR 和风险评审文档已完成，文档 diff 检查通过。
- `visual-qa-admin-vendor-storefront`: done，视觉 QA 文档已完成；Vendor/Storefront 已截图，Admin headless 受登录态限制。
- `storefront-category-and-product-list-polish`: done，Storefront 分类/商品列表本地市场找货语境已完成，Storefront build 通过。
- `storefront-pickup-card-mobile-polish`: done，提货卡移动端裁切和换行 polish 已完成，Storefront build 通过。
- `admin-authenticated-visual-qa`: done，Admin HTTP 可达；headless 无法复用登录态，已记录人工确认清单。
- `vendor-mobile-quick-listing-visual-qa`: done，Vendor 移动端截图已完成；首屏偏菜单总览，需后续移动端 polish。
- `admin-vendor-component-split-plan`: done，Admin/Vendor 大文件拆分计划已完成。
- `vendor-component-data-extract`: done，Vendor mock 数据和类型已抽离，Vendor build 通过。
- `vendor-mobile-shell-polish`: done，Vendor 移动端首屏已优先展示快速上架、AI 草稿和关键待办，Vendor build 通过。
- `admin-ops-console-split`: done，Admin 运营控制台 mock 数据和展示 primitive 已抽离，Admin build 通过。
- `admin-feature-flag-backend-split`: done，Admin 模块开放控制后端落地拆分方案文档已完成，覆盖四层配置、能力视图、Admin 修改 API、幂等、审计、回滚和安全边界。

## Queue

当前第一轮和第二轮低风险本地化队列已清空。第三轮 Storefront 细节和 Admin feature flag API 设计也已完成。

第四轮任务：

1. `integration-review-and-split-plan`: done
2. `visual-qa-admin-vendor-storefront`: done
3. `storefront-category-and-product-list-polish`: done

第四轮队列已清空。下一步建议新增第五轮任务：

第五轮任务：

1. `storefront-pickup-card-mobile-polish`: done
2. `admin-authenticated-visual-qa`: done
3. `vendor-mobile-quick-listing-visual-qa`: done
4. `admin-vendor-component-split-plan`: done

第五轮队列已清空。下一步建议新增第六轮任务：

第六轮任务：

1. `vendor-component-data-extract`: done
2. `vendor-mobile-shell-polish`: done
3. `admin-ops-console-split`: done

第六轮队列已清空。下一步建议新增第七轮任务：围绕 Admin 视觉 QA 人工确认、Storefront 首页进一步对齐本地批发市场/爱采购式信息密度、以及 Vendor 店铺装修/供应商能力开关做小批量任务。

第七轮任务：

1. `storefront-home-market-density-polish`: done
2. `vendor-shop-decoration-shell`: done
3. `admin-module-open-control-polish`: done

第七轮队列已清空。下一步建议新增第八轮任务：三端浏览器视觉 QA、Storefront 首页 mock 数据抽离、Vendor 店铺装修 API 设计、Admin feature flag 后端落地拆分方案。

第八轮任务：

1. `visual-qa-round-8`: done
2. `storefront-home-data-extract`: done
3. `vendor-shop-decoration-api-design`: done
4. `admin-feature-flag-backend-split`: done

第八轮队列已清空。下一步建议新增第九轮任务：围绕商品规格模型、消费者商品详情移动端、商户快速上架规格模板、以及 AI 草稿解析合同做小批量任务。

第九轮任务：

1. `product-spec-model`: done
2. `vendor-quick-listing-ai-draft`: done
3. `product-spec-template-admin-design`: done
4. `admin-product-spec-template-ui`: done
5. `admin-i18n-hook-polish`: done

第九轮补充观察：

- `admin-authenticated-visual-qa`: done，用户登录后截图显示规格模板页存在 `chinaAdmin.specTemplates.*` key 暴露；`admin-i18n-hook-polish` 已将中国后台自定义组件统一接入 `useChinaAdminTranslation()`，并补充本地插值支持。

第十轮任务：

1. `market-model-backend-design`: done
2. `admin-module-config-contract-design`: done
3. `vendor-fulfillment-config-design`: done
4. `integration-release-readiness`: done

第十轮原则：

- 只做设计文档、风险拆分、验收计划。
- 不修改 `apps/**` 或 `packages/**` 业务代码。
- 不让模块开关、配送规则、商户类型、支付、订单、退款、结算、佣金或权限真实生效。

第十轮队列已清空。下一步进入拆 PR / staging 准备边界：先按 `docs/integration-release-readiness.md` 拆分低风险 PR，再进入支付、退款、结算、权限、真实履约等高风险串行任务。

第十一轮 docs-only staging 准备任务：

1. `integration-pr-staging-index`: done

第十一轮原则：

- 只做拆 PR 索引和 ledger 更新。
- 不修改 `apps/**` 或 `packages/**`。
- 不 push、不创建 PR。
- 不让任何高风险业务逻辑真实生效。

第十一轮队列已清空。下一步安全边界是创建 staging worktree 并按 `docs/integration-pr-staging-index.md` 拆 PR；如果没有明确 staging 目标，不继续往业务代码里写。

第十二轮合并后收口任务：

1. `post-merge-validation-report`: done

第十二轮原则：

- 只记录 PR A-H 已合并、合并后验证结果、临时网络配置清理状态和下一阶段边界。
- 不修改 `apps/**` 或 `packages/**`。
- 不引入依赖。
- 不碰支付、订单、退款、结算、佣金、权限或真实履约逻辑。

第十二轮完成后，下一阶段建议新增任务文件：

1. `market-data-model-implementation-plan`: pending，设计并拆分市场/商户/档口/商户类型真实数据模型落地 PR。
2. `admin-module-config-read-model`: pending，先做 Admin 模块开关的真实只读配置模型，不让它影响权限或业务流程。
3. `vendor-draft-product-readwrite-plan`: pending，拆分 Vendor 快速上架草稿 API 与规格模板读取，不直接发布真实商品。
4. `storefront-real-discovery-bridge`: pending，把首页、搜索、店铺页继续从 mock/read-only 过渡到真实市场/商户/商品数据。

第十三轮任务文件准备：

1. `market-data-model-implementation-plan`: done
2. `admin-module-config-read-model`: done
3. `vendor-draft-product-readwrite-plan`: done
4. `storefront-real-discovery-bridge`: done

第十三轮原则：

- 当前只是准备任务文件，让后续主 agent 或 subagents 能按文件执行。
- 每个任务默认先做设计、拆分、风险和验收清单。
- 真正修改 `apps/**` 或 `packages/**` 前，必须由对应任务文件明确允许。
- 支付、订单、退款、结算、佣金、权限、真实履约和真实 Provider 仍然保持高风险串行。

第十三轮进度：

- `market-data-model-implementation-plan`: done，已形成市场、商户、档口、商户类型、公告、营业时间和配送 profile 的数据模型落地 PR 拆分。
- `admin-module-config-read-model`: done，已形成 capability view、draft config、published config、effective config 的只读模型落地 PR 拆分。
- `vendor-draft-product-readwrite-plan`: done，已形成快速上架草稿、规格模板、AI mock suggestion、审核候选和真实商品创建分离的 PR 拆分。
- `storefront-real-discovery-bridge`: done，已形成首页、搜索、店铺页从 mock/read-only 过渡到真实 market/seller/category/product read model 的桥接计划。

第十三轮队列已清空。

第十四轮建议：

1. `api-read-model-skeleton`: done，小范围实现 market/module/draft/discovery 的只读类型和 builder。
2. `storefront-discovery-view-shape`: done，先定义 Storefront home/search/seller read model，不重做 UI。
3. `vendor-draft-product-skeleton`: done，先实现草稿模型 skeleton，不发布商品。
4. `admin-config-readonly-api`: done，先实现 Admin 模块配置只读 API，不保存不生效。

第十四轮进度：

- `api-read-model-skeleton`: done，新增 API 只读 read model builder，覆盖 discovery、module config capability view 和 vendor product draft skeleton；现有 `/store/china/discovery` 输出保持兼容。
- `storefront-discovery-view-shape`: done，新增 Storefront home/search/seller view shape builder，明确提货卡为 secondary/separate entry，直播只作为 seller status badge。
- `vendor-draft-product-skeleton`: done，新增未注册 Vendor product draft skeleton service 和单元测试，草稿、AI suggestion、审核候选均不创建真实商品。
- `admin-config-readonly-api`: done，新增 Admin module configs 只读 GET endpoints，不提供写入、不改变 runtime。

第十四轮队列已清空。

第十五轮建议：

1. `api-post-merge-validation`: done，对 PR O-R 合并后的 API typecheck、unit tests、build 做总验证。
2. `real-model-next-pr-plan`: done，整理下一轮真正 migration/API route 的拆分顺序和风险门禁。

第十五轮进度：

- `api-post-merge-validation`: done，PR O-R 合并后 API typecheck、3 组单元测试 16/16、Medusa build 均通过。
- `real-model-next-pr-plan`: done，已固化下一轮 PR U-Z 的真实模型/API route 拆分顺序和高风险门禁。

第十五轮队列已清空。

第十六轮建议：

1. `market-read-model-module-skeleton`: done，新增市场 read model module skeleton，不新增 migration、不接 checkout。
2. `market-read-model-static-adapter`: done，把当前静态市场/seller/category discovery 包装成 adapter。
3. `market-readonly-store-api`: done，新增 Store 只读 markets API。
4. `admin-market-readonly-api`: done，新增 Admin 只读 markets API。

第十六轮进度：

- `market-read-model-module-skeleton`: done，新增未注册 China market read model skeleton service 和单元测试。
- `market-read-model-static-adapter`: done，新增 static adapter，将默认市场和 seller metadata 转为 read model seed，不影响 checkout。
- `market-readonly-store-api`: done，新增 `/store/china/markets`、`/store/china/markets/:slug`、`/store/china/markets/:slug/sellers` 只读 API。
- `admin-market-readonly-api`: done，新增 `/admin/china/markets` 和 `/admin/china/markets/:id` 只读 API。

第十六轮队列已清空。

第十七轮建议：

1. `market-api-post-merge-validation`: done，对 PR U-X 合并后的 API typecheck/build 和市场 read model 单测做总验证。
2. `storefront-connect-market-readonly-api-plan`: done，规划 Storefront 何时接入 markets API，不直接改 UI。

第十七轮进度：

- `market-api-post-merge-validation`: done，PR U-X 合并后 API typecheck、2 组单元测试 8/8、Medusa build 均通过。
- `storefront-connect-market-readonly-api-plan`: done，已规划 Storefront market client、首页、搜索、店铺页分阶段接入 markets API。

第十七轮队列已清空。

第十八轮建议：

1. `storefront-market-client`: done，只新增 Storefront markets API client/fetcher，不改页面布局。
2. `admin-market-readonly-ui-plan`: done，规划 Admin 市场只读 API 接入 UI，不直接改权限或保存逻辑。

第十八轮进度：

- `storefront-market-client`: done，新增 `apps/storefront/src/lib/data/china-markets.ts`，只提供 markets API fetcher 和 fallback，不接页面。
- `admin-market-readonly-ui-plan`: done，已规划 Admin market client、市场配置只读页、市场详情只读页和模块配置联动。

第十八轮队列已清空。

第十九轮建议：

1. `admin-market-client`: done，只新增 Admin markets API client，不改页面。
2. `storefront-home-market-data-bridge`: done，让首页读取 market client，但保持布局不重做。

第十九轮进度：

- `admin-market-client`: done，新增 `apps/admin/src/lib/china-admin-market-client.ts`，只封装 `/admin/china/markets*` 读取和空 fallback，不保存、不改权限、不影响运行时业务。
- `storefront-home-market-data-bridge`: done，首页读取 `retrieveChinaMarkets()`，API 可用时替换市场名称、营业时间、公告和市场切换数据；API 不可用时保留静态 fallback。

第十九轮队列已清空。

第二十轮建议：

1. `admin-market-settings-readonly-page`: done，让 Admin 市场配置页展示 markets 只读 API 面板，不保存、不影响权限或履约。
2. `storefront-search-market-context`: done，让搜索页读取 market context，但不接真实搜索 provider。

第二十轮进度：

- `admin-market-settings-readonly-page`: done，Admin 市场能力页新增 `/admin/china/markets` 只读面板，包含 loading、ready、error/fallback 和 empty 状态。
- `storefront-search-market-context`: done，搜索页移动端市场条和桌面市场配置侧栏优先读取 `retrieveChinaMarkets()`，失败或空数据时保留 discovery/static fallback。

第二十轮队列已清空。

第二十一轮建议：

1. `storefront-seller-market-context`: done，让店铺页读取市场详情上下文，展示营业时间、公告和配送展示能力，不影响 checkout。
2. `readonly-market-ui-post-merge-validation`: done，对 Admin/Storefront markets UI read-only 接入做合并后验证报告。

第二十一轮进度：

- `storefront-seller-market-context`: done，店铺页通过 `retrieveChinaMarkets()` 和 `retrieveChinaMarketDetail()` 展示市场营业时间、公告和 deliveryProfiles，保留商家 metadata/static fallback。
- `readonly-market-ui-post-merge-validation`: done，验证 API typecheck、market/read-model 单测、Medusa build、Admin lint/build、Storefront build 和 diff check 均通过；记录既有 warnings 和安全边界。

第二十一轮队列已清空。

第二十二轮建议：

1. `admin-market-detail-readonly-page`: done，Admin 读取 `/admin/china/markets/:id` 展示市场详情，只读不保存。
2. `vendor-market-context-readonly-plan`: done，规划 Vendor 所属市场/档口/公告只读接入，不改履约。

第二十二轮进度：

- `admin-market-detail-readonly-page`: done，市场只读列表新增详情入口；详情页展示市场基础信息、商户/档口归属、配送 profile、营业时间、公告和只读边界，不保存、不发布、不影响订单、配送、支付、结算或权限。
- `vendor-market-context-readonly-plan`: done，已规划 Vendor 市场上下文只读视图、页面消费方式、跨市场多档口策略、商户类型边界、PR 拆分和验证步骤。

第二十二轮队列已清空。

第二十三轮建议：

1. `vendor-market-context-api-plan`: done，设计 Vendor 专用市场上下文只读 API 合同，不改 UI。
2. `vendor-market-context-client`: done，新增 Vendor market context client/fallback，不改页面布局。

第二十三轮进度：

- `vendor-market-context-api-plan`: done，已规划 Vendor 专用 market context 只读路由、鉴权边界、响应结构、fallback、缓存、日志、PR 拆分和验证要求。
- `vendor-market-context-client`: done，新增 `apps/vendor/src/lib/china-vendor-market-context-client.ts`，只提供类型、读取函数和空 fallback；API 不存在时不阻断 UI，且 `runtimeEnabled` 固定为 `false`。

第二十三轮队列已清空。

第二十四轮建议：

1. `vendor-home-market-context`: done，在 Vendor 首页展示市场/档口/公告只读摘要，不影响订单和履约。
2. `vendor-profile-market-context`: done，在 Vendor 店铺资料页展示市场归属，不提供保存。

第二十四轮进度：

- `vendor-home-market-context`: done，Vendor 首页接入 `retrieveChinaVendorMarketContext()`，API 有数据时展示市场、档口、公告和配送只读摘要；API 不可用时保留原静态市场 mock 展示。
- `vendor-profile-market-context`: done，Vendor 店铺资料页新增市场归属只读块，展示主市场、主档口、关联市场和 memberships；API 不可用时保留下方静态店铺资料表。

第二十四轮队列已清空。

第二十五轮建议：

1. `vendor-fulfillment-context-readonly`: done，在 Vendor 配送设置/物流页展示 delivery profiles，只读不影响 checkout。
2. `vendor-announcements-readonly`: done，在 Vendor 公告/服务页展示商户侧市场公告，只读不发布。

第二十五轮进度：

- `vendor-fulfillment-context-readonly`: done，Vendor 物流页新增 delivery profiles 只读区，明确 checkoutImpact 为 none、runtimeEnabled 为 false；API 不可用时保留下方物流 mock 表。
- `vendor-announcements-readonly`: done，Vendor 客服页新增商户侧市场公告只读区；API 不可用时保留下方客服 mock 表，不发布公告、不发送短信、IM 或站内信。

第二十五轮队列已清空。

第二十六轮建议：

1. `vendor-market-context-post-merge-validation`: done，对 PR AL-AP 合并后的 Vendor lint/build 做总验证报告。
2. `vendor-market-context-next-plan`: done，规划后续真正 Vendor API route/builder 和页面细节拆分。

第二十六轮进度：

- `vendor-market-context-post-merge-validation`: done，Vendor lint/build 和 diff check 均通过；已确认 PR AL-AP 只读接入没有触碰 `packages/api/**`、订单、支付、退款、结算、佣金、权限、真实履约或真实 provider。
- `vendor-market-context-next-plan`: done，已拆出 PR AS-AV：builder、readonly route、Vendor client API 状态 polish 和四页视觉 QA。

第二十六轮队列已清空。

第二十七轮建议：

1. `vendor-market-context-builder`: pending，实现 Vendor market context builder 和单元测试，不注册 route。
2. `vendor-market-context-readonly-route`: pending，实现只读 Vendor route 和鉴权边界。
3. `vendor-market-context-client-api-polish`: pending，Vendor client 对接真实 route 的可用/空/fallback 状态。
4. `vendor-market-context-visual-qa`: pending，四个 Vendor 页面做 API 状态视觉 QA。

## Status Rules

- `local-wip`: 已经在本地有工作结果，等待人工确认或后续整理。
- `pending`: 可执行。
- `done`: 已完成。
- 未显式标记的队列任务默认为 `pending`。

## Execution Rules

- 执行任务前读取 `AGENTS.md` 和 `.codex/tasks/<task>.md`。
- 自动队列模式下还要读取 `.codex/memory.md`。
- 每个任务完成并验证通过后，自动选择下一个可执行任务。
- 队列为空时，主 agent 可以新增下一批建议任务文件和队列项；如果涉及高风险业务逻辑或需要视觉确认，则先暂停说明。
- 默认不要自动 commit。
- 默认不要 push。
- 默认不要创建 PR。
- 默认不要运行 `git reset --hard`, `git merge`, `git rebase`, `git pull`, `git worktree remove`，除非用户当前指令或任务文件明确允许。
