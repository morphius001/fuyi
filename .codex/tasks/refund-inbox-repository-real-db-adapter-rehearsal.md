# Refund Inbox Repository Real DB Adapter Rehearsal

更新时间：2026-05-10 Asia/Shanghai

## 任务目标

新增本地 disposable PostgreSQL rehearsal 脚本，验证 refund inbox repository / SQL adapter 相关 DB 语义。这里的 real DB 只表示本地一次性 PostgreSQL，不表示预发或生产 DB。

## 允许范围

- 新增 `.codex/scripts/refund-inbox-repository-real-db-adapter-rehearsal.sh`
- 新增 `docs/refund-inbox-repository-real-db-adapter-rehearsal.md`
- 更新 `.codex/queue.md`
- 更新 `project-ledger/changelog.md`
- 更新 `project-ledger/status.md`
- 更新 `project-ledger/handoff.md`

## 禁止范围

- 不修改 `apps/**`
- 不修改 `packages/**` runtime
- 不注册 module / migration
- 不新增 route
- 不连接预发或生产 DB
- 不调用 provider refund API
- 不执行 payment / refund workflow
- 不改变 checkout、cart、order、payment、refund、settlement、commission、payout、permission、fulfillment 或 logistics runtime

## 验证要求

- rehearsal 脚本 positive run
- rehearsal 脚本 unsafe DB name guard
- rehearsal 脚本 production env guard
- focused local client / repository tests
- API typecheck
- payment notification harness
- existing refund disposable DB dry-run
- `git diff --check`
- 子智能体只读复核

## 完成输出

完成后说明：

- 修改文件
- 验证结果
- 风险点
- 下一步建议
