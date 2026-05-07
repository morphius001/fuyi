# round32-next-stage-planning

## 目标

固化第三十二轮后续路线：系统架构图、下一阶段 PR 顺序、上线前门禁和需要用户配合的阻塞条件。

## 允许修改

- `docs/round32-next-stage-plan.md`
- `docs/china-market-platform-architecture-map.md`
- `docs/china-localization-release-gates.md`
- `.codex/tasks/round32-next-stage-planning.md`
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
- 真实微信支付、支付宝、短信、IM、物流、直播、AI provider

## 验证命令

```bash
git diff --check
bunx prettier --check docs/round32-next-stage-plan.md docs/china-market-platform-architecture-map.md docs/china-localization-release-gates.md .codex/tasks/round32-next-stage-planning.md .codex/queue.md
```

## 完成边界

- 只做规划和文档。
- 不把 `blocked-manual` 的 Admin 浏览器 QA 标记为 done。
- 不开始真实 migration 注册、生产 seed、写接口、支付、退款、结算、权限或真实履约任务。
