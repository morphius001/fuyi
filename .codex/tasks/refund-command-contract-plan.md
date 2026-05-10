# refund-command-contract-plan

## 目标

定义中国本地退款命令合同和状态机规划，为后续 `refund-amount-guard-contract` 纯函数任务提供输入；本轮不实现退款 runtime。

## 范围

- 定义 refund command input / context / actor / ownership / amount / reason / idempotency 字段。
- 定义 refund command decision、block reason、manual review reason 和 audit metadata。
- 定义后续纯函数文件建议、测试矩阵和 PR 顺序。
- 更新 ledger / queue。

## 非目标

- 不新增 TypeScript runtime 文件。
- 不新增 refund route。
- 不调用 Medusa refund workflow。
- 不接支付宝 / 微信支付 refund API。
- 不读取真实 secret。
- 不修改 order、payment、refund、settlement、commission、payout、permission、fulfillment 或 logistics runtime。
- 不写 DB，不注册 migration。

## 验证

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn
git diff --check
git status --short
git diff --name-only
git ls-files --others --exclude-standard
```

## 交付

- `docs/refund-command-contract-plan.md`
- `.codex/tasks/refund-command-contract-plan.md`
- ledger / queue 更新
