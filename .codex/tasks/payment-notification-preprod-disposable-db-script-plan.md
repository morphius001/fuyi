# Task: payment-notification-preprod-disposable-db-script-plan

## 目标

规划未来 disposable preprod DB 脚本的输入、输出、安全检查和失败处理。

本任务只写文档，不新增脚本，不连接数据库。

## 允许修改

- `.codex/tasks/payment-notification-preprod-disposable-db-script-plan.md`
- `docs/payment-notification-preprod-disposable-db-script-plan.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- 不修改 `apps/**`。
- 不修改 `packages/**`。
- 不修改 `.codex/scripts/**`。
- 不修改 `packages/api/medusa-config.ts`。
- 不新增依赖。
- 不注册 migration。
- 不连接预发或生产数据库。
- 不写真实密钥。
- 不调用 payment workflow。

## 验证命令

```bash
git diff --check
```

## 完成标准

- 文档明确脚本参数、安全检查、输出格式和 No-Go。
- queue 和 ledger 更新。
- 未新增脚本。
