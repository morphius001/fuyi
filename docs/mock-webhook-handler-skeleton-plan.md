# Mock Webhook Handler Skeleton Plan

更新时间：2026-05-07 23:55 Asia/Shanghai

## 目标

下一步如需写 handler，只允许写未注册 handler skeleton。它必须位于 payment notification module 内，不得放入 `packages/api/src/api/**`，不得成为真实 HTTP route。

## 允许的未来文件

```text
packages/api/src/modules/china-payment-notification/mock-webhook-handler.ts
packages/api/src/modules/china-payment-notification/__tests__/mock-payment-webhook-handler.unit.spec.ts
```

## 禁止的未来文件

```text
packages/api/src/api/**
packages/api/src/workflows/**
packages/api/src/subscribers/**
packages/api/src/jobs/**
packages/api/src/links/**
packages/api/medusa-config.ts
```

## Handler Skeleton 输入

未来未注册 handler 只能接收显式注入的参数：

- runtime config input
- raw body reader result
- headers
- mock secret
- receivedAt
- repository contract
- optional payment/order snapshots provider

它不能：

- 读取真实 request stream。
- 读取真实 env。
- resolve Medusa container。
- 创建数据库连接。
- 调用 workflow。

## Handler Skeleton 输出

输出应包含：

- response
- optional envelope
- optional receiveResult
- optional commandDecision
- optional auditEvent
- safe debug metadata

输出不能包含：

- raw payload 原文
- secret
- 完整签名
- openid / unionid
- private key / certificate
- workflow result
- payment/order mutation result

## 组合规则

未来 skeleton 应只调用：

1. `parsePaymentNotificationRuntimeConfig()`
2. `composeMockPaymentWebhookInboxOnly()`
3. safe response metadata builder

不要在 skeleton 里重新实现 payload parsing、验签、幂等、状态机守卫或 command mapper。

## 必测断言

- runtime disabled 时不调用 repository。
- missing signature 时不调用 repository。
- invalid payload 时不调用 repository。
- duplicate replay 返回 duplicate。
- inbox-only accepted 不生成 command。
- mock prepare-command 只生成 command DTO，不执行 workflow。
- repository error 返回稳定 response。
- response/debug metadata 不包含敏感字段。

## 后续 PR 拆分

1. `mock-webhook-handler-skeleton`：新增未注册 handler skeleton 和单测，不新增 route。
2. `mock-webhook-handler-post-validation`：合并后验证 harness、typecheck、runtime grep。
3. `mock-webhook-local-route-disabled-plan`：规划真实 API route 的 disabled-only 接入条件。
4. `mock-webhook-local-route-disabled-skeleton`：如要新增 route，必须默认 disabled、mock-only、无 workflow execution。

真实 API route、DB write、runtime switch、支付宝、微信支付、退款、对账和商家结算仍需单独串行。

## 本轮验证

本轮 docs-only：

```bash
git diff --check
git grep -n -e 'china-payment-notification' -- packages/api/medusa-config.ts packages/api/src/api packages/api/src/workflows packages/api/src/subscribers packages/api/src/jobs packages/api/src/links || true
```

预期：diff 无格式错误，runtime grep 无匹配。
