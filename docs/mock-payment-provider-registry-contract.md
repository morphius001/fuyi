# Mock Payment Provider Registry Contract

更新时间：2026-05-08 14:15 Asia/Shanghai

## 目标

新增中国支付 provider adapter registry 纯函数 contract。

它用于后续 runtime gate 之前的 provider 选择边界，不是 Medusa payment provider 注册。

## 当前行为

- 默认 disabled。
- production 默认 blocked。
- 只有 `provider=mock_china_pay`、`mode=mock_contract_only` 且显式传入非生产 `nodeEnv` 时可以解析 mock contract。
- `alipay` 和 `wechat_pay` 当前都会被拒绝。

## 文件

- `packages/api/src/modules/china-payment-notification/payment-provider-registry.ts`
- `packages/api/src/modules/china-payment-notification/__tests__/payment-provider-registry.unit.spec.ts`
- `packages/api/src/modules/china-payment-notification/index.ts`
- `.codex/scripts/payment-notification-idempotency-harness.sh`

## 安全边界

本轮没有：

- 修改 `packages/api/medusa-config.ts`。
- 注册 Medusa payment provider。
- 读取真实密钥。
- 接支付宝或微信支付。
- 连接数据库。
- 接 checkout runtime。
- 调用 payment workflow。
- 改变 checkout、order、payment、refund、settlement、commission 或 permission 行为。

## 验证

```bash
.codex/scripts/payment-notification-idempotency-harness.sh
bunx tsc --noEmit -p packages/api/tsconfig.json
git diff --check
```

## 下一步

下一步可做 `mock-payment-provider-registry-validation`，记录 PR 合并后 harness/typecheck/runtime grep。

支付宝和微信支付仍不能进入实现，必须等待：

- mock contract / registry validation。
- disposable preprod DB execution。
- runtime gate 通过。
- secret manager 和 test vectors 明确。
