# Handoff

更新时间：2026-05-07 14:02 Asia/Shanghai

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
