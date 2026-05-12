# Refund State Mutation Preprod Rehearsal Operator Pack

更新时间：2026-05-13 Asia/Shanghai

## 结论

真实生产退款成功状态写入仍是 No-Go。本 operator pack 只整理一次性预发 rehearsal 的输入模板、执行前核对、evidence capture 清单和回滚确认项，不实现 preprod runtime、不连接生产 DB、不执行生产 workflow、不写 production refund success state。

## Operator Checklist

执行 rehearsal 前，operator 必须逐项确认：

1. 当前环境是 disposable / isolated preprod，不是 production。
2. 当前 DB、provider endpoint、webhook、merchant id、secret、certificate 均为 sandbox / fake / disposable 值。
3. feature flag snapshot 已记录，默认关闭，任何 `execute` 模式仍为 No-Go。
4. approval persistence、audit persistence、runtime attempt persistence、terminal conflict persistence 交叉引用均可反查。
5. rehearsal request 不会触发 settlement、commission、payout、permission、fulfillment、logistics side effect。
6. 已准备 rollback owner、rollback deadline、operator communication note。
7. evidence capture 路径已准备，且不会写入真实敏感信息。

任一项不满足即停止。

## Input Template

每次 rehearsal 前至少填写：

```text
rehearsal_id:
environment_label:
db_target_confirmation:
provider_target_confirmation:
feature_flag_snapshot_key:
approval_persistence_idempotency_key:
audit_persistence_idempotency_key:
runtime_attempt_persistence_idempotency_key:
terminal_conflict_persistence_key:
workflow_adapter_command_key:
preprod_dry_run_request_key:
reviewer_actor_id:
reviewer_role:
permission_evidence_id:
target_state_audit_label:
provider_evidence_digest:
provider_evidence_digest_version:
rollback_owner:
rollback_deadline:
operator_note_redacted:
```

禁止填写：

- production DB URL
- 真实 provider key / cert / merchant secret
- raw provider payload
- 完整手机号、地址、身份证、银行卡

## Evidence Capture

每次 rehearsal 至少采集：

- environment self-check 截图或文本记录
- feature flag snapshot
- approval persistence lookup 结果
- audit persistence lookup 结果
- runtime attempt persistence lookup 结果
- terminal conflict snapshot / event lookup 结果
- dry-run request / audit event 结果
- duplicate / no-op / manual review / blocked 的 operator-visible reason
- rollback 前后 DB / queue / event count 对照

evidence 只能保存去敏结果。任何 raw payload 或敏感密钥都不得进入 evidence pack。

## Rollback Confirmation

rehearsal 结束后必须确认：

1. disposable DB 已清理或可证明无业务副作用残留。
2. 无真实 workflow execution。
3. 无 production refund success state write。
4. 无 settlement、commission、payout side effect。
5. 无 permission、fulfillment、logistics mutation。
6. operator review 队列未生成会误导生产处理的待办。
7. 所有 evidence 已归档，且仅包含 redacted 内容。

## Operator Sign-Off

建议至少需要三方 sign-off：

- execution operator
- reviewer / approver
- rollback owner

sign-off 必须包含时间、身份、确认项和 redacted note。缺任何一方即仍为 No-Go。

## Proposed Next PR Sequence

1. `refund-state-mutation-preprod-rehearsal-operator-pack-validation`：验证本 operator pack 文件范围和 No-Go。
2. `refund-state-mutation-preprod-rehearsal-readiness-review`：汇总 rehearsal refresh plan、operator pack 和现有 persistence 合同链，重新给出当前 Go / No-Go 结论。

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
