# Refund Inbox Disabled Route Skeleton Plan

更新时间：2026-05-10 Asia/Shanghai

## 任务目标

规划未来 refund inbox disabled route skeleton。当前只写计划，不新增 route、不修改 runtime。

## 允许范围

- 新增 `docs/refund-inbox-disabled-route-skeleton-plan.md`
- 更新 `.codex/queue.md`
- 更新 `project-ledger/changelog.md`
- 更新 `project-ledger/status.md`
- 更新 `project-ledger/handoff.md`

## 禁止范围

- 不修改 `apps/**`
- 不修改 `packages/**`
- 不新增 API route
- 不注册 `china-payment-notification` module 或 migration
- 不读取 request body
- 不连接 DB
- 不调用 refund verifier / normalizer / repository
- 不调用 provider refund API 或 workflow
- 不改变 checkout、cart、order、payment、refund、settlement、commission、payout、permission、fulfillment 或 logistics runtime

## 计划必须覆盖

- 未来 route skeleton 文件范围
- 默认 disabled response
- production blocked response
- 不读 body / 不验签 / 不 normalize / 不写 inbox / 不执行 workflow
- Method handling
- 单元测试清单
- runtime grep / typecheck / harness 验证建议
- 回滚与 Go / No-Go

## 验证要求

- `git diff --check`
- `git diff --name-only`
- `git status --short --branch`
- `git ls-files --others --exclude-standard`
- 子智能体只读复核

## 完成输出

完成后说明：

- 修改文件
- 验证结果
- 风险点
- 下一步建议
