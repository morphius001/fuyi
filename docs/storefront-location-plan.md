# Storefront Location Plan

当前 monorepo 的 storefront 位置确定为:

```text
apps/storefront
```

该目录来自官方 Mercur B2C Storefront scaffold，用于后续 storefront 审计和本地化工作。后续中国化改造应在独立 PR 中进行，避免和 scaffold 接入混在一起。

## Ownership

- `apps/storefront`: 买家端 B2C storefront。
- `apps/admin`: 平台运营后台，保持现有目录不变。
- `apps/vendor`: 商家后台，保持现有目录不变。
- `packages/api`: 后端 API、模块、工作流、links、subscribers，保持现有目录不变。

## Follow-Up Worktrees

建议后续 storefront 中国化使用单独分支或 worktree，例如:

```bash
git worktree add ../fuyi-worktrees/storefront-ux -b china/storefront-ux
```

该后续 worktree 的范围应限定为 storefront UI/文案/体验审计和低风险改造。支付、订单、退款、结算、佣金、权限相关任务应继续保持串行和单独评审。

## China Localization Boundary

后续 storefront 中国化可以单独评估:

- zh-CN 文案。
- CNY 价格展示。
- 国内电商信息架构。
- 商品列表、商品详情、购物车和结账页移动端体验。
- 中国地址输入顺序。
- 大陆手机号校验。
- 搜索、分类、促销和售后入口。

后续 storefront 中国化不应在同一个 PR 中修改:

- 支付状态判定。
- 订单状态流转。
- 退款逻辑。
- 商家结算或佣金。
- 权限和用户归属规则。
- 真实支付、搜索、客服或物流 provider。

## Verification Expectations

每个后续 storefront PR 至少包含:

- 修改文件列表。
- Scope 和 non-goals。
- `bun run lint:storefront` 或明确说明无法运行的原因。
- Desktop 和 mobile 手工验证记录。
- 对支付、订单、退款、结算、佣金、权限影响的风险说明。
