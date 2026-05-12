# Refund State Mutation Production Feature Flag Plan

更新时间：2026-05-12 Asia/Shanghai

## 结论

真实生产退款成功状态写入仍是 No-Go。本计划只规划 production feature flag / kill switch / rollback owner，不实现真实开关、不修改 runtime、不执行生产 workflow、不写 production refund success state。

生产开关的原则是：默认关闭、显式审批、可灰度、可审计、可立即回滚，且不能绕过 approval persistence、audit persistence、terminal conflict lock 和 runtime attempt persistence。

## Required Flag Layers

未来生产执行至少需要四层 gate：

1. **Global kill switch**  
   默认 `off`。关闭时任何 refund state mutation workflow attempt 都必须 fail closed。

2. **Environment gate**  
   生产必须显式配置 `production_enabled=true`，staging / disposable preprod 必须独立配置，不能复用生产开关。

3. **Provider / market scope gate**  
   第一阶段只能按 provider、market、merchant 或 fixed allowlist 灰度，不能全量打开。

4. **Operation mode gate**  
   支持 `dry_run`、`shadow_only`、`single_attempt`、`disabled` 等模式；真实 `execute` 必须单独 Go / No-Go。

## Required Ownership

每个开关变更必须有：

- owner team。
- approver。
- change ticket / incident id。
- start time and planned end time。
- rollback owner。
- rollback deadline。
- operator communication note。
- audit event id。

No-Go：

- 只有环境变量，没有审批和审计。
- 只有前端开关，没有服务端 gate。
- provider route 可以直接打开执行。
- vendor actor 可以打开平台退款状态写入。

## Required Runtime Behavior

未来 runtime gate 必须：

- 在读取 provider evidence / approval / audit / attempt 前先检查 global kill switch。
- 每次 workflow attempt 前重新读取 feature flag snapshot。
- 将 flag version 写入 attempt record。
- flag 关闭后，不再创建新 executable attempt。
- 已在 processing 的 attempt 必须进入 safe stop / operator review，而不是继续写成功状态。
- rollback 后 duplicate / replay 必须返回 operator-visible reason。

## Required Verification

生产前必须完成：

- unit tests：flag parser、default off、production blocked、allowlist、mode transition。
- local dry-run：disabled / dry_run / shadow_only 不执行 workflow。
- disposable preprod rehearsal：flag off -> on shadow -> off rollback。
- runtime grep：无 provider route 直接执行 workflow。
- rollback rehearsal：kill switch 关闭后 attempt 停止并可复核。

## Proposed Next PR Sequence

1. `refund-state-mutation-production-feature-flag-validation`：验证本计划文件范围和 No-Go。
2. `refund-state-mutation-production-feature-flag-contract`：新增 disabled feature flag decision 纯函数合同和 focused tests。
3. `refund-state-mutation-production-feature-flag-contract-validation`：验证合同仍不可执行。
4. `refund-state-mutation-approval-persistence-schema-plan`：规划真实 approval persistence schema。
5. `refund-state-mutation-audit-persistence-schema-plan`：规划真实 audit persistence schema。

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
