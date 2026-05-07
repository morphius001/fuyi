# Storefront Market Readonly API DB QA

更新时间：2026-05-07 Asia/Shanghai

## 目标

让 Storefront markets readonly API 在 market membership 表存在时优先读取 repository rows；表缺失或 repository rows 不可用时继续使用 seller metadata static fallback。

## 本轮变更

```text
packages/api/src/api/store/china/markets/helpers.ts
packages/api/src/api/store/china/markets/route.ts
packages/api/src/api/store/china/markets/[slug]/route.ts
packages/api/src/api/store/china/markets/[slug]/sellers/route.ts
packages/api/src/api/store/china/markets/__tests__/helpers.unit.spec.ts
```

## 行为

- `GET /store/china/markets`
  - 返回 `source: "repository"` 或 `source: "static_fallback"`。
  - 仍然只读。

- `GET /store/china/markets/:slug`
  - 返回 market detail。
  - detail 中补充 `source`。
  - 不影响 checkout、cart totals 或 shipping options。

- `GET /store/china/markets/:slug/sellers`
  - 返回 market sellers。
  - sellers response 中补充 `source`。
  - 仍然只读。

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
   - 不阻断 Storefront markets API。

## 安全边界

本轮没有：

- 修改 Storefront UI。
- 修改 checkout、cart totals 或 shipping options。
- 修改 migration SQL。
- 写 production seed。
- 接入真实支付、短信、IM、物流、直播或 AI provider。
- 改变订单、支付、退款、结算、佣金、权限或真实履约逻辑。

## 验证结果

已验证：

- `bun --cwd packages/api test:unit -- --runTestsByPath src/api/store/china/markets/__tests__/helpers.unit.spec.ts`: passed，1 suite / 4 tests.
- `bunx tsc --noEmit -p packages/api/tsconfig.json`: passed.
- `git diff --check`: passed.
- `prettier --check`: passed.
