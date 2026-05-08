# Task: pickup-card-consumer-flow-plan

## 目标

重新梳理消费者持有提货卡后如何提货，强调提货卡是预先获得的提货凭证，不是优惠券、支付方式、储值卡或普通购物抵扣。

## 允许修改

- `.codex/tasks/pickup-card-consumer-flow-plan.md`
- `docs/pickup-card-consumer-flow-plan.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- 不修改 `apps/**`。
- 不修改 `packages/**`。
- 不新增 API route。
- 不新增 migration。
- 不修改 checkout、cart、order、payment、refund、settlement、commission、payout、permission 或 fulfillment 逻辑。
- 不把提货卡接入 payment provider、coupon、gift card、store credit 或 promotion。
- 不生成真实卡密、二维码、兑换记录或履约单。

## 验证命令

```bash
git diff --check -- .codex/tasks/pickup-card-consumer-flow-plan.md docs/pickup-card-consumer-flow-plan.md .codex/queue.md project-ledger
git diff --name-status
```

## 完成标准

- 明确消费者流程是“持卡识别权益 -> 补齐信息 -> 提交提货申请”。
- 明确不是“用卡买商品”。
- 明确固定权益、可选权益、地址/自提、幂等、风控和履约单边界。
- 明确后续 PR 顺序。
