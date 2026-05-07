# Handoff

更新时间：2026-05-07 11:55 Asia/Shanghai

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
