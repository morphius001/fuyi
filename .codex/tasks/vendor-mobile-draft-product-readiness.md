# Task: vendor-mobile-draft-product-readiness

## 目标

梳理 Vendor 手机快速上架、规格模板读取、AI 一句话草稿和审核候选的准备边界。

本任务只做 docs-only readiness，不实现真实读写 API，不发布真实商品。

## 允许修改

- `.codex/tasks/vendor-mobile-draft-product-readiness.md`
- `docs/vendor-mobile-draft-product-readiness.md`
- `docs/vendor-draft-product-readwrite-plan.md`，如需要
- `docs/vendor-draft-product-api-design.md`，如需要
- `docs/product-spec-model.md`，如需要
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- 不修改 `apps/**`。
- 不修改 `packages/**`。
- 不新增依赖。
- 不发布真实商品。
- 不创建库存。
- 不修改订单、支付、退款、结算、佣金、打款、权限或履约逻辑。
- 不接真实微信、AI、图片识别、语音识别、短信、IM、物流或快递打印服务。

## 验证命令

```bash
git diff --check -- .codex/tasks/vendor-mobile-draft-product-readiness.md docs/vendor-mobile-draft-product-readiness.md .codex/queue.md project-ledger
git diff --name-status
```

## 完成标准

- 明确手机快速上架最小字段。
- 明确规格模板必须来自后台配置或只读 contract。
- 明确 AI 只能生成 suggestion，不覆盖商户确认字段。
- 明确草稿、审核候选和真实商品创建必须分开。
- 明确后续 PR 顺序。
