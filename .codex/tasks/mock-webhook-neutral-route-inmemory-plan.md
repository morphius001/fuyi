# mock-webhook-neutral-route-inmemory-plan

## 目标

规划 neutral mock payment webhook route 的 local-only in-memory 分支。

本任务只写文档，不修改 route，不接 handler。

## 允许修改

- `.codex/tasks/mock-webhook-neutral-route-inmemory-plan.md`
- `docs/mock-webhook-neutral-route-inmemory-plan.md`
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

- neutral route local-only env gate。
- 不允许 production 进入 in-memory 分支。
- 复用现有 handler/composition 的边界。
- in-memory repository 生命周期。
- 响应安全：不泄漏 raw payload、signature、secret。
- 不连接 DB、不执行 payment workflow。
- 后续 skeleton 和 smoke script PR 拆分。

## 验证

```bash
git diff --check
```

## 不自动执行

- 不自动 commit，除非用户明确授权。
- 不自动 push，除非用户明确授权。
- 不自动创建 PR，除非用户明确授权。
