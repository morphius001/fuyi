# mock-webhook-neutral-local-inmemory-devserver-plan

## 目标

规划使用临时 API dev server 验证 neutral mock webhook `local-inmemory` smoke。

本任务只写文档，不启动服务，不新增脚本。

## 允许修改

- `.codex/tasks/mock-webhook-neutral-local-inmemory-devserver-plan.md`
- `docs/mock-webhook-neutral-local-inmemory-devserver-plan.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- `apps/**`
- `packages/**`
- `.codex/scripts/**`
- `package.json`
- `bun.lock`
- `.env` 或真实密钥
- 支付、订单、退款、结算、佣金、权限业务逻辑

## 必须覆盖

- 使用单独 API 端口，不影响现有 9000 服务。
- 使用临时 mock env，不修改 `.env`。
- 启动后跑 `.codex/scripts/mock-webhook-neutral-route-smoke.sh local-inmemory`。
- 结束后关闭临时进程。
- 不连接预发/生产 DB。
- 不执行 payment workflow。

## 验证

```bash
git diff --check
```
