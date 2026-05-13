# Mock Webhook DB Backed Route Runtime

## 任务

落地 mock / fake payload 到 inbox 的 DB-backed route，保持 inbox-only、默认关闭、仅限 local / disposable DB。

## 范围

- 仅允许修改 `packages/api/src/modules/china-payment-notification/**` 和必要的 route contract / test。
- 更新对应 docs / ledger。

## 非目标

- 不注册真实 provider。
- 不接 checkout。
- 不暴露 success 语义。
- 不执行 workflow。

## 验证

- focused tests
- API typecheck
- runtime grep / registration check
- `git diff --check`
