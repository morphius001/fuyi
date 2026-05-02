# Storefront Scaffold

本文档记录官方 Mercur B2C Storefront 接入当前 monorepo 的 scaffold 决策。本次任务只接入 storefront，不做中国化改造，不修改支付、订单、退款、结算、佣金或权限逻辑。

## Source

- 官方仓库: https://github.com/mercurjs/b2c-marketplace-storefront
- 获取方式: GitHub `main` 分支源码压缩包
- 接入位置: `apps/storefront`
- 未复制内容: 官方仓库 `.git`、独立仓库 `yarn.lock`

## Monorepo Integration

根目录 `package.json` 已包含:

```json
"workspaces": [
  "packages/*",
  "apps/*"
]
```

因此 `apps/storefront` 会被当前 bun workspace 自动纳入。官方 storefront 独立仓库声明 `packageManager: yarn@1.22.22`，当前 monorepo 声明 `packageManager: bun@1.3.13`。为避免混用锁文件和包管理器，本次接入:

- 保留官方应用源码和 Next.js 配置。
- 不复制官方 `yarn.lock`。
- 将 `apps/storefront/package.json` 的 `packageManager` 对齐为 `bun@1.3.13`。
- 使用根目录 `bun.lock` 记录安装解析结果。

根目录新增最小脚本:

```bash
bun run dev:storefront
bun run build:storefront
bun run lint:storefront
```

## Environment

已新增 `apps/storefront/.env.local.example`，仅包含本地开发占位值，不包含真实密钥。不要提交 `apps/storefront/.env.local`。

关键变量:

- `MEDUSA_BACKEND_URL=http://localhost:9000`
- `NEXT_PUBLIC_BASE_URL=http://localhost:3000`
- `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=`
- `NEXT_PUBLIC_DEFAULT_REGION=cn`
- `NEXT_PUBLIC_STRIPE_KEY=pk_test_placeholder`
- `REVALIDATE_SECRET=change_me`
- `NEXT_PUBLIC_SITE_NAME=Fuyi`
- `NEXT_PUBLIC_SITE_DESCRIPTION=Fuyi marketplace storefront`
- `NEXT_PUBLIC_ALGOLIA_ID=`
- `NEXT_PUBLIC_ALGOLIA_SEARCH_KEY=`
- `NEXT_PUBLIC_TALKJS_APP_ID=`

`apps/storefront/.gitignore` 已包含 `.env.local`，本地密钥文件不会被纳入 Git。

## Scope

本次 scaffold 包含:

- 新增 `apps/storefront`。
- 安装 storefront 依赖到根 bun workspace。
- 增加 storefront 专用 dev/build/lint 脚本。
- 记录 storefront 位置和后续中国化任务边界。

本次 scaffold 不包含:

- 中文化、CNY 展示改造或国内电商 UX 改造。
- 真实 Stripe、Algolia、TalkJS、微信支付、支付宝接入。
- 支付、订单、退款、结算、佣金或权限逻辑改动。
- 生产密钥或 `.env.local`。

## Verification

完成接入后需要执行:

```bash
bun install
bun run lint:storefront
```

如果 lint 因官方模板脚本或 Next.js 版本兼容性失败，记录原因即可，不在 scaffold PR 中大量修业务代码。

## Risk Notes

- Storefront 引入 React 19 和 Next.js 15 依赖；根项目已有 React 18 依赖，bun workspace 可能同时解析多个版本。后续构建验证需要关注 peer dependency 与 hoisting 行为。
- 官方 storefront 保留 Stripe、Algolia、TalkJS 相关依赖和入口，但本次不配置真实服务。
- `.env.local.example` 使用 `NEXT_PUBLIC_DEFAULT_REGION=cn` 是本地连接当前项目默认区域的占位配置，不代表已完成中国化 UX 或业务逻辑。
