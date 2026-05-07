# admin-write-api-runtime-switch-plan

## 目标

设计 Admin 市场配置、模块开关、商户类型开关的写接口与 runtime switch 分离方案。当前只做 docs-only，不实现 API，不让任何开关生效。

## 允许修改

- `.codex/tasks/admin-write-api-runtime-switch-plan.md`
- `docs/admin-write-api-runtime-switch-plan.md`
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

## 必须覆盖

- 写接口只保存 draft/published config，不能直接改变 runtime。
- runtime effective config 必须单独只读发布和回滚。
- 所有写入必须有权限、审计、幂等、版本、回滚和 dry-run preview。
- 商户类型开关、市场配送能力、模块开放控制必须有默认关闭或 fallback 策略。
- 不能影响 checkout、订单、支付、退款、结算、佣金、权限或真实履约。

## 验证命令

```bash
git diff --check
bunx prettier --check .codex/tasks/admin-write-api-runtime-switch-plan.md docs/admin-write-api-runtime-switch-plan.md .codex/queue.md
```

## 完成边界

- 只输出设计文档和队列状态。
- 不实现写接口。
- 不注册 runtime switch。
- 不修改业务代码。
