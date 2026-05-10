# refund-runtime-risk-gate-plan

## 目标

建立退款 runtime 风险门禁和后续 PR 顺序，确保退款只能在支付通知、幂等、金额约束、权限、审计和人工复核边界齐备后串行推进。

## 范围

- 盘点当前 refund 相关状态。
- 定义 refund command guard、provider refund request idempotency、refund notification inbox、partial refund amount invariant、manual review 和 audit gate。
- 明确与 payment、reconciliation、settlement、commission、payout、permission、fulfillment、logistics 的串行边界。
- 更新 ledger / queue。

## 非目标

- 不新增 refund route。
- 不调用 Medusa refund workflow。
- 不接支付宝 / 微信支付 refund API。
- 不读取真实 secret。
- 不修改 order、payment、refund、settlement、commission、payout、permission、fulfillment 或 logistics runtime。
- 不连接外部 DB 或生产 DB。
- 不注册 migration。

## 验证

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn
git diff --check
git status --short
git diff --name-only
git ls-files --others --exclude-standard
```

## 交付

- `docs/refund-runtime-risk-gate-plan.md`
- `.codex/tasks/refund-runtime-risk-gate-plan.md`
- ledger / queue 更新
