# Refund State Mutation Persistence Gap Plan

更新时间：2026-05-12 Asia/Shanghai

## 结论

真实生产退款成功状态写入仍是 No-Go。本计划只梳理 production persistence gaps，不实现 DB write、不新增 migration、不注册 route / job / subscriber、不执行生产 workflow、不写生产 refund success state。

必须先补齐的持久化能力：

1. operator approval persistence。
2. audit write persistence。
3. runtime idempotency / replay persistence。
4. workflow execution attempt persistence。
5. terminal state conflict evidence persistence。

## Operator Approval Persistence Gaps

当前 operator approval 仍是 disabled / non-executable candidate。进入生产前必须规划：

- approval record schema。
- reviewer / initiator separation fields。
- reviewer role / permission evidence fields。
- target refund state audit label。
- source readiness / shadow command / runtime adapter references。
- immutable decision timestamp。
- rejection / manual review reason。
- idempotency key and uniqueness rule。
- replay-safe read model。

No-Go：

- approval 只存在内存或 metadata。
- reviewer permission 只由前端提交。
- reviewer 与发起 actor 可相同。
- vendor actor 可批准平台退款状态写入。

## Audit Write Persistence Gaps

当前 audit write 仍是 disabled intent。进入生产前必须规划：

- append-only audit table / event log。
- audit write idempotency key。
- redacted metadata schema。
- block code and evidence references。
- write failure behavior: fail closed。
- replay and operator lookup query shape。
- retention / export policy。

No-Go：

- audit write failure 后继续 workflow execution。
- audit metadata 可覆盖 safety flags。
- raw provider payload、密钥、DB URL 或个人敏感信息落入 audit metadata。

## Runtime Idempotency / Replay Gaps

当前 runtime / workflow / dry-run 都是 disabled。进入生产前必须规划：

- workflow execution idempotency key。
- provider evidence replay key。
- approval / audit / workflow cross-reference。
- retry state machine。
- duplicate request no-op rule。
- terminal conflict lock。
- operator-visible replay result。

No-Go：

- 重试可重复写 refund success state。
- terminal state conflict 只靠应用层日志判断。
- provider query / route 可绕过 state owner。

## Proposed Next PR Sequence

1. `refund-state-mutation-persistence-gap-validation`：验证本计划文件范围和 No-Go。
2. `refund-state-mutation-approval-persistence-plan`：规划 operator approval persistence，不写生产 DB。
3. `refund-state-mutation-audit-persistence-plan`：规划 audit write persistence，不写生产 DB。
4. `refund-state-mutation-runtime-idempotency-plan`：规划 workflow execution idempotency / replay，不执行 workflow。
5. `refund-state-mutation-terminal-conflict-contract`：新增不可执行终态冲突纯函数合同和 focused tests。

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
