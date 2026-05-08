# Task: mock-provider-runtime-preprod-smoke-plan

## 目标

规划未来 `POST /china/payment-providers/mock` 在 disposable preprod DB 上的 smoke 验证，不执行外部数据库连接。

## 允许修改

- `.codex/tasks/mock-provider-runtime-preprod-smoke-plan.md`
- `docs/mock-provider-runtime-preprod-smoke-plan.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- 不修改 `apps/**`。
- 不修改 `packages/**`。
- 不修改 `.codex/scripts/**`。
- 不修改 `package.json`、`bun.lock`、`.env` 或真实密钥。
- 不连接预发或生产数据库。
- 不注册 Medusa payment provider。
- 不接支付宝或微信支付。
- 不执行 payment workflow。

## 规划要求

- 明确 disposable preprod DB 前置条件。
- 明确 Go / No-Go 门禁。
- 明确变量输入和禁止输入。
- 明确 smoke 场景：disabled、accepted、duplicate、rejected。
- 明确输出脱敏、cleanup、回滚和残留检查。
- 明确仍不能触碰 checkout、order、payment、refund、settlement、commission、payout 或 permission 状态。

## 验证命令

```bash
git diff --check
git diff --name-only
```

## 完成标准

- 只新增 docs/task/ledger/queue。
- 没有 runtime code、script、provider、DB connection 或 payment workflow execution。
