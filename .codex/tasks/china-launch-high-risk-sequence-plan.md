# china-launch-high-risk-sequence-plan

## 目标

用户要求全面推进 ProductCard、cart、checkout、订单、支付、退款、结算、佣金、权限、履约和物流，并进入上线准备。

本任务先建立高风险上线串行推进图，把每个域的进入条件、阻塞条件、验证步骤和回滚边界写清楚。后续才能按小 PR 逐段实现，不能把资金、订单、权限和履约链路混成一个大改。

## 范围

- ProductCard 与真实 Store API 商品事实的展示边界。
- cart / checkout 的当前可上线前检查项。
- 订单、支付、退款、结算、佣金、权限、履约和物流的串行门禁。
- 已有支付通知、mock provider、物流面单、Admin 能力开关文档的复用关系。
- 下一批 PR 的建议顺序和验证清单。

## 非目标

- 不修改 `apps/**` 或 `packages/**` 运行时代码。
- 不注册 payment notification migration。
- 不接支付宝、微信支付、真实物流、真实短信、真实 IM 或真实面单 provider。
- 不改变 cart、checkout、order、payment、refund、settlement、commission、permission、fulfillment 或 logistics 状态。
- 不写真实生产密钥、商户号、app id、证书、私钥、webhook token 或数据库连接串。

## 必须遵守

- 支付成功必须以后端异步通知为准，不能以前端跳转或返回页为准。
- 支付通知必须验签、幂等、可重试，并保留安全审计。
- 退款、结算、佣金、权限、履约和物流必须单独串行。
- 所有上线前任务必须包含验证步骤和回滚方式。

## 验证

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn/apps/storefront
/home/codex/.bun/bin/bun run build

cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn
git diff --check
```

## 交付

- `docs/china-launch-high-risk-sequence-plan.md`
- ledger / queue 更新

