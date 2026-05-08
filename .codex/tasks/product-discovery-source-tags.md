# product-discovery-source-tags

## Goal

给商品发现只读 read model 增加非敏感 `sourceTags`，帮助后续 dev-only 调试和 QA 判断 response source、item count、fallback 与 filter keys。

## Scope

- 只修改商品发现 read model response shape、focused unit test 和 Storefront client type/fallback。
- `sourceTags` 只包含低风险聚合字段，不包含用户隐私、订单、支付、退款、结算、佣金、权限或 provider secret。
- 不接真实日志 provider、analytics SDK 或 tracing provider。

## Non-goals

- 不修改 Storefront 页面展示。
- 不修改 `ProductCard`。
- 不新增 API route、migration、写接口或 provider runtime。
- 不改变 cart、checkout、订单、支付、退款、结算、佣金、权限、履约或物流。

## Verification

已完成：

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn
export PATH="/home/codex/.nvm/versions/node/v24.15.0/bin:/home/codex/.bun/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
cd packages/api
NODE_OPTIONS=--experimental-vm-modules ./node_modules/.bin/jest --silent --runInBand --forceExit src/lib/__tests__/china-product-discovery-read-model.unit.spec.ts
```

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn
export PATH="/home/codex/.nvm/versions/node/v24.15.0/bin:/home/codex/.bun/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
bunx tsc --noEmit -p packages/api/tsconfig.json
```

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn/apps/storefront
/home/codex/.bun/bin/bun run build
```

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn
git diff --check
```

子智能体只读复核通过。Storefront build 仅保留既有 React Hook dependency warnings。
