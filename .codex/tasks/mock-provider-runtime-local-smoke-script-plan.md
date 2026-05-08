# Task: mock-provider-runtime-local-smoke-script-plan

## 目标

规划 `POST /china/payment-providers/mock` 的本地 disposable DB smoke wrapper。

本任务只写文档，不新增脚本，不启动服务，不连接外部数据库。

## 允许修改

- `.codex/tasks/mock-provider-runtime-local-smoke-script-plan.md`
- `docs/mock-provider-runtime-local-smoke-script-plan.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- 不修改 `apps/**`。
- 不修改 `packages/**`。
- 不修改 `.codex/scripts/**`。
- 不修改 `package.json`、`bun.lock`、`.env` 或真实密钥。
- 不注册 Medusa payment provider。
- 不接支付宝或微信支付。
- 不执行 payment workflow。
- 不连接预发或生产数据库。

## 规划内容

- 临时 API dev server 端口和进程管理。
- 本地 disposable DB 创建、migration up/down 和 cleanup。
- mock provider route env gate。
- accepted / duplicate / missing signature / remote actual DB refused smoke 场景。
- 输出脱敏规则。
- 失败 cleanup 和无残留检查。
- 后续 PR 拆分。

## 验证命令

```bash
git diff --check
git status --short --untracked-files=all
```

## 完成标准

- 文档明确脚本前置条件、禁止项、smoke 场景和失败处理。
- queue 更新下一项。
- 未修改 runtime code 或脚本。
