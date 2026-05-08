# Task: logistics-and-waybill-boundary-plan

## 目标

规划统一配送、自配送、自提、配送供应商和快递面单打印边界，明确哪些可以先做只读能力，哪些必须后续串行接入。

## 允许修改

- `.codex/tasks/logistics-and-waybill-boundary-plan.md`
- `docs/logistics-and-waybill-boundary-plan.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- 不修改 `apps/**`。
- 不修改 `packages/**`。
- 不新增 API route。
- 不新增 migration。
- 不修改 checkout shipping options。
- 不确认发货。
- 不创建履约单。
- 不生成真实运单号或真实面单。
- 不接真实快递100、菜鸟、顺丰、京东物流、云打印、短信或 IM。
- 不修改订单、支付、退款、结算、佣金、打款、权限或履约逻辑。

## 验证命令

```bash
git diff --check -- .codex/tasks/logistics-and-waybill-boundary-plan.md docs/logistics-and-waybill-boundary-plan.md .codex/queue.md project-ledger
git diff --name-status
```

## 完成标准

- 明确 Storefront 展示和 checkout 生效分离。
- 明确 Vendor 配置和真实发货分离。
- 明确 Admin 配送供应商管理和真实物流 Provider 分离。
- 明确快递打印只能先 mock / readonly，不真实出单。
