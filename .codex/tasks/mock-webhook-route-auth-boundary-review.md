# mock-webhook-route-auth-boundary-review

## 目标

审查 mock webhook route 放在 `/admin/**` 下的认证边界风险，决定后续 smoke/script/route 是否需要迁移到非 Admin provider callback 路径。

本任务只写文档，不改 route。

## 允许修改

- `.codex/tasks/mock-webhook-route-auth-boundary-review.md`
- `docs/mock-webhook-route-auth-boundary-review.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- `apps/**`
- `packages/**`
- `.codex/scripts/**`
- `package.json`
- `bun.lock`
- `.env` 或真实密钥

## 验证

```bash
git diff --check
```
