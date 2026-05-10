# payment-risk-register

## 目标

汇总支付、退款、对账、结算、佣金、权限的上线风险登记表和串行顺序，为后续真实 Provider、退款、结算和权限强制进入 implementation 前建立 Go / No-Go。

## 范围

- 支付通知 runtime gate。
- 真实支付宝 / 微信支付 provider 前置条件。
- 退款通知与退款命令边界。
- 对账、结算、佣金、打款边界。
- 权限 / RBAC 与资金、订单、履约操作的关系。
- 外部 disposable preprod DB 阻塞条件。

## 非目标

- 不修改 `apps/**` 或 `packages/**` runtime。
- 不连接预发或生产 DB。
- 不注册 migration。
- 不接真实支付宝、微信支付、退款、对账、结算、佣金或打款。
- 不修改 checkout、order、payment、refund、settlement、commission、permission、fulfillment 或 logistics 状态。

## 验证

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn
git diff --check
```

## 交付

- `docs/payment-risk-register.md`
- ledger / queue 更新

