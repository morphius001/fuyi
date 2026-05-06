# Vendor Market Context Authenticated Browser QA

更新时间：2026-05-07 Asia/Shanghai

## 状态

`blocked-manual`

本任务需要已登录 Vendor 浏览器会话。当前主 agent 无法确认可复用的已登录 Vendor session，因此不伪造截图结果，也不把登录页截图当成业务页 QA。

## 目标页面

- Vendor 首页
- 店铺资料页
- 物流管理页
- 客服管理页

## 需要验证的三态

### API 可用

期望：

- 页面能读取 `GET /vendor/china/market-context`。
- 首页显示市场上下文已读取。
- 店铺资料页展示市场归属只读块。
- 物流页展示 delivery profiles，并标明 `checkoutImpact: none` 和 `runtimeEnabled: false`。
- 客服页展示市场公告，不提供发布、短信、IM、站内信推送入口。

### Empty Context

期望：

- API 返回 `vendor_market_context_empty` 时，四个页面仍可浏览。
- 不出现空白屏、无限 loading、异常堆栈。
- 不诱导商户端编辑市场归属、档口或商户类型。

### Fallback

期望：

- API 不可用、未登录或网络失败时，client 返回 `vendor_market_context_fallback`。
- 页面保留静态 mock 工作台兜底。
- 错误提示不暴露 token、密钥、数据库错误或内部堆栈。

## 执行前条件

需要本地服务：

```text
Backend API: http://127.0.0.1:9000
Vendor Panel: http://127.0.0.1:7001
```

需要已登录 Vendor 账号。若未登录，先完成 Vendor 登录，再进入目标页面。

## 截图命名建议

```text
docs/visual-qa-artifacts/vendor-market-home-ready.png
docs/visual-qa-artifacts/vendor-market-profile-ready.png
docs/visual-qa-artifacts/vendor-market-fulfillment-ready.png
docs/visual-qa-artifacts/vendor-market-service-ready.png
docs/visual-qa-artifacts/vendor-market-fallback.png
docs/visual-qa-artifacts/vendor-market-empty.png
```

## 安全边界

截图 QA 期间不得：

- 修改订单、支付、退款、结算、佣金、权限、真实履约逻辑。
- 接真实短信、IM、物流、直播、AI、支付 provider。
- 写入真实密钥、真实 token、商户号或生产 credential。
- 为了截图临时硬编码 localhost、账号、mock 开关或后端 URL。

## 队列处理

本任务暂标记为 `blocked-manual`，不作为自动队列继续执行项。等用户打开已登录 Vendor 页面后，再执行截图 QA。
