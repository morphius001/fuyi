# mock-webhook-admin-route-deprecation-plan

## 目标

规划旧 Admin mock webhook route 的保留、降级或删除策略。

本任务只写文档，不修改 route。

## 允许修改

- `.codex/tasks/mock-webhook-admin-route-deprecation-plan.md`
- `docs/mock-webhook-admin-route-deprecation-plan.md`
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

- Admin route 不再作为 provider callback。
- neutral route 已经承担 mock provider callback。
- Admin route 可选策略：保留 local debug、降级 disabled-only、删除。
- 推荐后续 PR 顺序。
- 不接 DB-backed route，不执行 workflow，不接真实 Provider。

## 验证

```bash
git diff --check
```
