# Task: mock-webhook-db-backed-route-resolver-plan

## 目标

规划 neutral mock webhook route 的 repository resolver contract、disabled fallback 和 local disposable injection。

目标 route：

```text
POST /china/payment-webhooks/mock
```

本任务只写文档，不修改 runtime。

## 允许修改

- `.codex/tasks/mock-webhook-db-backed-route-resolver-plan.md`
- `docs/mock-webhook-db-backed-route-resolver-plan.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- 不修改 `packages/**`。
- 不修改 `apps/**`。
- 不新增 API route。
- 不实现 repository resolver。
- 不连接 DB-backed repository。
- 不注册 migration。
- 不调用 payment workflow。
- 不接支付宝、微信支付、退款、对账、结算、佣金或权限逻辑。

## 规划要求

- resolver 默认返回 disabled/unavailable。
- production 必须 disabled。
- local disposable injection 必须显式开启。
- route 只依赖 repository contract，不知道底层 DB 来源。
- resolver 不能直接暴露 production DB client。
- repository unavailable 第一版应返回 disabled，避免误判 runtime 已可用。
- 后续 resolver contract PR 必须只加纯类型、纯 helper 和 mocked tests，不接 route。

## 验证命令

```bash
git diff --check
git diff --name-only
```

## 完成标准

- 文档明确 resolver 不是 runtime 开关。
- 文档明确后续仍是 mock-only、local-only、inbox-only。
- 不触碰真实交易链路。
