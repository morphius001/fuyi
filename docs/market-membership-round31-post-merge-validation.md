# Market Membership Round 31 Post-Merge Validation

更新时间：2026-05-07 Asia/Shanghai

## 范围

本报告收口第三十一轮 market membership 数据接入准备：

- PR #61：本地可丢弃数据库 migration dry-run 脚本。
- PR #62：market membership 测试 fixture。
- PR #63：Vendor market context DB reader QA，并修复 `china_market` 只读查询按 `id` 过滤。
- PR #64：Admin market membership 浏览器 QA handoff，标记为 `blocked-manual`。

## 已验证

### API 单元测试

```bash
bun --cwd packages/api test:unit -- --runTestsByPath \
  src/modules/china-market-read-model/__tests__/repository-market-read-model-adapter.unit.spec.ts \
  src/api/vendor/china/market-context/__tests__/helpers.unit.spec.ts \
  src/modules/china-market-read-model/__tests__/vendor-market-context-builder.unit.spec.ts
```

结果：passed，3 suites / 16 tests.

覆盖：

- repository adapter 映射和异常行过滤。
- Vendor market context builder 的 seller 作用域、跨市场、empty 状态。
- Vendor route helper 的 repository ready、owned market filter、required table missing、no membership fallback。
- `runtimeEnabled` 保持 `false`。
- `checkoutImpact` 保持 `none`。

### API TypeScript

```bash
bunx tsc --noEmit -p packages/api/tsconfig.json
```

结果：passed.

### 本地 Disposable DB Dry-Run

```bash
.codex/scripts/market-membership-local-dry-run.sh
```

结果：passed.

验证内容：

- 创建 `fuyi_market_membership_dry_run_*` 临时数据库。
- 应用 migration up SQL。
- 检查 6 张表存在。
- 插入最小 fixture。
- 验证错误 constraint 被拒绝。
- 行数：`1|1|1|1|1|1`。
- 应用 migration down SQL。
- 检查 6 张表被删除。
- 脚本退出后清理临时数据库。

### Diff Check

```bash
git diff --check
```

结果：passed.

### Formatting

```bash
bunx prettier --check .codex/tasks/market-membership-round31-post-merge-validation.md docs/market-membership-round31-post-merge-validation.md .codex/queue.md
```

结果：passed.

## 当前阻塞

`admin-market-membership-browser-qa` 仍然是 `blocked-manual`。

原因：

- Admin market membership 浏览器 QA 需要用户已登录 Codex App 浏览器会话。
- 自动 headless 不能可靠复用用户当前登录态。
- 不能伪造截图或把该项标记为 done。

## 安全边界

第三十一轮没有：

- 接入真实支付、短信、IM、物流、直播或 AI provider。
- 写入真实密钥。
- 写 production seed。
- 让 migration 自动进入生产运行。
- 修改 checkout、订单、支付、退款、结算、佣金、权限或真实履约逻辑。

## 下一步建议

1. 用户确认已登录 Admin 后，执行 `admin-market-membership-browser-qa`，截图验证 ready / empty / fallback 三态。
2. 若要继续 DB 方向，下一步应是预发 disposable DB dry-run 任务，必须显式提供目标库并确认可丢弃。
3. 真实 migration 注册、生产 seed、Admin 写接口、模块开关生效、支付/退款/结算/权限仍然保持高风险串行。
