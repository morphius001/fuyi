# Refund Provider Query Local Fixture Contract

## 任务

新增退款 provider query local fixture contract，提供 redacted fake query snapshot vectors，用于后续 reconciliation / manual review 测试。

## 范围

- 新增 `packages/api/src/modules/china-payment-notification/refund-provider-query-local-fixtures.ts`。
- 新增 focused tests。
- 导出 fixture contract。
- 将 focused test 纳入 payment notification harness。
- 新增 `docs/refund-provider-query-local-fixture-contract.md`。
- 更新 `.codex/queue.md` 和 `project-ledger/**`。

## 非目标

- 不新增 route。
- 不连接 DB。
- 不注册 module。
- 不接 SDK 或真实密钥。
- 不发网络请求。
- 不调用真实 provider refund request / query API。
- 不执行 workflow。
- 不写 refund success state。
- 不改变 settlement、commission、payout、permission、fulfillment 或 logistics。

## 验证

- Focused unit test。
- API typecheck。
- Payment notification harness。
- Runtime grep。
- `git diff --check`。
- 子智能体只读复核。
