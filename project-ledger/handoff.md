# Handoff

更新时间：2026-05-07 21:00 Asia/Shanghai

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
