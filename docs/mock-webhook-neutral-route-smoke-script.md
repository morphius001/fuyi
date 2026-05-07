# Mock Webhook Neutral Route Smoke Script

更新时间：2026-05-07 19:20 Asia/Shanghai

## 目标

新增本地 smoke 脚本：

```text
.codex/scripts/mock-webhook-neutral-route-smoke.sh
```

脚本只请求 neutral route：

```text
POST /china/payment-webhooks/mock
```

它不再测试 Admin route 作为 provider callback。

## 模式

脚本支持：

```bash
.codex/scripts/mock-webhook-neutral-route-smoke.sh auto
.codex/scripts/mock-webhook-neutral-route-smoke.sh disabled
.codex/scripts/mock-webhook-neutral-route-smoke.sh local-inmemory
.codex/scripts/mock-webhook-neutral-route-smoke.sh production-disabled
```

默认模式是 `auto`。

## 重要限制

脚本不会启动、停止或重启 API 服务，也不会修改 `.env`。

因此：

- `disabled` 用于当前 API 处于默认 disabled 状态。
- `local-inmemory` 需要 API 进程已经用 mock local env 启动。
- `production-disabled` 需要当前 API 进程本身处于对应 disabled 状态。

脚本自己的环境变量不能改变已经运行中的 API 进程配置。

## 验证内容

`disabled`：

- HTTP 503。
- `status=disabled`。
- `code=RUNTIME_DISABLED`。
- `route=mock_payment_webhook_neutral_disabled_only`。

`local-inmemory`：

- fake signed CNY payload accepted，HTTP 202。
- missing signature rejected，HTTP 400。
- malformed payload rejected，HTTP 400。
- 响应不包含 raw payload、mock secret、signature 或 workflow result。

`auto`：

- 如果探测到 route disabled，则验证 disabled 后退出。
- 如果探测到 local in-memory route，则执行 local in-memory cases。

## 安全边界

脚本不会：

- 写真实密钥。
- 修改 `.env`。
- 连接预发或生产数据库。
- 启动或停止服务。
- 调用支付宝或微信支付。
- 执行 payment workflow。
- 测试退款、对账、商家结算、佣金或权限。

脚本不会连接业务、预发或生产 DB；只查询本地 payment notification dry-run 残留库名，并要求结果为空。

## 验证命令

```bash
bash -n .codex/scripts/mock-webhook-neutral-route-smoke.sh
.codex/scripts/mock-webhook-neutral-route-smoke.sh disabled
.codex/scripts/payment-notification-idempotency-harness.sh
```

## 风险结论

这是本地 mock smoke 脚本，不是生产支付验证。

它证明 neutral route 的本地 mock 行为和响应安全边界；DB-backed inbox、真实支付宝/微信支付、payment workflow、退款、对账和商家结算仍然要独立串行。
