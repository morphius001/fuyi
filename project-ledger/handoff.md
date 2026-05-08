# Handoff

更新时间：2026-05-07 22:00 Asia/Shanghai

## 当前上下文

- Worktree: `/home/codex/code/fuyi-integration-cn`
- Branch: `china/integration-localization`
- 本地服务已恢复：API 9000、Admin 7000、Vendor 7001、Storefront 3101。
- Admin 登录问题已定位并处理：Windows 浏览器访问 `127.0.0.1:9000` 会触发 `Failed to fetch`，本地启动脚本已改用 `http://localhost:9000` 注入 Admin/Vendor。
- 本地测试账号 `admin@fuyi.local` 可登录；不要把本地测试密码写进仓库文件或提交说明。

## 本轮验证

- API health: `http://localhost:9000/health` 返回 200。
- Admin login page: `http://localhost:7000/dashboard/login` 返回 200。
- Admin emailpass login POST 返回 200。
- Admin 登录态页面：`http://localhost:7000/dashboard/cn/operations/market-capabilities` 可访问。
- 截图产物：本地 `docs/visual-qa-artifacts/admin-market-capabilities-authenticated.png`，不纳入 PR A。
- 检查结果：本地 `docs/visual-qa-artifacts/admin-market-capabilities-authenticated.json`，不纳入 PR A；核心断言均为 true，且 `hasFetchError=false`。

## 注意事项

- Codex in-app Browser Use 当前仍报系统级 `拒绝访问`，登录态视觉 QA 暂时使用 `/tmp/fuyi-browser-qa` 下的本地 Playwright 兜底。
- WSL 已补齐 `libnspr4`、`libnss3`、`libasound2t64` 和 `fonts-noto-cjk`，后续 Playwright 截图可正确显示中文。
- 当前 integration worktree 仍有大量未跟踪任务文件和视觉 QA 产物；后续 staging 必须按 PR 范围精确选择，不要一次性全加。
- 当前 integration worktree 没有 main 最新的 `/admin/china/markets` 路由；本轮验证的是 integration 现有的 `/dashboard/cn/operations/market-capabilities` 页面。
- 最新 main 工作树已补测 `admin-market-membership-browser-qa`：需要从 `/home/codex/code/fuyi-pr-bx-workflow-handoff-cn` 启动服务，且 `.codex/scripts/start-dev.sh` 需要注入本地 CORS env。
- Admin 市场详情截图产物为本地 `docs/visual-qa-artifacts/admin-market-membership-browser-qa.png`，不纳入 PR；JSON 检查结果同目录，不纳入 PR。

## 下一步建议

1. 将本地 CORS 启动脚本修复和 `admin-market-membership-browser-qa` 结果作为小 PR 提交。
2. 继续跳过 `preprod-disposable-db-dry-run-execution`，除非用户明确提供可丢弃预发库和回滚确认。
3. 下一批只能做 docs-only 或本地 disposable DB 验证；真实 migration 注册、Admin 写接口、runtime switch、支付/退款/结算/权限仍需单独串行。

## Round 34 更新

- PR #77 和 PR #78 已合并。
- `round34-post-admin-qa-validation` 已记录本地验证结果。
- 自动队列当前没有可继续执行的普通任务。
- 剩余阻塞项是 `preprod-disposable-db-dry-run-execution`，需要用户提供可丢弃预发库、备份和回滚确认。

## Round 35 更新

- `preprod-dry-run-operator-pack` 已完成，见 `docs/preprod-dry-run-operator-pack.md`。
- 当前仍未连接任何预发或生产数据库。
- 如果用户后续提供 disposable preprod DB，先按 operator pack 做 Go/No-Go，不要直接执行。

## Round 36 更新

- `round36-safe-next-execution-map` 已完成，见 `docs/round36-safe-next-execution-map.md`。
- 自动队列没有可继续执行的普通任务。
- 可选安全方向只有 docs-only 高风险拆分计划；真实 DB、migration、Admin 写接口、runtime switch、支付、退款、结算、佣金、权限和真实履约仍保持阻塞。

## Round 37 更新

- `local-preprod-sim-dry-run` 已完成，见 `docs/local-preprod-sim-dry-run.md`。
- 本地 WSL disposable DB dry-run 通过，临时库已自动删除并复查无残留。
- 这不是正式预发 dry-run；`preprod-disposable-db-dry-run-execution` 仍为 `blocked-external`。

## Round 38 更新

- `payment-notification-idempotency-plan` 已完成，见 `docs/payment-notification-idempotency-plan.md`。
- 本轮只新增支付通知验签、幂等、重试、审计和 PR 拆分计划。
- 未修改 `apps/**` 或 `packages/**`，未实现真实支付 Provider，未改变 checkout、cart、order、payment、refund、payout、commission 或 permission 行为。
- 支付实现类任务下一步必须继续串行：先 mock notification skeleton，再 inbox/model dry-run，再 runtime；支付宝、微信支付、退款、对账和商家结算继续拆开。

## Round 39 更新

- `payment-notification-contract-docs` 已完成，见 `docs/payment-notification-contract.md`。
- 本轮定义 normalized envelope、event type、signature result、idempotency key、raw payload 安全和 return/notify URL 职责边界。
- 未实现 Provider，未新增 migration，未连接数据库，未改变交易状态。
- 下一步若继续支付方向，应先做 mock skeleton 设计或 fake signed payload test harness，仍不得接真实支付宝/微信支付。

## Round 40 更新

- `mock-payment-notification-skeleton-plan` 已完成，见 `docs/mock-payment-notification-skeleton-plan.md`。
- 本轮只规划未注册 mock skeleton 的文件边界、fake signature、fake payload、幂等 key 和单元测试清单。
- 未修改 `apps/**` 或 `packages/**`，未接 Provider runtime，未改变 checkout、order、payment、refund、settlement、commission 或 permission。
- 下一步如果继续，应进入单独 PR：`mock-payment-notification-skeleton`，并保持未注册、mock-only、测试优先。

## Round 41 更新

- `mock-payment-notification-skeleton` 已完成，新增 `packages/api/src/modules/china-payment-notification/**`。
- 当前 skeleton 只导出 fake signature、mock payload normalizer、idempotency key 和类型；未注册到 `medusa-config.ts`，未接 API route、workflow、subscriber、job、checkout 或真实 Provider。
- 单元测试覆盖验签通过、验签失败、重复 event key、fallback key、金额异常和 unknown merchant order reference。
- 下一步如果继续支付方向，应先做 `payment-notification-inbox-model-design` 或 fake signed payload harness；仍不要接真实支付宝、微信支付、退款、对账或结算。

## Round 42 更新

- `payment-notification-inbox-model-design` 已完成，见 `docs/payment-notification-inbox-model-design.md`。
- 本轮只设计 inbox / event log、幂等唯一约束、状态流转、本地 disposable DB dry-run 和后续 PR 拆分。
- 未新增 migration，未连接数据库，未实现 repository 或 runtime，未改变支付/订单状态。
- 下一步如果继续，应先做 migration skeleton + local disposable dry-run 脚本，不注册生产 migration。

## Round 43 更新

- `payment-notification-inbox-local-dry-run` 已完成，新增 `.codex/scripts/payment-notification-inbox-local-dry-run.sh` 和 `docs/local-payment-notification-inbox-dry-run.md`。
- 脚本使用本地 disposable DB `fuyi_payment_notification_inbox_dry_run_20260507133751` 验证 inbox/event log up/down SQL、唯一约束、CNY 约束、event log action 约束和 rollback；临时库已删除并复查无残留。
- 未新增真实 migration，未修改 `apps/**` 或 `packages/**`，未连接预发/生产数据库，未改变交易状态。
- 下一步如果继续，可以考虑 migration skeleton PR，但仍不注册生产 migration，不接 runtime，不连接预发/生产数据库。

## Round 44 更新

- `payment-notification-inbox-migration-skeleton` 已完成，新增 `packages/api/src/modules/china-payment-notification/migrations/Migration20260507000200.ts`。
- Skeleton 创建 payment notification inbox / event log 表、约束和索引，并提供 down SQL。
- 验证通过：`bunx tsc --noEmit -p packages/api/tsconfig.json`；本地 dry-run 脚本再次通过，临时库 `fuyi_payment_notification_inbox_dry_run_20260507134145` 已删除并复查无残留。
- 未修改 `packages/api/medusa-config.ts`，未注册生产 migration，未接 webhook/provider runtime，未改变交易状态。
- 下一步如果继续，应做 repository/test harness，或把 dry-run 脚本改为从 migration skeleton 提取 SQL；仍不得连接预发/生产数据库。

## Round 45 更新

- `payment-inbox-dry-run-from-skeleton` 已完成。
- `.codex/scripts/payment-notification-inbox-local-dry-run.sh` 现在从 `Migration20260507000200.ts` 提取 up/down SQL，再应用到 disposable DB。
- 验证通过：本地 disposable DB `fuyi_payment_notification_inbox_dry_run_20260507134820` 跑通 up/down、fixtures、唯一约束、CNY 约束、event log action 约束和 rollback；临时库已删除并复查无残留。
- 未注册 migration，未接 runtime，未改变交易状态。
- 下一步如果继续，应考虑 repository/test harness；仍不接 webhook runtime 或真实 Provider。

## Round 46 更新

- `payment-notification-idempotency-harness` 已完成，新增 `.codex/scripts/payment-notification-idempotency-harness.sh`。
- Harness 串联未注册检查、staged 禁止范围检查、mock payment notification 单测和 inbox migration skeleton dry-run。
- 验证通过：mock payment notification 单测 6/6；本地 disposable DB `fuyi_payment_notification_inbox_dry_run_20260507135217` dry-run 通过并已删除，复查无残留。
- 未注册 Provider 或 migration，未接 webhook runtime，未改变交易状态。
- 下一步如果继续，可以做 repository/test harness 的代码层拆分，但仍保持未注册和测试优先。

## Round 47 更新

- `payment-notification-edge-case-tests` 已完成。
- 补齐 missing signature、malformed JSON、non-CNY payload 和 weak idempotency source 单测。
- 验证通过：mock payment notification 单测 10/10。
- 未注册 Provider 或 migration，未接 webhook runtime，未改变交易状态。

## Round 48 更新

- `payment-notification-inbox-repository` 已完成。
- 新增未注册 `InMemoryPaymentNotificationInboxRepository`，覆盖 receive、dedupe replay、retryable failure 和 invalid signature audit。
- 验证通过：payment notification 单测 14/14，`bunx tsc --noEmit -p packages/api/tsconfig.json`。
- 未连接数据库，未注册 runtime，未改变 checkout、order、payment、refund、settlement、commission 或 permission。

## Round 49 更新

- `payment-notification-post-merge-validation` 已完成，见 `docs/payment-notification-post-merge-validation.md`。
- 验证通过：idempotency harness、API typecheck、runtime grep 未注册、disposable DB 无残留。
- 当前支付通知链路仍是未注册 skeleton / repository / dry-run，不是可用支付 runtime。

## Round 50 更新

- `payment-notification-state-guard-plan` 已完成，见 `docs/payment-notification-state-guard-plan.md`。
- 本轮只规划未来 handler 进入 payment workflow 前的 guard 输入输出、阻断场景和 PR 拆分。
- 未写 handler，未调用 payment workflow，未改变交易状态。

## Round 51 更新

- `payment-notification-state-guard-contract` 已完成。
- 新增纯函数 `guardPaymentNotificationState` 和单元测试，覆盖 capture allowed、duplicate no-op、invalid signature、provider mismatch、amount mismatch、unknown reference 和 terminal order。
- 验证通过：payment notification 单测 21/21，API typecheck 通过。
- 未调用 payment workflow，未接 runtime，未连接数据库，未改变交易状态。

## Round 52 更新

- `payment-notification-harness-full-tests` 已完成。
- `.codex/scripts/payment-notification-idempotency-harness.sh` 现在运行 mock notification、inbox repository 和 state guard 全量 payment notification 单测。
- 验证通过：payment notification 单测 21/21；本地 disposable DB `fuyi_payment_notification_inbox_dry_run_20260507141523` dry-run 通过并已删除，复查无残留。
- 未接 runtime，未注册 migration，未改变交易状态。

## Round 53 更新

- `payment-workflow-command-adapter-plan` 已完成，见 `docs/payment-workflow-command-adapter-plan.md`。
- 本轮只规划 command DTO、映射、幂等、审计和后续 PR 拆分。
- 未实现 adapter，未调用 payment workflow，未改变交易状态。

## Round 54 更新

- `payment-workflow-command-contract` 已完成。
- 新增 `mapGuardResultToWorkflowCommand` 纯函数，把 guard result 转成 command DTO 或 audit-only decision。
- 验证通过：payment notification 单测 25/25，API typecheck 通过。
- 未调用 payment workflow，未接 runtime，未连接数据库，未改变交易状态。

## Round 55 更新

- `payment-harness-command-mapper` 已完成。
- `.codex/scripts/payment-notification-idempotency-harness.sh` 现在包含 `payment-workflow-command-mapper.unit.spec.ts`。
- 验证通过：payment notification 单测 25/25；本地 disposable DB `fuyi_payment_notification_inbox_dry_run_20260507142712` dry-run 通过并已删除，复查无残留。
- 未调用 payment workflow，未接 runtime，未改变交易状态。

## Round 56 更新

- `payment-notification-round55-validation` 已完成，见 `docs/payment-notification-round55-validation.md`。
- 验证通过：idempotency harness 25/25、API typecheck、runtime grep 无注册、disposable DB 无残留。
- 当前 command mapper 仍只输出 DTO，不执行 workflow。

## Round 57 更新

- `payment-notification-event-log-actions-plan` 已完成，见 `docs/payment-notification-event-log-actions-plan.md`。
- 本轮只规划 event log action 白名单扩展、metadata 安全规则和后续 migration/dry-run 拆分。
- 未修改 migration，未接 runtime，未调用 payment workflow。

## Round 58 更新

- `payment-event-log-actions-migration-skeleton` 已完成，见 `docs/payment-event-log-actions-migration-skeleton.md`。
- 未注册 migration skeleton 新增 command / workflow / manual review audit action 白名单。
- 本地 disposable DB dry-run 已插入新增 action fixture，并继续验证未知 action 被拒绝。
- 未修改 `packages/api/medusa-config.ts`，未接 webhook runtime，未调用 payment workflow。

## Round 59 更新

- `payment-command-mapper-audit-tests` 已完成，见 `docs/payment-command-mapper-audit-tests.md`。
- 新增 `mapWorkflowCommandDecisionToAuditEvent()` 纯函数，覆盖 prepared、skipped、blocked 和 manual-review audit action。
- Harness 已纳入新增单测。
- 未写 DB，未接 runtime，未调用 payment workflow。

## Round 60 更新

- `payment-command-audit-post-merge-validation` 已完成，见 `docs/payment-command-audit-post-merge-validation.md`。
- 合并后验证通过：payment notification harness 31/31、dry-run row count 2|9、API typecheck、runtime grep 无注册、disposable DB 无残留。
- 当前支付通知链路仍未注册 runtime，command audit mapper 仍只输出 DTO。

## Round 61 更新

- `payment-runtime-disabled-plan` 已完成，见 `docs/payment-runtime-disabled-plan.md`。
- 明确未来 runtime 必须默认关闭，先 mock-only，且 webhook / migration / workflow execution 分阶段拆 PR。
- 本轮未修改 `packages/**` 或 `apps/**`，未接真实支付宝、微信支付、退款、对账或结算。

## Round 62 更新

- `mock-payment-webhook-inbox-route-plan` 已完成，见 `docs/mock-payment-webhook-inbox-route-plan.md`。
- 本轮只规划 mock webhook inbox-only route 的 feature flag、请求响应、错误码、幂等和测试边界。
- 未新增 API route，未接 runtime，未调用 payment workflow。

## Round 63 更新

- `payment-inbox-repository-db-contract-plan` 已完成，见 `docs/payment-inbox-repository-db-contract-plan.md`。
- 本轮只规划 DB-backed inbox repository 方法、事务边界、幂等冲突、event log 一致性和错误映射。
- 未写 repository 实现，未连接数据库，未接 runtime。

## Round 64 更新

- `payment-inbox-repository-interface` 已完成，见 `docs/payment-inbox-repository-interface.md`。
- 新增 `PaymentNotificationInboxRepositoryContract`、repository error classifier 和单元测试。
- Harness 已纳入新增单测。
- 未写 DB adapter，未接 webhook route，未调用 payment workflow。

## Round 65 更新

- `payment-runtime-disabled-config-skeleton` 已完成，见 `docs/payment-runtime-disabled-config-skeleton.md`。
- 新增 `parsePaymentNotificationRuntimeConfig()` 纯函数，默认 disabled，只允许 mock inbox-only / mock prepare-command。
- Harness 已纳入新增单测。
- 未接 runtime，未新增 webhook route，未注册 migration。

## Round 66 更新

- `payment-notification-skeleton-stage-validation` 已完成，见 `docs/payment-notification-skeleton-stage-validation.md`。
- 阶段验证通过：payment notification harness 41/41、dry-run row count 2|9、API typecheck、runtime grep 无注册、disposable DB 无残留。
- 当前仍是未注册 skeleton，不是可用支付 runtime。

## Round 67 更新

- `payment-inbox-repository-db-adapter-skeleton-plan` 已完成，见 `docs/payment-inbox-repository-db-adapter-skeleton-plan.md`。

## Round 94 更新

- `mock-webhook-admin-route-disabled-only` 已完成，见 `docs/mock-webhook-admin-route-disabled-only.md`。
- 旧 Admin mock webhook route `POST /admin/china/mock-payment-webhooks` 已降级为 disabled-only。
- Admin route 不再读取 request body，不再处理 signature/header，不再构造 in-memory repository，也不再调用 mock handler。
- neutral route `POST /china/payment-webhooks/mock` 继续作为唯一 mock provider callback 演进路径。
- 本轮不接 DB-backed repository，不注册 migration，不调用 payment workflow，不接支付宝或微信支付，不改变交易状态。

## Round 95 更新

- `mock-webhook-admin-route-disabled-validation` 已完成，见 `docs/mock-webhook-admin-route-disabled-validation.md`。
- PR #151 合并后验证通过：payment notification harness 83/83、API typecheck、runtime grep 和 disposable DB 无残留。
- Runtime grep 只命中 Admin disabled route、neutral mock route 和 neutral route 单测；未命中 medusa-config、workflow、subscriber、job 或 link。
- 下一步如果继续支付 mock route 方向，应先做 `mock-webhook-db-backed-route-plan`，只规划 neutral route 的 DB-backed inbox skeleton，不改 runtime。

- 本轮只规划 DB adapter skeleton 文件边界、mocked ORM 测试、事务一致性和错误映射。
- 未写 adapter 实现，未连接数据库，未新增 webhook route。

## Round 68 更新

- `payment-inbox-repository-db-adapter-skeleton` 已完成，见 `docs/payment-inbox-repository-db-adapter-skeleton.md`。
- 新增 `DbPaymentNotificationInboxRepository` skeleton 和 mocked transaction 单测。
- Harness 已纳入新增单测。
- 未创建数据库连接，未新增 webhook route，未调用 payment workflow。

## Round 69 更新

- `payment-db-adapter-post-merge-validation` 已完成，见 `docs/payment-db-adapter-post-merge-validation.md`。
- 合并后验证通过：payment notification harness 46/46、dry-run row count 2|9、API typecheck、runtime grep 无注册、disposable DB 无残留。
- 当前 DB adapter skeleton 仍未接真实数据库或 webhook runtime。

## Round 70 更新

- `payment-inbox-repository-disposable-db-test-plan` 已完成，见 `docs/payment-inbox-repository-disposable-db-test-plan.md`。
- 本轮只规划本地 disposable DB integration test 的命名、连接限制、schema up/down、测试用例和无残留检查。
- 未写 integration test，未连接数据库，未新增 webhook route。

## Round 71 更新

- `payment-inbox-repository-disposable-db-test-script` 已完成，见 `docs/payment-inbox-repository-disposable-db-test-script.md`。
- 新增 `.codex/scripts/payment-inbox-repository-disposable-db-test.sh`，只允许本地 disposable DB，覆盖 repository 合同级 schema 行为、约束、回滚和无残留检查。
- 未新增 webhook route，未调用 payment workflow，未连接预发或生产数据库。

## Round 72 更新

- `payment-repository-disposable-db-script-validation` 已完成，见 `docs/payment-repository-disposable-db-script-validation.md`。
- 合并后验证通过：repository disposable DB script row count 3|6、payment notification harness 46/46、runtime grep 无注册、dry-run DB 无残留。
- 当前仍未新增 webhook route，未注册 migration，未调用 payment workflow。

## Round 73 更新

- `mock-webhook-inbox-only-route-readiness` 已完成，见 `docs/mock-webhook-inbox-only-route-readiness.md`。
- 本轮只记录 route 前置条件、允许文件边界、response contract、测试清单和仍未满足项。
- 未新增 API route，未接 runtime，未调用 payment workflow。

## Round 74 更新

- `mock-webhook-route-response-contract` 已完成，见 `docs/mock-webhook-route-response-contract.md`。
- 新增 `mapMockPaymentWebhookResponse()` 纯函数和单元测试，固定 disabled、accepted、duplicate、rejected 响应语义。
- 未新增 API route，未接 runtime，未调用 payment workflow。

## Round 75 更新

- `mock-webhook-route-request-contract` 已完成，见 `docs/mock-webhook-route-request-contract.md`。
- 新增 `mapMockPaymentWebhookRequestToNormalizeInput()`，只负责未来 mock webhook route 的 raw body/header/secret 到 normalizer input 的纯函数规整。
- 拒绝结果只暴露安全 metadata，不暴露 raw payload、签名、secret 或 payment/order mutation 字段。
- 验证通过：`.codex/scripts/payment-notification-idempotency-harness.sh` 57/57，dry-run row count 2|9；`cd packages/api && bunx tsc --noEmit -p tsconfig.json`；runtime grep 无注册；disposable DB 无残留。
- 当前仍未新增 API route，未接 runtime，未写 DB，未调用 payment workflow。

## Round 76 更新

- `mock-webhook-request-post-merge-validation` 已完成，见 `docs/mock-webhook-request-post-merge-validation.md`。
- 合并后验证通过：payment notification harness 57/57、dry-run row count 2|9、API typecheck、runtime grep 无注册、disposable DB 无残留。
- 当前仍未新增 API route，未接 runtime，未写 DB，未调用 payment workflow。

## Round 77 更新

- `mock-webhook-handler-composition-plan` 已完成，见 `docs/mock-webhook-handler-composition-plan.md`。
- 本轮只规划未来 mock webhook inbox-only handler 的组合顺序：runtime gate、request contract、normalizer、repository、state guard、command/audit mapper 和 response mapper。
- 未新增 handler、API route、runtime、DB 连接或 workflow 调用。

## Round 78 更新

- `mock-webhook-handler-composition-harness-plan` 已完成，见 `docs/mock-webhook-handler-composition-harness-plan.md`。
- 本轮只规划纯函数 composition harness 的路径、fixtures、repository double、错误映射和审计断言。
- 未新增 handler、API route、runtime、DB 连接或 workflow 调用。

## Round 79 更新

- `mock-webhook-composition-helper` 已完成，见 `docs/mock-webhook-composition-helper.md`。
- 新增 `composeMockPaymentWebhookInboxOnly()` 纯函数 helper 和 composition 单测，覆盖 disabled、request reject、payload invalid、invalid signature、duplicate、accepted、guard blocked 和 command prepared。
- 验证通过：payment notification harness 65/65、dry-run row count 2|9、API typecheck、runtime grep 无注册、disposable DB 无残留。
- 当前仍未新增 API route，未接 runtime，未创建 DB 连接，未执行 payment workflow。

## Round 80 更新

- `mock-webhook-composition-error-tests` 已完成，见 `docs/mock-webhook-composition-error-tests.md`。
- composition helper 现在把 repository unique conflict 映射为 duplicate，把 retryable/unknown repository failure 映射为 `INBOX_RETRYABLE`，terminal failure 映射为 `INBOX_UNAVAILABLE`。
- 验证通过：payment notification harness 69/69、dry-run row count 2|9、API typecheck。
- 当前仍未新增 API route，未接 runtime，未创建 DB 连接，未执行 payment workflow。

## Round 81 更新

- `mock-webhook-composition-post-validation` 已完成，见 `docs/mock-webhook-composition-post-validation.md`。
- 合并后验证通过：payment notification harness 69/69、dry-run row count 2|9、API typecheck、runtime grep 无注册、disposable DB 无残留。
- 当前仍未新增 API route，未接 runtime，未创建 DB 连接，未执行 payment workflow。

## Round 82 更新

- `mock-webhook-handler-skeleton-plan` 已完成，见 `docs/mock-webhook-handler-skeleton-plan.md`。
- 本轮只规划未来未注册 handler skeleton 的允许路径、禁止路径、输入输出、安全 metadata 和后续 PR 拆分。
- 未修改 `packages/**` 或 `apps/**`，未新增 API route，未接 runtime。

## Round 83 更新

- `mock-webhook-handler-skeleton` 已完成，见 `docs/mock-webhook-handler-skeleton.md`。
- 新增未注册 `handleMockPaymentWebhookNotification()` 和单元测试，只接受显式注入参数并调用 composition helper。
- 验证通过：payment notification harness 73/73、dry-run row count 2|9、API typecheck、runtime grep 无注册、disposable DB 无残留。
- 当前仍未新增 API route，未接 runtime，未创建 DB 连接，未执行 payment workflow。

## Round 84 更新

- `mock-webhook-handler-post-validation` 已完成，见 `docs/mock-webhook-handler-post-validation.md`。
- 合并后验证通过：payment notification harness 73/73、dry-run row count 2|9、API typecheck、runtime grep 无注册、disposable DB 无残留。
- 当前仍未新增 API route，未接 runtime，未创建 DB 连接，未执行 payment workflow。

## Round 85 更新

- `mock-webhook-local-route-disabled-plan` 已完成，见 `docs/mock-webhook-local-route-disabled-plan.md`。
- 本轮只规划未来 mock webhook local route 的默认 disabled 接入条件、raw body、env gate、repository 策略、验证清单和回滚策略。
- 未修改 `packages/**` 或 `apps/**`，未新增 API route，未接 runtime。

## Round 86 更新

- `mock-webhook-local-route-disabled-skeleton` 已完成，见 `docs/mock-webhook-local-route-disabled-skeleton.md`。
- 新增 Admin 侧 `POST /admin/china/mock-payment-webhooks` disabled-only route skeleton 和单测；默认和 env requested 情况都返回 disabled。
- 验证通过：payment notification harness 75/75、dry-run row count 2|9、API typecheck、DB 无残留。
- Runtime grep 现在预期只命中新 disabled route；仍未调用 handler、repository、DB 或 payment workflow。

## Round 87 更新

- `mock-webhook-disabled-route-post-validation` 已完成，见 `docs/mock-webhook-disabled-route-post-validation.md`。
- 合并后验证通过：payment notification harness 75/75、dry-run row count 2|9、API typecheck、runtime 入口检查只命中新 disabled route、DB 无残留。
- 当前 route 仍只返回 disabled，不调用 handler、repository、DB 或 payment workflow。

## Round 88 更新

- `mock-webhook-local-route-inmemory-plan` 已完成，见 `docs/mock-webhook-local-route-inmemory-plan.md`。
- 本轮只规划 local-only in-memory route smoke 的 env gate、repository 生命周期、禁止行为和后续 PR 拆分。
- 未修改 `packages/**` 或 `apps/**`，未接 handler、DB 或 workflow。

## Round 89 更新

- `mock-webhook-local-route-inmemory-skeleton` 已完成，见 `docs/mock-webhook-local-route-inmemory-skeleton.md`。
- Admin mock webhook route 新增 local-only in-memory 分支；默认仍 disabled，production 强制 disabled。
- 验证通过：payment notification harness 78/78、dry-run row count 2|9、API typecheck、DB 无残留。
- 当前仍未连接 DB，未执行 payment workflow，未接真实 Provider。

## Round 90 更新

- `mock-webhook-inmemory-route-post-validation` 已完成，见 `docs/mock-webhook-inmemory-route-post-validation.md`。
- 合并后验证通过：payment notification harness 78/78、dry-run row count 2|9、API typecheck、runtime 入口检查和 DB 无残留。
- 当前 route 默认仍 disabled；local in-memory 分支不连接 DB、不执行 workflow。

## Round 91 更新

- `mock-webhook-local-route-smoke-script-plan` 已完成，见 `docs/mock-webhook-local-route-smoke-script-plan.md`。
- 本轮只规划本地 smoke 脚本的 disabled、accepted、missing signature、malformed payload 和安全检查。
- 未新增脚本，未修改 `packages/**` 或 `apps/**`。

## Round 92 更新

- `mock-webhook-route-auth-boundary-review` 已完成，见 `docs/mock-webhook-route-auth-boundary-review.md`。
- 记录当前 mock route 位于 `/admin/**`，不应直接视为真实 provider webhook callback 路径。
- 下一步建议先规划 neutral provider callback route，再写 smoke script。

## Round 93 更新

- `mock-webhook-route-path-migration-plan` 已完成，见 `docs/mock-webhook-route-path-migration-plan.md`。
- 本轮只规划 neutral provider callback route 路径、Admin route 保留/降级策略、默认 disabled 安全要求和后续 PR 拆分。
- 未新增 API route，未修改 `packages/**` 或 `apps/**`，未连接 DB，未执行 payment workflow。
- 下一步应先做 `mock-webhook-neutral-route-disabled-skeleton`，不要继续给 `/admin/**` route 写 provider callback smoke script。

## Round 94 更新

- `mock-webhook-neutral-route-disabled-skeleton` 已完成，见 `docs/mock-webhook-neutral-route-disabled-skeleton.md`。
- 新增 neutral mock payment webhook route `packages/api/src/api/china/payment-webhooks/mock/route.ts`，默认 disabled。
- 单测确认默认和 env requested 情况都返回 disabled，且不读取 request body。
- Harness 已纳入 neutral route 单测。
- 当前仍未调用 handler，未连接 DB，未执行 payment workflow，未接支付宝或微信支付。

## Round 95 更新

- `mock-webhook-neutral-route-disabled-post-validation` 已完成，见 `docs/mock-webhook-neutral-route-disabled-post-validation.md`。
- PR #139 合并后验证通过：payment notification harness 80/80、dry-run row count 2|9、API typecheck、runtime 入口检查和 disposable DB 无残留。
- 当前 neutral route 仍默认 disabled，不读 body，不调用 handler，不连接 DB，不执行 payment workflow。
- 下一步若继续，应先做 `mock-webhook-neutral-route-inmemory-plan`，再考虑 local-only in-memory skeleton。

## Round 96 更新

- `mock-webhook-neutral-route-inmemory-plan` 已完成，见 `docs/mock-webhook-neutral-route-inmemory-plan.md`。
- 本轮只规划 neutral route local-only in-memory 分支的 env gate、handler 注入、repository 生命周期、安全响应和后续 PR 拆分。
- 未修改 `packages/**` 或 `apps/**`，未接 handler、DB 或 workflow。
- 下一步可做 `mock-webhook-neutral-route-inmemory-skeleton`，但仍必须默认/prod disabled，且不连接 DB、不执行 payment workflow。

## Round 97 更新

- `mock-webhook-neutral-route-inmemory-skeleton` 已完成，见 `docs/mock-webhook-neutral-route-inmemory-skeleton.md`。
- neutral route 新增 local-only in-memory 分支；默认和 production 仍 disabled。
- 单测覆盖 signed payload accepted、missing signature rejected、production disabled 和 disabled 不读 body。
- 当前仍未连接 DB，未执行 payment workflow，未接支付宝或微信支付。

## Round 98 更新

- `mock-webhook-neutral-route-inmemory-post-validation` 已完成，见 `docs/mock-webhook-neutral-route-inmemory-post-validation.md`。
- PR #142 合并后验证通过：payment notification harness 83/83、dry-run row count 2|9、API typecheck、runtime 入口检查和 disposable DB 无残留。
- 当前 neutral route 仍是 local-only mock inbox-only，不连接 DB，不执行 payment workflow。
- 下一步应规划 `mock-webhook-neutral-route-smoke-script-plan`，只针对 neutral route 做本地 smoke。

## Round 99 更新

- `mock-webhook-neutral-route-smoke-script-plan` 已完成，见 `docs/mock-webhook-neutral-route-smoke-script-plan.md`。
- 本轮只规划本地 smoke 脚本，目标固定为 neutral route `/china/payment-webhooks/mock`。
- 明确不再把 Admin route 当 provider callback smoke 目标，不启动/停止服务，不改 `.env`，不连接 DB，不执行 workflow。
- 下一步可以新增 `.codex/scripts/mock-webhook-neutral-route-smoke.sh`。

## Round 100 更新

- `mock-webhook-neutral-route-smoke-script` 已完成，见 `docs/mock-webhook-neutral-route-smoke-script.md`。
- 新增 `.codex/scripts/mock-webhook-neutral-route-smoke.sh`，支持 `auto`、`disabled`、`local-inmemory`、`production-disabled` 模式。
- 脚本只打 neutral route `/china/payment-webhooks/mock`，不启动/停止服务，不修改 `.env`。
- 当前脚本不替代 DB-backed inbox、真实 Provider 或 payment workflow 验证。

## Round 101 更新

- `mock-webhook-neutral-route-smoke-validation` 已完成，见 `docs/mock-webhook-neutral-route-smoke-validation.md`。
- PR #145 合并后验证通过：脚本语法检查、disabled smoke、payment notification harness 83/83、dry-run row count 2|9、DB 残留为空。
- 当前未跑 `local-inmemory` smoke，因为脚本不会修改已运行 API 进程 env。
- 下一步建议规划 `mock-webhook-neutral-local-inmemory-devserver-plan`，用临时 dev server 方式验证 local-inmemory smoke。

## Round 102 更新

- `mock-webhook-neutral-local-inmemory-devserver-plan` 已完成，见 `docs/mock-webhook-neutral-local-inmemory-devserver-plan.md`。
- 本轮只规划临时 API dev server smoke wrapper：使用单独端口、临时 mock env、跑 `local-inmemory` smoke 后关闭自己启动的进程。
- 未新增脚本，未启动服务，未修改 `apps/**` 或 `packages/**`。
- 下一步可写 `mock-webhook-neutral-local-inmemory-devserver-script`。

## Round 103 更新

- `mock-webhook-neutral-local-inmemory-devserver-script` 已完成，见 `docs/mock-webhook-neutral-local-inmemory-devserver-script.md`。
- 新增 `.codex/scripts/mock-webhook-neutral-local-inmemory-devserver-smoke.sh`。
- 脚本使用单独端口、临时 mock env、本地 DB，只关闭自己启动的临时 API 进程。
- 不修改 `.env`，不关闭现有 9000 服务，不接真实 Provider，不执行 payment workflow。
- 实际 devserver smoke 发现 Medusa 请求不一定提供 `req.text()`，本轮已补齐 neutral route 对 `req.body` 字符串、Buffer 和 JSON object 的 mock raw body 读取兜底。

## Round 104 更新

- `mock-webhook-neutral-local-inmemory-smoke-validation` 已完成，见 `docs/mock-webhook-neutral-local-inmemory-smoke-validation.md`。
- PR #148 合并后验证通过：临时 9100 devserver local-inmemory smoke 覆盖 accepted、missing signature、malformed payload；payment notification harness 84/84；DB 残留为空。
- 9100 端口复查无监听进程。
- 下一步建议做 `mock-webhook-admin-route-deprecation-plan`，明确旧 Admin mock route 的保留、降级或删除策略。

## Round 105 更新

- `mock-webhook-admin-route-deprecation-plan` 已完成，见 `docs/mock-webhook-admin-route-deprecation-plan.md`。
- 推荐将旧 Admin mock route 降级为 disabled-only，避免它继续承担 provider callback 或 local in-memory smoke。
- neutral route 是后续 mock provider callback 的唯一演进路径。
- 下一步可做 `mock-webhook-admin-route-disabled-only`。

## Round 106 更新

- `mock-webhook-db-backed-route-plan` 已完成，见 `docs/mock-webhook-db-backed-route-plan.md`。
- 文档把 neutral route 的后续演进拆成 disabled、local in-memory、local disposable DB inbox-only、DB-backed prepare-command 和 workflow execution 五层。
- 下一步只允许做 `mock-webhook-db-backed-route-resolver-plan`，先规划 route-level repository resolver contract 和 disabled fallback。
- Admin route 保持 disabled-only；neutral route `POST /china/payment-webhooks/mock` 是唯一 mock provider callback 演进路径。

## Round 107 更新

- `mock-webhook-db-backed-route-resolver-plan` 已完成，见 `docs/mock-webhook-db-backed-route-resolver-plan.md`。
- 本轮只规划 resolver contract、disabled/unavailable fallback 和 local disposable injection。
- resolver 默认 disabled，production disabled；route 不能直接 import production DB client，也不能调用 payment workflow。
- 下一步可做 `mock-webhook-db-backed-route-resolver-contract`，只新增纯类型、纯 helper 和 mocked tests，不接 route、不接 DB。

## Round 108 更新

- `mock-webhook-db-backed-route-resolver-contract` 已完成，见 `docs/mock-webhook-db-backed-route-resolver-contract.md`。
- 新增 `resolveMockWebhookInboxRepository()` 纯 helper，默认 disabled、production disabled，只在 local DB flag + transaction client + repository factory 都存在时返回 local disposable repository。
- Resolver 单测已纳入 payment notification harness。
- 当前仍不接 neutral route，不连接 DB，不注册 migration，不调用 payment workflow。

## Round 109 更新

- `mock-webhook-db-backed-route-local-script-plan` 已完成，见 `docs/mock-webhook-db-backed-route-local-script-plan.md`。
- 本轮只规划 local disposable DB smoke wrapper，不新增脚本、不改 route。
- 后续脚本必须只管理自己创建的 disposable DB 和临时 API，不关闭现有 9000 服务，不修改 `.env`。
- 下一步可做 `mock-webhook-db-backed-route-local-script`，但仍不接 route runtime、不执行 payment workflow。

## Round 110 更新

- `mock-webhook-db-backed-route-local-script` 已完成，见 `docs/mock-webhook-db-backed-route-local-script.md`。
- 新增 `.codex/scripts/mock-webhook-db-backed-route-local-smoke.sh`。
- 当前脚本是 preflight smoke：验证 disposable DB migration up/down、临时 API 启停、neutral route 在 local DB env 下仍 disabled。
- 当前仍不修改 neutral route，不写 inbox runtime，不注册 migration，不调用 payment workflow。

## Round 111 更新

- `mock-webhook-db-backed-route-skeleton` 已完成，见 `docs/mock-webhook-db-backed-route-skeleton.md`。
- neutral route 增加 local DB resolver skeleton；没有 transaction/repository injection 时仍返回 disabled。
- local DB env 下 route 不读取 body、不写库、不调用 payment workflow。
- 下一步只能先规划 `mock-webhook-db-backed-route-transaction-plan`，再考虑 local DB accepted/duplicate smoke。

## Round 112 更新

- `mock-webhook-db-backed-route-transaction-plan` 已完成，见 `docs/mock-webhook-db-backed-route-transaction-plan.md`。
- 本轮只规划 route-level transaction client injection、local-only disposable DB adapter、repository factory 组合和 accepted/duplicate smoke。
- 未修改 `packages/**` 或 `apps/**`，未连接数据库，未注册 migration，未调用 payment workflow。
- 下一步建议做 `mock-webhook-db-client-contract-plan`，先规划 local disposable Postgres adapter 的接口和 SQL 映射，不接 route。

## Round 113 更新

- `mock-webhook-db-client-contract-plan` 已完成，见 `docs/mock-webhook-db-client-contract-plan.md`。
- 本轮只规划 local disposable Postgres adapter contract：local-only gate、database name/host 限制、transaction contract、SQL 映射、错误映射和 mocked unit tests。
- 未修改 `packages/**` 或 `apps/**`，未新增依赖，未接 route，未连接数据库，未注册 migration，未调用 payment workflow。
- 下一步可做 `mock-webhook-db-client-contract`，新增 adapter skeleton 和 mocked unit tests；仍不得连接真实 DB 或接 route。

## Round 114 更新

- `mock-webhook-db-client-contract` 已完成，见 `docs/mock-webhook-db-client-contract.md`。
- 新增 `local-postgres-db-client.ts`，把注入式 driver 包装成 `PaymentNotificationDbClient`。
- 新增 mocked unit tests，并纳入 payment notification harness。
- 验证通过：payment notification harness 16 suites / 105 tests、API typecheck。
- 本轮不接 route、不连接真实 DB、不新增依赖、不注册 migration、不调用 payment workflow。
- 下一步建议做 `mock-webhook-db-client-contract-validation`，记录合并后验证结果。

## Round 115 更新

- `mock-webhook-db-client-contract-validation` 已完成，见 `docs/mock-webhook-db-client-contract-validation.md`。
- PR #161 合并后验证通过：payment notification harness 16 suites / 105 tests、API typecheck、runtime grep、DB/端口无残留。
- 当前 adapter 仍未接 route，仍不连接真实 DB，不执行 payment workflow。
- 下一步建议做 `mock-webhook-db-backed-route-local-accepted-plan`，先规划 route 注入 local adapter 和 accepted/duplicate smoke。

## Round 116 更新

- `mock-webhook-db-backed-route-local-accepted-plan` 已完成，见 `docs/mock-webhook-db-backed-route-local-accepted-plan.md`。
- 本轮只规划 neutral route 接 local adapter 后的 accepted、duplicate 和 rejected smoke。
- 未修改 `packages/**` 或 `apps/**`，未接 route，未连接数据库，未执行 payment workflow。
- 下一步可做 `mock-webhook-db-backed-route-local-accepted`，但必须保持 local disposable DB、mock provider、inbox-only 和 production disabled。

## Round 117 更新

- `mock-webhook-db-backed-route-local-accepted` 已完成，见 `docs/mock-webhook-db-backed-route-local-accepted.md`。
- Neutral mock webhook route 现在只在 local disposable DB gate 下接入 `DbPaymentNotificationInboxRepository`。
- accepted smoke 通过：HTTP 202 / `accepted`，inbox count = 1，event log 包含 `verified`。
- duplicate smoke 通过：HTTP 200 / `duplicate`，inbox count 仍为 1，event log 包含 `dedupe_hit`。
- 修复 event log stable id 截断导致 `received` / `verified` 主键冲突的问题；现在使用短前缀 + hash，避免无限增长。
- 子 AG 复核后已补强脚本边界：固定 9110、dry-run DB 名白名单、临时 payload 目录纳入 cleanup。
- 验证通过：payment notification harness 16 suites / 108 tests、accepted smoke、duplicate smoke、API typecheck、`git diff --check`、DB/9110 无残留。
- 当前仍未注册 migration，未连接预发/生产 DB，未执行 payment workflow，未接支付宝/微信支付/退款/对账/结算/佣金/权限。
- 下一步建议做 `mock-webhook-db-backed-route-local-rejected-smoke`，补 rejected path smoke。

## Round 118 更新

- `mock-webhook-db-backed-route-local-rejected-smoke` 已完成，见 `docs/mock-webhook-db-backed-route-local-rejected-smoke.md`。
- `.codex/scripts/mock-webhook-db-backed-route-local-smoke.sh rejected` 覆盖 missing signature、invalid signature 和 non-CNY payload。
- 三个 rejected 场景均返回 400，并保持 inbox count = 0、event log count = 0；non-CNY 当前按既有 contract 返回 `PAYLOAD_INVALID`。
- 验证通过：payment notification harness 16 suites / 108 tests、rejected smoke、API typecheck、`git diff --check`、DB/9110 无残留。
- 仍未修改 route runtime，未注册 migration，未连接预发/生产 DB，未执行 payment workflow。

## Round 119 更新

- `mock-webhook-db-backed-route-post-validation` 已完成，见 `docs/mock-webhook-db-backed-route-post-validation.md`。
- PR #164 / #165 合并后验证通过：harness 16 suites / 108 tests、accepted smoke、duplicate smoke、rejected smoke、API typecheck、runtime grep、DB/9110 无残留、`git diff --check`。
- 当前 neutral mock webhook route 已具备 local-only disposable DB inbox smoke，但仍不是生产支付 runtime。
- 下一步建议只做 `mock-webhook-db-backed-route-runtime-gate-plan` docs-only，规划未来 runtime gate；仍不执行 workflow。

## Round 120 更新

- `mock-webhook-db-backed-route-runtime-gate-plan` 已完成，见 `docs/mock-webhook-db-backed-route-runtime-gate-plan.md`。
- 本轮只写文档，规划 migration registration gate、repository runtime gate、mock provider preprod gate 和 workflow execution gate。
- 明确 production 默认 disabled，workflow execution 必须单独 gate，支付宝/微信支付/退款/对账/结算/佣金/权限继续串行。
- 下一步可做 `payment-notification-runtime-gate-contract`：纯函数 contract，默认 disabled，不接 route、不执行 workflow。

## Round 121 更新

- `payment-notification-runtime-gate-contract` 已完成，见 `docs/payment-notification-runtime-gate-contract.md`。
- 新增 `evaluatePaymentNotificationRuntimeGate()` 纯函数和单元测试。
- Gate 默认 blocked，production blocked，DB runtime / migration / preprod disposable DB / provider adapter 缺一即 blocked。
- `mock_inbox_only` 和 `mock_prepare_command` 只在所有非 workflow gate 满足时 allowed。
- Harness 已纳入 runtime gate 单测。
- 当前仍不接 route、不注册 migration、不连接 DB、不执行 payment workflow。

## Round 122 更新

- `payment-notification-db-runtime-preflight` 已完成，见 `docs/payment-notification-db-runtime-preflight.md`。
- 本轮只写文档，规划 local DB preflight、preprod disposable DB preflight、migration registration readiness、transaction checks 和 observability checks。
- 当前结论：可以准备 preprod disposable DB checklist，但不能自动注册 migration，不能接 route runtime，不能执行 workflow。

## Round 123 更新

- `payment-notification-preprod-disposable-db-checklist` 已完成，见 `docs/payment-notification-preprod-disposable-db-checklist.md`。
- 本轮只写文档，准备外部 disposable preprod DB 的 Go/No-Go、变量模板、执行前/中/后检查和失败处理。
- 当前没有连接任何外部数据库，没有写入真实密钥，没有执行 migration registration 或 payment workflow。
- 下一步可做 `payment-notification-preprod-disposable-db-script-plan`，仍不连接数据库。

## Round 124 更新

- `payment-notification-preprod-disposable-db-script-plan` 已完成，见 `docs/payment-notification-preprod-disposable-db-script-plan.md`。
- 本轮只写文档，规划未来脚本参数、安全检查、输出 JSON、失败处理和 Go/No-Go。
- 未新增脚本，未连接数据库，未注册 migration，未执行 workflow。
- 下一步可做 `payment-notification-preprod-disposable-db-script`，只新增 skeleton，不执行外部 DB。

## Round 125 更新

- `payment-notification-preprod-disposable-db-script` 已完成，见 `docs/payment-notification-preprod-disposable-db-script.md`。
- 新增 `.codex/scripts/payment-notification-preprod-disposable-db-smoke.sh` skeleton。
- 脚本当前只支持 `--print-plan` 和 `--validate-inputs-only`，默认不连接外部数据库。
- 已拒绝 production-like DB name、full connection string、password CLI 参数、provider secret、signature、raw payload 和 commit sha 不一致。
- 下一项 `payment-notification-preprod-disposable-db-execution` 标记为 `blocked-external`，需要 disposable preprod DB、备份/回滚 owner 和明确连接授权。

## Round 126 更新

- `payment-preprod-db-script-post-validation` 已完成，见 `docs/payment-preprod-db-script-post-validation.md`。
- PR #171/#172 合并后验证通过：`--print-plan`、`--validate-inputs-only`、password 拒绝、full connection string 拒绝、`git diff --check`。
- 子 AG 复核未发现外部 DB 连接、SQL 执行、migration 注册、payment workflow 调用或交易链路逻辑混入。
- `docs/visual-qa-artifacts/**` 仍为未跟踪本地截图产物，本轮未纳入 PR。
- 自动队列下一项为 `payment-notification-preprod-disposable-db-execution`，保持 `blocked-external`。

## Round 127 更新

- `payment-provider-adapter-contract-plan` 已完成，见 `docs/payment-provider-adapter-contract-plan.md`。
- 本轮只写文档和队列，规划 Provider / Adapter 分层、notify/return URL 边界、验签、幂等、错误映射、密钥加载和后续 PR 拆分。
- 未接支付宝或微信支付，未实现真实 Provider，未修改 `apps/**` 或 `packages/**`。
- 下一项可执行任务为 `mock-china-payment-provider-contract`：未注册 mock provider contract，不接 checkout runtime，不执行 payment workflow。

## Round 128 更新

- `mock-china-payment-provider-contract` 已完成，见 `docs/mock-china-payment-provider-contract.md`。
- 新增未注册 `createMockChinaPaymentProviderContract()`，覆盖 create/query/close/verify/normalize contract。
- 单测覆盖 deterministic mock payment、非 CNY 拒绝、pending 查询、contract-only close、fake signed notification normalize。
- Harness 已纳入新增单测。
- 未注册 Medusa payment provider，未修改 `medusa-config.ts`，未接 checkout runtime，未执行 payment workflow。
- 下一项建议为 `mock-payment-provider-registry-contract`：adapter registry 纯函数，默认 production disabled。

## Round 129 更新

- `mock-payment-provider-registry-contract` 已完成，见 `docs/mock-payment-provider-registry-contract.md`。
- 新增 `resolveChinaPaymentProviderAdapter()` 纯函数 registry。
- Registry 默认 disabled，production blocked，仅 `mock_china_pay` + `mock_contract_only` + 显式非生产 `nodeEnv` 可解析 mock contract。
- `alipay` / `wechat_pay` 当前明确 refused，等待单独 adapter 设计和测试向量。
- 未注册 Medusa payment provider，未读取真实密钥，未接 checkout runtime，未执行 payment workflow。
- 下一项建议为 `mock-payment-provider-registry-validation`。

## Round 130 更新

- `mock-payment-provider-registry-validation` 已完成，见 `docs/mock-payment-provider-registry-validation.md`。
- 验证通过：payment notification harness 19 suites / 128 tests、API typecheck、runtime grep 未注册、disposable DB 无残留。
- 当前 mock provider contract 和 registry 仍未接 runtime，不读取真实密钥，不执行 payment workflow。
- 下一项建议为 `mock-provider-runtime-gate-validation-plan`，只规划组合验证，不接 runtime。

## Round 131 更新

- `mock-provider-runtime-gate-validation-plan` 已完成，见 `docs/mock-provider-runtime-gate-validation-plan.md`。
- 本轮只写文档，规划 mock provider contract、registry、runtime gate 和 preprod disposable DB gate 的组合验证矩阵。
- 未修改 `apps/**` 或 `packages/**`，未接 runtime，未注册 provider，未执行 payment workflow。
- 下一项建议为 `mock-provider-runtime-gate-composition-tests`，只新增纯函数组合测试。

## Round 132 更新

- `mock-provider-runtime-gate-composition-tests` 已完成，见 `docs/mock-provider-runtime-gate-composition-tests.md`。
- 新增 registry + runtime gate 组合单测，覆盖 real provider refused、production blocked、preprod DB gate required、prepare-command allowed 和 workflow 不暴露。
- Harness 已纳入新增组合单测。
- 未接 route、未连接 DB、未注册 Medusa payment provider，未执行 payment workflow。
- 下一项建议为 `mock-provider-runtime-readiness-report`。

## Round 133 更新

- `mock-provider-runtime-readiness-report` 已完成，见 `docs/mock-provider-runtime-readiness-report.md`。
- 验证通过：payment notification harness 20 suites / 133 tests、API typecheck、runtime grep 未注册、disposable DB 无残留。
- 当前 mock provider contract / registry / runtime gate 仍未接 runtime，未注册 Medusa payment provider，未执行 payment workflow。
- 下一项建议为 `mock-provider-runtime-readiness-checklist`，只整理 Go / No-Go，不写 runtime code。

## Round 134 更新

- `mock-provider-runtime-readiness-checklist` 已完成，见 `docs/mock-provider-runtime-readiness-checklist.md`。
- 本轮只写文档，明确 mock provider runtime 前 Go / No-Go 条件和下一阶段拆分。
- 当前结论：还不能直接接 runtime；下一项只能做 `mock-provider-runtime-design` docs-only。
- 真实支付宝、微信支付、退款、对账、结算、佣金和权限仍保持串行阻塞。

## Round 135 更新

- `mock-provider-runtime-design` 已完成，见 `docs/mock-provider-runtime-design.md`。
- 本轮只写文档，设计 runtime config、provider registry、runtime gate、inbox/event log、state guard、command mapper 和 audit 的调用顺序。
- 明确本阶段不得执行 payment workflow，不得写订单/支付/退款/结算/佣金/权限状态。
- 下一项建议为 `mock-provider-runtime-disabled-skeleton-plan`，继续 docs-only。

## Round 136 更新

- `mock-provider-runtime-disabled-skeleton-plan` 已完成，见 `docs/mock-provider-runtime-disabled-skeleton-plan.md`。
- 本轮只写文档，规划未来 disabled route skeleton 的文件范围、默认 disabled 行为、production blocked 和测试清单。
- 下一项可做 `mock-provider-runtime-disabled-skeleton`，但只能新增 disabled route，不读 body、不接 DB、不调用 adapter、不执行 workflow。

## Round 137 更新

- `mock-provider-runtime-disabled-skeleton` 已完成，见 `docs/mock-provider-runtime-disabled-skeleton.md`。
- 新增 `POST /china/payment-providers/mock` disabled route skeleton，默认返回 503。
- 单测覆盖默认 disabled、runtime env requested、production blocked、不读 body、不泄露 secret、不暴露 workflow/checkout 字段。
- Harness 已纳入新增 route 单测。
- 仍未注册 Medusa payment provider，未接 DB，未调用 adapter，未执行 payment workflow。

## Round 138 更新

- `mock-provider-runtime-disabled-validation` 已完成，见 `docs/mock-provider-runtime-disabled-validation.md`。
- 验证通过：payment notification harness 21 suites / 137 tests、API typecheck、runtime grep 未注册、disposable DB 无残留。
- 当前 `POST /china/payment-providers/mock` 仍只是 disabled skeleton，不读 body、不接 DB、不执行 workflow。
- 下一项建议为 `mock-provider-runtime-local-inbox-only-plan`，只规划 local disposable DB inbox-only runtime。

## Round 139 更新

- `mock-provider-runtime-local-inbox-only-plan` 已完成，见 `docs/mock-provider-runtime-local-inbox-only-plan.md`。
- 本轮只写文档，规划 local disposable DB inbox-only route 顺序、local DB gate、accepted/duplicate/rejected smoke 和禁止项。
- 下一项可做 `mock-provider-runtime-local-inbox-only-skeleton`，但只能接 local disposable DB，仍不得执行 payment workflow。

## Round 140 更新

- `mock-provider-runtime-local-inbox-only-skeleton` 已完成，见 `docs/mock-provider-runtime-local-inbox-only-skeleton.md`。
- `POST /china/payment-providers/mock` 默认和生产仍 disabled，不读 request body。
- 只有 `mock_contract_only` registry、`mock_inbox_only` runtime、local disposable DB env、当前 DB 名匹配且非 production 时，才接收 fake signed mock provider notification 并写入 inbox/event log。
- 单测覆盖默认 disabled、runtime requested、production blocked、缺 registry、accepted、duplicate、missing signature 和不泄露 workflow/checkout 字段。
- 仍未注册 Medusa payment provider，未接真实支付宝/微信支付，未执行 payment workflow，未改变 checkout、order、payment、refund、settlement、commission 或 permission 状态。
- 下一项建议为 `mock-provider-runtime-local-inbox-only-validation`，记录合并后 harness/typecheck/runtime grep/DB 无残留。

## Round 141 更新

- `mock-provider-runtime-local-inbox-only-validation` 已完成，见 `docs/mock-provider-runtime-local-inbox-only-validation.md`。
- PR #187 已合并，merge commit `528b26868b2096a413f3e448f15ea4d3fff6ae45`。
- 合并后验证通过：payment notification harness 21 suites / 143 tests、API typecheck、`git diff --check`、`medusa-config.ts` runtime grep 无注册、disposable DB 无残留。
- 子 AG 指出的实际 PG 连接本地性校验和 signature header name 泄露风险已在 PR #187 内修复。
- 下一项建议为 `mock-provider-runtime-local-smoke-script-plan`，只规划 provider route local disposable DB smoke wrapper，不直接接真实支付。

## Round 142 更新

- `mock-provider-runtime-local-smoke-script-plan` 已完成，见 `docs/mock-provider-runtime-local-smoke-script-plan.md`。
- 本轮只规划后续脚本，不新增 `.codex/scripts/**`，不修改 `packages/**` 或 `apps/**`。
- 后续脚本应使用临时 API 端口、本地 disposable DB、fake local secret，并覆盖 disabled / accepted / duplicate / missing-signature smoke。
- 下一项可做 `mock-provider-runtime-local-smoke-script`，但仍不得连接预发/生产或执行 payment workflow。

## Round 143 更新

- `mock-provider-runtime-local-smoke-script` 已完成，见 `docs/mock-provider-runtime-local-smoke-script.md`。
- 新增 `.codex/scripts/mock-provider-runtime-local-smoke.sh`，支持 `disabled`、`accepted`、`duplicate`、`rejected`。
- 脚本使用临时端口 `9120`、本地 disposable DB 前缀 `fuyi_payment_notification_route_dry_run_*`、fake local secret，并在结束后删除临时库。
- 子 AG 复核后已补强：临时 API 不再在 disabled 模式连接普通 app DB，失败输出不打印 raw metadata 或临时 API log 内容，JSON 解析错误压制 stderr，并校验 listener PID 与脚本 server PID 进程组一致后再清理。
- 验证通过：四种 smoke 模式、payment notification harness 21/143、API typecheck、`git diff --check`、`medusa-config.ts` 未注册、DB/9120 无残留。
- 脚本仍不连接预发/生产，不注册 provider，不执行 payment workflow。
- 下一项建议为 `mock-provider-runtime-local-smoke-validation`，运行脚本并记录验证结果。

## Round 144 更新

- `mock-provider-runtime-local-smoke-validation` 已完成，见 `docs/mock-provider-runtime-local-smoke-validation.md`。
- PR #190 已合并，merge commit `dd936fe0e58cd846079920e318a871b754be7038`。
- 合并后验证通过：四种 provider route local smoke、payment notification harness 21/143、API typecheck、`git diff --check`、`medusa-config.ts` 未注册、DB/9120 无残留。
- 下一项建议为 `mock-provider-runtime-preprod-smoke-plan`，只做 docs-only 规划；没有外部 disposable preprod DB 和授权前不得连接预发或生产数据库。

## Round 145 更新

- `mock-provider-runtime-preprod-smoke-plan` 已完成，见 `docs/mock-provider-runtime-preprod-smoke-plan.md`。
- 本轮只写文档和任务文件，规划 disposable preprod DB 的 Go / No-Go、禁止输入、执行阶段、脱敏、cleanup 和后续 PR 拆分。
- 未新增脚本，未连接预发或生产数据库，未注册 Provider，未执行 payment workflow。
- 下一项建议为 `mock-provider-runtime-preprod-smoke-script`，但脚本只能默认不连接外部 DB，并只支持 print-plan / validate-inputs-only。

## Round 146 更新

- `mock-provider-runtime-preprod-smoke-script` 已完成，见 `docs/mock-provider-runtime-preprod-smoke-script.md`。
- 新增 `.codex/scripts/mock-provider-runtime-preprod-smoke.sh`，当前只支持 `--print-plan` 和 `--validate-inputs-only`。
- 脚本拒绝 full connection string、password、provider secret、raw payload、signature、production-like DB host/name 和 commit sha 不一致。
- 验证通过：print-plan、安全示例 validate-only、forbidden CLI arg 拒绝、`git diff --check`。
- 未连接预发或生产数据库，未注册 Provider，未执行 payment workflow。

## Round 147 更新

- `mock-provider-runtime-preprod-smoke-script-validation` 已完成，见 `docs/mock-provider-runtime-preprod-smoke-script-validation.md`。
- PR #193 已合并，merge commit `49a6f8e93f654ff48030fe0a61503068b15c73c6`。
- 合并后验证通过：print-plan、安全示例 validate-only、forbidden CLI arg 拒绝、`git diff --check`。
- 自动队列现在停在 `mock-provider-runtime-preprod-smoke-execution: blocked-external`，需要 disposable preprod DB、备份/回滚 owner 和连接授权。

## Round 148 更新

- `blocked-external-boundary-rollup` 已完成，见 `docs/blocked-external-boundary-and-next-safe-tracks.md`。
- 本轮只记录外部阻塞边界、已完成 PR #190-#194 和下一批安全方向。
- 没有 disposable preprod DB 前，不得执行 mock provider runtime preprod smoke。
- 下一项建议为 `china-platform-non-payment-backlog`，回到非支付方向整理低风险 PR 队列。

## Round 149 更新

- `china-platform-non-payment-backlog` 已完成，见 `docs/china-platform-non-payment-backlog.md`。
- 本轮只整理非支付方向 backlog，不修改 `apps/**` 或 `packages/**`。
- 下一批低风险 docs-only 队列：market domain readiness、merchant role capability、vendor mobile draft product、shop decoration、logistics/waybill、pickup card consumer flow、live commerce readonly。
- 推荐下一项：`market-domain-readiness-review`。

## Round 150 更新

- `market-domain-readiness-review` 已完成，见 `docs/market-domain-readiness-review.md`。
- 本轮只审查市场域已有 read-only 能力和缺口，不修改 `apps/**` 或 `packages/**`。
- 结论：已有 Store/Admin/Vendor 市场只读 API 和 clients，但市场实体、商户-市场-档口关系、配送 profile、公告营业时间和上游供应关系仍未真实运营化。
- 推荐下一项：`market-domain-contract-docs`。

## Round 151 更新

- `market-domain-contract-docs` 已完成，见 `docs/market-domain-contract.md`。
- 本轮定义 Market、MarketBusinessHours、MarketAnnouncement、Stall、SellerMarketMembership、商户角色和配送 profile 合同。
- 明确 Storefront / Admin / Vendor 展示规则和 checkout、订单、结算、权限高风险边界。
- 推荐下一项：`market-domain-read-model-contract`。

## Round 152 更新

- `market-domain-read-model-contract` 已完成，见 `docs/market-domain-read-model-contract.md`。
- 新增 `buildChinaMarketDomainContractView()` 纯函数和单元测试。
- View shape 覆盖市场域实体、商户角色和 checkout/order/payment/refund/settlement/commission/payout/permission 高风险边界。
- 未新增 migration、route 或数据库连接，不影响 runtime。

## Round 153 更新

- `market-domain-read-model-contract-validation` 已完成，见 `docs/market-domain-read-model-contract-validation.md`。
- PR #199 已合并，merge commit `9c1276efc099004613d57effb0508604bccb97d0`。
- 合并后验证通过：focused market-domain contract unit test、API typecheck、`git diff --check`。
- 下一项建议为 `merchant-role-capability-readiness`。

## Round 154 更新

- `merchant-role-capability-readiness` 已完成，见 `docs/merchant-role-capability-readiness.md`。
- 本轮整理普通商品商户、物料供应商、配送供应商、养殖户、种植户、种苗供应商和外地批发商的可见性、开通方式和禁止项。
- 明确角色不影响权限、订单归属、结算、佣金、支付、退款或 checkout shipping options。
- 推荐下一项：`merchant-role-capability-contract`。

## Round 155 更新

- `merchant-role-capability-contract` 已完成，见 `docs/merchant-role-capability-contract.md`。
- 新增 `buildChinaMerchantRoleCapabilityContract()`，输出商户角色能力只读 view shape。
- 合同明确普通商品商户进入消费者商品流，物料/配送/上游/外地批发默认保持商户侧或上游侧可见。
- 合同继续把权限、订单归属、checkout shipping options、支付、退款、结算、佣金、打款、真实物流和快递打印标为串行阻塞工作。
- 推荐下一项：`vendor-mobile-draft-product-readiness`。

## Round 156 更新

- `vendor-mobile-draft-product-readiness` 已完成，见 `docs/vendor-mobile-draft-product-readiness.md`。
- 本轮只梳理手机快速上架最小字段、规格模板读取、AI suggestion、草稿状态和真实商品创建前置条件。
- 明确 AI 不直接发布商品，手机草稿不创建库存，`ready_for_product_create` 也只是候选。
- 推荐下一项：`vendor-mobile-draft-product-contract`。

## Round 157 更新

- `vendor-mobile-draft-product-contract` 已完成，见 `docs/vendor-mobile-draft-product-contract.md`。
- 新增 `buildVendorMobileDraftProductContract()`，输出手机草稿字段、阶段和高风险阻塞项。
- 合同明确所有草稿阶段都不创建商品、不创建库存；AI/微信/真实商品发布仍是串行高风险。
- 推荐下一项：`shop-decoration-readonly-plan`。

## Round 158 更新

- `shop-decoration-readonly-plan` 已完成，见 `docs/shop-decoration-readonly-plan.md`。
- 本轮只规划商家主页装修只读模型，覆盖 Storefront 公开快照、Vendor 预览、Admin 审核入口和高风险边界。
- 明确装修不改变商品、库存、订单、支付、退款、结算、佣金、权限、履约或 checkout shipping options。
- 推荐下一项：`shop-decoration-readonly-contract`。

## Round 159 更新

- `shop-decoration-readonly-contract` 已完成，见 `docs/shop-decoration-readonly-contract.md`。
- 新增 `buildChinaShopDecorationReadonlyView()`，输出店铺装修只读 view shape。
- 合同明确模块全部不可编辑，装修不影响商品、库存、checkout、订单、支付、退款、结算、佣金、权限、文件上传、直播或履约。
- 推荐下一项：`logistics-and-waybill-boundary-plan`。

## Round 160 更新

- `logistics-and-waybill-boundary-plan` 已完成，见 `docs/logistics-and-waybill-boundary-plan.md`。
- 本轮只规划展示层/配置层与执行层/面单层的边界。
- 明确当前不得确认发货、创建履约单、写 checkout shipping options、生成真实运单、云打印或回写订单物流状态。
- 推荐下一项：`logistics-and-waybill-readonly-contract`。

## Round 161 更新

- `logistics-and-waybill-readonly-contract` 已完成，见 `docs/logistics-and-waybill-readonly-contract.md`。
- 新增 `buildChinaLogisticsWaybillReadonlyView()`，输出履约方式、面单能力和高风险阻塞项。
- 合同明确所有履约方式对 checkout 无影响，面单能力不创建真实 shipment、不打印真实 label。
- 推荐下一项：`pickup-card-consumer-flow-plan`。

## Round 162 更新

- `pickup-card-consumer-flow-plan` 已完成，见 `docs/pickup-card-consumer-flow-plan.md`。
- 本轮重新固化消费者流程：持卡识别权益、补齐规格/地址/自提时间、提交提货申请、生成提货单、进入履约。
- 明确提货卡不是优惠券、满减券、折扣券、储值卡、余额、支付方式或普通购物抵扣。
- 推荐下一项：`pickup-card-consumer-flow-contract`。

## Round 163 更新

- `pickup-card-consumer-flow-contract` 已完成，见 `docs/pickup-card-consumer-flow-contract.md`。
- 新增 `buildChinaPickupCardConsumerFlowView()`，输出消费者提货步骤、权益模式、履约要求、消费者状态和高风险阻塞项。
- 合同明确所有步骤不创建 payment 或 ordinary order，权益不能换目录商品、不能转余额、不能抵扣 cart total。
- 推荐下一项：`live-commerce-readonly-plan`。

## Round 164 更新

- `live-commerce-readonly-plan` 已完成，见 `docs/live-commerce-readonly-plan.md`。
- 本轮只规划直播只读状态和 Provider 边界；直播只作为店铺/档口状态，不放消费者首页主入口。
- 明确不接真实推流、IM、聊天室、礼物、打赏、直播交易、支付、退款、结算、佣金或权限。
- 推荐下一项：`live-commerce-readonly-contract`。

## Round 165 更新

- `live-commerce-readonly-contract` 已完成，见 `docs/live-commerce-readonly-contract.md`。
- 新增 `buildChinaLiveCommerceReadonlyView()`，输出直播 session、展示位置和高风险阻塞项。
- 合同明确直播可作为店铺卡片/店铺主页/Vendor 预览/Admin 审核占位，但不能作为消费者首页主入口。
- 推荐下一项：`non-payment-readonly-contracts-validation`。

## Round 166 更新

- `non-payment-readonly-contracts-validation` 已完成，见 `docs/non-payment-readonly-contracts-validation.md`。
- 合并后 focused tests 通过：6 suites / 19 tests。
- API typecheck 和 `git diff --check` 通过；`packages/api/.mercur/index.d.ts` 已恢复，未纳入验证 PR。
- 第九十四轮建议从 `readonly-contracts-export-index` 开始。

## Round 167 更新

- `readonly-contracts-export-index` 已完成，见 `docs/readonly-contracts-export-index.md`。
- 本轮只建立非支付只读 contracts 索引，说明 Admin/Vendor/Storefront 可读范围和禁止误用。
- 明确这些 contract 不能作为 feature flag、RBAC、支付成功、订单已支付、履约、Provider 配置、结算、佣金或打款事实来源。
- 推荐下一项：`admin-readonly-contracts-panel-plan`。

## Round 168 更新

- `admin-readonly-contracts-panel-plan` 已完成，见 `docs/admin-readonly-contracts-panel-plan.md`。
- 本轮只规划 Admin “平台能力只读总览”面板，不修改 `apps/admin/**`。
- 明确面板只展示合同状态和高风险边界，不提供保存、开关、审核、发布、删除或真实 Provider 配置入口。
- 推荐下一项：`vendor-readonly-contracts-panel-plan`。
