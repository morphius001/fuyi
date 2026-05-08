# Task: payment-provider-adapter-contract-plan

## 目标

规划中国本地支付 Provider / Adapter 合同，为后续 Mock China PaymentProvider、支付宝 Provider、微信支付 Provider 做接口边界准备。

本任务只写文档，不实现真实 Provider，不连接支付宝或微信支付。

## 允许修改

- `.codex/tasks/payment-provider-adapter-contract-plan.md`
- `docs/payment-provider-adapter-contract-plan.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- 不修改 `apps/**`。
- 不修改 `packages/**`。
- 不修改 `.codex/scripts/**`。
- 不修改 `packages/api/medusa-config.ts`。
- 不新增依赖。
- 不接真实支付宝、微信支付或任何支付网关。
- 不写真实 app id、merchant id、private key、public key、证书、secret 或 webhook token。
- 不调用 payment workflow。
- 不改变 checkout、order、payment、refund、settlement、commission 或 permission 行为。

## 规划内容

- Provider / Adapter 分层。
- 支付创建、查询、关闭、退款申请、退款查询、对账文件下载的合同边界。
- notify URL 和 return URL 职责边界。
- 验签、幂等、重试、审计、错误映射。
- 真实密钥加载和日志脱敏规则。
- Mock Provider、支付宝、微信支付的后续 PR 拆分。

## 验证命令

```bash
git diff --check
git status --short --untracked-files=all
```

## 完成标准

- 文档明确真实 Provider 之前的 adapter contract。
- 队列更新下一批可执行任务。
- 未修改任何业务代码。
