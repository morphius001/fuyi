# refund-notification-contract-plan

## 目标

规划退款通知 verifier / normalizer 合同，明确 `refund.succeeded` / `refund.failed` 的后端通知边界；本轮不实现 runtime。

## 范围

- 定义 refund notification envelope 必填字段。
- 定义 verifier / normalizer 的输入输出和失败矩阵。
- 定义 notification idempotency、provider refund id、amount / currency / reference 匹配规则。
- 定义后续 PR 顺序。
- 更新 ledger / queue。

## 非目标

- 不新增 TypeScript runtime 文件。
- 不新增 refund route。
- 不写 DB，不注册 migration。
- 不调用 Medusa refund workflow。
- 不接支付宝 / 微信支付 refund API。
- 不读取真实 secret。
- 不输出 refund success state mutation。
- 不改变 checkout、order、payment、refund、settlement、commission、payout、permission、fulfillment 或 logistics runtime。

## 验证

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn
git diff --check
git status --short
git diff --name-only
git ls-files --others --exclude-standard
```

## 交付

- `docs/refund-notification-contract-plan.md`
- `.codex/tasks/refund-notification-contract-plan.md`
- ledger / queue 更新
