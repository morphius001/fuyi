# Product Discovery Source Tags Validation

更新时间：2026-05-09 Asia/Shanghai

## Summary

本轮汇总 PR #290 `product-discovery-source-tags` 的验证和边界。

`sourceTags` 已加入商品发现只读 read model，并同步到 Storefront client fallback type。它只用于 QA 和 dev-only 调试，不接真实日志 provider，不记录用户隐私或交易敏感字段。

## Implemented In PR #290

- `packages/api/src/lib/china-product-discovery-read-model.ts`
  - 新增 `ChinaProductDiscoverySourceTags`。
  - `buildChinaProductDiscoveryReadModel()` 返回 `sourceTags`。
- `packages/api/src/lib/__tests__/china-product-discovery-read-model.unit.spec.ts`
  - 覆盖真实商品、seller product filter、B-side filtered empty result 和 fallback source tags。
- `apps/storefront/src/lib/data/china-product-discovery.ts`
  - Storefront client response type 增加 `sourceTags`。
  - client fallback 使用 `responseSource=storefront_fallback` 和 `fallbackReason=client_fetch_failed`。
  - fallback `filterKeysPresent` 只记录入参 key 名，不记录 filter 原始值。

## Verification Already Run

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn/packages/api
export PATH="/home/codex/.nvm/versions/node/v24.15.0/bin:/home/codex/.bun/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
NODE_OPTIONS=--experimental-vm-modules ./node_modules/.bin/jest --silent --runInBand --forceExit src/lib/__tests__/china-product-discovery-read-model.unit.spec.ts
```

Result: passed, 3 tests.

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn
export PATH="/home/codex/.nvm/versions/node/v24.15.0/bin:/home/codex/.bun/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
bunx tsc --noEmit -p packages/api/tsconfig.json
```

Result: passed.

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn/apps/storefront
/home/codex/.bun/bin/bun run build
```

Result: passed, only existing React Hook dependency warnings.

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn
git diff --check
```

Result: passed.

子智能体只读复核通过。

## Privacy Boundary

`sourceTags` 允许：

- `responseSource`
- `itemCount`
- `productRowCount`
- `sellerContextCount`
- `fallbackUsed`
- `fallbackReason`
- `filterKeysPresent`
- `displayOnly`

`sourceTags` 禁止：

- 用户姓名、手机号、地址、OpenID、unionid、email 或会员 id。
- cart id、order id、payment id、refund id、settlement id。
- provider app id、merchant id、secret、token 或 webhook payload。
- 原始搜索词全文。
- 外部 analytics/log/metrics/tracing provider 运行时写入。

## Next Gate

下一步如做 dev-only debug banner，必须满足：

- 只在开发环境或显式 debug flag 下可见。
- 只展示 source、item count、fallback used、fallback reason 和 filter key names。
- 不展示原始搜索词、不展示用户身份、不展示订单/支付/退款/结算字段。
- 不改变页面商品卡、购物车、结算、订单、支付、退款、结算、佣金、权限、履约或物流行为。
- 单独 PR，并包含 Storefront build、`git diff --check` 和子智能体只读复核。
