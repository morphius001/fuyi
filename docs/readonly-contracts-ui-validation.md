# Readonly Contracts UI Validation

更新时间：2026-05-08 Asia/Shanghai

## 目标

验证第九十五轮三端只读合同 UI 工作在最新 `origin/main` 上可以共同构建。

覆盖范围：

- Admin `admin-readonly-contracts-panel-ui`
- Vendor `vendor-readonly-contracts-panel-ui`
- Storefront `storefront-visibility-copy-polish`

## 已执行验证

```bash
cd apps/admin
bun run lint
bun run build

cd apps/vendor
bun run lint
bun run build

cd apps/storefront
bun run build

git diff --check
```

## 结果

- Admin lint：通过。
- Admin build：通过。
- Vendor lint：通过。
- Vendor build：通过。
- Storefront build：通过。
- `git diff --check`：通过。

Storefront build 仍输出项目既有 React Hook dependency warnings：

- `src/components/cells/CartDropdown/CartDropdown.tsx`
- `src/components/cells/PasswordValidator/PasswordValidator.tsx`
- `src/components/organisms/ShippingAddress/ShippingAddress.tsx`
- `src/components/sections/CartAddressSection/CartAddressSection.tsx`

这些 warning 与本轮只读合同 UI 收口无关，本任务不扩大范围修复。

## 风险边界

本验证任务未修改：

- `apps/**`
- `packages/**`
- `package.json`
- `bun.lock`
- checkout、cart、order、payment、refund、settlement、commission、payout、permission 或 fulfillment runtime

## 结论

第九十五轮只读合同 UI 三端收口可进入主线：

- Admin 能力合同总览为前端静态只读页面。
- Vendor 我的能力边界为前端静态只读页面。
- Storefront 消费者文案 polish 不改变交易链路。

下一批建议继续走非支付、低风险、可回滚的小 PR，优先从只读合同接入真实后台配置的规划开始，而不是直接写交易链路。
