# refund-manual-review-audit-plan

## 目标

docs-only 规划退款人工复核和审计事件合同，为后续 inbox / guard / runtime 任务提供门禁。

## 范围

- 新增 `docs/refund-manual-review-audit-plan.md`。
- 更新 queue / ledger。

## 非目标

- 不新增 TypeScript runtime。
- 不新增 refund route。
- 不写 DB，不新增或注册 migration。
- 不调用 Medusa refund workflow。
- 不接支付宝 / 微信支付 refund API 或真实 SDK。
- 不读取真实 secret、证书、APIv3 key、app id 或 merchant id。
- 不输出 provider refund request。
- 不输出 refund success state mutation。
- 不改变 checkout、order、payment、refund、settlement、commission、payout、permission、fulfillment 或 logistics runtime。

## 验证

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn
git diff --check
git diff --name-only
git ls-files --others --exclude-standard
```

## 交付

- `docs/refund-manual-review-audit-plan.md`
- `.codex/tasks/refund-manual-review-audit-plan.md`
- queue / ledger 更新
