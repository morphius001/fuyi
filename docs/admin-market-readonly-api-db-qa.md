# Admin Market Readonly API DB QA

更新时间：2026-05-07 Asia/Shanghai

## 目标

让 Admin market readonly API 在 market membership 表存在时优先读取 repository rows；表缺失或 repository rows 不可用时继续使用 seller metadata static fallback。

## 本轮变更

```text
packages/api/src/api/admin/china/markets/helpers.ts
packages/api/src/api/admin/china/markets/route.ts
packages/api/src/api/admin/china/markets/[id]/route.ts
packages/api/src/api/admin/china/markets/__tests__/helpers.unit.spec.ts
```

## 行为

- `GET /admin/china/markets`
  - 返回 `source: "repository"` 或 `source: "static_fallback"`。
  - 仍然只返回只读 markets。

- `GET /admin/china/markets/:id`
  - 返回 market detail。
  - detail 中补充 `source`。
  - 不提供保存、发布、生效或写入能力。

## 覆盖三态

1. Repository ready
   - market membership 表存在。
   - helper 读取 markets、memberships、roles、announcements、business hours、delivery profiles。
   - `dataSource` 为 `repository`。

2. Required table missing
   - 缺少 `china_market_membership` 时 repository rows 为 `undefined`。
   - API helper 可 fallback。

3. Static fallback
   - repository rows 不可用时使用 seller metadata static adapter。
   - 不阻断 Admin markets 页面。

## 安全边界

本轮没有：

- 修改 Admin UI。
- 新增写接口。
- 修改 migration SQL。
- 写 production seed。
- 接入真实支付、短信、IM、物流、直播或 AI provider。
- 改变 checkout、订单、支付、退款、结算、佣金、权限或真实履约逻辑。

## 验证结果

已验证：

- `bun --cwd packages/api test:unit -- --runTestsByPath src/api/admin/china/markets/__tests__/helpers.unit.spec.ts`: passed，1 suite / 4 tests.
- `bunx tsc --noEmit -p packages/api/tsconfig.json`: passed.
- `git diff --check`: passed.
- `prettier --check`: passed.
