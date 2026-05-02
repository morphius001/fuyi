# Task: pickup-card-architecture

## Goal

设计提货卡系统后端架构文档，不写业务代码。

提货卡定义：线下实体卡，用户在线上使用卡号/卡密/二维码兑换商品或套餐并发货。

明确不是：

- 不是优惠券
- 不是满减券
- 不是折扣券
- 不是储值卡
- 不是支付方式

## Read First

- `AGENTS.md`
- 本文件 `.codex/tasks/pickup-card-architecture.md`
- `docs/china-localization-task-list.md`

## Allowed Changes

- `docs/pickup-card-architecture.md`
- `docs/china-localization-task-list.md`

## Forbidden Changes

- 禁止修改 `apps/**`
- 禁止修改 `packages/**`
- 禁止写业务代码
- 禁止接入真实卡密、兑换、订单、库存、物流、支付、结算逻辑
- 不要自动提交
- 不要 push

## Architecture Topics

文档必须设计：

- 卡种
- 批次
- 卡号
- 卡密安全
- 二维码兑换
- 兑换流程
- 提货订单
- 库存占用和扣减边界
- 物流发货边界
- 有效期和过期
- 冻结和解冻
- 作废
- 风控
- 操作日志
- 审计字段
- 与订单、库存、履约、支付、结算的边界
- PR 拆分

## Design Constraints

- 卡密必须加密或哈希存储，禁止明文展示。
- 后台只允许脱敏显示。
- 兑换必须幂等。
- 兑换应有风控、频率限制和操作日志。
- 提货卡兑换不是支付成功事件。
- 提货卡兑换不得绕过库存、履约和订单审计。

## Verification

```bash
git diff -- docs/pickup-card-architecture.md docs/china-localization-task-list.md
```

人工确认：

- 只修改 docs。
- 明确提货卡不是优惠券、满减券、折扣券、储值卡、支付方式。
- PR 拆分包含低风险文档、模型、mock、兑换、履约、风控、后台 UI。

## Output

完成后只输出：

- 修改文件
- 验证结果
- 风险点
- 下一步建议

