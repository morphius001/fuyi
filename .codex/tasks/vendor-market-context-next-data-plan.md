# vendor-market-context-next-data-plan

## 目标

规划从 static adapter 过渡到真实 market membership 数据源。

## 允许修改

- `docs/vendor-market-context-next-data-plan.md`
- `.codex/tasks/vendor-market-context-next-data-plan.md`
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

- schema finalization
- migration skeleton
- repository adapter
- Vendor route data source switch
- Admin readonly membership view
- post-migration validation
- 高风险串行边界

## 验证命令

```bash
git diff --check
```

## 完成边界

- 本任务只做规划。
- 不写 migration。
- 不接真实数据源。
