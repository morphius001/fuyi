# Task: market-domain-readiness-review

## 目标

审查中国市场域当前 readiness：市场、商户、档口、多市场归属、营业时间、公告和配送 profile 的已有实现、缺口和下一步 PR 顺序。

## 允许修改

- `.codex/tasks/market-domain-readiness-review.md`
- `docs/market-domain-readiness-review.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- 不修改 `apps/**`。
- 不修改 `packages/**`。
- 不新增 migration。
- 不新增写 API。
- 不连接外部数据库。
- 不修改 checkout shipping options、订单、履约、支付、退款、结算、佣金或权限逻辑。

## 验证命令

```bash
git diff --check
git diff --name-only
```

## 完成标准

- 明确已有只读市场域能力。
- 明确仍然是假数据、seed metadata 或 read-only 的范围。
- 明确下一步 docs-only / read-only skeleton 顺序。
