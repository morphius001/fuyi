# Migration Registration Design Review

更新时间：2026-05-07 Asia/Shanghai

## 结论

market membership migration 还不能直接注册到真实运行路径。

当前可以进入“注册前设计评审”阶段，但真实注册必须再拆一个独立 PR，并且该 PR 只允许做 migration registration，不允许同时写 seed、切 runtime、加 Admin 写接口或改变 Store/Vendor/Admin 业务行为。

## 当前证据

已完成：

- migration skeleton 存在，覆盖 6 张表：
  - `china_market`
  - `china_market_membership`
  - `china_seller_role`
  - `china_market_announcement`
  - `china_market_business_hour`
  - `china_market_delivery_profile`
- 本地 disposable DB up/down dry-run 通过。
- repository integration disposable DB 通过。
- local registration rehearsal 通过。
- Vendor/Admin/Store 只读 helper 和 fallback 单测通过。
- Store/Admin markets readonly API 在表存在时可优先读取 repository rows，表缺失或无数据时 fallback。
- `runtimeEnabled` 保持 `false`。
- `checkoutImpact` 保持 `none`。

仍未完成：

- Admin authenticated browser QA 仍为 `blocked-manual`。
- 预发 disposable DB dry-run 仍为 `blocked-external`。
- migration 尚未注册到 `packages/api/medusa-config.ts`。
- 没有 production seed。
- 没有 Admin 写接口。
- 没有 runtime switch 生效。

## 注册 PR 边界

未来真实 migration registration PR 只能做：

- 注册 `china-market-membership` migration/module 到项目运行路径。
- 保持空表可启动。
- 保持 existing read-only fallback。
- 记录 migration up/down 和 rollback 命令。

该 PR 禁止同时做：

- production seed。
- Admin 写接口。
- runtime 开关生效。
- Storefront UI 改造。
- Vendor UI 改造。
- checkout、购物车、配送方式、订单、支付、退款、结算、佣金、权限或真实履约修改。
- 真实短信、IM、物流、直播、AI、微信支付或支付宝 provider。

## Entry Gates

进入真实 migration registration 前必须满足：

1. `market-membership-registration-rehearsal.sh` 通过。
2. `market-membership-repository-integration-test.sh` 通过。
3. API 单测覆盖 Vendor/Admin/Store repository / fallback 三态。
4. API TypeScript 通过。
5. `git diff --check` 通过。
6. 预发 disposable DB dry-run 有目标库确认，或明确记录暂不进入预发。
7. Admin browser QA 若仍 blocked，必须在 PR 描述中标注缺口，不得声称已完成。

## Runtime Gates

真实 migration 注册后仍不得自动进入 runtime 生效。

必须先验证：

- 空表启动：API 和 dashboard 不报错。
- 表存在但无数据：Vendor/Admin/Store fallback 正常。
- 只读 fixture：Vendor/Admin/Store 读取 repository rows 正常。
- `runtimeEnabled = false`。
- `checkoutImpact = none`。
- 关闭开关时所有前端仍能 fallback。

## Rollback Plan

最低回滚方案：

1. 部署回退到 migration registration 前一版本。
2. 对 disposable/preprod DB 执行 migration down SQL。
3. 若真实环境已执行 migration，先确认没有 production data，再执行 down。
4. 若已产生数据，不直接 drop 表，改为：
   - 保持表存在。
   - 关闭 runtime flag。
   - 保持 read-only fallback。
   - 另起 data-safe rollback 任务。

## PR 拆分建议

### PR BX: Migration Registration

Scope:

- 注册 migration/module。
- 不写 seed。
- 不改 runtime。

Verification:

- API typecheck。
- market membership local rehearsal。
- 空表启动检查。
- repository/fallback 单测。

### PR BY: Empty Table Runtime Smoke

Scope:

- 只验证 migration 注册后空表运行状态。
- 记录 Admin/Store/Vendor fallback。

Verification:

- API dev server 启动。
- Admin/Store/Vendor read-only endpoints 返回 fallback。

### PR BZ: Fixture Readonly Smoke

Scope:

- 只在 disposable DB 或明确的测试 DB 插入 fixture。
- 验证 read-only routes 读 repository rows。

Non-goals:

- 不写 production seed。
- 不让真实 runtime 生效。

### PR CA: Runtime Switch Design Review

Scope:

- docs-only 评审 runtime switch。
- 等 Admin write API 设计完成后再执行。

Non-goals:

- 不让开关生效。

## 暂停条件

以下情况必须暂停：

- 要连接预发或生产 DB，但没有明确目标和可回滚确认。
- 要写 production seed。
- 要新增 Admin 写接口。
- 要让模块开关影响真实 runtime。
- 要触碰 checkout、订单、支付、退款、结算、佣金、权限或真实履约。
- 要接真实 provider。

## 本轮验证

本任务只做 docs-only 评审：

```bash
git diff --check
bunx prettier --check .codex/tasks/migration-registration-design-review.md docs/migration-registration-design-review.md .codex/queue.md
```

结果：passed.
