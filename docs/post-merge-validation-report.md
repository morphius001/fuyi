# Post Merge Validation Report

更新时间：2026-05-07 Asia/Shanghai

## 结论

PR A-H 已经按低风险拆分合并到 `main`，当前 `origin/main` 已包含中国大陆本地化基础版的工作流、只读 API 契约、Storefront、Admin、Vendor、Mock provider skeleton、架构文档和本地启动运行手册。

本轮合并后验证通过。当前可以把 `main` 当作下一阶段开发基线，但还不能当作生产上线版本。

## 已合并 PR

- PR #3: `[china] PR A Codex workflow and ledger baseline`
- PR #4: `[china] PR B API readonly contracts and demo seed`
- PR #5: `[china] PR C Storefront China consumer localization`
- PR #6: `[china] PR D Admin China ops shell`
- PR #7: `[china] PR E Vendor China merchant shell`
- PR #8: `[china] PR F Mock China service providers`
- PR #9: `[china] PR G China architecture and staging plans`
- PR #10: `[china] PR H Integration runbooks and env template notes`

合并后 `origin/main` 最近提交：

- `a945ceb` `[china] PR H Integration runbooks and env template notes`
- `ea0ab91` `[china] PR G China architecture and staging plans`
- `47155ba` `[china] PR F Mock China service providers`
- `a986b2d` `[china] PR E Vendor China merchant shell`
- `c825139` `[china] PR D Admin China ops shell`
- `93c6411` `[china] PR C Storefront China consumer localization`
- `459fd60` `[china] PR B API readonly contracts and demo seed`
- `bc40393` `[china] PR A Codex workflow and ledger baseline`

## 合并后验证

验证 worktree：

- `/home/codex/code/fuyi-pr-h-runbooks-cn`
- 本地分支：`china/pr-h-runbooks-env`
- 远端基线：`origin/main`

验证命令：

```bash
bun install --frozen-lockfile
./node_modules/.bin/tsc --noEmit -p packages/api/tsconfig.json
cd packages/api && ./node_modules/.bin/medusa build
cd packages/api && TEST_TYPE=unit ./node_modules/.bin/jest src/modules/china-service-providers/__tests__/mock-service-providers.unit.spec.ts --runInBand
cd apps/admin && bun run lint
cd apps/admin && bun run build
cd apps/vendor && bun run lint
cd apps/vendor && bun run build
cd apps/storefront && bun run build
```

验证结果：

- API typecheck 通过。
- API build 通过。
- Mock China service providers 单元测试通过，8 个测试全部通过。
- Admin lint/build 通过。
- Vendor lint/build 通过。
- Storefront build 通过。
- `origin/main..china/integration-localization` diff 为空，说明拆分后的主线内容与 integration 基线一致。

已知残留：

- Storefront build 仍有项目既有 React Hook dependency warnings，主要在 cart/address 相关组件；本轮未改这些业务逻辑。
- 当前三端大量页面仍是 mock/read-only/basic shell，不代表真实支付、真实履约、真实结算或真实权限已经跑通。
- 主工作目录 `/home/codex/code/fuyi` 仍可能有用户本地改动，本轮没有在那里执行 pull 或 reset。

## 已清理的临时环境

为了从 WSL 访问 GitHub，曾临时使用 Windows 本地代理转发端口 `19829`。PR 推送和合并完成后已经移除：

- Windows portproxy `0.0.0.0:19829 -> 127.0.0.1:19828`
- Windows 防火墙规则 `Fuyi WSL proxy 19829`

后续如果 WSL 直连 GitHub 再次超时，应优先修复固定网络配置，不要把临时 portproxy 当生产方案。

## 下一阶段边界

下一阶段应从“数据和后台控制真正跑通”开始，而不是继续堆静态 UI。

优先级建议：

1. 市场、商户、档口、商户类型、模块开关的真实数据库模型和只读查询。
2. Admin 模块开关真实配置草稿、审计、预览和只读生效面。
3. Vendor 快速上架草稿 API、规格模板读取和保存草稿。
4. Storefront 继续把首页、搜索、店铺页接到真实市场/商户/商品数据。
5. 支付、退款、结算、佣金、权限、真实履约和快递打印继续保持高风险串行任务。

## 高风险禁止混入

后续普通 UI 或数据契约 PR 不要混入：

- 支付成功状态变更。
- 支付通知、验签、幂等、重试。
- 退款。
- 对账。
- 商家结算、payout、commission。
- 权限、RBAC、真实菜单显隐。
- checkout shipping option、cart total、订单履约状态真实生效。
- 真实短信、IM、物流、直播、AI 或快递打印服务。

## 本文档验证

```bash
git diff --check -- docs/post-merge-validation-report.md project-ledger/status.md .codex/queue.md
```
