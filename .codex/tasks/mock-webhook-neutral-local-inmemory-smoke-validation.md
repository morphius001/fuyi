# mock-webhook-neutral-local-inmemory-smoke-validation

## 目标

记录 neutral mock webhook 临时 devserver `local-inmemory` smoke 合并后的验证结果。

本任务只写文档，不修改 runtime。

## 允许修改

- `.codex/tasks/mock-webhook-neutral-local-inmemory-smoke-validation.md`
- `docs/mock-webhook-neutral-local-inmemory-smoke-validation.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- `apps/**`
- `packages/**`
- `.codex/scripts/**`
- `package.json`
- `bun.lock`
- `.env` 或真实密钥
- 支付、订单、退款、结算、佣金、权限业务逻辑

## 必须记录

- PR 编号和 merge commit。
- devserver local-inmemory smoke 结果。
- accepted / missing signature / malformed payload 结果。
- harness 结果。
- 9100 端口关闭复查。
- DB residual query 为空。

## 验证

```bash
git diff --check
```
