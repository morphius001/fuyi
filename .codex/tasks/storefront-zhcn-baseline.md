# Task: storefront-zhcn-baseline

## Goal

完成 `apps/storefront` 基础中文化和国内电商前台风格改造。保持低风险，不改后端业务逻辑。

## Read First

- `AGENTS.md`
- 本文件 `.codex/tasks/storefront-zhcn-baseline.md`
- `apps/storefront` 下现有 README、配置和路由结构

## Allowed Changes

- `apps/storefront/**`

## Forbidden Changes

- 禁止修改 `packages/api/**`
- 禁止修改 `apps/admin/**`
- 禁止修改 `apps/vendor/**`
- 不接真实微信支付
- 不接真实支付宝
- 不接真实客服
- 不接真实物流
- 禁止修改支付、订单、退款、结算、佣金、权限业务逻辑
- 禁止写真实密钥
- 不要自动提交
- 不要 push

## UX Requirements

- 中文文案：面向中国大陆消费者，默认 zh-CN。
- 人民币：价格展示使用 CNY/人民币语境。
- 搜索：强化搜索入口、搜索提示、空状态。
- 商品详情：强化价格、库存、规格、配送、售后、保障说明。
- 购物车：中文化商品、优惠占位、配送和结算入口。
- 结算页：中文化地址、配送、支付方式占位和订单确认。
- 订单状态：使用中国大陆电商常见状态文案。
- Footer 合规占位：公司信息、ICP备案占位、隐私政策、用户协议、售后服务、联系客服。

## Integration Constraints

- 支付成功必须以后端异步通知为准。
- 前台支付返回页不得作为支付成功依据。
- 微信支付、支付宝、客服、物流只做占位或 mock 文案，不接真实服务。
- 不要删除 Stripe、Algolia、Resend、TalkJS。

## Verification

优先运行 storefront 自身命令；按项目实际 scripts 调整：

```bash
bun --cwd apps/storefront run lint
bun --cwd apps/storefront run build
```

如根目录有对应脚本，也可运行：

```bash
bun run lint
bun run check-types
```

手动验证：

- 首页
- 搜索页
- 商品详情
- 购物车
- 结算页
- 订单状态页
- Footer
- 桌面和移动端布局

## Output

完成后只输出：

- 修改文件
- 验证结果
- 风险点
- 下一步建议

