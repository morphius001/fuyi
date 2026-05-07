# Task: mock-webhook-db-backed-route-local-script

## 目标

新增 neutral mock webhook route 的 local disposable DB smoke wrapper。

第一版脚本只做 preflight：

- 创建/drop disposable DB。
- 验证未注册 inbox migration skeleton up/down。
- 启动临时 API。
- 在 local DB env 下确认 neutral route 仍返回 disabled。

本任务不修改 route runtime。

## 允许修改

- `.codex/scripts/mock-webhook-db-backed-route-local-smoke.sh`
- `.codex/tasks/mock-webhook-db-backed-route-local-script.md`
- `docs/mock-webhook-db-backed-route-local-script.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- 不修改 `packages/**`。
- 不修改 `apps/**`。
- 不修改 `.env`。
- 不关闭或复用现有 9000 API 服务。
- 不接 DB-backed route runtime。
- 不注册 migration。
- 不调用 payment workflow。
- 不接支付宝、微信支付、退款、对账、结算、佣金或权限逻辑。

## 验证命令

```bash
bash -n .codex/scripts/mock-webhook-db-backed-route-local-smoke.sh
.codex/scripts/mock-webhook-db-backed-route-local-smoke.sh
git diff --check
```

## 完成标准

- 脚本只管理自己启动的临时 API 和自己创建的 disposable DB。
- 端口占用时直接退出。
- 脚本结束后 route dry-run DB 无残留。
- 当前 route 未接 DB-backed runtime，所以 smoke 预期为 disabled。
