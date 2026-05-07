# Mock Webhook Neutral Local In-Memory Dev Server Script

更新时间：2026-05-07 19:40 Asia/Shanghai

## 目标

新增临时 dev server smoke wrapper：

```text
.codex/scripts/mock-webhook-neutral-local-inmemory-devserver-smoke.sh
```

它用于运行：

```bash
.codex/scripts/mock-webhook-neutral-route-smoke.sh local-inmemory
```

实际 dev server smoke 暴露了两个框架差异：

- Medusa HTTP 请求里不一定存在 `req.text()`，因此 neutral mock route 需要支持框架已解析的 JSON body。
- 有效 smoke payload 不能带尾随换行，否则签名会覆盖换行而框架解析后的 JSON body 不包含换行。
- malformed payload smoke 需要用 `text/plain`，避免 JSON body parser 在进入 route 前直接返回框架级 500。

本轮同时补齐 route 单测和 smoke payload 写法。

## 行为

脚本会：

- 加载 nvm 和 bun PATH。
- 确认临时端口未被占用。
- 确认本地 PostgreSQL `127.0.0.1:15432/mercur` 可访问。
- 使用单独端口启动临时 API，默认 `9100`。
- 注入 mock-only 支付通知 env。
- 等待 `/health` 返回 200。
- 调用 neutral route smoke 的 `local-inmemory` 模式。
- 结束时只关闭自己启动的临时 API 进程。

## 不会做什么

- 不关闭现有 9000 API 服务。
- 不修改 `.env`。
- 不写真实密钥。
- 不连接预发或生产 DB。
- 不执行 payment workflow。
- 不接支付宝或微信支付。
- 不测试退款、对账、商家结算、佣金或权限。

## 可配置变量

```text
MOCK_WEBHOOK_DEVSERVER_PORT=9100
MOCK_WEBHOOK_DEVSERVER_HOST=127.0.0.1
MOCK_WEBHOOK_POSTGRES_PORT=15432
MOCK_WEBHOOK_DATABASE_NAME=mercur
CHINA_PAYMENT_NOTIFICATION_MOCK_SECRET=local_neutral_smoke_secret_not_real
```

## 验证计划

```bash
bash -n .codex/scripts/mock-webhook-neutral-local-inmemory-devserver-smoke.sh
.codex/scripts/payment-notification-idempotency-harness.sh
```

如果本地 DB 和端口条件满足：

```bash
.codex/scripts/mock-webhook-neutral-local-inmemory-devserver-smoke.sh
```

## 风险结论

这是本地 mock smoke wrapper，不是生产支付验证。

它只验证 neutral route 在本地 mock env 下可走 accepted / rejected 响应安全边界。DB-backed inbox、真实 Provider、payment workflow、退款、对账和商家结算仍然单独串行。
