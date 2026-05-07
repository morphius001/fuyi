# round33-high-risk-entry-plan

## 目标

把第 33 轮“进入真实 DB / 写接口 / 模块开关生效前”的门禁、任务顺序和暂停条件固化下来。

当前只做 planning，不执行真实预发/生产 DB，不注册 migration，不写 Admin 写接口，不让任何开关影响运行时。

## 允许修改

- `docs/round33-high-risk-entry-plan.md`
- `.codex/tasks/round33-high-risk-entry-plan.md`
- `.codex/queue.md`
- `docs/china-localization-task-list.md`

## 禁止修改

- `apps/**`
- `packages/**`
- migration SQL
- production seed
- `package.json`
- `bun.lock`
- `.env*`
- 支付、订单、退款、结算、佣金、权限、真实履约逻辑
- 真实微信支付、支付宝、短信、IM、物流、直播或 AI provider

## 必须覆盖

- `admin-market-membership-browser-qa` 仍然是手动阻塞项，不能伪造截图。
- 预发 DB dry-run 必须明确目标库可丢弃、备份、回滚和退出标准。
- 真实 migration 注册必须排在 disposable DB 和浏览器只读 QA 之后。
- Admin 写接口和模块开关真实生效必须排在 read-only 证据之后，并有 feature flag / rollback。
- 支付、退款、对账、商家结算、权限和真实履约继续保持高风险串行，不进入第 33 轮自动队列。

## 验证命令

```bash
git diff --check
bun run prettier --check docs/round33-high-risk-entry-plan.md .codex/tasks/round33-high-risk-entry-plan.md .codex/queue.md docs/china-localization-task-list.md
```

## 完成边界

- 只记录计划和队列，不新增业务代码。
- 若后续用户说“继续”，只能执行本计划中 docs-only 或 local disposable DB 任务；涉及预发/生产 DB、写接口、运行时开关或资金域时必须按任务门禁串行。
