# fulfillment-logistics-runtime-gate-plan

## 目标

建立履约 / 物流 / 面单 runtime gate，明确市场统一配送、商家自配送、到档自提、配送供应商、fulfillment、物流轨迹和电子面单从只读展示进入真实 runtime 前的串行条件。

## 范围

- checkout shipping options adapter 前置条件。
- fulfillment creation / shipment / tracking / waybill 的边界。
- mock provider 与真实 provider 顺序。
- 权限、幂等、审计、回滚、No-Go。

## 非目标

- 不修改 `apps/**` 或 `packages/**` runtime。
- 不改 checkout shipping options。
- 不创建真实 fulfillment、shipment、tracking、waybill。
- 不接真实快递100、菜鸟、顺丰、京东物流或云打印 provider。
- 不改订单、支付、退款、结算、佣金、权限状态。

## 验证

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn
git diff --check
```

## 交付

- `docs/fulfillment-logistics-runtime-gate-plan.md`
- ledger / queue 更新

