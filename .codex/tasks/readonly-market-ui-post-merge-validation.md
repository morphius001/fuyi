# readonly-market-ui-post-merge-validation

## 目标

对 PR AC-AF/AG 合并后的只读 markets 接入做验证报告。

范围包括：

- Admin market client
- Admin 市场只读面板
- Storefront 首页市场数据桥接
- Storefront 搜索页市场上下文
- Storefront 店铺页市场详情上下文

## 允许修改

- `docs/readonly-market-ui-post-merge-validation.md`
- `.codex/tasks/readonly-market-ui-post-merge-validation.md`
- `.codex/queue.md`

## 禁止修改

- `apps/**`
- `packages/**`
- `package.json`
- `bun.lock`
- `.env*`
- 真实密钥和真实 provider 配置

## 验证命令

```bash
bunx tsc --noEmit -p packages/api/tsconfig.json
cd packages/api && bun run test:unit -- src/lib/__tests__/china-read-models.unit.spec.ts src/modules/china-market-read-model/__tests__/market-read-model-service.unit.spec.ts
cd packages/api && bun run build
cd apps/admin && bun run lint
cd apps/admin && bun run build
cd apps/storefront && bun run build
git diff --check
```

## 完成后

- 记录验证结果。
- 记录残余 warning。
- 记录高风险边界是否被触碰。
- 记录下一步建议。
