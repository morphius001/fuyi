# Payment Runtime Inbox Only Route Plan

更新时间：2026-05-10 Asia/Shanghai

## 目标

下一步只做 mock payment runtime inbox-only route local rehearsal。

计划结论：可以继续，但只允许复用现有 mock provider route 和本地 disposable DB / local in-memory 边界。该阶段的成功标准是 mock/fake 通知被验签、归一化、写入 inbox，并在重复通知时返回 duplicate；它仍不能表达支付最终成功，不能修改 payment/order state，不能执行 checkout 或 workflow。

## 当前可复用能力

已存在 route / gate：

- `packages/api/src/api/china/payment-providers/mock/route.ts`
- `packages/api/src/api/china/payment-webhooks/mock/route.ts`
- `packages/api/src/api/admin/china/mock-payment-webhooks/route.ts`
- `packages/api/src/modules/china-payment-notification/runtime-config.ts`
- `packages/api/src/modules/china-payment-notification/runtime-gate.ts`
- `packages/api/src/modules/china-payment-notification/mock-webhook-composition.ts`
- `packages/api/src/modules/china-payment-notification/mock-webhook-handler.ts`
- `packages/api/src/modules/china-payment-notification/mock-webhook-response.ts`

当前 gate 已具备：

- runtime 默认关闭。
- production 默认 blocked。
- provider 只允许 `mock_china_pay`。
- provider registry mode 必须是 `mock_contract_only`。
- local DB 必须显式开启，并验证连接是本地 DB。
- workflow gate 关闭，当前只允许 `inbox_only` stage。
- response 只允许 disabled / accepted / duplicate / rejected。
- response 不回显 raw body、secret、signature header 或 DB URL。

## 下一步 Rehearsal 允许范围

允许文件：

- 现有 mock provider route focused test。
- 现有 mock webhook route focused test。
- local disposable DB harness 或其只读文档说明。
- docs / task / ledger。

如需代码改动，只能是测试或 local-only rehearsal 保护性收紧，例如：

- 增加 provider route local DB 正常写入、duplicate、missing signature、remote DB blocked 的断言。
- 增加 route response 不包含 `execute_workflow`、checkout、payment / order state command 的断言。
- 增加本地 disposable DB 演练命令文档，不写真实环境变量。

不允许在下一步做：

- 新增真实支付宝 / 微信支付 route。
- 注册 Medusa payment provider。
- 引入支付宝 / 微信支付 SDK。
- 读取真实 app id、mch id、merchant id、private key、公钥、证书、APIv3 key 或 token。
- 接 checkout、cart、order 或 payment workflow。
- 把 return URL、前端跳转或 route response 当成支付成功来源。
- 写生产 DB、外部 DB 或注册生产 migration。
- 处理退款、对账、结算、佣金、打款、分账、履约或物流 runtime。

## 环境变量计划

Local-only rehearsal 必须显式设置：

```text
NODE_ENV=development
CHINA_PAYMENT_NOTIFICATION_RUNTIME_ENABLED=true
CHINA_PAYMENT_NOTIFICATION_WEBHOOK_MODE=mock_inbox_only
CHINA_PAYMENT_NOTIFICATION_PROVIDER=mock_china_pay
CHINA_PAYMENT_PROVIDER_REGISTRY_MODE=mock_contract_only
CHINA_PAYMENT_NOTIFICATION_LOCAL_DB=true
CHINA_PAYMENT_NOTIFICATION_LOCAL_DB_URL=<local disposable db url>
CHINA_PAYMENT_NOTIFICATION_LOCAL_DB_NAME=<local disposable db name>
CHINA_PAYMENT_NOTIFICATION_MOCK_SECRET=<fake local secret>
```

上线 / 生产必须保持：

```text
CHINA_PAYMENT_NOTIFICATION_RUNTIME_ENABLED=false
```

或者不设置该变量。生产环境不得使用 `mock_contract_only` 或 mock secret。

## Test Matrix

下一步 local rehearsal 应覆盖：

1. 默认 disabled：不读 body。
2. production blocked：即使 env 显式开启也不读 body。
3. registry mode 未显式开启：blocked。
4. local DB 未开启：blocked。
5. scope 没有可用 PG connection：blocked。
6. 实际 DB host 不是 localhost / 127.0.0.1 / local socket：blocked。
7. signed mock payload：accepted，写入 inbox / event log。
8. duplicate mock payload：duplicate，不重复表达成功。
9. missing / invalid signature：rejected。
10. response 不包含 raw body、secret、signature、DB URL、checkout、workflow command 或 order / payment state command。

## Rollback

如果 rehearsal 出现异常：

- 删除或 revert 本地 rehearsal 测试 / 文档 PR。
- 生产保持 runtime disabled。
- 不需要数据回滚，因为下一步仍只允许 local disposable DB。
- 不删除 Stripe、Algolia、Resend 或 TalkJS。

## Go / No-Go

进入 `payment-runtime-inbox-only-route-local-rehearsal` 的 Go 条件：

- 只使用 mock provider route。
- 只使用 fake payload 和 fake local secret。
- 只连接 local disposable DB 或 local in-memory repository。
- 不修改 provider registration、checkout、payment workflow 或订单状态。
- 验证通过 payment harness、API typecheck、route high-risk grep 和 diff check。

进入真实支付宝 / 微信支付 provider runtime 的 No-Go：

- 仍缺 sandbox credentials owner。
- 仍缺可审计的 secret rotation / storage plan。
- 仍缺 preprod disposable DB 授权。
- 仍缺 payment workflow execution release gate。
- 仍缺退款、对账、结算、佣金、权限和审计日志串行评审。

因此下一步只能做 `payment-runtime-inbox-only-route-local-rehearsal`，不能直接接真实 SDK、checkout、退款、结算、佣金、履约或物流。

## 验证记录

本轮为 docs-only plan；验证结果：

- Payment notification harness：29 suites / 194 tests passed；local disposable DB dry-run 已创建、回滚并清理。
- API typecheck：通过。
- Route high-risk grep：仅命中 route test 里的 checkout / workflow 负断言。
- `git diff --check`：通过。
