# 支付通知 Runtime Disabled 计划

## 目标

支付通知 skeleton 已经具备 fake signature、normalized envelope、idempotency key、inbox migration skeleton、state guard、workflow command DTO 和 audit action DTO。

下一步如果进入 runtime，必须先保持 disabled-by-default。本计划只定义门禁，不实现 webhook route，不注册 migration，不调用 payment workflow。

## 当前状态

- `china-payment-notification` 模块未注册到 `medusa-config.ts`。
- 没有 `/api` webhook route。
- 没有 subscriber / job / link / workflow 接入。
- migration 仍是 skeleton，未注册生产 migration。
- command mapper 只输出 DTO。
- audit mapper 只输出 event log DTO。
- 本地 harness 通过 31/31 单测，并使用 disposable DB dry-run 验证 inbox/event log skeleton。

## Runtime 默认关闭

未来即使新增 runtime，也必须默认关闭：

```text
CHINA_PAYMENT_NOTIFICATION_RUNTIME_ENABLED=false
CHINA_PAYMENT_PROVIDER=mock_china_pay
```

规则：

- 缺省值必须是关闭。
- 未设置开关时不能接收并处理通知。
- 真实支付宝 / 微信支付 Provider 不得复用 mock provider 开关。
- runtime disabled 时最多返回安全的 mock/dev 提示，不能推进 payment/order 状态。

## 进入 Runtime 前的门禁

必须全部满足：

1. migration 注册方案单独 PR 评审通过。
2. local disposable DB dry-run 通过。
3. disposable preprod DB dry-run 通过，且有备份和 rollback 记录。
4. webhook route 只接 mock provider。
5. webhook route 只保存 inbox/event log，不执行 payment workflow。
6. 验签失败、缺签、未知 event type、非 CNY、重复 idempotency key 均有测试。
7. state guard 阻断 provider mismatch、amount mismatch、terminal order、unknown reference。
8. command audit event 不保存 raw payload、完整签名、密钥、证书、手机号明文、openid/unionid 明文。
9. runtime grep 和 PR diff 确认不触碰 refund、settlement、commission、permission。

## 支付成功判定

- 支付成功必须以后端异步通知为准。
- 前端 return URL 只能显示 pending / 查询中 / 待确认。
- 不能以前端跳转成功页作为支付成功依据。

## Webhook 分阶段

### Stage 1: mock inbox-only route

- 新增 mock-only webhook route。
- 只 normalize、验签、写 inbox/event log。
- 不调用 payment workflow。
- 不改 payment/order 状态。

### Stage 2: mock command preparation

- 调用 state guard 和 command mapper。
- 写 command audit event。
- 仍不执行 workflow。

### Stage 3: mock workflow execution behind flag

- 只允许 mock provider。
- 只在显式 feature flag 打开后执行。
- 必须有 idempotency lock / retry policy / rollback plan。

### Stage 4: real provider design

- 支付宝 Provider 单独 PR。
- 微信支付 Provider 单独 PR。
- 各自独立验签、证书、回调重试、错误映射和对账设计。

## 回滚策略

- feature flag 关闭必须立即停止 runtime 处理。
- webhook route 必须能返回 provider 可重试响应，不丢失 raw payload digest。
- inbox/event log down migration 只能在确认无数据依赖的 disposable 环境执行。
- 生产回滚不得删除已接收的支付通知审计数据。

## 下一步建议

安全下一步：

1. `mock-payment-webhook-inbox-route-plan`
   - docs-only route 设计。
   - 不写 route。

2. `payment-inbox-repository-db-contract-plan`
   - docs-only repository contract。
   - 不连接真实 DB。

3. `payment-runtime-disabled-config-skeleton`
   - 只做 config parser 纯函数。
   - 不注册到 app runtime。

高风险任务继续串行：migration 注册、mock webhook route、payment workflow 调用、支付宝、微信支付、退款、对账、商家结算、佣金和权限。
