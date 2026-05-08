# Task: mock-provider-runtime-local-smoke-script

## 目标

新增 `POST /china/payment-providers/mock` 的本地 disposable DB smoke wrapper。

## 允许修改

- `.codex/scripts/mock-provider-runtime-local-smoke.sh`
- `packages/api/src/api/china/payment-providers/mock/route.ts`，仅允许修复本地 Postgres `inet_server_addr()` CIDR 格式识别
- `packages/api/src/api/china/payment-providers/mock/__tests__/route.unit.spec.ts`，仅允许补对应单测
- `.codex/tasks/mock-provider-runtime-local-smoke-script.md`
- `docs/mock-provider-runtime-local-smoke-script.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- 不修改 `apps/**`。
- 不修改 `packages/**`，上述 route CIDR 识别修复除外。
- 不修改 `package.json`、`bun.lock`、`.env` 或真实密钥。
- 不注册 Medusa payment provider。
- 不接支付宝或微信支付。
- 不执行 payment workflow。
- 不连接预发或生产数据库。

## 脚本要求

- 只使用本地 PostgreSQL。
- 只创建 `fuyi_payment_notification_route_dry_run_*` disposable DB。
- 本地 app DB 只允许作为 schema-only 来源；临时 API 的 `CODEX_DATABASE_URL` 必须始终指向 disposable DB。
- 使用临时 API 端口，默认 `9120`。
- 只关闭自己启动的 API 进程。
- 支持 `disabled`、`accepted`、`duplicate`、`rejected` 模式。
- 响应、失败输出和日志摘要不得输出 raw payload、signature、mock secret、DB password、full connection string、authorization/header values 或 raw event metadata。
- 结束后删除 disposable DB 并复查无残留。

## 验证命令

```bash
.codex/scripts/mock-provider-runtime-local-smoke.sh disabled
.codex/scripts/mock-provider-runtime-local-smoke.sh accepted
.codex/scripts/mock-provider-runtime-local-smoke.sh duplicate
.codex/scripts/mock-provider-runtime-local-smoke.sh rejected
.codex/scripts/payment-notification-idempotency-harness.sh
bunx tsc --noEmit -p packages/api/tsconfig.json
git diff --check
```

## 完成标准

- 四个 smoke 模式通过或明确记录本地外部条件阻塞。
- Harness 和 API typecheck 通过。
- 未修改 runtime code。
- 未注册 provider 或执行 workflow。
