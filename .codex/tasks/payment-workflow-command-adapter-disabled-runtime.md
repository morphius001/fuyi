# Payment Workflow Command Adapter Disabled Runtime

## 任务

在 payment runtime disposable DB rehearsal 证据成立之后，只实现 disabled command adapter / release gate，让 route 即使拿到 command DTO 也不会自动推进 workflow。

## 范围

- 仅允许修改 `packages/api/src/modules/china-payment-notification/**` 的 command adapter / gate / pure mapper 层，以及必要的 focused tests。
- 更新对应 docs / ledger / task 文件。

## 非目标

- 不真正执行 payment workflow。
- 不放开真实 provider。
- 不改 checkout 提交流程。
- 不写 payment success 或 order state mutation。

## 验证

- focused tests
- API typecheck
- runtime grep / registration check
- `git diff --check`
