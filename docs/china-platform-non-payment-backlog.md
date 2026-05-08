# China Platform Non-Payment Backlog

更新时间：2026-05-08 16:44 Asia/Shanghai

## 结论

支付 provider runtime 已到外部 DB 授权边界。没有 disposable preprod DB 前，继续推进支付执行会变成高风险空转。

下一批建议回到非支付方向，先做 docs-only 或 read-only skeleton，继续为中国大陆多市场生鲜/海鲜平台补齐基础能力，同时避免影响 checkout、订单、支付、退款、结算、佣金、权限和真实履约。

## 下一批低风险队列

### 1. `market-domain-readiness-review`

目标：审查市场、商户、档口、多市场归属、营业时间、公告、配送 profile 的当前模型和缺口。

范围：

- docs-only。
- 汇总已有只读 markets API、seller metadata、Storefront market client 和 Admin market read-only UI 计划。
- 标记哪些字段已经有 read model，哪些仍是假数据或 seed metadata。

禁止：

- 不新增 migration。
- 不新增写 API。
- 不影响 checkout shipping options。

验证：

- `git diff --check`。

### 2. `merchant-role-capability-readiness`

目标：整理普通商户、物料供应商、配送供应商、养殖户/种植户、种苗供应商、外地批发商的角色能力矩阵。

范围：

- docs-only。
- 输出后台开通、商户可见菜单、消费者可见入口和供应链关系。
- 明确哪些能力是平台开关，哪些是商户自选。

禁止：

- 不修改权限系统。
- 不修改结算、佣金、订单归属。

验证：

- `git diff --check`。

### 3. `vendor-mobile-draft-product-readiness`

目标：梳理手机快速上架、规格模板、AI 草稿、审核候选到真实商品发布的分阶段边界。

范围：

- docs-only。
- 明确草稿字段、规格、单位、图片、库存、产地、价格区间和审核状态。
- AI 只能生成草稿，商家必须确认。

禁止：

- 不创建真实商品。
- 不写库存。
- 不接真实 AI / 微信。

验证：

- `git diff --check`。

### 4. `shop-decoration-readonly-plan`

目标：规划商家主页装修的只读模型和三端展示边界。

范围：

- docs-only。
- 覆盖店招、档口号、市场、主营类目、资质、直播状态、配送方式、推荐商品和公告。
- 先规划 read-only API，再规划 Admin/Vendor 配置。

禁止：

- 不做上传。
- 不做富文本编辑器。
- 不接真实 CDN。

验证：

- `git diff --check`。

### 5. `logistics-and-waybill-boundary-plan`

目标：规划统一配送、商家自配送、自提、配送供应商和快递打印的边界。

范围：

- docs-only。
- 区分市场配送规则、商户选择、订单履约、面单模板和打印机接入。
- 明确快递打印前必须先有订单履约和物流 Provider adapter。

禁止：

- 不改变 shipping option。
- 不创建发货单。
- 不接快递 100、菜鸟或真实打印机。

验证：

- `git diff --check`。

### 6. `pickup-card-consumer-flow-plan`

目标：重新梳理提货卡作为消费者持卡提货凭证的完整流程。

范围：

- docs-only。
- 覆盖线下实体卡、卡号/卡密/二维码、绑定、兑换、提货订单、收货地址、发货、过期、冻结、作废、风控和操作日志。

禁止：

- 不把提货卡当支付方式、储值卡、优惠券、满减券或折扣券。
- 不修改订单、库存、物流或支付逻辑。

验证：

- `git diff --check`。

### 7. `live-commerce-readonly-plan`

目标：规划直播能力的只读占位和后续 Provider 边界。

范围：

- docs-only。
- 消费端最多在商家/档口卡片显示“正在直播”状态。
- Vendor/Admin 只规划直播间状态、回放、商品挂载和审核字段。

禁止：

- 不接真实直播 SDK。
- 不接 IM。
- 不做推流或录制。

验证：

- `git diff --check`。

## 可进入 read-only skeleton 的候选

等 docs-only readiness 过完后，可以按以下顺序进入小范围 read-only skeleton：

1. 市场域 read model 字段补齐。
2. 商户角色 capability view。
3. 店铺装修 read-only view shape。
4. Vendor 草稿商品 read-only / in-memory skeleton。
5. 提货卡 read-only status view。

这些 skeleton 仍不得改变真实订单、库存、配送、支付、退款、结算、佣金或权限。

## 继续保持串行的高风险项

- 真实 payment workflow execution。
- 支付宝 / 微信支付 Provider。
- 退款。
- 对账。
- 商家结算。
- 佣金。
- 权限。
- checkout shipping options 生效。
- 真实订单履约状态。
- 快递打印真实出单。

## 推荐下一项

先执行 `market-domain-readiness-review`。它是其他非支付能力的地基：商户类型、档口、配送、店铺装修、直播、提货卡和供应链关系都需要依赖市场域边界。
