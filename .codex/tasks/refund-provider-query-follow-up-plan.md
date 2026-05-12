# Refund Provider Query Follow-up Plan

## 任务

规划 provider refund query follow-up 的 owner、触发条件、输入输出合同、审计边界和后续 PR 顺序。

## 范围

- 新增 `docs/refund-provider-query-follow-up-plan.md`。
- 明确 WeChat / Alipay 退款查询只能作为独立 follow-up owner 的 future boundary。
- 明确 provider inbox route、state owner handoff 和 workflow shadow command 均不得直接调用 provider query API。
- 更新 `.codex/queue.md` 和 `project-ledger/**`。

## 非目标

- 不修改 `apps/**` 或 `packages/**` runtime。
- 不新增 query route。
- 不连接 DB。
- 不注册 module。
- 不接 SDK 或真实密钥。
- 不调用真实 WeChat Pay / Alipay query API。
- 不执行 workflow。
- 不写 refund success state。
- 不改变 settlement、commission、payout、permission、fulfillment 或 logistics。

## 验证

- `git diff --check`。
- `git status --short --branch`。
- 子智能体只读复核。
