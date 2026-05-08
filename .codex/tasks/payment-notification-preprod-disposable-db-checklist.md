# Task: payment-notification-preprod-disposable-db-checklist

## 目标

准备 payment notification disposable preprod DB 执行清单，供未来人工提供外部库后使用。

本任务只写文档，不连接任何数据库。

## 允许修改

- `.codex/tasks/payment-notification-preprod-disposable-db-checklist.md`
- `docs/payment-notification-preprod-disposable-db-checklist.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- 不修改 `apps/**`。
- 不修改 `packages/**`。
- 不修改 `packages/api/medusa-config.ts`。
- 不新增依赖。
- 不注册 migration。
- 不连接预发或生产数据库。
- 不写真实密钥。
- 不接支付宝、微信支付、退款、对账、结算、佣金或权限逻辑。
- 不调用 payment workflow。

## 验证命令

```bash
git diff --check
```

## 完成标准

- 文档包含 Go/No-Go。
- 文档包含变量模板但不含真实密钥。
- 文档包含执行前、执行中、执行后检查。
- queue 和 ledger 更新。
