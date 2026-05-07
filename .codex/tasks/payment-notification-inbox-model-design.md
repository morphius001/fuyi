# payment-notification-inbox-model-design

## 目标

设计支付通知 inbox / event log 的数据模型和 dry-run 验证计划，为后续真正 migration skeleton 做准备。

当前任务只写文档，不新增 migration，不连接数据库。

## 允许修改

- `docs/payment-notification-inbox-model-design.md`
- `.codex/tasks/payment-notification-inbox-model-design.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- `apps/**`
- `packages/**`
- `bun.lock`
- `package.json`
- `.env`
- 真实支付密钥、商户号、证书、app id 或 webhook token

## 必须覆盖

- inbox 表职责。
- event log / audit 表职责。
- 幂等唯一约束。
- raw payload digest / storage ref。
- retry count、processing status、error code。
- payment/order 状态推进隔离。
- up/down dry-run 验证清单。
- 后续 PR 拆分。

## 禁止行为

- 不新增真实 migration。
- 不注册 runtime。
- 不写入真实数据库。
- 不接真实支付宝、微信支付或 Mock PaymentProvider runtime。
- 不修改 checkout、cart、order、payment、refund、settlement、commission、permission 行为。

## 验证命令

```bash
git diff --check -- \
  docs/payment-notification-inbox-model-design.md \
  .codex/tasks/payment-notification-inbox-model-design.md \
  .codex/queue.md \
  project-ledger
```

并确认 staged 文件不包含业务代码：

```bash
git diff --cached --name-only | grep -E '^(apps|packages|bun.lock|package.json|\.env)' && exit 1 || true
```
