# 支付通知 Runtime Disabled Config Skeleton

## 目标

新增 `parsePaymentNotificationRuntimeConfig()` 纯函数，为未来 mock webhook route 做默认关闭的配置解析。

本轮不把它接入 `medusa-config.ts`、API route、workflow、subscriber、job 或 link。

## 配置规则

默认：

```text
enabled=false
mode=disabled
provider=mock_china_pay
```

只有同时满足以下条件才返回 enabled：

- `CHINA_PAYMENT_NOTIFICATION_RUNTIME_ENABLED=true` 或 `1`
- `CHINA_PAYMENT_NOTIFICATION_WEBHOOK_MODE=mock_inbox_only` 或 `mock_prepare_command`
- `CHINA_PAYMENT_NOTIFICATION_PROVIDER=mock_china_pay`

拒绝：

- `workflow_execute`
- `alipay`
- `wechat_pay`
- 任意未知 mode/provider

## 验证

- 新增单元测试覆盖默认关闭、disabled mode、mock inbox-only、mock prepare-command、未知 mode 和真实 provider 拒绝。
- 本地 idempotency harness 已纳入 config 测试。
- API typecheck 通过。
- runtime grep 确认未注册到 app runtime。

## 安全边界

- 不写真实密钥。
- 不接真实支付宝、微信支付。
- 不新增 webhook route。
- 不注册 migration。
- 不执行 payment workflow。
- 不改变 checkout、cart、order、payment、refund、settlement、commission 或 permission。
