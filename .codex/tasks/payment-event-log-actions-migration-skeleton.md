# payment-event-log-actions-migration-skeleton

## 目标

扩展未注册 payment notification inbox migration skeleton 的 event log action 白名单，并让本地 disposable DB dry-run 覆盖新增 action。

## 允许修改

- `packages/api/src/modules/china-payment-notification/types.ts`
- `packages/api/src/modules/china-payment-notification/migrations/Migration20260507000200.ts`
- `.codex/scripts/payment-notification-inbox-local-dry-run.sh`
- `.codex/tasks/payment-event-log-actions-migration-skeleton.md`
- `docs/payment-event-log-actions-migration-skeleton.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- `apps/**`
- `packages/api/medusa-config.ts`
- `packages/api/src/api/**`
- `packages/api/src/workflows/**`
- `packages/api/src/subscribers/**`
- `packages/api/src/jobs/**`
- `packages/api/src/links/**`
- `bun.lock`
- `package.json`
- `.env`

## 安全边界

- 不注册 migration。
- 不接 webhook runtime。
- 不调用 payment workflow。
- 不修改 payment/order/refund/settlement/commission/permission 状态。
- 不连接预发或生产数据库。
- 不保存真实 provider payload、密钥、证书、手机号明文、openid 或 unionid 明文。

## 验证命令

```bash
.codex/scripts/payment-notification-inbox-local-dry-run.sh
bunx tsc --noEmit -p packages/api/tsconfig.json
git grep -n -e 'china-payment-notification' -- \
  packages/api/medusa-config.ts \
  packages/api/src/api \
  packages/api/src/workflows \
  packages/api/src/subscribers \
  packages/api/src/jobs \
  packages/api/src/links
```
