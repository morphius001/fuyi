# Payment Runtime Inbox Only Route Local Rehearsal

更新时间：2026-05-10 Asia/Shanghai

## 目标

本轮在 focused tests 中完成 mock provider route local inbox-only rehearsal。

结论：通过。测试层已验证 fake payload 在所有 gate 满足时只进入 local inbox-only response，不暴露 raw body、fake secret、signature、DB URL、checkout、workflow command 或 payment/order state command；重复通知返回 duplicate；缺失或错误签名返回 rejected。

## 修改范围

- `packages/api/src/api/china/payment-providers/mock/__tests__/route.unit.spec.ts`
- `.codex/tasks/payment-runtime-inbox-only-route-local-rehearsal.md`
- `docs/payment-runtime-inbox-only-route-local-rehearsal.md`
- `.codex/queue.md`
- `project-ledger/changelog.md`
- `project-ledger/handoff.md`
- `project-ledger/status.md`

## Rehearsal 覆盖

本轮新增或收紧：

- local DB 实际 host 不是本地时保持 disabled。
- local DB 实际 port 与 configured local DB URL 不一致时保持 disabled。
- signed mock payload 返回 accepted，但响应不表达 `payment.succeeded`。
- duplicate mock payload 返回 duplicate，仍不暴露 workflow / checkout / state command。
- missing signature 返回 rejected。
- invalid signature 返回 rejected，且不泄露 bad signature、fake secret、raw body 或 DB URL。
- accepted / duplicate / rejected response 均不包含：
  - raw body
  - fake local secret
  - `x-mock-payment-signature`
  - local DB URL
  - `execute_workflow`
  - `checkout`
  - `paymentStateCommand`
  - `orderStateCommand`
  - `payment.succeeded`

## Safety Boundary

本轮没有修改 route runtime 实现。

仍禁止：

- 新增真实支付宝 / 微信支付 route。
- 注册 Medusa payment provider。
- 接支付宝 / 微信支付 SDK。
- 读取真实 app id、mch id、merchant id、private key、公钥、证书、APIv3 key 或 token。
- 接 checkout、cart、order 或 payment workflow。
- 把 return URL、前端跳转或 route response 当成支付成功来源。
- 写生产 DB、外部 DB 或注册生产 migration。
- 处理退款、对账、结算、佣金、打款、分账、履约或物流 runtime。

## Local Config Boundary

测试使用 fake local secret 和 mocked local DB scope，均为 unit test 内部数据。

生产必须保持：

```text
CHINA_PAYMENT_NOTIFICATION_RUNTIME_ENABLED=false
```

或者不设置该变量。生产环境不得使用 `mock_contract_only`、mock secret、local disposable DB URL 或本轮 test fixture。

## 验证记录

Focused provider route test：

```text
PASS src/api/china/payment-providers/mock/__tests__/route.unit.spec.ts
Test Suites: 1 passed, 1 total
Tests: 12 passed, 12 total
```

完整验证结果：

- Payment notification harness：29 suites / 196 tests passed；local disposable DB dry-run 已创建、回滚并清理。
- API typecheck：通过。
- Route high-risk grep：仅命中 provider route test 里的 checkout / workflow / state command 负断言。
- `git diff --check`：通过。

## 下一步

推荐继续 `refund-runtime-risk-gate-plan` 或 payment runtime docs-only validation。

不能直接进入真实支付宝 / 微信支付 SDK、checkout、workflow、退款、结算、佣金、履约或物流 runtime。
