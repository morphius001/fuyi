# Admin Market Membership Browser QA

更新时间：2026-05-07 12:40 Asia/Shanghai

## 结论

当前状态：`done`。

已在本地 headless 浏览器中使用本地测试 Admin 账号完成登录态 QA。由于 Codex in-app Browser Use 当前仍受系统级 `拒绝访问` 限制，本轮使用 `/tmp/fuyi-browser-qa` 下的 Playwright 兜底执行，不伪造用户截图。

## 当前本地服务观察

已观察到：

- Admin dev server 正在监听 `0.0.0.0:7000`。
- Backend API 正在监听 `*:9000`。
- 进程来自 `/home/codex/code/fuyi-pr-bx-workflow-handoff-cn`，对应最新 `origin/main` 后的本地验证分支。

本轮发现并修复本地启动脚本缺少 `ADMIN_CORS` / `AUTH_CORS` / `STORE_CORS` / `VENDOR_CORS` 的问题。修复后 Admin 登录、`/admin/china/markets` 和市场详情页均可从 `http://localhost:7000` 正常访问。

## 需要验证的页面

目标页面：Admin 市场详情/市场能力只读页。

重点验证：

- 市场基础信息：名称、城市、区县、地址、状态。
- 商户/档口归属：商户名、档口号、跨市场归属、商户类型。
- 配送 profile：市场自提、商户自配、市场统一配送等只读展示。
- 营业时间：按中国市场语境展示。
- 公告：市场公告只读展示。
- 只读边界：不得出现保存、发布、生效、生成订单、创建配送规则或支付配置等按钮。

## 三态清单

### Ready

- API 返回市场和 membership 数据：`/admin/china/markets` 返回 200。
- 页面展示三门海鲜市场、阿海鲜活档、A区 18号、市场自提、统一配送展示能力、营业时间摘要和公告摘要。
- 页面展示只读边界，`runtimeEnabled` 为未启用。
- 未出现保存、发布、生效等可操作按钮。
- 未触发写入。

### Empty

- 当前截图中的公告表和营业时间表处于空态。
- 空态文案清晰，不展示假公告或假营业时间明细。
- 不提供创建真实商户、订单、配送规则或支付配置入口。

### Fallback/Error

- 修复 CORS 前曾复现 fallback/error：页面不崩溃，显示 fallback 边界。
- 修复后 ready 状态通过；`Failed to fetch` 不再出现。
- 页面不进入写入或高风险业务流程。

## 后续执行方式

本轮产物：

- 截图：本地 `docs/visual-qa-artifacts/admin-market-membership-browser-qa.png`，不纳入 PR。
- 检查结果：本地 `docs/visual-qa-artifacts/admin-market-membership-browser-qa.json`，不纳入 PR。
- 浏览器 URL：`http://localhost:7000/dashboard/cn/operations/market-capabilities/market_%E4%B8%89%E9%97%A8%E6%B5%B7%E9%B2%9C%E5%B8%82%E5%9C%BA`。

自动检查结果：

- `marketsApiStatus=200`
- `hasMarketDetailTitle=true`
- `hasMembershipSection=true`
- `hasDeliveryProfileSection=true`
- `hasBusinessHoursSection=true`
- `hasAnnouncementsSection=true`
- `hasReadonlyBoundary=true`
- `hasRuntimeDisabled=true`
- `hasDangerActionButton=false`
- `hasFetchError=false`
- `hasI18nKeyLeak=false`
- `consoleErrors=[]`

## 安全边界

本轮没有：

- 修改 `apps/**` 或 `packages/**`。
- 修改 migration、生产 seed 或真实数据库。
- 接入真实支付、短信、IM、物流、直播或 AI provider。
- 改变 checkout、订单、支付、退款、结算、佣金、权限或真实履约逻辑。

## 已验证

- `git diff --check`: passed.
- Playwright 登录态 QA：passed.
