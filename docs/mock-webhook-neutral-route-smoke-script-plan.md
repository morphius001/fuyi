# Mock Webhook Neutral Route Smoke Script Plan

更新时间：2026-05-07 19:05 Asia/Shanghai

## 目标

规划后续本地 smoke 脚本：

```text
.codex/scripts/mock-webhook-neutral-route-smoke.sh
```

本轮不新增脚本。

脚本只验证 neutral provider callback 路径：

```text
POST /china/payment-webhooks/mock
```

不再把 `/admin/china/mock-payment-webhooks` 当作 provider callback smoke 目标。

## 前置条件

- 本地 API dev server 已运行：`http://localhost:9000`
- 不启动服务。
- 不停止服务。
- 不修改 `.env`。
- 不读取真实密钥。
- 使用脚本内临时 mock secret。
- 不连接预发或生产。

## 计划覆盖

### 1. Disabled Case

默认环境或不传 local gate：

```text
POST /china/payment-webhooks/mock
```

预期：

```text
HTTP 503
status=disabled
code=RUNTIME_DISABLED
route=mock_payment_webhook_neutral_disabled_only
```

必须确认：

- 不要求 body。
- 不要求 signature。
- 不返回 raw payload。

### 2. Local In-Memory Accepted Case

临时环境：

```text
CHINA_PAYMENT_NOTIFICATION_RUNTIME_ENABLED=true
CHINA_PAYMENT_NOTIFICATION_WEBHOOK_MODE=mock_inbox_only
CHINA_PAYMENT_NOTIFICATION_PROVIDER=mock_china_pay
CHINA_PAYMENT_NOTIFICATION_LOCAL_INMEMORY=true
CHINA_PAYMENT_NOTIFICATION_MOCK_SECRET=<temporary mock secret>
NODE_ENV=development
```

发送 fake signed CNY payload。

预期：

```text
HTTP 202
status=accepted
mode=mock_inbox_only
route=mock_payment_webhook_neutral_local_inmemory
```

### 3. Missing Signature Case

同样 local env，但不发送 signature header。

预期：

```text
HTTP 400
status=rejected
code=SIGNATURE_MISSING
route=mock_payment_webhook_neutral_local_inmemory
```

### 4. Malformed Payload Case

发送无法 JSON parse 的 raw body，并用 mock secret 签名。

预期：

```text
HTTP 400
status=rejected
code=PAYLOAD_INVALID
route=mock_payment_webhook_neutral_local_inmemory
```

### 5. Production Disabled Case

即使 local env gate 打开，只要 `NODE_ENV=production`：

```text
HTTP 503
status=disabled
code=RUNTIME_DISABLED
```

脚本不能真正改写生产环境，只能用临时进程 env 调用本地开发 API。

## 安全检查

每个响应都检查不包含：

- raw payload。
- temporary mock secret。
- full signature。
- workflow command body。
- workflow result。
- payment/order mutation result。

DB 残留检查：

```bash
psql -h 127.0.0.1 -p 15432 -U "$USER" -d postgres -tAc "select datname from pg_database where datname like 'fuyi_payment_notification_repository_dry_run_%' or datname like 'fuyi_payment_notification_inbox_dry_run_%'"
```

预期为空。

## 脚本边界

脚本允许：

- 使用 `curl` 请求本地 API。
- 使用临时 payload 文件。
- 使用 Node/Bun inline 生成 mock signature。
- 检查 JSON response 字段。

脚本禁止：

- 修改 `.env`。
- 启动或停止 API 服务。
- 写真实密钥。
- 连接预发或生产数据库。
- 调用支付宝、微信支付、短信、IM、物流。
- 执行 payment workflow。
- 测试 refund、reconciliation、settlement、commission 或 permission。

## 关于 Duplicate

当前 neutral route 使用 route-local in-memory repository，不承诺跨请求共享幂等状态。

因此 smoke 脚本第一版不强测 duplicate。duplicate 应留给：

1. DB-backed inbox route smoke。
2. 或单独共享 local repository 生命周期设计。

## 后续 PR 拆分

1. `mock-webhook-neutral-route-smoke-script`
   - 新增 `.codex/scripts/mock-webhook-neutral-route-smoke.sh`。
   - 只打 neutral route。
   - 不启动/停止服务。

2. `mock-webhook-neutral-route-smoke-validation`
   - 记录本地 smoke 结果。

3. `mock-webhook-admin-route-deprecation-plan`
   - 规划 Admin route 保留、降级或删除。

4. `mock-webhook-db-backed-route-plan`
   - 再规划 DB-backed inbox route。

## 验证计划

本轮 docs-only：

```bash
git diff --check
git diff --name-only
```

后续脚本 PR：

```bash
.codex/scripts/payment-notification-idempotency-harness.sh
.codex/scripts/mock-webhook-neutral-route-smoke.sh
cd packages/api && bunx tsc --noEmit -p tsconfig.json
```

## 结论

可以新增 neutral route smoke 脚本，但它只能证明本地 mock route 的 disabled、accepted、rejected 和响应安全边界。

它不能替代 DB-backed inbox、真实支付 Provider、workflow 执行、退款、对账或商家结算验证。
