# Task: china-platform-non-payment-backlog

## 目标

在支付 provider runtime 卡在外部 DB 授权边界后，整理中国大陆多市场平台非支付方向的下一批低风险 PR 队列。

## 允许修改

- `.codex/tasks/china-platform-non-payment-backlog.md`
- `docs/china-platform-non-payment-backlog.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- 不修改 `apps/**`。
- 不修改 `packages/**`。
- 不修改 `.codex/scripts/**`。
- 不连接外部数据库。
- 不新增依赖。
- 不接真实支付、短信、IM、物流、直播服务。
- 不修改 payment、order、refund、settlement、commission、payout 或 permission 逻辑。

## 规划要求

- 拆出市场 / 商户 / 档口 / 配送 / 商品草稿 / 店铺装修 / 快递打印 / 直播 / 提货卡的后续低风险任务。
- 每个任务必须写清范围、禁止项和验证方式。
- 明确哪些任务只能 docs-only，哪些后续可以进入 read-only API skeleton。
- 明确所有会影响 checkout、订单、履约、结算、权限的任务继续串行。

## 验证命令

```bash
git diff --check
git diff --name-only
```

## 完成标准

- 新增非支付 backlog 文档。
- 更新队列到下一批可执行 docs-only / read-only skeleton 任务。
- 不修改业务代码。
