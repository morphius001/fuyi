# Refund State Mutation Production Execution Go / No-Go

更新时间：2026-05-12 Asia/Shanghai

## 结论

真实生产退款成功状态写入仍是 **No-Go**。

当前链路已补齐大量 disabled / non-executable 合同和规划：

- provider refund inbox / verifier / local disposable DB wiring。
- state owner handoff。
- workflow shadow command。
- provider query follow-up / reconciliation / local fixtures。
- state mutation readiness。
- state mutation shadow command。
- operator approval candidate。
- runtime adapter disabled decision。
- audit write / workflow adapter / preprod dry-run disabled request。
- approval persistence / audit persistence disabled intent。
- runtime idempotency / terminal conflict / runtime attempt planning。
- terminal conflict disabled contract。
- runtime attempt disabled contract。

但这些仍然不是生产执行许可。当前所有关键执行面仍被设计为 disabled / non-executable，尚未具备 production workflow execution 和 refund success state mutation 的真实前置条件。

## Hard No-Go Reasons

以下任一项缺失都足以阻断生产执行；当前仍全部或部分缺失：

1. **真实 production feature flag / kill switch 未落地**  
   还没有可审计的生产开关、灰度范围、快速回滚和 owner。

2. **真实 approval persistence 未落地**  
   目前只有 disabled approval persistence intent，没有生产 approval record schema、唯一约束、reviewer separation 持久化和 replay read model。

3. **真实 audit persistence 未落地**  
   目前只有 disabled audit persistence intent，没有 append-only audit table、fail-closed write path 和 operator lookup。

4. **runtime attempt persistence 未落地**  
   目前只有 disabled runtime attempt intent，没有 attempt record schema、status transition、retry window、duplicate no-op 持久化。

5. **terminal conflict lock 未落地**  
   目前只有 disabled terminal conflict intent，没有真实 lock acquisition、digest persistence、terminal marker 和 operator review queue。

6. **production workflow execution 未 dry-run**  
   尚未在 disposable preprod / staging 证明真实 workflow command adapter 和 Medusa workflow 输入一致。

7. **rollback runbook 未演练**  
   尚未演练生产开关关闭、attempt 中断、terminal conflict review、audit lookup 和 operator recovery。

8. **财务 / 履约 side effect gate 未独立完成**  
   settlement、commission、payout、fulfillment、logistics 仍必须是后续独立 gate，不能随 refund success state mutation 同 PR 触发。

## Required Go Criteria

未来重新评估 Go 前，至少需要以下独立 PR 串行完成：

1. production feature flag / kill switch plan and validation。
2. approval persistence schema / repository contract / local disposable DB rehearsal。
3. audit persistence schema / repository contract / local disposable DB rehearsal。
4. terminal conflict lock persistence contract / local disposable DB rehearsal。
5. runtime attempt persistence contract / local disposable DB rehearsal。
6. workflow command adapter dry-run against disposable preprod or equivalent safe runtime。
7. production rollback runbook and operator recovery rehearsal。
8. final Go / No-Go review with explicit sign-off boundaries。

## Current Allowed Next Work

仍然允许：

- docs-only 分解下一批 persistence / feature flag / runbook PR。
- disabled / non-executable pure function contracts。
- local disposable DB rehearsal scripts that create and drop isolated databases。
- focused unit tests and harness expansion。

仍然禁止：

- production DB write。
- production workflow execution。
- production refund success state mutation。
- route / job / subscriber 直接写状态。
- provider route / query job 绕过 state owner。
- settlement / commission / payout / fulfillment / logistics side effects。

## Verification Plan

本 PR 需要运行：

```bash
git diff --check
git status --short --branch
```

本 PR 已验证：

```text
git diff --check passed
No apps/** or packages/** runtime diff
```

复核重点：

- 本轮仅 docs / task / queue / ledger。
- 未修改 `apps/**` 或 `packages/**` runtime。
- 未新增 route、job、subscriber、migration、DB、SDK、provider request / query、workflow execution、refund success state mutation。
- 未改变 settlement、commission、payout、permission、fulfillment 或 logistics。
