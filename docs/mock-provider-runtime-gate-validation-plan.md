# Mock Provider Runtime Gate Validation Plan

更新时间：2026-05-08 14:35 Asia/Shanghai

## 目标

规划 mock provider contract、provider registry、runtime gate、preprod disposable DB gate 的组合验证。

本轮只写计划，不接 runtime，不注册 provider，不执行 workflow。

## 当前积木

已经具备：

- Mock payment notification skeleton。
- Inbox / event log migration skeleton。
- Local disposable DB dry-run。
- Neutral mock webhook route local-only DB smoke。
- Runtime gate pure function。
- Preprod disposable DB checklist。
- Preprod disposable DB script skeleton。
- Mock China PaymentProvider contract。
- Payment provider registry pure function。

仍然缺少：

- 外部 disposable preprod DB execution。
- Provider runtime wiring。
- Medusa payment provider registration。
- Workflow execution gate。
- 真实支付宝 / 微信支付 adapter。

## 组合验证矩阵

| Gate | 条件 | 期望 |
| --- | --- | --- |
| Provider contract | `createMockChinaPaymentProviderContract()` 单测通过 | 只返回 mock contract，不写状态 |
| Registry | `mock_china_pay` + `mock_contract_only` + 显式非生产 `nodeEnv` | 可解析 mock contract |
| Registry production | `nodeEnv=production` | blocked |
| Runtime config | 未显式开启 | disabled |
| Runtime gate | 缺 DB runtime / migration / preprod DB / provider adapter 任一项 | blocked |
| Workflow gate | `workflowExecutionEnabled=false` | blocked |
| External DB | 无 disposable preprod DB | blocked-external |

## 建议验证顺序

1. `payment-provider-registry.unit.spec.ts`
   - 默认 disabled。
   - production blocked。
   - 缺 `nodeEnv` blocked。
   - alipay / wechat_pay refused。
2. `payment-runtime-gate.unit.spec.ts`
   - runtime 默认 blocked。
   - DB runtime 缺失 blocked。
   - migration 缺失 blocked。
   - preprod disposable DB 缺失 blocked。
   - provider adapter 缺失 blocked。
3. `mock-china-payment-provider.unit.spec.ts`
   - create / query / close 只返回 contract。
   - notification verify / normalize 只生成 envelope。
4. `payment-notification-idempotency-harness.sh`
   - 汇总 payment notification 单测。
   - local disposable DB dry-run 后无残留。
5. runtime grep
   - `packages/api/medusa-config.ts` 不应引用 `china-payment-notification`。
   - `apps/**` 不应引用 mock provider contract。

## Runtime Go / No-Go

Go 到下一阶段计划：

- Harness 通过。
- Typecheck 通过。
- Runtime grep 无注册。
- Disposable DB 无残留。
- Provider registry 明确 production blocked。
- Runtime gate 明确 workflow blocked。

No-Go：

- 需要真实支付宝或微信支付密钥。
- 需要注册 Medusa payment provider。
- 需要连接生产或不可删除 DB。
- 需要前端 return URL 作为支付成功依据。
- 需要执行 payment workflow。
- 需要把退款、对账、结算、佣金或权限混入同一 PR。

## 后续 PR 拆分

### PR 1: mock-provider-runtime-gate-validation-plan

本文件。只写计划。

### PR 2: mock-provider-runtime-gate-composition-tests

新增纯函数组合测试：

- registry resolved + runtime gate missing preprod DB -> blocked。
- registry resolved + runtime gate missing workflow -> blocked。
- production -> blocked。
- alipay / wechat_pay -> refused。

不接 route，不接 DB。

### PR 3: mock-provider-runtime-readiness-report

docs-only，记录组合测试、harness、typecheck 和 runtime grep。

### PR 4: preprod-disposable-db-execution

blocked-external。只有用户提供 disposable preprod DB 和明确授权后才能执行。

## 当前结论

下一步可以做 `mock-provider-runtime-gate-composition-tests`，但必须保持纯函数测试，不接 runtime、不注册 provider、不执行 workflow。
