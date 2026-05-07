# mock-webhook-local-route-smoke-script-plan

## 目标

规划本地 mock webhook route smoke 脚本。此任务只写文档，不新增脚本。

## 允许修改

- `.codex/tasks/mock-webhook-local-route-smoke-script-plan.md`
- `docs/mock-webhook-local-route-smoke-script-plan.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- `apps/**`
- `packages/**`
- `.codex/scripts/**`
- `package.json`
- `bun.lock`
- `.env` 或真实密钥

## 必须覆盖

- smoke 脚本前置条件。
- disabled case。
- local in-memory accepted case。
- missing signature rejected case。
- malformed payload rejected case。
- 不连接 DB、不执行 workflow 的检查。
- 日志和敏感信息限制。

## 验证

```bash
git diff --check
```
