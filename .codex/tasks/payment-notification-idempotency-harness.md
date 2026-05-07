# payment-notification-idempotency-harness

## 目标

新增本地验证 harness，把 mock notification 单元测试、inbox migration dry-run、禁止注册检查和禁止范围检查串起来。

## 允许修改

- `.codex/scripts/payment-notification-idempotency-harness.sh`
- `docs/payment-notification-idempotency-harness.md`
- `.codex/tasks/payment-notification-idempotency-harness.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- `apps/**`
- `packages/api/medusa-config.ts`
- `packages/api/package.json`
- `bun.lock`
- `.env`

## 验证命令

```bash
.codex/scripts/payment-notification-idempotency-harness.sh
```

脚本必须证明：

- mock payment notification unit tests 通过。
- inbox migration dry-run 通过。
- `medusa-config.ts` 未引用 `china-payment-notification`。
- staged 文件不包含禁止范围。
