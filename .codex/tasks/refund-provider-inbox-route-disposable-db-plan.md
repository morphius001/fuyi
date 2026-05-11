# Refund Provider Inbox Route Disposable DB Plan

## 任务

规划后续 `refund-provider-inbox-route-disposable-db` PR，把 provider refund inbox route 从 local in-memory rehearsal 推进到 local disposable DB inbox-only rehearsal。

## 范围

- 新增 `docs/refund-provider-inbox-route-disposable-db-plan.md`。
- 更新 `.codex/queue.md`、`project-ledger/changelog.md`、`project-ledger/status.md`、`project-ledger/handoff.md`。
- 只做 disposable DB wiring 计划，不改 runtime。

## 非目标

- 不修改 `apps/**`。
- 不修改 `packages/**` runtime。
- 不连接预发、生产或普通共享数据库。
- 不注册 module。
- 不接 SDK。
- 不写真实密钥、证书、公钥、webhook token 或 DB URL。
- 不调用 provider refund API。
- 不调用 refund query API。
- 不执行 workflow。
- 不写 refund success state。
- 不改变 settlement、commission、payout、permission、fulfillment 或 logistics。

## 必须覆盖

- disposable DB gate、DB name / host / env guard、existing local PG client / repository 复用边界、schema prerequisite、body read order、provider verifier contract、normalizer、inbox receive、audit trail 和 response mapping。
- WeChat abnormal / closed、Alipay trade-only / query-required 的 non-success 语义。
- response / metadata redaction、runtime grep、focused tests、disposable DB rehearsal、rollback 和下一步 PR 拆分。

## 验证

- `git diff --check`
- `git status --short --branch`
- 子智能体只读复核。
