# mock-webhook-neutral-route-smoke-validation

## 目标

记录 neutral mock webhook smoke script 合并后的验证结果。

本任务只写文档，不修改 runtime。

## 允许修改

- `.codex/tasks/mock-webhook-neutral-route-smoke-validation.md`
- `docs/mock-webhook-neutral-route-smoke-validation.md`
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

## 必须记录

- PR 编号和 merge commit。
- smoke script disabled 模式结果。
- payment notification harness 结果。
- DB residual query 结果。
- local-inmemory 模式需要 API 用 mock env 启动后再跑。

## 验证

```bash
git diff --check
```
