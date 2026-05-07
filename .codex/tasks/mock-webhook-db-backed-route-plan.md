# Task: mock-webhook-db-backed-route-plan

## 目标

规划 neutral mock webhook route 接 DB-backed inbox skeleton 的后续拆分。

目标 route：

```text
POST /china/payment-webhooks/mock
```

本任务只写文档，不修改 runtime，不新增 DB 连接，不调用 payment workflow。

## 允许修改

- `.codex/tasks/mock-webhook-db-backed-route-plan.md`
- `docs/mock-webhook-db-backed-route-plan.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- 不修改 `packages/**`。
- 不修改 `apps/**`。
- 不新增、删除或移动 API route。
- 不注册 migration。
- 不连接真实 DB-backed repository。
- 不调用 payment workflow。
- 不接支付宝、微信支付、退款、对账、商家结算、佣金或权限逻辑。

## 规划要求

- 明确 Admin route 已 deprecated/disabled-only，不再作为 provider callback。
- 明确 neutral route 是唯一 mock provider callback 演进路径。
- 区分 local in-memory、local disposable DB、DB-backed inbox-only、未来 prepare-command 和 workflow execution。
- 设计 feature flag 和环境门禁，默认 disabled，production disabled，真实 Provider 禁止。
- 设计 repository resolution 边界，不能从 route 直接拿 production DB 写交易状态。
- 设计 smoke 和测试清单。
- 明确后续 PR 拆分和停止点。

## 验证命令

```bash
git diff --check
git diff --name-only
```

## 完成标准

- 文档能指导后续小 PR，不要求一次接入 DB-backed route。
- 后续第一步仍保持 mock-only、disabled by default、inbox-only。
- 不触碰支付、订单、退款、结算、佣金或权限真实业务逻辑。
