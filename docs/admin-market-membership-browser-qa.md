# Admin Market Membership Browser QA

更新时间：2026-05-07 Asia/Shanghai

## 结论

当前状态：`blocked-manual`。

Admin market membership 浏览器 QA 需要用户已登录 Admin 的 Codex App 浏览器会话。当前自动化环境能看到本地服务端口，但不能确认或复用用户登录态，因此不能伪造截图、不能把该项标记为 done。

## 当前本地服务观察

已观察到：

- Admin dev server 正在监听 `0.0.0.0:7000`。
- Backend API 正在监听 `*:9000`。
- 进程来自 `/home/codex/code/fuyi-integration-cn`。

这说明本机有可访问服务，但不等于已完成登录态浏览器 QA。

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

- API 返回市场和 membership 数据。
- 页面展示商户/档口/配送/营业时间/公告。
- 不触发写入。

### Empty

- 当前市场没有 membership。
- 页面展示清晰空态。
- 不展示假商户，不提供创建真实业务数据入口。

### Fallback/Error

- API 异常或不可用。
- 页面展示 fallback/error 提示。
- 页面不崩溃，不进入高风险业务流程。

## 后续执行方式

当用户确认“Admin 已登录，可以做浏览器 QA”后再执行：

1. 打开 `http://127.0.0.1:7000`。
2. 进入市场详情/市场能力只读页。
3. 截图 ready、empty、fallback/error 三态。
4. 更新本报告为 done，并记录截图路径、浏览器 URL、验证结论。

## 安全边界

本轮没有：

- 修改 `apps/**` 或 `packages/**`。
- 修改 migration、生产 seed 或真实数据库。
- 接入真实支付、短信、IM、物流、直播或 AI provider。
- 改变 checkout、订单、支付、退款、结算、佣金、权限或真实履约逻辑。

## 已验证

- `git diff --check`: passed.
