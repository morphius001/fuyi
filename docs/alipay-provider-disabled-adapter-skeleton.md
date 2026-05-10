# Alipay Provider Disabled Adapter Skeleton

更新时间：2026-05-10 Asia/Shanghai

## 目标

本轮新增支付宝 Provider disabled adapter skeleton，作为后续 sandbox fake notify、官方验签测试和 runtime gate 的代码边界。

它不是可用支付 Provider，不注册到 Medusa，不接 checkout，不读取真实密钥，不执行 payment workflow。

## 文件

- `packages/api/src/modules/china-payment-notification/alipay-provider.ts`
- `packages/api/src/modules/china-payment-notification/__tests__/alipay-provider.unit.spec.ts`
- `packages/api/src/modules/china-payment-notification/index.ts`
- `.codex/scripts/payment-notification-idempotency-harness.sh`

## 行为

`createDisabledAlipayProviderAdapter()` 只暴露：

- `provider: "alipay"`。
- `sandboxProvider: "alipay_sandbox"`。
- `mode: "disabled"`。
- `enabled: false`。
- notify / return URL config key 名。
- 支付宝 secret reference key 名。

以下操作全部返回 `blocked` decision：

- `createPayment`。
- `queryPayment`。
- `closePayment`。
- `verifyNotification`。
- `normalizeNotification`。

blocked decision 只包含：

- provider。
- mode。
- enabled false。
- operation。
- reason。
- raw payload digest。

它不会返回：

- `paymentUrl`。
- `qrCodeUrl`。
- 支付宝前端调起 `clientPayload`。
- payment workflow command。
- order state command。
- checkout hook。

## 安全边界

本轮没有：

- 注册 Medusa payment provider。
- 修改 `packages/api/medusa-config.ts`。
- 新增 API route。
- 接支付宝 SDK。
- 读取环境变量。
- 读取真实 app id、merchant id、private key、公钥、证书或 token。
- 接 checkout。
- 执行 payment workflow。
- 注册 migration。
- 连接外部 DB。
- 处理退款、对账、结算、佣金、打款、分账、履约或物流。

## 验证

已执行：

```bash
cd packages/api
source "$HOME/.nvm/nvm.sh" && nvm use 24
bun run test:unit --runTestsByPath src/modules/china-payment-notification/__tests__/alipay-provider.unit.spec.ts
bunx tsc --noEmit -p tsconfig.json
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn
git diff --check
```

PR 收口前已执行：

```bash
.codex/scripts/payment-notification-idempotency-harness.sh
```

结果：23 个 test suites / 153 个 tests 通过，disposable DB dry-run 创建、回滚并清理完成。

## 下一步

推荐：

1. `alipay-provider-disabled-adapter-validation`
2. `wechat-pay-provider-fake-notify-test-plan`
3. `alipay-provider-fake-notify-test-plan`

其中 fake notify 仍必须使用测试向量，不读取真实密钥，不接 checkout，不执行 payment workflow。
