# Integration PR Staging Index

更新时间：2026-05-07 Asia/Shanghai

## 目的

本索引用于从 `/home/codex/code/fuyi-integration-cn` 的 `china/integration-localization` 本地集成分支拆出后续 staging PR。

原则：

- 不从 integration 直接开一个大 PR。
- 不使用 `git add .`。
- 每个 PR 只 stage 自己的文件清单。
- 每个 PR 独立验证。
- 高风险业务主题继续串行，不混入 UI、文档或只读 API PR。

上游边界文档：`docs/integration-release-readiness.md`。

## 推荐 staging 流程

1. 从干净的目标基线创建 staging worktree。
2. 只挑一个 PR 组的文件。
3. 运行该 PR 的验证命令。
4. 检查 `git diff --cached --name-only`。
5. 确认没有未审查文件、视觉产物、真实密钥或高风险逻辑。
6. commit。
7. 需要 push/PR 时再由用户明确授权。

## PR A: Codex 工作流与 Ledger

目标：

- 固化后续 Codex 任务执行规则、队列、启动脚本、状态台账和架构图。

候选文件：

- `AGENTS.md`
- `.codex/memory.md`
- `.codex/queue.md`
- `.codex/scripts/start-dev.sh`
- `.codex/scripts/seed-api.sh`
- 经审查需要版本化的 `.codex/tasks/*.md`
- `project-ledger/status.md`
- `project-ledger/tasks.md`
- `project-ledger/changelog.md`
- `project-ledger/architecture-map.md`

验证命令：

```bash
git diff --check -- AGENTS.md .codex project-ledger
git status --short --branch
```

不要混入：

- `apps/**`
- `packages/**`
- `.codex/agent-notes/**`
- 未审查历史任务文件
- `docs/visual-qa-artifacts/**`

## PR B: API 只读契约与 Demo Seed

目标：

- 提供中国本地化能力矩阵、发现数据、商家商品过滤和本地 demo seed。

候选文件：

- `packages/api/src/lib/china-capabilities.ts`
- `packages/api/src/api/store/china/capabilities/route.ts`
- `packages/api/src/api/store/china/vendor-capabilities/route.ts`
- `packages/api/src/api/store/china/discovery/route.ts`
- `packages/api/src/api/store/china/sellers/[handle]/products/route.ts`
- `packages/api/src/api/admin/china/capabilities/route.ts`
- `packages/api/src/scripts/seed.ts`
- `packages/api/.mercur/index.d.ts`
- `packages/api/src/api/middlewares.ts`
- `packages/api/src/links/product-seller-link.ts`

验证命令：

```bash
tsc --noEmit -p packages/api/tsconfig.json
cd packages/api && medusa build
.codex/scripts/seed-api.sh
```

Smoke：

```bash
curl -i http://127.0.0.1:9000/store/china/capabilities
curl -i http://127.0.0.1:9000/store/china/discovery
curl -i http://127.0.0.1:9000/store/china/sellers/a-hai-xian-huo-dang/products
```

不要混入：

- 真实支付、退款、结算、佣金、权限逻辑。
- 生产密钥。
- 让 seed 成为生产数据来源的说明或代码。

## PR C: Storefront 消费端本地化

目标：

- 国内生鲜/海鲜市场消费者前台：找店、搜索、商品详情、购物车、结算文案、地址顺序和样例边界。

候选文件：

- `apps/storefront/**`
- Storefront 相关文档中已审查的部分

验证命令：

```bash
cd apps/storefront && bun run build
curl -i http://127.0.0.1:3101/cn
curl -i http://127.0.0.1:3101/cn/search
curl -i http://127.0.0.1:3101/cn/sellers/a-hai-xian-huo-dang
curl -i http://127.0.0.1:3101/cn/products/sweatpants
```

不要混入：

- 真实支付结果判断。
- 真实订单、退款、配送选项计算。
- 前端假结算成功。
- 市场物料供应商前置到消费者首页。

## PR D: Admin 中国平台运营后台壳

目标：

- 平台运营后台基础版，包含国内运营信息架构、模块开关只读展示、提货卡、规格模板和 mock/read-only 风控入口。

候选文件：

- `apps/admin/**`
- Admin 相关文档中已审查的部分

验证命令：

```bash
cd apps/admin && bun run lint
cd apps/admin && bun run build
curl -i http://127.0.0.1:7000/dashboard/cn
```

不要混入：

- RBAC/permission 真实修改。
- 订单、退款、结算、佣金、支付状态修改。
- 模块开关真实落库或真实生效。

## PR E: Vendor 中国商户后台壳

目标：

- 商户后台基础版，覆盖快速上架、AI 草稿、店铺装修、履约配置展示、供应方角色矩阵和移动端壳。

候选文件：

- `apps/vendor/**`
- Vendor 相关文档中已审查的部分

验证命令：

```bash
cd apps/vendor && bun run lint
cd apps/vendor && bun run build
curl -i http://127.0.0.1:7001/
```

不要混入：

- 真实接单、发货、退款、结算、权限。
- 物料供应商真实订单流。
- 配送供应商真实履约流。

## PR F: Mock Provider Skeleton

目标：

- 保留 MockChat、MockSms、MockLogistics、MockLive、MockAiListing provider 边界，为后续真实 provider 做隔离。

候选文件：

- `packages/api/src/modules/china-service-providers/**`
- `docs/mock-service-providers.md`

验证命令：

```bash
tsc --noEmit -p packages/api/tsconfig.json
cd packages/api && medusa build
```

不要混入：

- 真实腾讯 IM、环信、阿里云短信、腾讯短信、快递100、菜鸟、直播服务。
- 真实 app id、secret、token、merchant id、私钥。

## PR G: 架构与下一阶段设计文档

目标：

- 把市场模型、模块配置、商户履约和 release readiness 固化为下一阶段设计依据。

候选文件：

- `docs/market-model-backend-design.md`
- `docs/admin-module-config-contract-design.md`
- `docs/vendor-fulfillment-config-design.md`
- `docs/integration-release-readiness.md`
- `docs/integration-pr-staging-index.md`
- 其他已审查的架构文档

验证命令：

```bash
git diff --check -- docs project-ledger .codex/queue.md
```

不要混入：

- 实现代码。
- 视觉 QA 截图产物。
- 机械 closeout 临时文档。

## 默认不纳入的未跟踪内容

以下内容默认不进入任何 PR，除非后续任务明确要求：

- `.codex/agent-notes/**`
- `.mercur/**`
- `docs/visual-qa-artifacts/**`
- `docs/mechanical-*`
- 未审查的 `docs/*submit-readiness.md`
- 未审查的 `docs/*staging-commands.md`
- 未审查的 `.codex/tasks/*.md`

## 高风险串行入口

低风险 PR A-G 完成后，才进入以下串行任务：

- 支付通知验签、幂等、重试。
- 支付宝 Provider。
- 微信支付 Provider。
- 退款。
- 对账。
- 商家结算、payout、commission。
- 权限和 RBAC。
- Admin 模块开关真实落库和生效。
- Vendor 履约配置影响 checkout shipping options。
- 快递打印真实服务和电子面单。

每个高风险任务必须单独 PR、单独验证、单独回滚方案。
