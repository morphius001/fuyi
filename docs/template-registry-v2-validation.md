# Template Registry V2 Validation

更新时间：2026-05-08 Asia/Shanghai

## 验证范围

本轮验证 PR #242、#243、#244 合并后的模板注册表 v2 和 Storefront 首页 / 店铺页 mapper。

覆盖内容：

- `storefront-home-market-shop-v2`
- `storefront-shop-stall-v2`
- `admin-dashboard-ops-v2`
- `vendor-role-workspace-v2`
- Storefront home view model mapper
- Storefront shop view model mapper

## 验证命令

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn/packages/api
bun test src/modules/china-template-registry-read-model/__tests__/template-registry-readonly-contract.unit.spec.ts
bun test src/lib/__tests__/storefront-home-view-model-mapper.unit.spec.ts
bun test src/lib/__tests__/storefront-shop-view-model-mapper.unit.spec.ts
bun test src/lib/__tests__/china-read-models.unit.spec.ts

cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn
./node_modules/.bin/tsc --noEmit -p packages/api/tsconfig.json
git diff --check
```

## 结果

- Template registry readonly contract：6 passed。
- Storefront home mapper：4 passed。
- Storefront shop mapper：4 passed。
- China read model builders：5 passed。
- API TypeScript typecheck：通过。
- `git diff --check`：通过。

## 边界确认

本轮没有新增或修改：

- `apps/**`
- API route
- DB / migration / seed
- checkout / cart
- order
- payment
- refund
- settlement / commission / payout
- permission / RBAC
- fulfillment / logistics / waybill
- real provider config
- real credentials

`packages/api/.mercur/index.d.ts` 在 typecheck 过程中可能被本地工具触碰；本轮验证后已恢复，没有纳入 diff。

## 风险说明

- Storefront 首页和店铺页 mapper 仍是只读合同，不代表页面已绑定真实 mapper。
- B-side 供应商默认不进入消费者首页；如果后续允许某些供应商对消费者可见，必须通过单独的展示策略、权限和运营配置 PR。
- 店铺页履约提示只作为 display-only `shop_header` 信息，不能作为 checkout shipping options 或真实运费来源。
- 提货卡仍是独立入口，不作为优惠券、支付方式、储值卡或购物车抵扣。
- 直播仍是店铺状态 badge，真实直播 provider 和 IM 互动必须单独串行接入。

## 下一步

第一百轮 contract / mapper 队列已收口。下一轮建议进入页面绑定前的计划任务：

1. `storefront-home-bind-view-model-plan`
2. `storefront-shop-bind-view-model-plan`
3. `storefront-search-view-model-mapper`

页面绑定必须单独 PR，且先绑定一个 surface，避免首页、搜索、店铺页同时变动导致视觉和数据问题混在一起。
