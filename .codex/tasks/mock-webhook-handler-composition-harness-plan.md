# mock-webhook-handler-composition-harness-plan

## 目标

规划 mock webhook handler composition harness：未来用纯函数测试覆盖 runtime disabled、request reject、normalizer reject、duplicate replay、accepted inbox-only 和 guard blocked 等路径。

本任务只做文档和 ledger，不写 harness 代码，不新增 handler，不新增 API route。

## 允许修改

- `.codex/tasks/mock-webhook-handler-composition-harness-plan.md`
- `docs/mock-webhook-handler-composition-harness-plan.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- `apps/**`
- `packages/**`
- `package.json`
- `bun.lock`
- `.env` 或真实密钥

## 必须覆盖

- 纯函数 composition harness 的输入 fixtures。
- mock runtime disabled path。
- request contract rejected path。
- normalizer payload/signature rejected path。
- inbox repository duplicate replay path。
- inbox-only accepted path。
- state guard blocked path。
- command prepared but not executed path。
- response decision 和 audit event 断言。
- 后续实现文件边界。

## 禁止

- 不写 handler。
- 不新增 API route。
- 不连接数据库。
- 不执行 payment workflow。
- 不注册 module 或 migration。

## 验证命令

```bash
git diff --check
git grep -n -e 'china-payment-notification' -- packages/api/medusa-config.ts packages/api/src/api packages/api/src/workflows packages/api/src/subscribers packages/api/src/jobs packages/api/src/links || true
```
