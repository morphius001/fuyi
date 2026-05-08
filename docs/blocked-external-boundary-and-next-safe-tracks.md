# Blocked External Boundary And Next Safe Tracks

更新时间：2026-05-08 16:34 Asia/Shanghai

## 当前结论

自动队列已经到达外部阻塞边界：

```text
mock-provider-runtime-preprod-smoke-execution: blocked-external
```

原因：真正执行 preprod smoke 必须连接用户明确授权的 disposable preprod DB。当前没有 disposable preprod DB、备份 owner、回滚 owner 和连接授权，因此不能继续执行外部数据库连接。

## 已完成的安全基础

近期已合并：

- PR #190: mock provider local smoke script。
- PR #191: mock provider local smoke validation。
- PR #192: mock provider preprod smoke plan。
- PR #193: mock provider preprod smoke script skeleton。
- PR #194: mock provider preprod smoke script validation。

当前状态：

- 本地 disposable DB smoke 已覆盖 disabled / accepted / duplicate / rejected。
- preprod smoke 脚本 skeleton 只支持 `--print-plan` 和 `--validate-inputs-only`。
- 没有注册 Medusa payment provider。
- 没有接支付宝或微信支付。
- 没有执行 payment workflow。
- 没有修改 checkout、order、payment、refund、settlement、commission、payout 或 permission 状态。

## 继续执行的硬条件

要进入 `mock-provider-runtime-preprod-smoke-execution`，必须由用户明确提供：

- disposable preprod DB host。
- disposable preprod DB port。
- disposable preprod DB user。
- disposable preprod DB name。
- 备份 owner。
- 回滚 owner。
- 操作 owner。
- 明确连接授权。
- 明确该 DB 可丢弃或可回滚。

没有这些条件时，任何 agent 都不得连接外部 DB。

## 仍然禁止

自动队列不得自行执行：

- `--preflight` 外部 DB 连接。
- `--smoke` 外部 DB 连接。
- 支付宝 Provider。
- 微信支付 Provider。
- 退款。
- 对账。
- 商家结算。
- 佣金。
- 权限。
- 真实 payment workflow execution。
- checkout/order/payment 状态推进。

## 下一批安全方向

在没有 disposable preprod DB 前，可以继续做：

1. `mock-provider-runtime-external-readiness-review`
   - docs-only。
   - 审查脚本 skeleton、任务文件、Go / No-Go 和安全边界是否足够清晰。
   - 不新增脚本，不连接 DB。

2. `payment-provider-production-hardening-plan`
   - docs-only。
   - 规划真实支付宝 / 微信支付前的配置、密钥、签名、证书、回调、审计和回滚要求。
   - 不接真实 provider。

3. `payment-risk-register`
   - docs-only。
   - 汇总支付、退款、对账、结算、佣金、权限的风险登记表和串行顺序。
   - 不写 runtime code。

4. `china-platform-non-payment-backlog`
   - docs-only。
   - 回到非支付方向，整理市场、商户、档口、配送、商品草稿、店铺装修、快递打印、直播和提货卡的下一批低风险 PR。
   - 不修改业务代码。

## 建议队列策略

默认优先继续 `china-platform-non-payment-backlog`，因为支付 runtime 已经卡在外部 DB 授权边界。这样可以继续推进国内多市场平台能力，同时避免在支付高风险链路上硬闯。

当用户明确提供 disposable preprod DB 后，再回到 `mock-provider-runtime-preprod-smoke-execution`。
