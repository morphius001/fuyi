# China Launch High Risk Sequence Plan

更新时间：2026-05-10 Asia/Shanghai

## 结论

当前可以继续推进上线，但不能把 ProductCard、购物车、结算、订单、支付、退款、结算、佣金、权限、履约和物流放进同一个实现 PR。

上线推进顺序应改为“展示事实收口 -> 购物车/结算安全复核 -> 订单状态事实源 -> 支付通知 runtime gate -> 退款 -> 对账 -> 结算/佣金 -> 权限强制 -> 履约/物流”。每一步都必须有独立验证、回滚和 Go / No-Go。

## 当前可用基础

已具备：

- Storefront 商品发现只读链路已合并到主线，首页、搜索页和店铺页展示字段可以读取真实 `store_product_table` 的只读发现结果。
- 真实可加购商品仍走 Store API / `ProductCard`，没有把只读发现字段当作价格、库存、订单、履约或支付事实。
- cart / checkout 页面已完成中文文案和支付异步通知提示，但既有 `setAddresses`、`setShippingMethod`、`initiatePaymentSession` 语义不能被顺手改动。
- 支付通知方向已有 mock-only skeleton、inbox / event log migration skeleton、local disposable DB dry-run、state guard、command mapper、audit mapper、DB runtime preflight 和 runtime gate contract。
- 物流和面单已有只读边界计划，当前只适合展示和配置合同，不适合直接生成真实履约、轨迹或面单。

仍未具备：

- 可丢弃预发 DB 授权、备份 owner、回滚 owner 和连接窗口。
- 真实 migration 注册。
- 支付通知 DB runtime rehearsal。
- 支付 workflow execution。
- 支付宝 / 微信支付真实 provider。
- 退款、对账、结算、佣金、打款 runtime。
- 权限强制与 Admin/Vendor 写操作联动。
- checkout shipping options 与市场/商户配送规则的真实生效。

## 串行 PR 顺序

### KF1 ProductCard Launch Readiness Audit

目标：确认所有可加购商品卡继续只读读取 Store API 的商品、variant、price 和 seller 信息。

允许：

- 审计 ProductCard 输入字段。
- 记录哪些字段是展示字段，哪些字段必须来自 Store API 或 Medusa 交易链路。
- 补充 ProductCard QA 清单。

禁止：

- 从 product discovery `sourceTags`、static fallback 或 metadata 直接决定价格、库存、可买性、履约、佣金或支付。
- 修改 add-to-cart 语义。

验证：

- Storefront build。
- ProductCard / product discovery grep。
- 首页、搜索、店铺和商品详情人工 QA。

### KF2 Cart Checkout Safety Audit

目标：复核购物车和结算页的上线前安全边界。

允许：

- 检查 CN 区域、CNY、配送方式、地址字段、支付提示、错误提示。
- 记录既有 `setAddresses`、`setShippingMethod`、`initiatePaymentSession` 调用点。
- 补充 smoke runbook。

禁止：

- 以前端返回页判断支付成功。
- 修改 `placeOrder`、`completeCart`、支付 session 创建、配送方式设置或 totals 计算语义。

验证：

- Storefront build。
- cart smoke：创建 CN cart、添加商品、选择配送方式。
- checkout smoke：无 cart redirect、地址字段顺序、支付提示。

### KF3 Order Lifecycle Gate

目标：定义订单状态事实源和商户/平台可见状态。

允许：

- docs-only 或纯函数状态映射合同。
- 明确订单创建、支付待确认、已支付、待履约、已履约、退款中的状态来源。

禁止：

- 直接修改 Medusa/Mercur order workflow。
- 让前端或 mock route 改订单状态。

验证：

- API typecheck。
- focused unit tests。
- 状态来源表人工 review。

### KF4 Payment Notification Runtime Gate

目标：把支付通知从未注册 skeleton 推进到可 rehearsal 的 runtime gate，但仍不接真实 provider。

进入条件：

- `docs/payment-notification-db-runtime-preflight.md` 的本地检查通过。
- 用户提供可丢弃预发 DB、备份 owner、回滚 owner、操作窗口和明确连接授权。

允许：

- mock provider runtime gate rehearsal。
- DB-backed inbox transaction rehearsal。
- runtime disabled config skeleton。

禁止：

- 注册真实支付宝或微信支付 provider。
- 执行 payment workflow。
- 改 order/payment/refund/settlement/commission/permission 状态。

验证：

- `.codex/scripts/payment-notification-idempotency-harness.sh`
- mock webhook accepted / duplicate / rejected smoke。
- disposable DB up/down/cleanup。
- secret grep 和 runtime registration grep。

### KF5 Payment Workflow Execution Adapter

目标：只有在 KF4 通过后，才允许把 guard result 映射到 payment workflow execution。

进入条件：

- migration 已在 disposable DB rehearsal 通过。
- mock notification accepted / duplicate / rejected 在 DB-backed route 上通过。
- 支付状态推进有 rollback 和 manual review 兜底。

禁止：

- 同 PR 接真实支付宝 / 微信支付。
- 同 PR 做退款、结算、佣金或订单履约。

### KF6 Real Provider Sandbox: Alipay Or WeChat Pay

目标：每个真实 provider 单独 PR，先 sandbox / disabled-by-default。

进入条件：

- 真实 provider 文档、验签、证书轮换、幂等 key、通知重试、错误映射和回滚策略完成。
- 所有配置来自 env 或安全密钥管理，不进入 repo。

禁止：

- 两个 provider 同 PR。
- 无 sandbox 就上 production。
- 前端返回页作为支付成功依据。

### KF7 Refund Notification And Refund Command Gate

目标：退款必须独立于支付成功通知推进。

允许：

- 退款通知合同。
- mock refund notification skeleton。
- refund idempotency key 和 audit event。

禁止：

- 直接调用真实退款。
- 和支付成功 workflow execution 同 PR。
- 影响结算或佣金。

### KF8 Reconciliation Gate

目标：对账只做读取、差异识别、人工处理建议，不自动改资金状态。

允许：

- provider statement parser contract。
- 差异分类、审计、导出 runbook。

禁止：

- 自动补单、自动退款、自动打款。
- 写真实财务结论。

### KF9 Settlement Commission Payout Gate

目标：结算、佣金和打款必须在支付、退款、对账之后。

允许：

- 结算批次模型计划。
- 佣金计算纯函数合同。
- payout disabled-by-default provider boundary。

禁止：

- 自动打款。
- 和退款/支付 provider 同 PR。
- 绕过人工复核和审计。

### KF10 Permission And RBAC Enforcement Gate

目标：所有 Admin/Vendor 写操作进入 runtime 前必须先复核权限边界。

允许：

- 权限矩阵、角色能力 view、资源归属校验清单。
- 写接口前置 guard 纯函数。

禁止：

- 用前端隐藏入口替代后端权限。
- 用 capability view 替代 RBAC。
- 放大商户跨市场、跨店铺、跨订单访问。

### KF11 Fulfillment Logistics Runtime Gate

目标：履约和物流先从只读能力进入 mock provider，再进入真实 provider。

允许：

- 市场统一配送、商家自配送、自提、配送供应商的只读配置合同。
- mock logistics provider。
- mock waybill provider。

禁止：

- 直接改 checkout shipping options。
- 生成真实运单号、真实面单或真实派单。
- 改 order fulfillment / shipment 状态。

### KF12 Launch Go No-Go Pack

目标：把所有通过的门禁汇总成上线决策包。

必须包含：

- 变更清单。
- 验证证据。
- 失败回滚。
- feature flag / disabled-by-default 状态。
- 值班 owner。
- 日志和告警检查。
- 已知不支持项。

## 上线 No-Go

出现以下任一情况即停止上线：

- 支付成功依赖前端跳转或返回页。
- 支付通知没有验签、幂等或重试。
- 退款、结算、佣金、打款没有审计和人工兜底。
- 真实 provider 需要把密钥写入 repo。
- 没有 disposable DB rehearsal 就注册 migration。
- capability view 被当作权限系统。
- 物流或面单 provider 会直接改订单履约状态但没有 rollback。
- cart total、shipping methods、order state、payment state、refund state 或 settlement state 的事实来源不清楚。

## 推荐立即继续的下一步

1. `productcard-launch-readiness-audit`
   - docs-only 或最小审计。
   - 不改 add-to-cart。

2. `cart-checkout-launch-safety-audit`
   - docs-only + smoke。
   - 不改 checkout mutation 语义。

3. `payment-risk-register`
   - 汇总支付、退款、对账、结算、佣金、权限风险登记表。
   - 不写 runtime。

4. `permission-rbac-launch-matrix`
   - 明确 Admin/Vendor 写操作与 RBAC、资源归属、市场归属关系。
   - 不替代现有权限系统。

5. `fulfillment-logistics-runtime-gate-plan`
   - 以 `docs/logistics-and-waybill-boundary-plan.md` 为基础继续拆 mock provider 与真实 provider。
   - 不改 checkout shipping options。

## 本 PR 验证

```bash
cd apps/storefront && /home/codex/.bun/bin/bun run build
git diff --check
```

预期：

- Storefront build 通过，允许保留既有 React Hook dependency warnings。
- `git diff --check` 无输出。

