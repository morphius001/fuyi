# Mock Provider Runtime Local Smoke Script Plan

更新时间：2026-05-08 Asia/Shanghai

## 目标

为 `POST /china/payment-providers/mock` 规划一个本地 disposable DB smoke wrapper。该 wrapper 后续只用于验证 mock provider route 的 local inbox-only skeleton，不用于真实支付、不连接预发或生产数据库。

本文件只做计划；本轮不新增脚本、不修改 runtime code、不启动服务。

## 前置条件

后续脚本执行前必须满足：

- 当前分支包含 PR #187 的 mock provider local inbox-only skeleton。
- PostgreSQL 本地服务可访问，例如 `127.0.0.1:15432`。
- 临时 DB 名必须使用严格前缀，例如 `fuyi_payment_notification_route_dry_run_`。
- API dev server 必须使用临时端口，例如 `9120`，并且只关闭自己启动的进程。
- 不读取 `.env` 中真实支付密钥。

## Runtime Env

脚本启动临时 API 时只能注入 mock/local env：

```text
NODE_ENV=development
CHINA_PAYMENT_NOTIFICATION_RUNTIME_ENABLED=true
CHINA_PAYMENT_NOTIFICATION_WEBHOOK_MODE=mock_inbox_only
CHINA_PAYMENT_NOTIFICATION_PROVIDER=mock_china_pay
CHINA_PAYMENT_PROVIDER_REGISTRY_MODE=mock_contract_only
CHINA_PAYMENT_NOTIFICATION_LOCAL_DB=true
CHINA_PAYMENT_NOTIFICATION_LOCAL_DB_URL=postgres://codex@127.0.0.1:15432/<disposable-db>
CHINA_PAYMENT_NOTIFICATION_LOCAL_DB_NAME=<disposable-db>
CHINA_PAYMENT_NOTIFICATION_MOCK_SECRET=<fake-local-secret>
```

禁止使用真实支付宝、微信支付、短信、IM、物流、银行或商户密钥。

## Smoke 场景

后续脚本至少覆盖：

1. `disabled`
   - 不开启 runtime env。
   - 期望 503。
   - 确认不读 body、不写 inbox。

2. `accepted`
   - 使用 fake signed `payment.succeeded` payload。
   - 期望 202。
   - 确认 inbox/event log 有记录。
   - 响应不包含 raw body、signature、secret、DB URL 或 header names。

3. `duplicate`
   - 重放同一 event id / idempotency key。
   - 期望 200 duplicate。
   - 确认只产生 dedupe audit，不重复推进状态。

4. `missing-signature`
   - 不传 fake signature。
   - 期望 400 rejected。
   - 确认拒绝响应不泄露 raw body 或 secret。

5. `remote-actual-db-refused`
   - 单元测试已覆盖实际 PG server host 不是本地时 disabled。
   - smoke wrapper 可以先不伪造远端 PG；后续如果能注入 fake driver，再加 CLI 场景。

## Cleanup

脚本必须：

- 记录自己启动的 API PID。
- 退出时关闭自己启动的 API 进程。
- 执行 migration down。
- 删除 disposable DB。
- 复查 `fuyi_payment_notification_*dry_run_*` 无残留。
- 不删除用户已有服务、worktree 或数据库。

## 输出规则

允许输出：

- route status
- response status/code/mode
- inbox/event log row count
- disposable DB 名
- cleanup 状态

禁止输出：

- raw payload
- fake signature 值
- mock secret
- DB password
- full connection string
- authorization/header values

## 后续 PR 拆分

1. `mock-provider-runtime-local-smoke-script`
   - 新增脚本 skeleton。
   - 先支持 disabled / accepted / duplicate / missing-signature。
   - 不连接预发或生产。

2. `mock-provider-runtime-local-smoke-validation`
   - 运行脚本并记录本地验证结果。
   - 继续确认 runtime 未注册、DB 无残留、workflow 未执行。

3. `mock-provider-runtime-preprod-smoke-plan`
   - 只规划 disposable preprod DB 条件。
   - 没有外部授权前保持 blocked-external。

## 仍未进入范围

- 支付宝 Provider。
- 微信支付 Provider。
- 真实 payment workflow execution。
- 退款、对账、商家结算、佣金、权限。
- Admin 开关真实生效。
- checkout/payment/order 状态变更。
