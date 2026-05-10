# Provider Disabled Adapter Rollup Validation

更新时间：2026-05-10 Asia/Shanghai

## 目标

本验证汇总 PR #303-#310 的支付 Provider 阶段结果。

结论：通过。当前支付宝 / 微信支付仍只具备 sandbox contract、secret key 模板、未注册 disabled adapter skeleton 和 fake notify test plan；尚未成为可用支付 Provider。

## 已合并范围

- PR #303: WeChat Pay provider sandbox contract。
- PR #304: Provider secret config template。
- PR #305: WeChat Pay disabled adapter skeleton。
- PR #306: WeChat Pay disabled adapter validation。
- PR #307: Alipay disabled adapter skeleton。
- PR #308: Alipay disabled adapter validation。
- PR #309: WeChat Pay fake notify test plan。
- PR #310: Alipay fake notify test plan。

## 当前能力

已具备：

- 支付宝 / 微信支付 sandbox contract。
- 支付宝 / 微信支付 secret reference key 模板。
- `createDisabledWechatPayProviderAdapter()`。
- `createDisabledAlipayProviderAdapter()`。
- 两个 disabled adapter 的 focused unit tests。
- payment notification harness 覆盖 mock provider、WeChat disabled adapter、Alipay disabled adapter、runtime gate、state guard、command mapper、DB adapter skeleton 和 route skeleton。
- fake notify / test vector 后续拆分计划。

仍未具备：

- Medusa payment provider registration。
- 支付宝 / 微信支付 API route。
- 支付宝 / 微信支付 SDK。
- 真实 app id、mch id、merchant id、private key、APIv3 key、公钥、证书或 token。
- checkout binding。
- payment workflow execution。
- DB-backed provider runtime。
- official sandbox / fake notify test vectors。
- refund、reconciliation、settlement、commission、payout、fulfillment 或 logistics runtime。

## 验证命令

Payment notification harness：

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn
.codex/scripts/payment-notification-idempotency-harness.sh
```

结果：

```text
Test Suites: 23 passed, 23 total
Tests: 153 passed, 153 total
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

Diff check：

```bash
git diff --check
```

结果：通过，无输出。

## Safety Boundary

当前允许继续：

- fake notify fixtures。
- pure verifier / normalizer contracts。
- payment harness 扩展。
- docs-only validation。

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

进入 fake notify fixture 的 Go 条件：

- fixture 明确 fake-only。
- key / cert / signature 全部不可生产使用。
- unit test 只跑纯函数。
- harness 纳入新增测试。
- 不新增 route。

进入 sandbox SDK 的 No-Go：

- 仍缺真实 sandbox 凭据 owner。
- 仍缺 disposable preprod DB 授权和执行确认。
- 仍缺 workflow execution adapter release gate。
- 仍缺 provider route runtime gate。
- 仍缺 RBAC / ownership / audit review。

因此下一步只能进入 fake fixture / pure contract，不应直接接 SDK 或 checkout。

## 下一步

推荐：

1. `wechat-pay-fake-notify-fixtures`
2. `alipay-fake-notify-fixtures`
3. `provider-fake-notify-contract-validation`
