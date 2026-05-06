# PR D Preflight: Vendor China Merchant Shell

日期：2026-05-05

本文档记录 `china/integration-localization` worktree 第四批 PR D 的预检结果。PR D 目标是提交中国商家后台 UI/mock：商户首页、市场/档口、手机快速上架、AI 草稿、店铺装修、物料供应、配送供应、上游供给、种苗和外地批发商工作台。PR D 不接真实商品、订单、库存、支付、退款、结算、佣金、权限、物流、直播或 AI 服务。

## 建议纳入 PR D

```text
apps/vendor/src/App.tsx
apps/vendor/src/styles.css
apps/vendor/src/china/**
docs/integration-pr-d-vendor-preflight.md
```

说明：

- `apps/vendor/src/china/data/vendorMockData.ts` 是 Vendor 中国商家后台 mock 数据入口。
- 当前 Vendor 是单页应用，主要页面逻辑集中在 `App.tsx`；后续应拆组件，但 PR D 可以先作为 UI/mock baseline。

## 建议排除 PR D

```text
AGENTS.md
.codex/**
apps/admin/**
apps/storefront/**
packages/**
docs/integration-pr-a-preflight.md
docs/integration-pr-b-preflight.md
docs/integration-pr-c-admin-preflight.md
docs/integration-pr-file-manifest.md
docs/vendor-draft-product-api-design.md
docs/vendor-shop-decoration-api-design.md
docs/vendor-china-page-coverage.md
.mercur/**
dist/**
node_modules/**
.env
.env.local
```

说明：

- Vendor API 合同和覆盖文档属于 PR B。
- Admin、Storefront、Provider 和 API 配置分别属于其它 PR。
- 不要把 Vendor UI PR 和真实 Provider / 后端写操作混在一起。

## 当前 Vendor 文件分组

| 分组 | 文件 | 说明 |
| --- | --- | --- |
| 单页工作台 | `apps/vendor/src/App.tsx` | 菜单、页面切换、首页、通用管理页、特殊页面骨架。 |
| 样式 | `apps/vendor/src/styles.css` | 中国商户后台布局、卡片、移动端适配和页面密度。 |
| Mock 数据 | `apps/vendor/src/china/data/vendorMockData.ts` | 商户首页、页面配置、指标、待办、物料/配送/上游供给等静态数据。 |

## 页面能力覆盖

PR D 覆盖以下 UI/mock：

- 商户首页、市场选择、商户类型。
- 手机快速上架。
- AI 一句话上架草稿。
- 商品、订单、提货卡履约、物流、快递打印、售后、客服、营销、直播管理。
- 店铺装修草稿。
- 市场物料采购、物料供应商接单。
- 配送供应商服务、订单、异常、范围。
- 养殖户、种植户、种苗批发、外地批发商、跨区冷链到货等 B 端供给入口。

## 风险边界

PR D 允许：

- 展示商户日常经营工作台。
- 展示移动端快速上架壳。
- 展示 AI 草稿结构化建议，但只能停留在草稿。
- 展示店铺装修草稿和预览占位。
- 展示物料、配送、上游、种苗和外地批发商 B 端入口。

PR D 禁止：

- 创建真实商品或绕过商品审核。
- 改真实库存、价格、订单、履约、发货、售后或退款状态。
- 发起真实结算、提现、佣金计算或 payout。
- 改商户权限、账号权限或订单归属。
- 接真实 AI、微信、IM、短信、物流、电子面单或直播服务。
- 写入真实 app id、token、access key、secret、私钥、证书、快递月结号或 IM 凭证。

## 建议后续拆分

当前 `App.tsx` 承载过多页面，后续可以拆成：

1. `D1 Vendor 首页与菜单能力`
2. `D2 Vendor 手机快速上架和 AI 草稿`
3. `D3 Vendor 店铺装修壳`
4. `D4 Vendor B 端供应链壳`

拆分时仍要保持每个 PR 单独通过 lint/build。

## 已执行验证

```bash
/home/codex/.bun/bin/bun --cwd apps/vendor lint
/home/codex/.bun/bin/bun --cwd apps/vendor build
git diff --check -- apps/vendor
```

结果：

- Vendor lint：通过。
- Vendor build：通过。
- `git diff --check -- apps/vendor`：通过。

## 仍需人工视觉确认

- 打开 `http://127.0.0.1:7001/`，确认首页像商户工作台而不是普通营销页。
- 移动宽度查看手机快速上架是否足够短、像 App 操作。
- 查看 AI 草稿页面是否明确“生成草稿，商户确认后再提交”。
- 查看店铺装修页面是否符合档口主页经营需求。
- 查看物料、配送、上游、种苗、外地批发商入口是否明显是 B 端能力，不像消费者前台。

## 当前结论

PR D 可以进入准备阶段。代码层面 lint/build/diff-check 已通过；提交前建议先做一次 Vendor 页面人工视觉确认，尤其是移动端快速上架和店铺装修。
