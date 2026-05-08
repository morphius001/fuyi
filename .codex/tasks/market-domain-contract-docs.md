# Task: market-domain-contract-docs

## 目标

定义中国多市场平台的真实市场域合同：市场、商户、档口、多市场归属、营业时间、公告、配送 profile 和上游供应关系。

## 允许修改

- `.codex/tasks/market-domain-contract-docs.md`
- `docs/market-domain-contract.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- 不修改 `apps/**`。
- 不修改 `packages/**`。
- 不新增 migration。
- 不新增 API route。
- 不连接外部数据库。
- 不影响 checkout、order、payment、refund、settlement、commission、payout 或 permission。

## 验证命令

```bash
git diff --check
git diff --name-only
```

## 完成标准

- 写清实体、关系、状态、边界和 PR 顺序。
- 明确哪些字段只读展示，哪些未来才能写入。
- 明确 checkout / 订单 / 结算 / 权限边界。
