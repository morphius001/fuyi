# market-membership-round32-post-merge-validation

## 目标

对第三十二轮 market membership 只读 DB QA PR 做合并后验证和下一步边界收口。

## 允许修改

- `docs/market-membership-round32-post-merge-validation.md`
- `.codex/tasks/market-membership-round32-post-merge-validation.md`
- `.codex/queue.md`

## 禁止修改

- `apps/**`
- `packages/**`
- migration SQL
- production seed
- `package.json`
- `bun.lock`
- `.env*`
- 支付、订单、退款、结算、佣金、权限、真实履约逻辑
- 真实短信、IM、物流、直播、AI、支付 provider

## 验证命令

```bash
source ~/.nvm/nvm.sh && nvm use
bun --cwd packages/api test:unit -- --runTestsByPath \
  src/modules/china-market-read-model/__tests__/market-read-model-service.unit.spec.ts \
  src/modules/china-market-read-model/__tests__/repository-market-read-model-adapter.unit.spec.ts \
  src/modules/china-market-read-model/__tests__/vendor-market-context-builder.unit.spec.ts \
  src/api/vendor/china/market-context/__tests__/helpers.unit.spec.ts \
  src/api/admin/china/markets/__tests__/helpers.unit.spec.ts \
  src/api/store/china/markets/__tests__/helpers.unit.spec.ts
bunx tsc --noEmit -p packages/api/tsconfig.json
.codex/scripts/market-membership-repository-integration-test.sh
git diff --check
```

## 完成边界

- 只记录验证，不新增业务代码。
- Admin 浏览器 QA 仍保持 `blocked-manual`，不能伪造截图。
- 真实 migration 注册、预发/生产 DB、Admin 写接口、模块开关生效和支付/退款/结算/权限仍保持高风险串行。
