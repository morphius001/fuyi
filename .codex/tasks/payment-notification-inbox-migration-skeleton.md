# payment-notification-inbox-migration-skeleton

## 目标

把已通过本地 dry-run 的支付通知 inbox / event log SQL 固化为未注册 migration skeleton。

## 允许修改

- `packages/api/src/modules/china-payment-notification/migrations/**`
- `packages/api/src/modules/china-payment-notification/README.md`
- `.codex/tasks/payment-notification-inbox-migration-skeleton.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- `apps/**`
- `packages/api/medusa-config.ts`
- `packages/api/package.json`
- `bun.lock`
- `.env`
- 真实支付密钥、商户号、证书、app id 或 webhook token

## 必须保持

- 不注册生产 migration。
- 不接 Provider runtime。
- 不新增 API route、workflow、subscriber、job 或 link。
- 不改变 checkout、cart、order、payment、refund、settlement、commission 或 permission 行为。

## 验证命令

```bash
.codex/scripts/payment-notification-inbox-local-dry-run.sh
cd packages/api
bunx tsc --noEmit -p tsconfig.json
```

并确认 staged 文件不包含禁止范围：

```bash
git diff --cached --name-only | grep -E '^(apps|packages/api/medusa-config.ts|packages/api/package.json|bun.lock|\.env)' && exit 1 || true
```
