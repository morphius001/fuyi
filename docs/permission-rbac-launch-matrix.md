# Permission RBAC Launch Matrix

更新时间：2026-05-10 Asia/Shanghai

## 结论

上线前必须把权限当作后端写操作的前置门禁，而不是菜单显隐、capability view 或前端按钮状态。

当前 Admin / Vendor / Storefront 的 capability view 只能用于只读提示、入口文案、申请状态或降级显示。它不能替代 Medusa/Mercur 现有 RBAC、商户归属、市场归属、订单归属、支付/退款/结算权限或履约权限。

本轮只做矩阵，不实现 runtime。

## 主体类型

| 主体 | 说明 | 可读范围 | 写操作原则 |
| --- | --- | --- | --- |
| Platform operator | 平台运营后台用户 | 平台、市场、商户、订单、风控、结算总览 | 必须具备对应 Admin permission、审计和二次确认 |
| Market operator | 市场运营人员 | 所属市场的数据 | 不能跨市场写入；高风险资金动作需平台复核 |
| Vendor / Seller owner | 商户 owner | 自己商户 / 档口 / 订单 / 商品 | 只能写自己商户资源 |
| Vendor / Seller staff | 商户员工 | 按角色裁剪 | 不能越权操作结算、退款、权限配置 |
| Delivery supplier | 配送供应商 | 被分配或授权的配送任务 | 不能修改订单支付、退款、结算或商品事实 |
| Customer | 消费者 | 自己购物车、订单、售后申请 | 不能访问其他用户订单或商户后台 |
| System job | 后台 job / webhook | 受限 service role | 必须有幂等、审计、最小权限和 replay guard |

## Capability View 边界

允许：

- 显示模块是否可见。
- 显示功能是否可申请。
- 显示 mock / sandbox / disabled 状态。
- 显示阻断原因。
- 为前端入口降级或隐藏提供提示。

禁止：

- 替代 RBAC。
- 替代 seller ownership。
- 替代 market ownership。
- 替代 resource ownership。
- 替代 order / payment / refund / settlement permission。
- 作为 API 写操作唯一授权依据。

## 写操作矩阵

| 操作域 | 示例操作 | 允许主体 | 必须后端校验 | 审计要求 | No-Go |
| --- | --- | --- | --- | --- | --- |
| 商品 | 创建/编辑商品、规格、价格 | Seller owner/staff with product permission；Platform operator | seller ownership、market membership、product permission | operator、seller、before/after、reason | capability view 直接放行 |
| 库存 | 调整库存、上下架 | Seller owner/staff；Platform operator | seller ownership、variant ownership、库存来源 | quantity delta、reason、source | Storefront 展示字段改库存 |
| 购物车 | 更新 cart line、地址、配送方式 | Customer / session owner | cart cookie/session ownership、region、shipping option eligibility | low risk event optional | 跨用户 cart |
| 订单 | 改订单状态、取消订单 | Platform operator；Seller owner limited | order ownership、seller ownership、status transition guard | before/after、reason、operator | 前端页面直接改订单 |
| 支付 | payment workflow execution | System webhook/job only | verified notification、idempotency、payment session match、amount/currency/provider match | provider event、signature、idempotency key | 前端返回页完成支付 |
| 退款 | 发起/确认退款 | Platform operator；system provider notify | order ownership、refund amount invariant、provider idempotency、manual review | refund reason、amount、operator/provider event | 商户或前端直接改退款成功 |
| 对账 | 导入流水、标记差异 | Platform finance operator | file/source validation、period lock、duplicate import guard | statement hash、operator、diff summary | 自动补单/自动退款 |
| 结算 | 创建/锁定结算批次 | Platform finance operator | reconciliation passed、refund/dispute lock、seller ownership | batch id、period、amounts、approver | 未对账就结算 |
| 佣金 | 发布/应用佣金规则 | Platform finance operator | rule version、market/seller scope、effective date | before/after、reason、version | 与支付 provider 同 PR |
| 打款 | 发起 payout | Platform finance operator + approval | settlement approved、bank/account verification、provider disabled-by-default | approver、provider ref、amount | 自动生产打款 |
| 权限 | 分配 Admin/Vendor role | Platform admin；Seller owner limited | current user permission、subject ownership、role scope | old role、new role、operator | 用户给自己提权 |
| 履约 | 创建/确认 fulfillment | Seller owner/staff；Delivery supplier limited；Platform operator | order ownership、payment status, fulfillment eligibility | package、method、operator | 未支付订单发货 |
| 物流 | 生成/取消/重打面单 | Seller owner/staff；Delivery supplier；Platform operator | fulfillment ownership、provider mode、waybill idempotency | provider request id、label id、operator | 真实 provider 未启用就打印 |

## Negative Tests

每个进入 runtime 的高风险 PR 必须至少覆盖：

- 非 owner 商户访问其他商户订单被拒。
- 非市场 operator 写其他市场配置被拒。
- Vendor staff 无权限退款被拒。
- Delivery supplier 试图改支付/退款/结算被拒。
- Customer 访问其他用户订单被拒。
- capability view 标记 enabled 但 RBAC 不足时仍被拒。
- 重放同一 webhook / payout / refund command 不重复写状态。
- 无 reason / operator / idempotency key 的高风险写操作被拒。

## Audit 字段

高风险写操作至少记录：

- actor type。
- actor id。
- subject type。
- subject id。
- market id。
- seller id。
- resource type。
- resource id。
- action。
- before snapshot hash 或关键字段。
- after snapshot hash 或关键字段。
- reason。
- idempotency key。
- provider event id / command id。
- created_at。

禁止写入：

- provider secret。
- private key。
- raw signature。
- DB URL。
- 完整银行卡号或敏感支付凭据。

## PR 进入条件

任何写接口、runtime provider、payment workflow、refund、settlement、commission、payout、fulfillment 或 logistics PR 进入 implementation 前必须提供：

- 权限矩阵行。
- 资源归属校验。
- negative tests。
- audit event。
- idempotency strategy。
- rollback plan。
- disabled-by-default 或 feature flag。

## 下一步

推荐继续：

1. `fulfillment-logistics-runtime-gate-plan`
   - 把履约、物流、配送供应商和面单按同样方式拆 runtime gate。

2. `payment-provider-production-hardening-plan`
   - 支付宝 / 微信支付真实 provider 前置加固计划。

3. `admin-write-api-permission-guard-plan`
   - 仅在要实现 Admin 写接口前执行。

## 本 PR 验证

```bash
git diff --check
```

预期：无输出。
