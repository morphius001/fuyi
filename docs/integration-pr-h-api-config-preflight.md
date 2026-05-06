# PR H Preflight: API Config Template And Seed Safety

日期：2026-05-05

本文档记录 `china/integration-localization` worktree 第八批 PR H 的预检结果。PR H 目标是单独审查 API 配置模板、Medusa 配置和 seed 中国本地化安全边界。它比前面的 UI/mock/docs PR 风险更高，因为它碰运行时配置和默认数据。

## 建议纳入 PR H

```text
packages/api/.env.template
packages/api/medusa-config.ts
packages/api/src/scripts/seed.ts
docs/integration-config-and-release-boundary-audit.md
docs/integration-pr-h-api-config-preflight.md
```

## 建议排除 PR H

```text
packages/api/src/modules/china-service-providers/**
apps/**
AGENTS.md
.codex/**
docs/mock-service-providers.md
docs/integration-pr-a-preflight.md
docs/integration-pr-b-preflight.md
docs/integration-pr-c-admin-preflight.md
docs/integration-pr-d-vendor-preflight.md
docs/integration-pr-e-storefront-discovery-preflight.md
docs/integration-pr-f-storefront-checkout-detail-preflight.md
docs/integration-pr-g-mock-provider-preflight.md
.mercur/**
.env
.env.local
真实密钥或证书
```

说明：

- Mock provider skeleton 属于 PR G；PR H 只看 API 配置模板和 seed。
- PR H 不应混入 Admin、Vendor、Storefront UI。
- PR H 不应接真实微信支付、支付宝、短信、IM、物流、直播、AI 或支付 Provider。

## 当前代码差异摘要

`packages/api/.env.template`：

- 新增 `DB_NAME=medusa-api`。
- 仍保留本地开发模板值：
  - `localhost` CORS / Redis / Vendor URL。
  - `JWT_SECRET=supersecret`
  - `COOKIE_SECRET=supersecret`

`packages/api/medusa-config.ts`：

- `databaseUrl` 改为优先读取 `CODEX_DATABASE_URL`，再 fallback 到 `DATABASE_URL`。
- `jwtSecret` / `cookieSecret` 仍有 `supersecret` fallback。
- 未注册 `china-service-providers`。

`packages/api/src/scripts/seed.ts`：

- seed 国家从欧洲多国改为 `cn`。
- 默认货币从 `eur` / `usd` 改为 `cny`。
- 默认 region 名称从 `Europe` 改为 `China Mainland`。
- payment provider 仍是 `pp_system_default`，未接真实微信支付或支付宝。

## 风险扫描结果

扫描命中：

- `packages/api/.env.template` 含 `localhost`、`JWT_SECRET=supersecret`、`COOKIE_SECRET=supersecret`。
- `packages/api/medusa-config.ts` 含 `jwtSecret` / `cookieSecret` 的 `supersecret` fallback。
- `docs/integration-config-and-release-boundary-audit.md` 明确把这些值标记为本地开发值和上线前阻断项。

未发现：

- 生产支付密钥样式
- 生产公钥样式
- 真实第三方应用密钥字段
- 真实私钥字段
- 真实访问密钥字段
- 真实商户号字段
- 真实证书或私钥内容

结论：

- 当前 PR H 可作为本地开发配置/seed 安全审计批次，但不能直接视为生产安全配置。
- 上线前必须移除或替换 `supersecret`、`localhost`、`127.0.0.1`、mock key 等本地值。

## 已执行验证

```bash
/home/codex/.bun/bin/bunx tsc --noEmit --project packages/api/tsconfig.json
git diff --check -- packages/api/.env.template packages/api/medusa-config.ts packages/api/src/scripts/seed.ts docs/integration-config-and-release-boundary-audit.md
```

结果：

- API typecheck：通过。
- PR H 范围 `git diff --check`：通过。

## Release Gate

PR H 如果进入合并，需要在 PR 描述里明确：

- `CODEX_DATABASE_URL` 只用于 Codex 本地开发，生产不得使用。
- `DB_NAME=medusa-api` 是模板值，不代表生产数据库名。
- `.env.template` 里的 `localhost` 和 `supersecret` 是开发占位，上线前必须替换。
- `medusa-config.ts` 的 `supersecret` fallback 对生产不安全，后续应增加生产环境强制校验。
- seed 改为 `cn` / `cny` 只影响初始化示例数据，不代表支付、税务、物流、结算已经完成中国化。
- payment provider 仍是 `pp_system_default`；没有接真实微信支付、支付宝、退款、对账、结算或佣金逻辑。

## 建议后续拆分

PR H 可以继续拆成两个小 PR：

1. `H1 Local Dev Config Boundary`
   - `medusa-config.ts`
   - `.env.template`
   - `docs/integration-config-and-release-boundary-audit.md`

2. `H2 China Seed Baseline`
   - `seed.ts`
   - seed 验证记录

如果要尽快合并，也可以作为一个中风险配置 PR，但必须单独 review，不要混入 Provider skeleton 或 UI。

## 当前结论

PR H 可以进入准备阶段，但它是中风险配置 PR。当前验证通过，且未发现真实密钥；不过生产前必须处理 `supersecret`、localhost、mock key 和 CORS 域名等 release gate。
