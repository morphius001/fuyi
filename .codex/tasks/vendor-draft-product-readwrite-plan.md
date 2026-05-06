# Task: vendor-draft-product-readwrite-plan

## 目标

规划 Vendor 手机快速上架和 AI 上架草稿的后端读写方案，让商户可以先保存草稿和规格选择，但本任务不发布真实商品、不改库存、不改订单。

核心目标：

- 定义快速上架草稿、规格模板、单位、价格区间、图片占位、AI 解析结果的后端边界。
- 明确“草稿保存”和“正式发布商品”的分离。
- 明确手机端极简上架、电脑端完整编辑、AI/微信入口的适配层。

## 允许修改

- `docs/vendor-draft-product-readwrite-plan.md`
- `docs/vendor-draft-product-api-design.md`
- `docs/product-spec-model.md`
- `project-ledger/**`
- `.codex/queue.md`

## 禁止修改

- 禁止修改 `apps/**`
- 禁止修改 `packages/**`
- 禁止新增依赖
- 禁止发布真实商品
- 禁止修改库存、订单、支付、退款、结算、佣金、权限或履约逻辑
- 禁止接入真实微信、AI、图片识别、短信、IM 或物流服务

## 要求

- 先读取 `AGENTS.md`、`.codex/queue.md`、`project-ledger/status.md`、`docs/post-merge-validation-report.md`、`docs/vendor-draft-product-api-design.md`、`docs/product-spec-model.md`。
- 给出草稿 API、规格模板读取、AI mock parser、审核/发布前置条件的拆分。
- 明确后续真正创建 Medusa product 前的校验、权限、审计和回滚。
- 保持 mock/provider 边界，不写真实 AI 服务凭证。

## 验证

```bash
git diff --check -- docs/vendor-draft-product-readwrite-plan.md docs/vendor-draft-product-api-design.md docs/product-spec-model.md project-ledger .codex/queue.md
git diff --name-status
```

## 输出

- 修改文件
- 验证结果
- 风险点
- 下一步建议
