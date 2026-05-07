# market-membership-round31-post-merge-validation

## 目标

对第三十一轮 market membership 数据接入准备 PR 做合并后验证和下一步边界收口。

## 允许修改

- `docs/market-membership-round31-post-merge-validation.md`
- `.codex/tasks/market-membership-round31-post-merge-validation.md`
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
bun --cwd packages/api test:unit -- --runTestsByPath src/modules/china-market-read-model/__tests__/repository-market-read-model-adapter.unit.spec.ts src/api/vendor/china/market-context/__tests__/helpers.unit.spec.ts src/modules/china-market-read-model/__tests__/vendor-market-context-builder.unit.spec.ts
bunx tsc --noEmit -p packages/api/tsconfig.json
.codex/scripts/market-membership-local-dry-run.sh
git diff --check
```

## 完成边界

- 只记录验证，不新增业务代码。
- Admin 浏览器 QA 仍保持 `blocked-manual`，不能伪造截图。
- 下一阶段如果进入真实预发 DB dry-run、Admin 登录态 QA 或生产 migration，必须单独任务串行执行。
