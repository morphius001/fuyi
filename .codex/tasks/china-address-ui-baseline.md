# Task: china-address-ui-baseline

## 目标

完成 Storefront 中国大陆地址 UI 基线，让账户地址、结算收货地址、账单地址和订单地址展示符合中国大陆常见顺序：省 / 市 / 区县 / 街道 / 详细地址。

## 执行前读取

- `AGENTS.md`
- `.codex/tasks/china-address-ui-baseline.md`
- `apps/storefront/src/components/molecules/AddressForm/AddressForm.tsx`
- `apps/storefront/src/components/organisms/ShippingAddress/ShippingAddress.tsx`
- `apps/storefront/src/components/organisms/BillingAddress/BillingAddress.tsx`
- `apps/storefront/src/components/sections/CartAddressSection/CartAddressSection.tsx`

## 允许修改

- `apps/storefront/src/components/**/Address*/**`
- `apps/storefront/src/components/organisms/BillingAddress/**`
- `apps/storefront/src/components/sections/CartAddressSection/**`
- `project-ledger/**`
- `.codex/queue.md`

## 禁止修改

- 禁止修改 `packages/api/**`
- 禁止修改 `apps/admin/**`
- 禁止修改 `apps/vendor/**`
- 禁止修改支付、订单、退款、结算、佣金、权限业务逻辑
- 禁止接入真实省市区地址库、短信、物流、支付服务
- 禁止新增依赖
- 不要自动 push

## 要求

- 地址 UI 使用中文标签和中国大陆地址顺序。
- 手机号按中国大陆手机号提示和前端 pattern 校验。
- 区县 / 街道可暂存到 Medusa 标准 `company` 字段，避免第一轮改数据库模型。
- 账单地址 UI 与收货地址使用一致的国内字段语义。
- 已保存地址、结算摘要、订单地址展示避免欧美地址顺序。
- 只做 UI/展示和前端输入约束，不改 `setAddresses`、cart、order、payment、shipping option 流程。

## 验证

```bash
git diff --check -- apps/storefront project-ledger .codex/tasks/china-address-ui-baseline.md
bun --cwd apps/storefront run build
```

手动或 HTTP smoke：

- 账户地址新增/编辑弹窗字段顺序和文案。
- 结算地址表单字段顺序和文案。
- 已保存地址选择器展示。
- 订单地址展示。
- 桌面和移动端不溢出。

## 输出

完成后只输出：

- 修改文件
- 验证结果
- 风险点
- 下一步建议
