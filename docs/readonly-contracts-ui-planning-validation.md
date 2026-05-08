# Readonly Contracts UI Planning Validation

更新时间：2026-05-08 22:18 Asia/Shanghai

## 结论

第九十四轮只读合同 UI 规划已完成，可以进入下一轮小范围 UI PR 设计，但仍不能直接接真实写接口或交易链路。

已完成规划：

- `docs/readonly-contracts-export-index.md`
- `docs/admin-readonly-contracts-panel-plan.md`
- `docs/vendor-readonly-contracts-panel-plan.md`
- `docs/storefront-readonly-contracts-visibility-plan.md`

## 当前可进入的下一轮

建议下一轮按低风险 UI 顺序：

1. `admin-readonly-contracts-panel-ui`
   - Admin 平台能力只读总览。
   - 只使用前端常量或静态 read-only data。
   - 不新增后端 route。

2. `vendor-readonly-contracts-panel-ui`
   - Vendor 我的能力边界面板。
   - 移动端可读。
   - 不保存、不发布、不发货、不打印。

3. `storefront-visibility-copy-polish`
   - Storefront 消费者侧可见性文案 polish。
   - 保持提货卡独立入口、直播不做首页主入口。

4. `readonly-contracts-ui-validation`
   - Admin/Vendor/Storefront build/lint/截图或 smoke。

## 仍然禁止

下一轮 UI PR 仍然禁止：

- POST/PATCH/DELETE 写接口。
- API route 新增，除非任务明确且只读。
- migration。
- 新依赖。
- checkout 修改。
- 订单状态修改。
- 支付/退款/结算/佣金/打款/权限修改。
- 真实商品发布。
- 真实库存初始化。
- 真实履约或物流面单。
- 真实直播/IM/交易。
- 提货卡真实兑换。

## 验证

本轮 validation 是 docs-only：

- `git diff --check` 通过。
- 未修改 `apps/**`。
- 未修改 `packages/**`。

## 风险

最大的风险不是代码，而是后续 UI 文案让用户误以为能力已经真实生效。下一轮 UI 必须显式展示：

- 只读。
- 未生效。
- 待平台开通。
- mock / placeholder。
- 不影响订单、支付、结算和权限。
