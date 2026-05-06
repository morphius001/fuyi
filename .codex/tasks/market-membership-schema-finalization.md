# market-membership-schema-finalization

## 目标

docs-only，最终 schema 设计。

## 允许修改

- `docs/market-membership-schema-finalization.md`
- `.codex/tasks/market-membership-schema-finalization.md`
- `.codex/queue.md`

## 禁止修改

- `apps/**`
- `packages/**`
- `package.json`
- `bun.lock`
- `.env*`
- 支付、订单、退款、结算、佣金、权限、真实履约逻辑
- 真实短信、IM、物流、直播、AI、支付 provider

## 必须覆盖

- market
- market membership
- seller role
- announcement
- business hour
- delivery profile
- read model mapping
- migration 前门禁

## 验证命令

```bash
git diff --check
```

## 完成边界

- 不写 migration。
- 不新增真实表。
- 不接 route。
