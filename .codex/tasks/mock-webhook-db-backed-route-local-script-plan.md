# Task: mock-webhook-db-backed-route-local-script-plan

## 目标

规划 neutral mock webhook route 的 local disposable DB smoke wrapper。

本任务只写文档，不新增脚本。

## 允许修改

- `.codex/tasks/mock-webhook-db-backed-route-local-script-plan.md`
- `docs/mock-webhook-db-backed-route-local-script-plan.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- 不修改 `packages/**`。
- 不修改 `apps/**`。
- 不新增脚本。
- 不新增或修改 API route。
- 不连接真实 DB-backed runtime。
- 不注册 migration。
- 不调用 payment workflow。
- 不接支付宝、微信支付、退款、对账、结算、佣金或权限逻辑。

## 规划要求

- 脚本未来只能管理自己创建的 disposable DB 和临时 API 进程。
- 不关闭、复用或杀死现有 9000 服务。
- 不修改 `.env` 或 production 配置。
- 使用单独端口，端口占用时退出。
- 使用 mock provider 和 mock secret。
- 只验证 neutral route。
- 验证结束必须 drop disposable DB 并复查无残留。
- smoke 仍保持 inbox-only，不执行 workflow。

## 验证命令

```bash
git diff --check
git diff --name-only
```

## 完成标准

- 文档能指导后续脚本 PR。
- 文档明确后续脚本不是生产 runtime 验证。
- 文档明确不触碰交易链路。
