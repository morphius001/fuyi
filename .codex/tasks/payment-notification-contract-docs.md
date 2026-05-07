# payment-notification-contract-docs

## 目标

把 `payment-notification-idempotency-plan` 的第一步拆成可复用的支付通知合同文档，供后续 Mock China PaymentProvider、支付宝 Provider 和微信支付 Provider 串行实现时引用。

本任务仍然只做文档，不写运行时代码。

## 允许修改

- `docs/payment-notification-contract.md`
- `.codex/tasks/payment-notification-contract-docs.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- `apps/**`
- `packages/**`
- `bun.lock`
- `package.json`
- `.env`
- 任何真实密钥、证书、商户号、app id 或 webhook token

## 必须覆盖

- 标准通知 envelope。
- 标准 event type 命名。
- 验签结果 contract。
- 幂等 key contract。
- Provider 原始 payload 保存和脱敏规则。
- 支付成功、关闭、退款通知的边界说明。
- 前端 return URL 与后端 notify URL 职责分离。
- Mock / Alipay / WeChat Pay 后续 adapter 必须遵守的字段。

## 禁止行为

- 不实现 Provider。
- 不注册 Provider。
- 不新增 migration。
- 不修改 payment/order/refund/settlement/commission/permission 逻辑。
- 不连接预发或生产数据库。

## 验证命令

```bash
git diff --check -- \
  docs/payment-notification-contract.md \
  .codex/tasks/payment-notification-contract-docs.md \
  .codex/queue.md \
  project-ledger
```

并确认 staged 文件不包含业务代码：

```bash
git diff --cached --name-only | grep -E '^(apps|packages|bun.lock|package.json|\.env)' && exit 1 || true
```
