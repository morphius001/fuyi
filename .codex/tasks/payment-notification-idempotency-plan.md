# payment-notification-idempotency-plan

## 目标

设计中国本地支付 Provider 后续接入前必须具备的支付通知验签、幂等、可重试和审计框架。

本任务只生成计划和验收边界，不实现真实支付代码。

## 背景

MercurJS 中国大陆多商户平台后续会需要 Mock China PaymentProvider、支付宝 Provider、微信支付 Provider、退款、对账和商家结算等高风险串行任务。

在这些任务进入代码实现前，必须先明确支付通知的系统边界：

- 支付成功必须以后端异步通知为准，不能以前端跳转页为准。
- 通知必须先验签，再进入业务处理。
- 通知处理必须幂等，同一 provider event 重放不能重复变更支付状态。
- 通知处理必须可重试，失败原因和 provider 原始事件需要可审计。
- 退款、对账、商家结算、佣金和权限不在本任务内实现。

## 允许修改

- `docs/payment-notification-idempotency-plan.md`
- `.codex/tasks/payment-notification-idempotency-plan.md`
- `.codex/queue.md`
- `project-ledger/**`
- `memory/**`，仅当沉淀出长期规则时

## 禁止修改

- `apps/**`
- `packages/**`
- `bun.lock`
- `package.json`
- `.env`
- 真实密钥、商户号、app id、私钥、证书、webhook token

## 禁止行为

- 不接入真实支付宝。
- 不接入真实微信支付。
- 不实现真实 Mock PaymentProvider 运行时。
- 不注册真实 payment provider。
- 不修改 order、payment、refund、payout、commission、permission 逻辑。
- 不改变 checkout、cart、订单状态、退款状态、结算状态。
- 不创建真实数据库 migration。
- 不连接预发或生产数据库。

## 计划内容要求

文档必须覆盖：

- Provider notification contract。
- Signature verification 边界。
- Idempotency key 生成规则。
- Provider event log / inbox 设计。
- 状态机入口和禁止直接状态变更规则。
- Retry-safe 行为。
- Duplicate / out-of-order / invalid-signature / unknown-order 处理。
- 前端 return URL 和后端 notify URL 的职责分离。
- Mock provider 与真实 Alipay / WeChat provider 的拆分顺序。
- 观测、审计、告警字段。
- 测试和 dry-run 方案。
- 后续 PR 拆分。

## 验证命令

```bash
git diff --check -- \
  docs/payment-notification-idempotency-plan.md \
  .codex/tasks/payment-notification-idempotency-plan.md \
  .codex/queue.md \
  project-ledger
```

并确认 staged 文件不包含：

```bash
git diff --cached --name-only | grep -E '^(apps|packages|bun.lock|package.json|\.env)' && exit 1 || true
```

## 完成输出

完成后只输出：

- 修改文件
- 验证结果
- 风险点
- 下一步建议

默认不要提交、不要 push、不要创建 PR；除非用户当前明确要求继续 push/开 PR。
