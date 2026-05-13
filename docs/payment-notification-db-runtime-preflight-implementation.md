# Payment Notification DB Runtime Preflight Implementation

更新时间：2026-05-14 Asia/Shanghai

## 结论

本轮把 payment notification runtime gate、local disposable DB 白名单和 redacted preflight decision 推进到了可执行代码层，但仍然停在 pure preflight / gate 范围内，不接真实 provider、不执行 workflow、不改 payment / order state。

## Files Changed

- `packages/api/src/modules/china-payment-notification/payment-runtime-preflight.ts`
- `packages/api/src/modules/china-payment-notification/local-postgres-db-client.ts`
- `packages/api/src/modules/china-payment-notification/index.ts`
- `packages/api/src/modules/china-payment-notification/__tests__/payment-runtime-preflight.unit.spec.ts`
- `docs/payment-notification-db-runtime-preflight-implementation.md`
- `.codex/queue.md`
- `project-ledger/changelog.md`
- `project-ledger/status.md`
- `project-ledger/handoff.md`

## What Changed

本轮新增了一个纯 `preflight` 评估器，用来把以下几层组合成一个 fail-closed 决策：

1. runtime config 解析
2. runtime gate 纯函数判断
3. local disposable DB 安全校验
4. redacted audit metadata 输出

同时把 local postgres DB 校验抽成了可复用的 assessment helper，避免后续 route / resolver 再各自重复一套白名单逻辑。

## Safety Boundaries

本轮仍然明确保持：

- `workflowExecutionAllowed=false`
- `stateMutationAllowed=false`
- 不执行 production workflow
- 不写 production refund success state
- 不连接 production DB
- 不接真实 provider refund request / query

也就是说，这一步只是让“是否允许本地 / disposable DB runtime 继续往下走”变成可执行代码，还没有让任何真实支付或退款状态往前推进。

## Verification

已运行：

```bash
bun test packages/api/src/modules/china-payment-notification/__tests__/payment-runtime-preflight.unit.spec.ts packages/api/src/modules/china-payment-notification/__tests__/local-postgres-db-client.unit.spec.ts packages/api/src/modules/china-payment-notification/__tests__/payment-runtime-gate.unit.spec.ts packages/api/src/modules/china-payment-notification/__tests__/payment-runtime-config.unit.spec.ts
bunx tsc --noEmit -p packages/api/tsconfig.json
git diff --check
```

结果：

```text
focused tests 36/36 passed
API typecheck passed
git diff --check passed
```

## Next Step

建议继续进入 `mock-webhook-db-backed-route-runtime`，把 fake payload -> inbox 的 DB-backed route 落地，但仍保持 inbox-only、默认关闭、仅限 local / disposable DB。
