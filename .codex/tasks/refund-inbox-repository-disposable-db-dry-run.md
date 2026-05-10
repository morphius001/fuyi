# Refund Inbox Repository Disposable DB Dry-run

更新时间：2026-05-10 Asia/Shanghai

## 任务目标

新增本地一次性 PostgreSQL dry-run 脚本，验证 refund inbox repository 未来需要的存储语义：唯一幂等、duplicate replay、digest conflict、refund event action allowlist、禁止动作 rejection、metadata redaction、rollback / drop 和无残留 DB。

## 允许范围

- 新增 `.codex/scripts/refund-inbox-repository-disposable-db-dry-run.sh`
- 新增 `docs/refund-inbox-repository-disposable-db-dry-run.md`
- 更新 `.codex/queue.md`
- 更新 `project-ledger/changelog.md`
- 更新 `project-ledger/status.md`
- 更新 `project-ledger/handoff.md`

## 禁止范围

- 不修改 `apps/**`
- 不修改 `packages/**`
- 不注册 `china-payment-notification` module 或 migration
- 不新增 route、provider refund API、workflow、subscriber、job 或 scheduler
- 不连接预发 / 生产 / 共享测试 DB
- 不写真实密钥、证书、商户号、token、provider payload 或完整手机号
- 不改变 checkout、cart、order、payment、refund、settlement、commission、payout、permission、fulfillment 或 logistics runtime

## 验证要求

- `.codex/scripts/refund-inbox-repository-disposable-db-dry-run.sh`
- `git diff --check`
- `git diff --name-only`
- `git status --short --branch`
- `git ls-files --others --exclude-standard`
- 子智能体只读复核

## 完成输出

完成后说明：

- 修改文件
- dry-run row count / cleanup 结果
- 验证结果
- 风险点
- 下一步建议
