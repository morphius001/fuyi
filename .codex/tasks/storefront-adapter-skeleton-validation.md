# storefront-adapter-skeleton-validation

## 目标

验证 Storefront home adapter skeleton 与 home/shop/search adapter plan 在最新 main 上兼容。

本任务是 validation / docs-only 收口，不改页面、不改 route、不改业务运行时。

## 允许修改

- `docs/storefront-adapter-skeleton-validation.md`
- `.codex/queue.md`
- `project-ledger/**`

## 禁止修改

- `apps/**`
- `packages/api/**`
- DB / migration / seed
- checkout、cart、order、payment、refund、settlement、commission、payout、permission、fulfillment 运行逻辑

## 验证命令

- `cd apps/storefront && bun run build`
- focused temporary TypeScript check for `china-home-view-model.ts`
- `git diff --check`
