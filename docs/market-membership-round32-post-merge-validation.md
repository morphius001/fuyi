# Market Membership Round 32 Post-Merge Validation

更新时间：2026-05-07 Asia/Shanghai

## 范围

本报告收口第三十二轮 market membership 只读 DB QA：

- PR #67：下一阶段规划、系统架构图和上线前 Gate 0-6。
- PR #68：预发 disposable DB dry-run 清单。
- PR #69：Admin market readonly API DB/read model 三态 QA。
- PR #70：Store markets readonly API DB/read model 三态 QA。

## 已验证

### API 单元测试

```bash
source ~/.nvm/nvm.sh && nvm use
bun --cwd packages/api test:unit -- --runTestsByPath \
  src/modules/china-market-read-model/__tests__/market-read-model-service.unit.spec.ts \
  src/modules/china-market-read-model/__tests__/repository-market-read-model-adapter.unit.spec.ts \
  src/modules/china-market-read-model/__tests__/vendor-market-context-builder.unit.spec.ts \
  src/api/vendor/china/market-context/__tests__/helpers.unit.spec.ts \
  src/api/admin/china/markets/__tests__/helpers.unit.spec.ts \
  src/api/store/china/markets/__tests__/helpers.unit.spec.ts
```

结果：passed，6 suites / 27 tests.

覆盖：

- market read model service 的静态 seed 转换。
- repository adapter 的行映射、软删除过滤和异常枚举过滤。
- Vendor market context builder 和只读 helper 的 repository / fallback 三态。
- Admin market readonly helper 的 repository ready、required table missing 和 static fallback。
- Store markets readonly helper 的 repository ready、required table missing 和 static fallback。
- `runtimeEnabled` 保持 `false`。
- `checkoutImpact` 保持 `none`。

### API TypeScript

```bash
source ~/.nvm/nvm.sh && nvm use
bunx tsc --noEmit -p packages/api/tsconfig.json
```

结果：passed.

### Repository Disposable DB Integration

```bash
.codex/scripts/market-membership-repository-integration-test.sh
```

结果：passed.

验证内容：

- 创建 `fuyi_market_membership_dry_run_repo_*` 临时数据库。
- missing-table 状态检查通过。
- 应用 market membership migration up SQL。
- 插入 repository integration fixture。
- 验证 repository ready 查询合同。
- 验证 seller-owned market filter。
- 验证 no-membership fallback。
- 验证 `checkout_impact = none`。
- 验证 `runtime_enabled = false`。
- 应用 migration down SQL，并清理临时数据库。

### Diff Check

```bash
git diff --check
```

结果：passed.

### Formatting

```bash
bun run prettier --check .codex/tasks/market-membership-round32-post-merge-validation.md docs/market-membership-round32-post-merge-validation.md .codex/queue.md
```

结果：passed.

## 环境备注

新 worktree 首次验证时需要安装本地依赖：

```bash
source ~/.nvm/nvm.sh && nvm use
bun install --frozen-lockfile
```

该命令只生成本地 `node_modules`，未修改 `bun.lock` 或 `package.json`。

另外，重启后后台 shell 可能没有自动加载 Node 24。后续验证命令应显式执行：

```bash
source ~/.nvm/nvm.sh && nvm use
```

否则可能出现 `jest: command not found`、Medusa 类型找不到，或 Bun/Jest 运行时异常。

## 当前阻塞

`admin-market-membership-browser-qa` 仍然是 `blocked-manual`。

原因：

- Admin market membership 浏览器 QA 需要用户已登录 Codex App 浏览器会话。
- 自动 headless 不能可靠复用用户当前登录态。
- 不能伪造截图或把该项标记为 done。

## 安全边界

第三十二轮没有：

- 接入真实支付、短信、IM、物流、直播或 AI provider。
- 写入真实密钥。
- 写 production seed。
- 让 migration 自动进入生产运行。
- 修改 checkout、购物车、配送方式、订单、支付、退款、结算、佣金、权限或真实履约逻辑。

## 下一步建议

1. 用户确认已登录 Admin 后，执行 `admin-market-membership-browser-qa`，截图验证 ready / empty / fallback 三态。
2. 若要继续 DB 方向，下一步应是预发 disposable DB dry-run 或真实 migration 注册前评审，必须明确目标库、备份、可回滚和退出标准。
3. Admin 写接口、模块开关真实生效、真实履约、支付、退款、对账、商家结算和权限仍然保持高风险串行。
