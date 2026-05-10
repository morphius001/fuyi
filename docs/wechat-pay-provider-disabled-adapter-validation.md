# WeChat Pay Provider Disabled Adapter Validation

更新时间：2026-05-10 Asia/Shanghai

## 目标

本验证记录 PR #305 `wechat-pay-provider-disabled-adapter-skeleton` 合并后的主线状态。

结论：通过。当前微信支付 adapter 仍是未注册 disabled skeleton，不是可用支付 Provider。

## 验证命令

Focused unit test：

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn/packages/api
source "$HOME/.nvm/nvm.sh" && nvm use 24
bun run test:unit --runTestsByPath src/modules/china-payment-notification/__tests__/wechat-pay-provider.unit.spec.ts
```

结果：

```text
PASS src/modules/china-payment-notification/__tests__/wechat-pay-provider.unit.spec.ts
Test Suites: 1 passed, 1 total
Tests: 5 passed, 5 total
```

API typecheck：

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn/packages/api
source "$HOME/.nvm/nvm.sh" && nvm use 24
bunx tsc --noEmit -p tsconfig.json
```

结果：通过，无输出。

Payment notification harness：

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn
.codex/scripts/payment-notification-idempotency-harness.sh
```

结果：

```text
Test Suites: 22 passed, 22 total
Tests: 148 passed, 148 total
PASS payment notification inbox migration skeleton local dry-run completed and disposable database will be dropped.
PASS payment notification idempotency harness completed.
```

Runtime registration grep：

```bash
grep -RIn "china-payment-notification" packages/api/medusa-config.ts || true
grep -RIn "createDisabledWechatPayProviderAdapter" packages/api/src/api packages/api/medusa-config.ts || true
```

结果：无输出。

Diff check：

```bash
git diff --check
```

结果：通过，无输出。

## 当前状态

已具备：

- `createDisabledWechatPayProviderAdapter()`。
- focused unit test。
- payment notification harness 纳入 WeChat disabled adapter test。
- barrel export，仅用于 contract/test 访问。

仍未具备：

- Medusa payment provider registration。
- API route。
- SDK。
- checkout binding。
- payment workflow execution。
- DB-backed provider runtime。
- sandbox official signature/decryption test vectors。
- real app id / mch id / private key / APIv3 key / platform certificate。

## 安全结论

当前 adapter 所有操作仍返回 blocked decision：

- `createPayment` 不返回 `paymentUrl`、`qrCodeUrl` 或微信调起 `clientPayload`。
- `queryPayment` 不查询真实微信支付。
- `closePayment` 不关闭真实订单或支付。
- `verifyAndDecryptNotification` 不验签、不解密、不推进 payment state。
- `normalizeNotification` 不输出 `payment.succeeded`。

本轮不改变 cart、checkout、order、payment、refund、settlement、commission、payout、permission、fulfillment 或 logistics runtime。

## 下一步

推荐：

1. `alipay-provider-disabled-adapter-skeleton`
2. `wechat-pay-provider-fake-notify-test-plan`
3. `wechat-pay-provider-official-test-vector-readiness`

其中 fake notify / official test vector 阶段仍不得读取真实 production secret，不得接 checkout，不得执行 payment workflow。
