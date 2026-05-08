# Mock Provider Runtime Local Smoke Script

更新时间：2026-05-08 Asia/Shanghai

## 结论

新增本地 smoke wrapper：

```bash
.codex/scripts/mock-provider-runtime-local-smoke.sh [disabled|accepted|duplicate|rejected]
```

脚本只验证 `POST /china/payment-providers/mock` 的 local disposable DB inbox-only skeleton。它不接真实支付、不连接预发或生产数据库、不执行 payment workflow。

本轮同时补了一个本地连接识别兼容：PostgreSQL `inet_server_addr()` 可能返回 `127.0.0.1/32`，route 会先归一化 CIDR 后缀再判断本地连接。

## 覆盖范围

脚本支持四种模式：

- `disabled`: 临时 API 仍只连接 disposable DB，env 关闭 mock provider runtime，预期 route disabled 且不写 inbox。
- `accepted`: 临时 API 连接 disposable DB，fake signed payload 预期 202 accepted，并写入 inbox/event log。
- `duplicate`: 重放同一 fake signed payload，预期 200 duplicate，并产生 dedupe audit。
- `rejected`: 不传 fake signature，预期 400 rejected，inbox/event log 保持空。

本地 app DB 只作为 schema-only dump 来源，脚本不会把临时 API 的 `CODEX_DATABASE_URL` 指向普通 app DB。

## 安全边界

脚本会拒绝：

- 非本地 PostgreSQL host。
- 非 `fuyi_payment_notification_route_dry_run_*` 前缀 DB 名。
- 非安全格式的 schema source DB 名。
- 已被占用的临时 API 端口。

脚本只关闭自己启动的进程，只删除自己创建的 disposable DB。

## 输出脱敏

脚本不应输出：

- raw payload
- fake signature 值
- mock secret
- full DB URL
- DB password
- authorization/header values
- 失败时的 raw event metadata 或临时 API log 内容
- 非 JSON 响应解析错误的原始响应片段

响应检查会确认 accepted / duplicate / rejected 不泄露 raw payload、signature、secret、DB URL 或 signature header name。

## 验证

本轮已执行验证：

- `.codex/scripts/mock-provider-runtime-local-smoke.sh disabled` 通过。
- `.codex/scripts/mock-provider-runtime-local-smoke.sh accepted` 通过。
- `.codex/scripts/mock-provider-runtime-local-smoke.sh duplicate` 通过。
- `.codex/scripts/mock-provider-runtime-local-smoke.sh rejected` 通过。
- `.codex/scripts/payment-notification-idempotency-harness.sh` 通过，21 suites / 143 tests。
- `bunx tsc --noEmit -p packages/api/tsconfig.json` 通过。
- `git diff --check` 通过。
- `medusa-config.ts` 未出现 `china-payment-notification` 或 `mock_china_pay` 注册。
- disposable DB 和 9120 端口复查无残留。

建议后续复验：

```bash
.codex/scripts/mock-provider-runtime-local-smoke.sh disabled
.codex/scripts/mock-provider-runtime-local-smoke.sh accepted
.codex/scripts/mock-provider-runtime-local-smoke.sh duplicate
.codex/scripts/mock-provider-runtime-local-smoke.sh rejected
.codex/scripts/payment-notification-idempotency-harness.sh
bunx tsc --noEmit -p packages/api/tsconfig.json
git diff --check
```

## 仍未进入范围

- 支付宝 Provider。
- 微信支付 Provider。
- 真实 payment workflow execution。
- 退款、对账、商家结算、佣金、权限。
- checkout/payment/order 状态变更。
- 预发或生产数据库。
