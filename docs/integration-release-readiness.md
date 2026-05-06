# Integration Release Readiness

更新时间：2026-05-07 Asia/Shanghai

## 结论

当前 `china/integration-localization` 已经适合作为本地集成验证基线，但不适合直接作为一个大 PR 合并。

建议把它拆成低风险 PR 组逐个进入 staging。支付、退款、结算、佣金、权限、真实履约和真实模块开关生效逻辑继续保持串行高风险任务，不要混入普通 UI 或文档 PR。

## 当前分支状态

- Worktree: `/home/codex/code/fuyi-integration-cn`
- Branch: `china/integration-localization`
- 本轮不 push、不创建 PR。
- 本轮只生成发布准备文档和 ledger 更新，不修改 `apps/**` 或 `packages/**`。

## 最近提交摘要

最近一批提交已经把第十轮设计任务收口：

- `77dc017 docs add vendor fulfillment config design`
- `bfd7018 docs add admin module config contract`
- `82e1874 docs add market model design plan`
- `5990b14 chore record integration verification`
- `9355d0c chore fix address task encoding`
- `9d6d5d6 chore align china address fields`
- `36127ac chore localize demo discovery categories`
- `cc7c3b1 chore admin read capability contract`
- `e94a3f7 chore storefront read seller fulfillment metadata`
- `879dce8 chore storefront read china discovery`

`main..HEAD` 范围很大，覆盖约 248 个文件，包含三端 UI、API 只读契约、mock provider skeleton、seed/demo 数据、Codex 工作流和大量设计文档。因此后续必须按主题拆 PR。

## 低风险 PR 组

### PR A: Codex 工作流与项目 ledger

范围：

- `AGENTS.md`
- `.codex/queue.md`
- `.codex/memory.md`
- `.codex/scripts/start-dev.sh`
- `project-ledger/**`
- 经确认需要入库的 `.codex/tasks/*.md`

验收重点：

- 任务规则、自动队列规则、WSL 启动脚本和项目状态记录可读。
- 不混入业务代码。
- 不包含真实密钥。

注意：当前仍有大量未跟踪 `.codex/tasks/*.md` 和 `.codex/agent-notes/`，PR A 只能精确 stage 已审查文件，不能 `git add .`。

### PR B: API 只读能力契约与 demo seed

范围：

- `packages/api/src/lib/china-capabilities.ts`
- `packages/api/src/api/store/china/**`
- `packages/api/src/api/admin/china/**`
- `packages/api/src/scripts/seed.ts`
- `packages/api/.mercur/index.d.ts`
- `.codex/scripts/seed-api.sh`

验收重点：

- 只读 capability/discovery/seller products 接口返回 200。
- seed/demo 只用于本地样例，不作为生产数据来源。
- 不改变支付、订单、退款、结算、佣金、权限逻辑。

### PR C: Storefront 消费端本地化与只读数据桥

范围：

- `apps/storefront/**`
- Storefront 相关 docs

验收重点：

- 首页、搜索、店铺页、商品详情、购物车、结算文案符合国内生鲜/海鲜市场语境。
- Storefront 优先读取 Store API 真实商品和只读发现数据。
- 没有把前端跳转当成支付成功依据。
- 没有让展示型配送标签直接影响 checkout shipping options。

### PR D: Admin 中国平台运营后台壳

范围：

- `apps/admin/**`
- Admin 相关 docs

验收重点：

- Admin 保持平台运营后台定位，菜单和页面是国内运营语境。
- 模块开关、提货卡、规格模板、风控、财务等高风险入口保持 mock/read-only 或占位。
- 不改变 RBAC、权限、退款、结算、佣金、支付或订单状态。

### PR E: Vendor 中国商户后台壳

范围：

- `apps/vendor/**`
- Vendor 相关 docs

验收重点：

- Vendor 保持商户工作台定位，支持快速上架、AI 草稿、店铺装修、履约配置展示和供应方角色矩阵。
- 不实现真实接单、发货、退款、结算、权限或物料供应商订单流。
- 移动端首屏优先快速上架和待办。

### PR F: Mock provider skeleton

范围：

- `packages/api/src/modules/china-service-providers/**`
- `docs/mock-service-providers.md`

验收重点：

- MockChatProvider、MockSmsProvider、MockLogisticsProvider、MockLiveProvider、MockAiListingProvider 只做 mock 边界。
- 不注册真实腾讯 IM、环信、阿里云短信、腾讯短信、快递100、菜鸟或直播服务。
- 不写真实密钥。

### PR G: 架构与下一阶段设计文档

范围：

- `docs/market-model-backend-design.md`
- `docs/admin-module-config-contract-design.md`
- `docs/vendor-fulfillment-config-design.md`
- `docs/integration-release-readiness.md`
- 其他已审查的架构文档

验收重点：

- 只做设计和拆分计划。
- 明确真实数据库模型、Admin 写 API、权限、checkout 生效、支付/结算等串行边界。

## 必须串行的高风险主题

以下主题不能并行混入低风险 PR：

- Mock China PaymentProvider 到真实支付 Provider 的升级。
- 支付通知验签、幂等、重试和状态机。
- 支付宝 Provider。
- 微信支付 Provider。
- 退款。
- 对账。
- 商家结算、payout、commission。
- 权限、RBAC、菜单真实显隐、商户角色生效。
- checkout shipping options、cart total、订单履约、物流状态的真实影响。
- 市场模型真实 migration 和生产数据迁移。
- Admin 模块开关真实落库、审计和生效。
- 供应商角色接单、物料订单、配送供应商订单流。
- 快递打印真实模板、面单号、物流轨迹和打印机适配。

## 未跟踪文件风险

当前工作区仍有大量未跟踪文件，主要包括：

- `.codex/tasks/*.md`
- `.codex/agent-notes/`
- `.mercur/`
- `docs/*`
- `docs/visual-qa-artifacts/`

处理规则：

- 不要使用 `git add .`。
- 每个 PR 只 stage 对应清单内的文件。
- 视觉 QA 图片和临时产物默认不进 PR，除非对应 PR 明确需要。
- 未审查的历史任务文件先保留未跟踪，不要为了“清空 status”而混入。
- `.mercur/` 需要单独确认是否属于生成缓存或必要类型产物；当前不要自动 stage 整个目录。

## 已完成验证

最近一次完整验证已经通过：

- `tsc --noEmit -p packages/api/tsconfig.json`
- `cd packages/api && medusa build`
- `cd apps/admin && bun run lint`
- `cd apps/admin && bun run build`
- `cd apps/vendor && bun run lint`
- `cd apps/vendor && bun run build`
- `cd apps/storefront && bun run build`
- API capability/discovery/seller products smoke
- Storefront `/cn`、`/cn/search`、`/cn/sellers/a-hai-xian-huo-dang`、`/cn/products/sweatpants` smoke

已知残留：

- Storefront build 仍有项目既有 React Hook lint warning。
- Admin headless 无法复用人工登录态，已用人工截图和 HTTP smoke 辅助确认。
- 当前 UI 仍是基础版和 mock/read-only 边界，不等于生产功能跑通。

## 本文档验证命令

```bash
git status --short --branch
git log --oneline -20
git diff --check -- docs/integration-release-readiness.md project-ledger .codex/queue.md
```

## 建议下一步

1. 先在 integration worktree 保留当前本地基线。
2. 创建 staging/split worktree，按 PR A 到 PR G 精确 cherry-pick 或精确 stage。
3. 每个 PR 独立跑对应 build/lint/smoke。
4. 低风险 PR 合并后，再开启高风险串行主题。
5. 上线前单独做环境变量、真实 Provider、CORS/session、seed/demo 数据和 mock provider 清理审计。
