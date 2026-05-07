# mock-payment-notification-skeleton-plan

## 目标

规划后续 Mock China Payment notification skeleton 的最小实现范围。当前任务只写计划，不写 `packages/**` 代码。

## 允许修改

- `docs/mock-payment-notification-skeleton-plan.md`
- `.codex/tasks/mock-payment-notification-skeleton-plan.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- `apps/**`
- `packages/**`
- `bun.lock`
- `package.json`
- `.env`
- 真实支付密钥、商户号、证书、app id 或 webhook token

## 必须规划

- Mock-only adapter 的文件边界。
- Fake signature verifier。
- Fake payload normalizer。
- 不注册 provider、不改变 runtime 的原则。
- 单元测试覆盖：验签通过、验签失败、重复 event key、金额不一致、未知订单引用。
- 后续进入 inbox/model dry-run 前的退出条件。

## 禁止行为

- 不实现真实支付宝或微信支付。
- 不让 Mock Provider 参与真实 checkout。
- 不修改 payment/order/refund/settlement/commission/permission 逻辑。
- 不新增真实 migration。
- 不连接预发或生产数据库。

## 验证命令

```bash
git diff --check -- \
  docs/mock-payment-notification-skeleton-plan.md \
  .codex/tasks/mock-payment-notification-skeleton-plan.md \
  .codex/queue.md \
  project-ledger
```

并确认 staged 文件不包含业务代码：

```bash
git diff --cached --name-only | grep -E '^(apps|packages|bun.lock|package.json|\.env)' && exit 1 || true
```
