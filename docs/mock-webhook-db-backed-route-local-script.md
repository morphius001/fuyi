# Mock Webhook DB-backed Route Local Script

更新时间：2026-05-07 23:45 Asia/Shanghai

## 目标

新增本地 smoke wrapper：

```text
.codex/scripts/mock-webhook-db-backed-route-local-smoke.sh
```

当前 neutral route 尚未接 DB-backed resolver runtime，因此第一版脚本是 preflight smoke。

## 当前脚本做什么

- 加载 Node 24 和 Bun。
- 检查本地 PostgreSQL 和本地 app database 可达。
- 创建 disposable DB：

```text
fuyi_payment_notification_route_dry_run_<timestamp>
```

- 从未注册 migration skeleton 提取 up/down SQL。
- 在 disposable DB 上验证 payment notification inbox/event log tables up/down。
- drop disposable DB 并复查无残留。
- 启动临时 API dev server，默认端口 `9110`。
- 注入 mock-only local DB env：

```text
CHINA_PAYMENT_NOTIFICATION_RUNTIME_ENABLED=true
CHINA_PAYMENT_NOTIFICATION_WEBHOOK_MODE=mock_inbox_only
CHINA_PAYMENT_NOTIFICATION_PROVIDER=mock_china_pay
CHINA_PAYMENT_NOTIFICATION_LOCAL_DB=true
NODE_ENV=development
```

- 调用 neutral route smoke 的 disabled 模式，确认当前 route 仍未接 DB-backed runtime。
- 关闭自己启动的临时 API 进程。

## 当前脚本不做什么

- 不修改 neutral route。
- 不让 DB-backed route accepted。
- 不写 inbox/event log runtime。
- 不读取真实支付宝或微信支付配置。
- 不修改 `.env`。
- 不关闭现有 9000 API 服务。
- 不注册 migration。
- 不调用 payment workflow。
- 不修改 payment、order、refund、settlement、payout、commission 或 permission。

## 为什么先做 preflight

此时 route 还没有接入 `resolveMockWebhookInboxRepository()`。

如果脚本此时伪造 accepted / duplicate，会让本地验证误以为 DB-backed route 已经可用。

因此第一版只验证两件事：

1. disposable DB / migration up-down / cleanup 可靠。
2. local DB env 下，route 仍保持 disabled，直到后续 route skeleton PR 显式接入。

## 验证

```bash
bash -n .codex/scripts/mock-webhook-db-backed-route-local-smoke.sh
.codex/scripts/mock-webhook-db-backed-route-local-smoke.sh
git diff --check
```

## 后续

下一步建议：

```text
mock-webhook-db-backed-route-skeleton
```

该 PR 才允许 neutral route 在 local DB flag + resolver available 下写 inbox/event log。

仍然禁止 payment workflow execution、真实支付宝、微信支付、退款、对账、结算、佣金和权限改动。
