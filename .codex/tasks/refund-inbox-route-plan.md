# Refund Inbox Route Plan

更新时间：2026-05-10 Asia/Shanghai

## 任务目标

规划未来 refund inbox route gate。当前只写计划，不新增 route、不改 runtime、不注册 module / migration、不连接真实 Provider、不执行 workflow。

## 允许范围

- 新增 `docs/refund-inbox-route-plan.md`
- 更新 `.codex/queue.md`
- 更新 `project-ledger/changelog.md`
- 更新 `project-ledger/status.md`
- 更新 `project-ledger/handoff.md`

## 禁止范围

- 不修改 `apps/**`
- 不修改 `packages/**`
- 不新增 API route
- 不注册 `china-payment-notification` module 或 migration
- 不接支付宝、微信支付或 mock provider 的真实 refund API
- 不读取真实 app id、merchant id、mch id、private key、公钥、证书、APIv3 key、webhook token 或 refund payload
- 不执行 payment / refund workflow
- 不改变 checkout、cart、order、payment、refund、settlement、commission、payout、permission、fulfillment 或 logistics runtime

## 计划必须覆盖

- Route path 草案和命名边界
- 默认 disabled / production blocked / local-only gate
- 请求 headers / body / fake-only payload
- inbox-only 行为：verify、normalize、idempotency、write inbox / event log
- duplicate、digest conflict、manual review、invalid signature、non-CNY、amount mismatch、unsupported event type
- 响应语义：accepted / duplicate / rejected / disabled 均不代表退款成功
- 不输出 raw payload、secret、signature、DB URL、workflow command 或 state mutation command
- 测试矩阵、grep guard、rollback 和 Go / No-Go

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
