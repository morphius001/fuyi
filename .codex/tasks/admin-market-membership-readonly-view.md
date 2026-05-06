# admin-market-membership-readonly-view

## 目标

确认 Admin 具备市场、商户市场关系、档口、公告、营业时间和配送 profile 的只读查看能力。

## 允许修改

- `docs/admin-market-membership-readonly-view-validation.md`
- `.codex/tasks/admin-market-membership-readonly-view.md`
- `.codex/queue.md`

## 禁止修改

- `apps/**`
- `packages/**`
- `package.json`
- `bun.lock`
- `.env*`
- 支付、订单、退款、结算、佣金、权限、真实履约逻辑
- 真实短信、IM、物流、直播、AI、支付 provider

## 验证命令

```bash
bun --cwd apps/admin build
git diff --check
```

## 完成边界

- 当前只记录现有只读页面能力和验证结果。
- 不新增写入口。
- 不改 Admin UI 业务逻辑。
- 不启用真实 migration。
