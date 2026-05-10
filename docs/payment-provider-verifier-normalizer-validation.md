# Payment Provider Verifier Normalizer Validation

更新时间：2026-05-10 Asia/Shanghai

## 目标

本验证汇总支付 Provider fake-only verifier / normalizer 合同阶段。

结论：通过。当前支付宝 / 微信支付已经具备 fake-only test vectors、pure verifier contracts 和 pure normalizer contracts，但仍不是可用支付 runtime。

## 已合并范围

- PR #315: WeChat Pay notification verifier contract。
- PR #316: Alipay notification verifier contract。
- PR #317: WeChat Pay notification normalizer contract。
- PR #318: Alipay notification normalizer contract。

相关前置：

- PR #309: WeChat Pay fake notify test plan。
- PR #310: Alipay fake notify test plan。
- PR #312: WeChat Pay fake notify fixtures。
- PR #313: Alipay fake notify fixtures。
- PR #314: Provider fake notify contract validation。

## 当前能力

已具备：

- `verifyWechatPayNotificationContract()`。
- `verifyAlipayNotificationContract()`。
- `normalizeWechatPayNotificationContract()`。
- `normalizeAlipayNotificationContract()`。
- WeChat Pay fake raw notification / fake decrypted resource fixtures。
- Alipay fake form / canonical payload fixtures。
- WeChat Pay normalizer 输出 `ChinaPaymentNotificationEnvelope`。
- Alipay normalizer 输出 `ChinaPaymentNotificationEnvelope`。
- 支付宝金额字符串按分解析，不做浮点金额重算。
- Payment notification harness 覆盖 mock provider、disabled adapters、runtime gate、state guard、command mapper、DB adapter skeleton、mock route skeleton、provider fake vectors、provider verifier contracts 和 provider normalizer contracts。

仍未具备：

- Medusa payment provider registration。
- 支付宝 / 微信支付生产或 sandbox runtime route。
- 支付宝 / 微信支付 SDK。
- 真实 app id、mch id、merchant id、private key、APIv3 key、公钥、证书或 token。
- checkout binding。
- payment workflow execution。
- DB-backed provider runtime。
- webhook route that receives real provider traffic。
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

Runtime grep：

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn
find apps packages/api/src/api packages/api/src/workflows packages/api/src/subscribers packages/api/src/links packages/api/medusa-config.ts -path "*/node_modules" -prune -o -type f -print 2>/dev/null | xargs grep -n "NotificationContract" 2>/dev/null || true
```

结果：无输出。

Diff check：

```bash
git diff --check
```

结果：通过，无输出。

## Safety Boundary

当前允许继续：

- runtime inbox-only route gate 设计。
- mock-only inbox route rehearsal。
- DB-backed repository rehearsal 继续保持 feature flag disabled。
- docs-only validation。

当前仍禁止：

- 注册 Medusa payment provider。
- 接真实支付宝 / 微信支付 SDK。
- 读取真实 secret。
- 把 return_url 当作支付成功。
- 接 checkout。
- 执行 payment workflow。
- 让 normalizer 输出直接改变 payment / order 状态。
- 注册 migration。
- 接退款、对账、结算、佣金、打款、分账、履约或物流 runtime。

## Go / No-Go

进入 `payment-runtime-inbox-only-route-gate` 的 Go 条件：

- route 默认关闭。
- route 只接受 mock/fake provider payload。
- route 只写入 inbox repository rehearsal 或 in-memory repository，不能执行 workflow。
- response 只能表示 received / duplicate / rejected，不能表示支付成功。
- 必须保留 idempotency key、signature status、raw payload digest 和 failure reason。

进入真实 SDK / checkout binding 的 No-Go：

- 仍缺真实 sandbox credentials owner。
- 仍缺 disposable preprod DB 授权和执行确认。
- 仍缺 provider runtime route gate。
- 仍缺 payment workflow execution adapter release gate。
- 仍缺 RBAC / ownership / audit review。

因此下一步只能进入 inbox-only route gate，不应直接接 SDK、checkout、真实 provider route 或 payment workflow。

## 下一步

推荐：

1. `payment-runtime-inbox-only-route-gate`
2. `payment-runtime-inbox-only-route-plan`
3. `refund-runtime-risk-gate-plan`
