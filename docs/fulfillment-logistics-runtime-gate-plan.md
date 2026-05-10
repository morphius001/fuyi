# Fulfillment Logistics Runtime Gate Plan

更新时间：2026-05-10 Asia/Shanghai

## 结论

履约、物流和面单可以继续推进上线准备，但当前不能直接进入真实 runtime。

当前只适合：

- 展示店铺/商品支持哪些履约方式。
- 建立只读或草稿配置合同。
- 规划 mock provider。
- 做本地 smoke。

仍然禁止：

- 只读履约字段直接改 checkout shipping options。
- Vendor / Admin UI 直接创建真实履约。
- 配送供应商直接接单或派单。
- 生成真实运单号、真实面单或云打印。
- 回写 order fulfillment / shipment / tracking。
- 改 payment、refund、settlement、commission 或 permission。

## 分层 Gate

### Gate L0 展示层

允许：

- Storefront 店铺页、商品详情页展示履约说明。
- Vendor 展示当前商家履约配置状态。
- Admin 展示市场配送规则、配送供应商档案、异常履约只读监控。

禁止：

- 写 checkout shipping options。
- 写订单履约状态。
- 展示虚假实时运费或物流轨迹。

当前状态：部分完成。

### Gate L1 配置合同

允许：

- market delivery rule read model。
- seller fulfillment profile read model。
- delivery supplier profile read model。
- waybill readonly contract。

必须：

- 明确 `checkoutImpact: "none"`。
- 明确 `permissionImpact: "none"`。
- 只读或草稿，不生效到 checkout / order。

当前状态：部分完成。

### Gate L2 Mock Provider Contract

允许：

- `MockDeliveryProvider`。
- `MockWaybillProvider`。
- mock quote。
- mock capacity。
- mock tracking id。
- mock label URL。

禁止：

- 调用真实物流接口。
- 生成真实运单。
- 改 order fulfillment。
- 改 settlement / commission。

进入条件：

- L1 合同稳定。
- 权限矩阵已有 delivery supplier / seller / platform operator 行。
- mock response 不包含真实密钥或真实运单号。

### Gate L3 Checkout Shipping Option Adapter

目标：让市场/商家配送规则影响 checkout 前，必须通过 adapter。

进入条件：

- L0-L2 通过。
- 地址服务范围校验。
- 商品/商家/市场/配送供应商可用性校验。
- 运费计算幂等。
- 明确 fallback。
- 失败不影响 cart existing shipping method。
- feature flag disabled-by-default。

禁止：

- UI 直接写 `shipping_methods`。
- 只读 metadata 直接影响 shipping options。
- 与支付 provider、退款、结算、佣金同 PR。

### Gate L4 Fulfillment Creation

目标：订单创建后，按支付状态和履约规则创建真实 fulfillment。

进入条件：

- 支付状态事实源已稳定。
- order ownership / seller ownership / market ownership / resource ownership guard 完成。
- fulfillment snapshot 已定义。
- 幂等 key 已定义。
- rollback / cancel flow 已定义。

禁止：

- 未支付订单自动发货。
- 配送供应商绕过商户/平台权限改订单。
- fulfillment creation 与 payment notification workflow 同 PR。

### Gate L5 Shipment Tracking

目标：物流轨迹只在真实 fulfillment 之后进入。

必须：

- provider tracking event idempotency。
- 状态映射表。
- 异常状态 manual review。
- customer-visible 状态裁剪。
- raw provider payload 安全存储或脱敏。

禁止：

- mock tracking 冒充真实物流。
- provider 事件直接改 payment/refund/settlement。

### Gate L6 Waybill Provider

目标：电子面单、云打印、取消、重打单独进入。

必须：

- mock waybill local smoke。
- real provider sandbox / disabled-by-default。
- 密钥和账号配置不入 repo。
- label generation idempotency。
- cancel / reprint guard。
- print audit。

禁止：

- 未启用真实 provider 就打印。
- 自动扣费但无结算归属。
- 面单 provider 与 payment/refund/settlement 同 PR。

## 写操作权限

| 操作 | 允许主体 | 必须校验 | No-Go |
| --- | --- | --- | --- |
| 保存履约草稿 | Vendor / Seller owner/staff | seller ownership、role permission | 写其他商户配置 |
| 发布市场配送规则 | Platform / Market operator | Admin RBAC、market ownership、audit | 市场 operator 跨市场发布 |
| 选择 checkout shipping option | Customer session owner | cart ownership、option eligibility | 只读展示字段直接写入 |
| 创建 fulfillment | Seller owner/staff 或 system job | order ownership、payment status、seller ownership | 未支付自动发货 |
| 分配配送供应商 | Platform / Market operator | market ownership、supplier status、capacity | 无供应商授权派单 |
| 更新配送状态 | Delivery supplier / system job | assignment ownership、event idempotency | 改支付/退款/结算 |
| 生成面单 | Seller owner/staff / Delivery supplier | fulfillment ownership、provider enabled、idempotency | 真实 provider 未启用 |
| 取消/重打面单 | Seller owner/staff / Platform operator | waybill ownership、state transition、audit | 无原因重打 |

## Audit 字段

履约/物流写操作至少记录：

- actor type / id。
- seller id。
- market id。
- order id。
- fulfillment id。
- shipment id。
- provider。
- provider event id 或 request id。
- action。
- before / after state。
- idempotency key。
- reason。
- created_at。

禁止记录：

- provider secret。
- full credential。
- raw signature。
- DB URL。
- 未脱敏手机号之外的敏感 payload。

## No-Go

出现以下任一情况停止：

- 只读配送展示直接影响 checkout。
- 未支付订单进入真实履约。
- 配送供应商可改支付、退款、结算或佣金。
- 真实物流 provider 需要把密钥写入 repo。
- 面单生成不可幂等。
- 取消/重打没有 audit 和 reason。
- 物流轨迹原始 payload 直接暴露给消费者。
- 与支付、退款、结算、佣金、权限 runtime 混在同一 PR。

## 推荐 PR 顺序

1. `fulfillment-runtime-readonly-validation`
   - 汇总 L0 / L1 当前合同和展示状态。
   - docs-only。

2. `mock-delivery-provider-contract`
   - 定义 mock quote / capacity / tracking contract。
   - 不接 checkout。

3. `mock-waybill-provider-contract`
   - 定义 mock label / cancel / reprint contract。
   - 不打印真实面单。

4. `checkout-shipping-adapter-plan`
   - 规划市场/商家配送规则如何进入 shipping options adapter。
   - 不实现 runtime。

5. `fulfillment-creation-guard-contract`
   - 纯函数 guard，覆盖 payment status、order ownership、seller ownership。
   - 不创建 fulfillment。

6. `real-logistics-provider-hardening-plan`
   - 快递100、菜鸟、顺丰、京东物流等真实 provider 的密钥、签名、幂等、回滚和 sandbox 计划。
   - 不接 production。

## 本 PR 验证

```bash
git diff --check
```

预期：无输出。

