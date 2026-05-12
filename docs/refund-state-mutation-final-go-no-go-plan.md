# Refund State Mutation Final Go / No-Go Plan

更新时间：2026-05-12 Asia/Shanghai

## 结论

真实生产退款成功状态写入仍是 No-Go。本计划只整理最终 Go / No-Go 清单，不实现 runtime、不新增 route / job / subscriber、不执行生产 workflow、不写生产 refund success state。

当前已完成的安全链路：

1. provider inbox / route shadow and local disposable DB guard。
2. state owner handoff。
3. workflow shadow command。
4. provider query follow-up / reconciliation / local fixtures。
5. readiness decision。
6. state mutation shadow command。
7. operator approval candidate。
8. runtime adapter disabled decision。
9. audit write disabled intent。
10. workflow adapter disabled command candidate。
11. preprod dry-run disabled request。

但以上仍全部是 disabled / non-executable 合同链，不能视作上线可执行许可。

## Final Go Checklist

真实生产状态写入前，必须全部满足：

- 生产 feature flag 默认关闭，开启有审批、审计和快速回滚。
- 生产 provider refund notification / query evidence 已验签、幂等、可重试、可回放。
- provider route 不能直接写平台 refund success state。
- state owner 明确，不由 provider route、query job 或前端回跳直接写状态。
- operator approval 已真实持久化，reviewer 与发起 actor 分离。
- permission evidence、ownership evidence、terminal state conflict guard 已在 runtime 重新校验。
- audit write 已真实持久化，且 audit write 失败必须阻断 workflow execution。
- workflow adapter dry-run 输出与真实 workflow 输入一一对应。
- production workflow execution 有单独开关、幂等键、重试策略和失败审计。
- refund success state mutation 有终态冲突保护，重复请求必须 no-op。
- settlement、commission、payout 仍是后续独立 gate，不能在同 PR 触发。
- fulfillment、logistics 仍是后续独立 gate，不能在同 PR 触发。
- rollback runbook、报警、人工复核入口和 replay 策略已演练。

## Absolute No-Go Conditions

任一条件出现即 No-Go：

- 生产 DB / provider / webhook / secret 指向不清晰。
- 缺少验签、幂等、重试或 replay 证据。
- 缺少真实 audit write 持久化。
- 缺少 operator approval 持久化。
- permission、ownership、reviewer separation 只能依赖 metadata。
- provider query / route 直接写 refund success state。
- workflow execution 与 settlement / commission / payout 同 PR。
- workflow execution 与 fulfillment / logistics 同 PR。
- refund success state mutation 无终态冲突保护。
- 缺少 rollback runbook 或人工复核入口。

## Proposed Next PR Sequence

仍然建议分小 PR 串行推进：

1. `refund-state-mutation-final-go-no-go-validation`：验证本清单、合并文件范围和 No-Go。
2. `refund-state-mutation-persistence-gap-plan`：规划真实 operator approval / audit write 持久化差距，不实现生产写入。
3. `refund-state-mutation-idempotency-runtime-plan`：规划生产 workflow execution idempotency / retry / replay，不执行 workflow。
4. `refund-state-mutation-terminal-conflict-contract`：新增不可执行终态冲突纯函数合同和 focused tests。
5. `refund-state-mutation-production-execution-plan`：只有前置 gate 全过后，才规划最小生产执行 PR。

## Verification Plan

本计划 PR 需要运行：

```bash
git diff --check
git status --short --branch
```

本计划 PR 已验证：

```text
git diff --check passed
No apps/** or packages/** runtime diff
```

复核重点：

- 本轮仅 docs / task / queue / ledger。
- 未修改 `apps/**` 或 `packages/**` runtime。
- 未新增 route、job、subscriber、migration、DB、SDK、provider request / query、workflow execution、refund success state mutation。
- 未改变 settlement、commission、payout、permission、fulfillment 或 logistics。
