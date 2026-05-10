# permission-rbac-launch-matrix

## 目标

建立上线前权限 / RBAC / 资源归属矩阵，明确 Admin、Vendor、商户用户、配送供应商、平台 operator 在订单、支付、退款、结算、佣金、履约和物流写操作中的后端强制校验。

## 范围

- Admin / Vendor / Storefront capability view 与真实 RBAC 的边界。
- 高风险写操作矩阵。
- seller ownership、market ownership、resource ownership。
- negative tests 和 audit 要求。

## 非目标

- 不修改 `apps/**` 或 `packages/**` runtime。
- 不实现权限中间件、route guard、migration 或写接口。
- 不改变现有 RBAC、订单、支付、退款、结算、佣金、履约或物流状态。

## 验证

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn
git diff --check
```

## 交付

- `docs/permission-rbac-launch-matrix.md`
- ledger / queue 更新

