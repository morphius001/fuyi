# Refund State Mutation Preprod Rehearsal Refresh Plan

更新时间：2026-05-13 Asia/Shanghai

## 结论

真实生产退款成功状态写入仍是 No-Go。本计划只刷新一次性预发 rehearsal gate 和 operator checklist，不实现 preprod runtime、不新增 route / job / subscriber、不连接生产 DB、不执行生产 workflow、不写 production refund success state。

旧版 `refund-state-mutation-preprod-dry-run-plan` 和 `refund-state-mutation-preprod-dry-run-contract` 已经完成，但它们形成于 approval persistence、audit persistence、runtime attempt persistence、terminal conflict persistence repository 逐段补齐之前。当前需要一份更新后的 rehearsal 计划，把这些持久化前置条件纳入同一份 Go / No-Go 清单。

## Refreshed Rehearsal Scope

未来一次性预发 rehearsal 必须在单独、可丢弃、可回滚的 preprod 环境中串行验证以下只读/禁写链路：

1. production feature flag snapshot 读取仍默认关闭。
2. operator approval persistence reference 可追溯。
3. audit persistence reference 可追溯。
4. runtime attempt persistence reference 可追溯。
5. terminal conflict persistence snapshot / event reference 可追溯。
6. preprod dry-run request / audit event 可重放。
7. workflow adapter command candidate 与 dry-run request 一一对应。
8. provider evidence digest / approval / audit / runtime attempt / terminal conflict 交叉引用一致。

任何一项只能以 disabled / shadow / no-op 方式演练；不得落到真实生产执行。

## Required Environment Gates

预发 rehearsal 前必须明确：

- rehearsal 环境不是 production，且不会通过环境变量、连接串、provider 配置或 webhook URL 回落到生产。
- rehearsal DB 必须是 disposable / isolated，允许全量删除和回滚验证。
- rehearsal provider 必须是 sandbox / fixture / local fake，不允许真实退款 request / query。
- rehearsal secret、证书、密钥、merchant id、webhook token 必须是 mock 或 sandbox 值。
- rehearsal 报警、日志、operator review 页面不得把结果误报为生产成功。

## Required Evidence Chain

每次 rehearsal request 至少要携带或能反查：

- feature flag snapshot key
- approval persistence idempotency key
- audit persistence idempotency key
- runtime attempt persistence idempotency key
- terminal conflict persistence idempotency key 或 snapshot key
- workflow adapter command key
- preprod dry-run request key
- reviewer / permission evidence id
- target state audit label
- provider evidence digest and digest version

缺任一项即 fail closed。

## Rehearsal Sequence

建议后续真实 rehearsal 仍按固定顺序串行：

1. 环境 gate self-check：确认非 production、非真实 provider、非真实 DB。
2. feature flag snapshot：确认默认关闭，dry-run 只能 shadow / disabled。
3. approval persistence replay：确认 reviewer separation / permission evidence 可追溯。
4. audit persistence replay：确认 append-only 证据链完整。
5. runtime attempt persistence replay：确认 duplicate / no-op / manual review 引用完整。
6. terminal conflict persistence replay：确认 snapshot / event / conflict code / digest version 可追溯。
7. preprod dry-run request replay：确认 dry-run request 仍不可执行、只生成 operator-visible audit trail。
8. rollback drill：清理 disposable DB、确认无生产副作用、确认 replay 记录可供人工复核。

## Absolute No-Go

任一条件出现即阻断 rehearsal：

- 任何连接串、provider endpoint、webhook 或 key 指向 production
- 任何步骤会执行真实 workflow
- 任何步骤会写 production refund success state
- 任何步骤会触发 settlement、commission、payout、permission、fulfillment、logistics side effect
- approval / audit / runtime attempt / terminal conflict 中任一 persistence 引用缺失
- terminal conflict evidence digest 与 approval / audit / runtime attempt 引用不一致
- dry-run request 无法重放、无法审计或无法回滚
- replay 结果无法区分 duplicate no-op、manual review、blocked

## Proposed Next PR Sequence

1. `refund-state-mutation-preprod-rehearsal-refresh-validation`：验证本计划文件范围和 No-Go。
2. `refund-state-mutation-preprod-rehearsal-operator-pack`：整理 rehearsal operator checklist、输入模板、回滚确认项和 evidence capture 清单。
3. `refund-state-mutation-preprod-rehearsal-readiness-review`：汇总所有 persistence 链和 rehearsal operator pack，重新给出 Go / No-Go 结论。

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
