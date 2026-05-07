# mock-webhook-neutral-route-smoke-script

## 目标

新增 neutral mock payment webhook route 的本地 smoke 脚本。

## 允许修改

- `.codex/scripts/mock-webhook-neutral-route-smoke.sh`
- `.codex/tasks/mock-webhook-neutral-route-smoke-script.md`
- `docs/mock-webhook-neutral-route-smoke-script.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- `apps/**`
- `packages/**`
- `package.json`
- `bun.lock`
- `.env` 或真实密钥
- 支付、订单、退款、结算、佣金、权限业务逻辑

## 必须满足

- 脚本只打 `/china/payment-webhooks/mock`。
- 不启动服务。
- 不停止服务。
- 不修改 `.env`。
- 支持 `auto`、`disabled`、`local-inmemory`、`production-disabled` 模式。
- 默认 `auto` 如果当前 API disabled，只验证 disabled。
- `local-inmemory` 模式要求 API 进程已用对应 mock env 启动。
- 响应安全检查不泄漏 raw payload、signature、secret、workflow result。
- 不连接业务、预发或生产 DB；只查询本地 dry-run 残留库名并要求为空。

## 验证

```bash
bash -n .codex/scripts/mock-webhook-neutral-route-smoke.sh
.codex/scripts/mock-webhook-neutral-route-smoke.sh disabled
.codex/scripts/payment-notification-idempotency-harness.sh
```
