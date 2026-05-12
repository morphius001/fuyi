# Refund State Mutation Terminal Conflict Plan

更新时间：2026-05-12 Asia/Shanghai

## 结论

真实生产退款成功状态写入仍是 No-Go。本计划只规划 terminal conflict lock / evidence digest / operator review 边界，不实现 DB write、不新增 migration、不注册 route / job / subscriber、不执行生产 workflow、不写 production refund success state。

Terminal conflict 的目标是防止重复通知、provider query snapshot、operator replay 或 workflow retry 在平台退款记录已进入终态后再次写入不同结果。

## Terminal State Definition

未来生产前必须由平台 refund state owner 明确定义终态集合。第一版规划建议至少区分：

- `succeeded`：平台已确认退款成功。
- `failed_final`：平台已确认不可重试失败。
- `canceled`：平台已确认退款取消。
- `manual_closed`：人工复核后关闭。

非终态示例：

- `pending`。
- `processing`。
- `retryable_failed`。
- `manual_review_required`。

任何终态集合变更都必须独立 PR、带 migration / runbook / replay 兼容说明，不能藏在 provider route 或 workflow adapter 中。

## Conflict Inputs

未来 terminal conflict contract 必须接收去敏且不可被 metadata 覆盖的输入：

- current platform refund state。
- current terminal marker and version。
- current state owner evidence id。
- incoming target state audit label。
- incoming provider evidence digest。
- incoming approval persistence idempotency key。
- incoming audit persistence idempotency key。
- incoming workflow idempotency key。
- actor / reviewer / permission evidence references。
- environment and runtime feature flag version。

禁止使用：

- raw provider payload。
- 前端 return URL 状态。
- operator note 作为唯一依据。
- metadata 中的 `currentState`、`targetState`、`refundSuccessState` 或 safety flags。
- timestamp-only conflict key。

## Evidence Digest Rules

Evidence digest 必须可重复计算并可追溯：

- canonical provider evidence 先去敏再 digest。
- amount、currency、provider refund reference、merchant order reference、refund request reference 必须进入 canonical form。
- approval persistence key 和 audit persistence key 必须进入 digest context。
- digest version 必须持久化，后续算法升级不能破坏历史 replay。
- digest mismatch 不能自动覆盖旧结果，只能进入人工复核。

No-Go：

- provider query snapshot 可覆盖 notification digest。
- route body 原文直接进入 digest。
- audit metadata 可修改 digest 输入。
- digest conflict 后仍继续 workflow execution。

## Lock And Review Rules

建议 terminal conflict lock 行为：

- 当前非终态、incoming target 合法且 evidence digest 未冲突：允许进入下一阶段的 shadow decision。
- 当前终态、incoming target 与终态一致、digest 一致：duplicate no-op / replay result。
- 当前终态、incoming target 一致但 digest 不一致：`terminal_digest_conflict`，人工复核。
- 当前终态、incoming target 不一致：`terminal_state_conflict`，人工复核。
- 当前状态缺失或 owner evidence 缺失：fail closed。
- lock acquisition failure：fail closed。

Operator review 必须展示：

- 当前平台状态与进入终态时间。
- 原终态 evidence digest。
- incoming evidence digest。
- provider reference / refund request reference。
- previous approval / audit / workflow attempt reference。
- conflict code and recommended action。

## Runtime Boundaries

- provider route 不能直接解除 terminal conflict lock。
- provider query reconciliation 不能直接写 terminal state。
- operator approval 不能覆盖 terminal conflict，必须生成新的 review decision。
- workflow retry 不能绕过 terminal conflict lock。
- settlement、commission、payout、fulfillment、logistics 不能在 terminal conflict 处理中被触发。

## Proposed Next PR Sequence

1. `refund-state-mutation-terminal-conflict-validation`：验证本计划文件范围和 No-Go。
2. `refund-state-mutation-terminal-conflict-contract`：新增不可执行 terminal conflict 纯函数合同和 focused tests。
3. `refund-state-mutation-terminal-conflict-contract-validation`：验证合同仍不可执行。
4. `refund-state-mutation-runtime-attempt-plan`：规划 workflow attempt persistence schema，不实现生产写入。
5. `refund-state-mutation-production-execution-go-no-go`：重新评估生产执行前置条件。

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
