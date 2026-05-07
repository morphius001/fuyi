# Mock Webhook Local Route Smoke Script Plan

更新时间：2026-05-08 01:30 Asia/Shanghai

## 目标

规划后续 `.codex/scripts/mock-webhook-local-route-smoke.sh`。该脚本只用于本地验证 Admin mock webhook route 的 disabled 和 local in-memory 分支。

本轮不新增脚本。

## 前置条件

- 本地 API dev server 已运行：`http://localhost:9000`
- 不连接预发或生产。
- 不读取 `.env` 中真实密钥。
- smoke 使用脚本内临时 mock secret。
- `NODE_ENV` 不得为 `production`。

## 计划覆盖

### 1. Disabled Case

默认 env：

```text
POST /admin/china/mock-payment-webhooks
```

预期：

```text
HTTP 503
status=disabled
code=RUNTIME_DISABLED
```

并确认不要求 body / signature。

### 2. Local In-Memory Accepted Case

临时 env：

```text
CHINA_PAYMENT_NOTIFICATION_RUNTIME_ENABLED=true
CHINA_PAYMENT_NOTIFICATION_WEBHOOK_MODE=mock_inbox_only
CHINA_PAYMENT_NOTIFICATION_PROVIDER=mock_china_pay
CHINA_PAYMENT_NOTIFICATION_LOCAL_INMEMORY=true
CHINA_PAYMENT_NOTIFICATION_MOCK_SECRET=<temporary mock secret>
```

发送 fake signed CNY payload。

预期：

```text
HTTP 202
status=accepted
mode=mock_inbox_only
```

### 3. Missing Signature Case

同样 local env，但不发送 signature header。

预期：

```text
HTTP 400
status=rejected
code=SIGNATURE_MISSING
```

### 4. Malformed Payload Case

发送无法 JSON parse 的 raw body，并用 mock secret 签名。

预期：

```text
HTTP 400
status=rejected
code=PAYLOAD_INVALID
```

## 安全检查

脚本必须检查：

- response 中不包含 raw payload。
- response 中不包含 mock secret。
- response 中不包含完整 signature。
- response 中不包含 workflowResult。
- disposable DB residual query 为空。

## 禁止

- 不连接数据库。
- 不启动或停止服务。
- 不修改 `.env`。
- 不写真实密钥。
- 不调用支付宝、微信支付、短信、IM 或物流。
- 不执行 payment workflow。

## 后续 PR 拆分

1. `mock-webhook-local-route-smoke-script`：新增本地 smoke 脚本。
2. `mock-webhook-local-route-smoke-validation`：记录 smoke 结果。
3. `mock-webhook-local-route-disposable-db-plan`：再规划 DB-backed local route smoke。

真实 DB、预发 DB、支付宝、微信支付、退款、对账和结算继续单独串行。
