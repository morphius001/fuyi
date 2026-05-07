# payment-notification-inbox-local-dry-run

## 目标

新增本地 disposable DB dry-run 脚本，用于验证支付通知 inbox / event log 的 migration skeleton SQL、幂等唯一约束、状态约束和 rollback。

## 允许修改

- `.codex/scripts/payment-notification-inbox-local-dry-run.sh`
- `docs/local-payment-notification-inbox-dry-run.md`
- `.codex/tasks/payment-notification-inbox-local-dry-run.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- `apps/**`
- `packages/**`
- `bun.lock`
- `package.json`
- `.env`
- 真实支付密钥、商户号、证书、app id 或 webhook token

## 禁止行为

- 不新增真实 migration。
- 不注册 Provider。
- 不连接预发或生产数据库。
- 不修改 checkout、cart、order、payment、refund、settlement、commission、permission 行为。

## 验证命令

```bash
.codex/scripts/payment-notification-inbox-local-dry-run.sh
```

并确认 staged 文件不包含业务代码：

```bash
git diff --cached --name-only | grep -E '^(apps|packages|bun.lock|package.json|\.env)' && exit 1 || true
```
