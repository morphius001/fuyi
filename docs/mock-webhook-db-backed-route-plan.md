# Mock Webhook DB-backed Route Plan

更新时间：2026-05-07 22:45 Asia/Shanghai

## 目标

规划 neutral mock webhook route 从 local in-memory 过渡到 DB-backed inbox skeleton。

目标 route：

```text
POST /china/payment-webhooks/mock
```

旧 Admin route 已降级为 disabled-only：

```text
POST /admin/china/mock-payment-webhooks
```

后续不再把 Admin route 当 provider callback 或 smoke 目标。

neutral route `POST /china/payment-webhooks/mock` 是唯一 mock provider callback 演进路径。

## 当前状态

已经具备：

- mock signature verifier。
- mock payload normalizer。
- idempotency key builder。
- request mapper。
- response mapper。
- handler composition helper。
- handler skeleton。
- runtime config parser，默认 disabled。
- inbox migration skeleton，未注册。
- repository contract。
- DB adapter skeleton，注入式 transaction client，未连接真实 DB。
- local disposable DB dry-run 脚本。
- neutral route disabled + local-only in-memory 分支。
- neutral route disabled smoke 和临时 devserver local-inmemory smoke。

尚未具备：

- route-level DB-backed repository resolver。
- route-level DB-backed transaction boundary。
- route-level disposable DB smoke。
- production migration registration。
- disposable preprod DB dry-run。
- payment workflow execution approval。

## 分层目标

### Layer 0: disabled

默认状态。

- Runtime disabled 返回 disabled。
- Production disabled。
- 不读取 body。
- 不连接 repository。

### Layer 1: local in-memory

已完成。

- 仅 `NODE_ENV !== production`。
- 仅 mock provider。
- 仅本地 smoke。
- 不连接 DB。
- 不执行 workflow。

### Layer 2: local disposable DB inbox-only

下一步目标。

- 只允许本地 disposable DB 或显式测试 database URL。
- 默认 disabled。
- Production disabled。
- 只写 inbox / event log。
- duplicate 返回 duplicate。
- rejected 写 terminal failure / audit event。
- 不调用 payment workflow。
- 不修改 payment session、order、refund、settlement、payout、commission 或 permission。

### Layer 3: DB-backed prepare-command

后续目标。

- 读取 inbox record。
- 运行 state guard。
- 生成 command DTO 和 audit event。
- 不执行 command。

### Layer 4: workflow execution

高风险串行任务。

- 必须单独 PR。
- 必须有 disposable preprod DB。
- 必须有真实 payment state transition 设计。
- 必须有回滚、幂等和人工复核策略。

本计划不进入 Layer 4。

## Feature Flag 草案

建议沿用现有 runtime parser，再新增独立 local DB 门禁。

```text
CHINA_PAYMENT_NOTIFICATION_RUNTIME_ENABLED=true
CHINA_PAYMENT_NOTIFICATION_WEBHOOK_MODE=mock_inbox_only
CHINA_PAYMENT_NOTIFICATION_PROVIDER=mock_china_pay
CHINA_PAYMENT_NOTIFICATION_LOCAL_DB=true
NODE_ENV=development
```

要求：

- 缺少任一条件时 route 返回 disabled。
- `NODE_ENV=production` 时强制 disabled。
- provider 不是 `mock_china_pay` 时强制 disabled。
- 不允许通过该 flag 接支付宝或微信支付。

## Repository Resolution 边界

下一步 route skeleton 不能直接读取 production 配置并写真实业务表。

推荐顺序：

1. 定义 route-level repository resolver contract。
2. resolver 默认返回 disabled / unavailable。
3. local DB smoke 注入 disposable DB transaction client。
4. route 只依赖 repository contract，不知道底层 DB 来源。
5. production resolver 保持 disabled，直到 migration registration 和 preprod dry-run 单独完成。

禁止：

- route 直接 import production DB client 并写库。
- route 直接调用 payment workflow。
- route 直接更新 payment session / order。
- route 使用真实支付宝或微信支付验签配置。

## Response Contract

| 场景 | HTTP | Body |
| --- | --- | --- |
| disabled | 503 | `status=disabled` |
| accepted | 202 | `status=accepted, mode=mock_inbox_only` |
| duplicate | 200 | `status=duplicate, mode=mock_inbox_only` |
| rejected | 400 | `status=rejected, code=...` |
| repository unavailable | 503 | `status=disabled` 或 `status=rejected, code=REPOSITORY_UNAVAILABLE` |

repository unavailable 在第一版建议返回 disabled，避免误以为 runtime 已可用。

## 必须测试

下一步 skeleton PR 至少覆盖：

- 默认 disabled 不读 body。
- production disabled。
- local DB flag 缺失 disabled。
- repository resolver unavailable disabled。
- accepted 首次通知写 inbox / event log。
- duplicate 返回 duplicate，并写 dedupe event。
- missing signature rejected。
- invalid signature rejected。
- malformed JSON rejected。
- non-CNY rejected。
- unsupported event type rejected。
- metadata 不包含 raw payload、完整签名、secret、手机号、openid、unionid、卡密。
- runtime grep 不命中 workflow/subscriber/job/link。
- disposable DB smoke 后无残留。

## PR 拆分

1. `mock-webhook-db-backed-route-resolver-plan`
   - docs-only。
   - 明确 resolver contract、disabled fallback 和 local disposable injection。

2. `mock-webhook-db-backed-route-resolver-contract`
   - 只新增 resolver contract / pure helpers / mocked tests。
   - 不接 route。

3. `mock-webhook-db-backed-route-local-script-plan`
   - docs-only。
   - 规划 neutral route local disposable DB smoke。

4. `mock-webhook-db-backed-route-local-script`
   - 新增本地 disposable DB smoke wrapper。
   - 不修改 production `.env`。
   - 不启动/停止现有服务，只管理自己创建的临时 DB / 临时 API。

5. `mock-webhook-db-backed-route-skeleton`
   - neutral route 在 local DB flag 下接 repository resolver。
   - inbox-only。
   - 不执行 workflow。
   - production disabled。

6. `mock-webhook-db-backed-route-validation`
   - 记录 harness、typecheck、runtime grep、local disposable DB smoke 和无残留。

## 停止点

完成 Layer 2 后必须停止重新评审。

进入 Layer 3 / Layer 4 前，需要重新确认：

- migration 是否仍未注册或是否已完成预发 dry-run。
- inbox/event log 是否满足审计和脱敏。
- state guard 是否覆盖真实 order/payment 状态。
- command mapper 是否仍只输出 DTO。
- 是否具备人工复核和回滚路径。

## 明确不做

本计划不做：

- 支付宝 Provider。
- 微信支付 Provider。
- 退款。
- 对账。
- 商家结算。
- 佣金。
- 权限。
- 真实 payment workflow execution。
- 真实 production migration registration。
