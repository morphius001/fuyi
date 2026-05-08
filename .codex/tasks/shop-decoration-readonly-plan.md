# Task: shop-decoration-readonly-plan

## 目标

规划商家主页/档口装修的只读模型，明确 Storefront、Vendor、Admin 的展示边界，先不实现保存、审核、发布或真实文件上传。

## 允许修改

- `.codex/tasks/shop-decoration-readonly-plan.md`
- `docs/shop-decoration-readonly-plan.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- 不修改 `apps/**`。
- 不修改 `packages/**`。
- 不新增 API route。
- 不新增 migration。
- 不保存装修草稿。
- 不发布装修版本。
- 不接真实文件上传、CDN、直播、IM、短信、物流或快递打印。
- 不修改商品、库存、订单、支付、退款、结算、佣金、打款、权限或履约逻辑。

## 验证命令

```bash
git diff --check -- .codex/tasks/shop-decoration-readonly-plan.md docs/shop-decoration-readonly-plan.md .codex/queue.md project-ledger
git diff --name-status
```

## 完成标准

- 明确 Storefront 只读公开展示。
- 明确 Vendor 只读预览和未来编辑边界。
- 明确 Admin 审核/下架仍是后续任务。
- 明确商品分组、资质、直播状态、配送说明都不改变真实业务状态。
