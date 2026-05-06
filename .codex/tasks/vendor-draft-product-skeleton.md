# Task: vendor-draft-product-skeleton

## 目标

新增 Vendor 商品草稿 skeleton，为手机快速上架和 AI 草稿做后续后端落地准备。本任务不注册运行时模块、不新增 API route、不发布真实商品。

## 允许修改

- `packages/api/src/modules/china-product-drafts/**`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- 禁止修改真实 product、inventory、order、payment、refund、settlement、commission、permission、fulfillment 逻辑
- 禁止新增 migration
- 禁止新增写 API
- 禁止接入真实 AI、微信、图片识别、语音、短信、IM 或物流服务
- 禁止新增依赖

## 验证

```bash
./node_modules/.bin/tsc --noEmit -p packages/api/tsconfig.json
cd packages/api && TEST_TYPE=unit ./node_modules/.bin/jest src/modules/china-product-drafts/__tests__/vendor-product-draft-service.unit.spec.ts --runInBand
cd packages/api && ./node_modules/.bin/medusa build
git diff --check -- packages/api/src/modules/china-product-drafts .codex/queue.md project-ledger .codex/tasks/vendor-draft-product-skeleton.md
```
