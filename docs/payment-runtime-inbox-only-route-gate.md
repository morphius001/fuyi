# Payment Runtime Inbox Only Route Gate

更新时间：2026-05-10 Asia/Shanghai

## 目标

本轮审计现有 payment runtime inbox-only route gate。

结论：通过。当前仓库只有 mock payment notification route / provider route skeleton，仍默认关闭；即使显式开启，也只允许 mock provider + local DB / local in-memory rehearsal，不接支付宝 / 微信支付真实 provider，不接 checkout，不执行 payment workflow。

## 已审计范围

- `packages/api/src/api/china/payment-webhooks/mock/route.ts`
- `packages/api/src/api/china/payment-providers/mock/route.ts`
- `packages/api/src/api/admin/china/mock-payment-webhooks/route.ts`
- `packages/api/src/modules/china-payment-notification/runtime-config.ts`
- `packages/api/src/modules/china-payment-notification/runtime-gate.ts`
- `packages/api/src/modules/china-payment-notification/mock-webhook-composition.ts`
- `packages/api/src/modules/china-payment-notification/mock-webhook-handler.ts`
- Route / runtime focused tests included by payment notification harness。

## 当前 Gate 状态

默认状态：

- `CHINA_PAYMENT_NOTIFICATION_RUNTIME_ENABLED` 未显式开启时，runtime disabled。
- production 环境默认 blocked。
- provider 只允许 `mock_china_pay`。
- route 不读取 body、不写 repository、不返回 payment success。

Mock inbox-only rehearsal 条件：

- `CHINA_PAYMENT_NOTIFICATION_RUNTIME_ENABLED=true`。
- `CHINA_PAYMENT_NOTIFICATION_WEBHOOK_MODE=mock_inbox_only`。
- `CHINA_PAYMENT_NOTIFICATION_PROVIDER=mock_china_pay`。
- provider registry 必须为 mock contract mode。
- local DB 或 local in-memory gate 必须显式开启。
- local DB 必须验证当前连接确实是本地 disposable DB。
- response 只能是 disabled / accepted / duplicate / rejected。

仍未具备：

- 支付宝 / 微信支付真实 webhook route。
- Medusa payment provider registration。
- 支付宝 / 微信支付 SDK。
- 真实 app id、mch id、merchant id、private key、APIv3 key、公钥、证书或 token。
- checkout binding。
- payment workflow execution。
- 生产 DB runtime。
- registered migration。
- refund、reconciliation、settlement、commission、payout、fulfillment 或 logistics runtime。

## 验证命令

Payment notification harness：

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn
.codex/scripts/payment-notification-idempotency-harness.sh
```

结果：

```text
Test Suites: 29 passed, 29 total
Tests: 194 passed, 194 total
PASS payment notification inbox migration skeleton local dry-run completed and disposable database will be dropped.
PASS payment notification idempotency harness completed.
```

API typecheck：

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn/packages/api
source "$HOME/.nvm/nvm.sh" && nvm use 24
bunx tsc --noEmit -p tsconfig.json
```

结果：通过，无输出。

Route high-risk grep：

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn
grep -RIn "execute_workflow\|paymentStateCommand\|orderStateCommand\|checkout\|wechat_pay\|alipay" \
  packages/api/src/api/china/payment-webhooks \
  packages/api/src/api/china/payment-providers \
  packages/api/src/api/admin/china/mock-payment-webhooks || true
```

结果：仅命中测试里的负断言，不存在真实支付宝 / 微信支付 route、checkout 或 workflow execution 接入。

Diff check：

```bash
git diff --check
```

结果：通过，无输出。

## Safety Boundary

当前允许继续：

- `payment-runtime-inbox-only-route-plan`。
- mock inbox-only route rehearsal。
- local disposable DB dry-run。
- docs-only validation。

当前仍禁止：

- 注册 Medusa payment provider。
- 新增支付宝 / 微信支付真实 route。
- 接支付宝 / 微信支付 SDK。
- 读取真实 secret。
- 把 return_url 当作支付成功。
- 接 checkout。
- 执行 payment workflow。
- 注册 migration。
- 连接外部 DB 或生产 DB。
- 接退款、对账、结算、佣金、打款、分账、履约或物流 runtime。

## Go / No-Go

进入 `payment-runtime-inbox-only-route-plan` 的 Go 条件：

- 只规划 mock inbox-only route。
- route 默认关闭。
- route 只接受 mock/fake provider payload。
- response 不表达支付成功。
- 不执行 workflow。
- 不连接外部 DB。

进入真实 provider runtime 的 No-Go：

- 仍缺真实 sandbox credentials owner。
- 仍缺 disposable preprod DB 授权和执行确认。
- 仍缺 production secret owner 和 rotation plan。
- 仍缺 payment workflow execution adapter release gate。
- 仍缺 RBAC / ownership / audit review。

因此下一步只能做 mock inbox-only route plan / rehearsal，不应直接接支付宝 / 微信支付 SDK、checkout 或 workflow。

## 下一步

推荐：

1. `payment-runtime-inbox-only-route-plan`
2. `payment-runtime-inbox-only-route-local-rehearsal`
3. `refund-runtime-risk-gate-plan`
