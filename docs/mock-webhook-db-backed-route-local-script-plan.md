# Mock Webhook DB-backed Route Local Script Plan

更新时间：2026-05-07 23:25 Asia/Shanghai

## 目标

规划 neutral mock webhook route 的 local disposable DB smoke wrapper。

目标 route：

```text
POST /china/payment-webhooks/mock
```

本计划不新增脚本，不修改 route，不连接真实 runtime。

## 背景

当前已具备：

- neutral route disabled + local in-memory smoke。
- repository resolver pure helper。
- inbox migration skeleton。
- DB adapter skeleton。
- local disposable DB dry-run 脚本。

下一步脚本要验证的是未来 DB-backed route skeleton 的 local-only 行为。

## 脚本职责

未来脚本建议命名：

```text
.codex/scripts/mock-webhook-db-backed-route-local-smoke.sh
```

职责：

- 创建 disposable DB。
- 从未注册 migration skeleton 提取 up/down SQL。
- 在 disposable DB 上 apply up SQL。
- 启动临时 API dev server，使用独立端口。
- 注入 mock-only local DB env。
- 调用 neutral route smoke。
- 验证 accepted / duplicate / rejected 场景。
- 关闭自己启动的临时 API。
- apply down SQL 或 drop disposable DB。
- 复查 disposable DB 无残留。

## 环境门禁

未来脚本必须显式设置：

```text
CHINA_PAYMENT_NOTIFICATION_RUNTIME_ENABLED=true
CHINA_PAYMENT_NOTIFICATION_WEBHOOK_MODE=mock_inbox_only
CHINA_PAYMENT_NOTIFICATION_PROVIDER=mock_china_pay
CHINA_PAYMENT_NOTIFICATION_LOCAL_DB=true
CHINA_PAYMENT_NOTIFICATION_MOCK_SECRET=<local fake secret>
NODE_ENV=development
```

禁止：

- 不读取真实支付宝/微信支付配置。
- 不读取 production database URL。
- 不写 `.env`。
- 不依赖现有 9000 API 进程。
- 不关闭现有 9000 API 进程。

## 端口和进程规则

- 使用默认独立端口，例如 `9110`。
- 如果端口已占用，直接退出。
- 只记录自己启动的 PID。
- cleanup 只关闭自己启动的进程组。
- 不 kill node、bun、medusa 或 9000 端口上的既有服务。

## Disposable DB 规则

- DB 名称必须带时间戳或随机后缀。
- 只连接本地 PostgreSQL。
- 默认使用 `127.0.0.1:15432`。
- 必须在脚本退出时 drop。
- 必须复查：

```sql
select datname
from pg_database
where datname like 'fuyi_payment_notification_route_dry_run_%';
```

结果必须为空。

## Smoke 场景

未来脚本至少覆盖：

- default disabled。
- local DB accepted 首次通知。
- local DB duplicate 通知。
- missing signature rejected。
- invalid signature rejected。
- malformed JSON rejected。
- non-CNY rejected。
- unsupported event type rejected。
- response 不泄漏 raw payload、完整签名、secret、database URL。

## Inbox / Event Log 检查

accepted 后检查：

- inbox row count 为 1。
- event log 包含 `received` / `verified`。
- duplicate 后 event log 包含 `dedupe_hit`。
- rejected 后 event log 包含 terminal failure 或 audit action。
- metadata 不包含敏感字段。

## 禁止事项

脚本和后续 route skeleton 都不能：

- 调用 payment workflow。
- 修改 payment session。
- 修改 order。
- 创建 refund。
- 触发 settlement、payout、commission。
- 修改 permission。
- 接真实支付宝或微信支付。
- 注册 production migration。

## 后续 PR

1. `mock-webhook-db-backed-route-local-script`
   - 新增脚本。
   - 不修改 route，除非脚本需要纯 helper。
   - 优先先验证脚本能创建/drop disposable DB 和启动/关闭临时 API。

2. `mock-webhook-db-backed-route-skeleton`
   - route 接入 resolver available 分支。
   - 仅 local DB flag。
   - inbox-only。
   - production disabled。

3. `mock-webhook-db-backed-route-validation`
   - 记录 script、harness、typecheck、runtime grep 和 DB 无残留。

## 停止点

脚本 PR 完成后必须停止评审。

只有脚本可靠后，才允许 route skeleton 接 local DB resolver。
