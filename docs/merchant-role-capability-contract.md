# Merchant Role Capability Contract

更新时间：2026-05-08 18:06 Asia/Shanghai

## 结论

本轮新增的是只读能力合同，不是权限系统、订单系统、结算系统或履约系统。

合同文件：

- `packages/api/src/modules/china-market-read-model/merchant-role-capability-contract.ts`
- `packages/api/src/modules/china-market-read-model/__tests__/merchant-role-capability-contract.unit.spec.ts`

## 覆盖角色

- 海鲜档口
- 冻品商户
- 干货商户
- 水果蔬菜商户
- 物料供应商
- 配送供应商
- 种植户
- 养殖户
- 种苗供应商
- 外地批发商

## 输出边界

合同输出：

- `readOnly: true`
- `runtimeEnabled: false`
- `permissionImpact: "none"`
- `orderOwnershipImpact: "none"`
- `settlementImpact: "none"`

这表示后续 Admin、Vendor、Storefront 可以读取这个 view shape 做只读提示，但不能因此改变真实权限、订单归属或结算规则。

## 默认可见性

普通商品商户默认进入消费者商品流：

- 海鲜档口
- 冻品商户
- 干货商户
- 水果蔬菜商户

商户服务和上游供给默认不进入消费者商品流：

- 物料供应商：商户侧可见，消费者侧隐藏。
- 配送供应商：商户侧可见，消费者侧隐藏。
- 种植户 / 养殖户：默认服务商户；若要对消费者售卖，必须额外开通普通商品商户角色。
- 种苗供应商：默认服务养殖户、种植户和商户。
- 外地批发商：默认对接本地商户补货。

## 高风险阻塞项

以下能力仍是串行高风险任务：

- RBAC / permission
- 订单归属
- checkout shipping options
- 支付
- 退款
- 结算
- 佣金
- 打款
- 真实物流 Provider
- 快递面单打印

## 下一步

建议继续做 `vendor-mobile-draft-product-readiness`，先把手机快速上架、规格模板、AI 草稿和审核候选边界再梳理一遍，避免直接创建真实商品。
