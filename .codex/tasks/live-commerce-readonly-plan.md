# Task: live-commerce-readonly-plan

## 目标

规划直播只读占位和 Provider 边界，明确直播当前只作为店铺/档口状态展示，不接真实推流、IM、带货交易、支付或结算。

## 允许修改

- `.codex/tasks/live-commerce-readonly-plan.md`
- `docs/live-commerce-readonly-plan.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- 不修改 `apps/**`。
- 不修改 `packages/**`。
- 不新增 API route。
- 不新增 migration。
- 不调用 MockLiveProvider。
- 不接真实直播、推流、IM、聊天室、礼物、打赏、订单、支付、退款、结算、佣金或权限逻辑。
- 不把直播放到消费者首页主入口。

## 验证命令

```bash
git diff --check -- .codex/tasks/live-commerce-readonly-plan.md docs/live-commerce-readonly-plan.md .codex/queue.md project-ledger
git diff --name-status
```

## 完成标准

- 明确 Storefront 只显示店铺/档口直播状态。
- 明确 Vendor 只做直播状态/预告/回放占位。
- 明确 Admin 只做审核/风控/暂停展示规划。
- 明确真实直播 Provider、IM、支付和带货交易均为后续串行高风险任务。
