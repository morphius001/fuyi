# admin-market-membership-browser-qa

## 目标

在用户已登录 Admin 的浏览器会话中，验证市场详情只读页对 market membership 数据的三态展示：ready、empty、fallback/error。

## 当前状态

`done`。

已在本地 headless 浏览器中使用本地测试 Admin 账号完成登录态 QA。Codex in-app Browser Use 当前仍受系统级 `拒绝访问` 限制，本轮使用 Playwright 兜底生成本地截图和 JSON 检查结果。

## 允许修改

- `docs/admin-market-membership-browser-qa.md`
- `.codex/tasks/admin-market-membership-browser-qa.md`
- `.codex/queue.md`

## 禁止修改

- `apps/**`
- `packages/**`
- migration SQL
- production seed
- `package.json`
- `bun.lock`
- `.env*`
- 支付、订单、退款、结算、佣金、权限、真实履约逻辑
- 真实短信、IM、物流、直播、AI、支付 provider

## 执行条件

- Admin dev server 可访问：`http://127.0.0.1:7000`。
- Backend API 可访问：`http://127.0.0.1:9000`。
- 用户已在 Codex App 浏览器里登录 Admin。
- 用户当前页面能访问市场详情页或能从侧边栏进入对应页面。

## 人工 QA 清单

1. Ready 状态
   - 市场基础信息显示：名称、城市、区县、地址、状态。
   - 商户/档口归属显示：商户名、档口号、跨市场归属、商户类型。
   - 配送 profile 显示：市场自提、商户自配、市场统一配送等只读展示。
   - 营业时间和公告显示。
   - 页面明确只读，不出现保存、发布、生效按钮。

2. Empty 状态
   - 当前市场没有 membership 时显示空态。
   - 空态不报错，不展示假商户。
   - 不允许从空态创建真实商户、订单、配送规则或支付配置。

3. Fallback/Error 状态
   - API 不可用或返回异常时展示 fallback/error 提示。
   - 页面不崩溃。
   - 不进入写入或高风险业务流程。

## 验证命令

```bash
git diff --check
```

## 完成边界

- 本任务只固化人工浏览器 QA 条件和清单。
- 已完成 ready 状态和部分 empty/fallback 边界验证。
- 后续若要继续做人工视觉复核，可直接打开本地截图或 Admin 市场详情页。
