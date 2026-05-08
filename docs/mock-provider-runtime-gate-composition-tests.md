# Mock Provider Runtime Gate Composition Tests

更新时间：2026-05-08 14:45 Asia/Shanghai

## 目标

新增 mock provider registry + runtime gate 的纯函数组合测试。

本轮只新增单元测试，不接 route、不接 DB、不注册 Medusa payment provider。

## 覆盖场景

- Registry 拒绝 `alipay` 时，runtime gate 因 provider adapter 未验证而 blocked。
- Production 环境下 registry 和 runtime gate 均 blocked。
- Mock registry resolved 后，preprod disposable DB 仍是必需 gate。
- 所有非 workflow gate 满足后，只允许 `mock_prepare_command`。
- 即使 `workflowExecutionEnabled=true`，当前 mock composition 仍不暴露 `execute_workflow`。

## 文件

- `packages/api/src/modules/china-payment-notification/__tests__/mock-provider-runtime-gate-composition.unit.spec.ts`
- `.codex/scripts/payment-notification-idempotency-harness.sh`

## 安全边界

本轮没有：

- 修改 `packages/api/medusa-config.ts`。
- 注册 Medusa payment provider。
- 读取真实密钥。
- 接支付宝或微信支付。
- 连接数据库。
- 接 checkout runtime。
- 执行 payment workflow。
- 改变 checkout、order、payment、refund、settlement、commission 或 permission 行为。

## 验证

```bash
.codex/scripts/payment-notification-idempotency-harness.sh
bunx tsc --noEmit -p packages/api/tsconfig.json
git diff --check
```

## 下一步

下一项建议为 `mock-provider-runtime-readiness-report`，记录组合测试合并后的 harness/typecheck/runtime grep 和 DB 无残留验证。
