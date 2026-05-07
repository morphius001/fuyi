# mock-webhook-neutral-local-inmemory-devserver-script

## 目标

新增临时 API dev server smoke wrapper，用于运行 neutral mock webhook `local-inmemory` smoke。

## 允许修改

- `.codex/scripts/mock-webhook-neutral-local-inmemory-devserver-smoke.sh`
- `.codex/tasks/mock-webhook-neutral-local-inmemory-devserver-script.md`
- `docs/mock-webhook-neutral-local-inmemory-devserver-script.md`
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

- 使用单独端口，默认 9100。
- 端口占用时退出，不 kill 现有进程。
- 不修改 `.env`。
- 只关闭自己启动的临时 API 进程。
- 使用本地 DB `127.0.0.1:15432/mercur`。
- 不连接预发或生产 DB。
- 不执行 payment workflow。
- 不接支付宝或微信支付。

## 验证

```bash
bash -n .codex/scripts/mock-webhook-neutral-local-inmemory-devserver-smoke.sh
.codex/scripts/payment-notification-idempotency-harness.sh
```

如果本地 DB 和端口条件满足，可运行：

```bash
.codex/scripts/mock-webhook-neutral-local-inmemory-devserver-smoke.sh
```
