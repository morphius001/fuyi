# mock-webhook-local-route-disabled-plan

## 目标

规划未来 mock webhook local route 的 disabled-only 接入条件。此任务只写文档，不新增 route。

## 允许修改

- `.codex/tasks/mock-webhook-local-route-disabled-plan.md`
- `docs/mock-webhook-local-route-disabled-plan.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- `apps/**`
- `packages/**`
- `package.json`
- `bun.lock`
- `.env` 或真实密钥

## 必须覆盖

- 未来 route 路径建议。
- 默认 disabled 行为。
- route 文件允许和禁止内容。
- raw body 获取策略。
- env/secret 获取策略。
- repository 注入策略。
- 禁止 workflow execution。
- local-only 验证清单。
- 回滚策略。

## 验证

```bash
git diff --check
git grep -n -e 'china-payment-notification' -- packages/api/medusa-config.ts packages/api/src/api packages/api/src/workflows packages/api/src/subscribers packages/api/src/jobs packages/api/src/links || true
```
