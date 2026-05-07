# mock-webhook-handler-skeleton-plan

## 目标

规划未注册 mock webhook handler skeleton 的文件边界和验收要求。下一步即使写 handler，也只能是 module 内未注册函数，不能新增 API route。

本任务只做文档和 ledger。

## 允许修改

- `.codex/tasks/mock-webhook-handler-skeleton-plan.md`
- `docs/mock-webhook-handler-skeleton-plan.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- `apps/**`
- `packages/**`
- `package.json`
- `bun.lock`
- `.env` 或真实密钥

## 必须覆盖

- handler skeleton 未来允许文件路径。
- 禁止路径：`packages/api/src/api/**`、workflows、subscribers、jobs、links。
- 输入输出合同。
- runtime disabled gate。
- raw body 读取边界。
- repository 注入边界。
- payment/order snapshot 只读边界。
- 不执行 workflow 的断言。
- 后续 PR 拆分和验证命令。

## 验证

```bash
git diff --check
git grep -n -e 'china-payment-notification' -- packages/api/medusa-config.ts packages/api/src/api packages/api/src/workflows packages/api/src/subscribers packages/api/src/jobs packages/api/src/links || true
```
