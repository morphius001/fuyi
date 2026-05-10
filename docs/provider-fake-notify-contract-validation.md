# Provider Fake Notify Contract Validation

更新时间：2026-05-10 Asia/Shanghai

## 目标

本验证汇总支付 Provider fake notify 阶段结果。

结论：通过。当前支付宝 / 微信支付已经具备 fake notify test plan 和 fake-only test vectors，但仍不是可用支付 Provider。

## 已合并范围

- PR #309: WeChat Pay fake notify test plan。
- PR #310: Alipay fake notify test plan。
- PR #312: WeChat Pay fake notify fixtures。
- PR #313: Alipay fake notify fixtures。

相关前置：

- PR #303: WeChat Pay provider sandbox contract。
- PR #304: Provider secret config template。
- PR #305: WeChat Pay disabled adapter skeleton。
- PR #306: WeChat Pay disabled adapter validation。
- PR #307: Alipay disabled adapter skeleton。
- PR #308: Alipay disabled adapter validation。
- PR #311: Provider disabled adapter rollup validation。

## 当前能力

已具备：

- 支付宝 / 微信支付 sandbox contract。
- 支付宝 / 微信支付 secret reference key 模板。
- 未注册 disabled adapter skeleton。
- 微信支付 fake-only notification vector。
- 支付宝 fake-only notification vector。
- 微信支付 fixture 的 fake raw body、fake encrypted resource、fake decrypted resource、expected idempotency key 和 payload digest。
- 支付宝 fixture 的 fake form、expected canonical keys / digest、expected idempotency key 和 payload digest。
- 支付宝 canonical payload 明确排除 `sign` 和 `sign_type`；`sign_type=RSA2` 只作为 verifier 独立输入。
- Payment notification harness 覆盖 mock provider、disabled adapters、runtime gate、state guard、command mapper、DB adapter skeleton、mock route skeleton 和 provider fake vectors。

仍未具备：

- Medusa payment provider registration。
- 支付宝 / 微信支付生产或 sandbox runtime route。
- 支付宝 / 微信支付 SDK。
- 真实 app id、mch id、merchant id、private key、APIv3 key、公钥、证书或 token。
- checkout binding。
- payment workflow execution。
- DB-backed provider runtime。
- real provider notification verifier。
- real provider notification normalizer。
- refund、reconciliation、settlement、commission、payout、fulfillment 或 logistics runtime。

## 验证命令

Payment notification harness：

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn
.codex/scripts/payment-notification-idempotency-harness.sh
```

结果：

```text
Test Suites: 25 passed, 25 total
Tests: 161 passed, 161 total
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

Runtime registration grep：

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn
grep -RIn "china-payment-notification" packages/api/medusa-config.ts || true
grep -RIn "createDisabled.*ProviderAdapter" packages/api/src/api packages/api/medusa-config.ts || true
```

结果：无输出。

Sensitive credential grep（fixture 文件）：

```bash
grep -RIn \
  -e BEGIN \
  -e "app_id=[0-9A-Za-z]{10,}" \
  -e "mch_id=[0-9]" \
  -e "merchant_id=[0-9]" \
  -e "private_key=" \
  -e "secret=" \
  -e "token=" \
  -e "DATABASE_URL=" \
  packages/api/src/modules/china-payment-notification/wechat-pay-test-vectors.ts \
  packages/api/src/modules/china-payment-notification/alipay-test-vectors.ts || true
```

结果：无输出。

Sensitive assertion grep（测试文件）：

```bash
grep -RIn \
  -e BEGIN \
  -e "app_id=[0-9A-Za-z]{10,}" \
  -e "mch_id=[0-9]" \
  -e "merchant_id=[0-9]" \
  -e "private_key=" \
  -e "secret=" \
  -e "token=" \
  -e "DATABASE_URL=" \
  packages/api/src/modules/china-payment-notification/__tests__/wechat-pay-test-vectors.unit.spec.ts \
  packages/api/src/modules/china-payment-notification/__tests__/alipay-test-vectors.unit.spec.ts || true
```

结果：仅命中测试中的否定断言和 fake/test id 断言，例如 `not.toContain("BEGIN PRIVATE KEY")`、`not.toMatch(/app_id=[0-9A-Za-z]{10,}/)`；它们是保护性测试，不是实际 secret。

Diff check：

```bash
git diff --check
```

结果：通过，无输出。

## Safety Boundary

当前允许继续：

- WeChat Pay notification verifier contract。
- WeChat Pay notification normalizer contract。
- Alipay notification verifier contract。
- Alipay notification normalizer contract。
- Payment harness 扩展。
- Docs-only validation。

当前仍禁止：

- 注册 Medusa payment provider。
- 新增真实 provider route。
- 接支付宝 / 微信支付 SDK。
- 读取真实 secret。
- 把 return_url 当作支付成功。
- 接 checkout。
- 执行 payment workflow。
- 写入真实 inbox / event log runtime。
- 与退款、对账、结算、佣金、打款、分账、履约或物流混在同 PR。

## Go / No-Go

进入 pure verifier / normalizer contract 的 Go 条件：

- 输入只来自 fake-only fixture。
- 不读取 env secret。
- 不依赖 SDK。
- 不调用 checkout 或 payment workflow。
- 不写 DB。
- 只返回 contract result / normalized envelope / error mapping。
- 单测覆盖成功、签名失败、provider mismatch、金额/币种异常、重复通知 key 和未知订单引用。

进入 sandbox SDK / checkout binding 的 No-Go：

- 仍缺真实 sandbox credentials owner。
- 仍缺 disposable preprod DB 授权和执行确认。
- 仍缺 workflow execution adapter release gate。
- 仍缺 provider route runtime gate。
- 仍缺 RBAC / ownership / audit review。

因此下一步只能进入 verifier / normalizer 纯函数合同，不应直接接 SDK、checkout、真实 route 或 payment workflow。

## 下一步

推荐：

1. `wechat-pay-notification-verifier-contract`
2. `alipay-notification-verifier-contract`
3. `wechat-pay-notification-normalizer-contract`
