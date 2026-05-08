# Non Payment Readonly Contracts Validation

更新时间：2026-05-08 21:02 Asia/Shanghai

## 结论

PR #201 到 PR #212 的非支付 read-only 合同与规划合并后，focused tests、API typecheck 和 diff check 均通过。

本轮没有修改 `apps/**`，没有新增 API route，没有新增 migration，没有注册 runtime module，没有修改 checkout、订单、支付、退款、结算、佣金、打款、权限或履约逻辑。

## 验证命令

```bash
cd packages/api && ./node_modules/.bin/jest --runInBand --forceExit --runTestsByPath \
  src/modules/china-market-read-model/__tests__/merchant-role-capability-contract.unit.spec.ts \
  src/modules/china-product-drafts/__tests__/mobile-draft-product-contract.unit.spec.ts \
  src/modules/china-shop-decoration-read-model/__tests__/shop-decoration-readonly-contract.unit.spec.ts \
  src/modules/china-logistics-read-model/__tests__/logistics-waybill-readonly-contract.unit.spec.ts \
  src/modules/china-pickup-card-read-model/__tests__/pickup-card-consumer-flow-contract.unit.spec.ts \
  src/modules/china-live-commerce-read-model/__tests__/live-commerce-readonly-contract.unit.spec.ts
bunx tsc --noEmit -p packages/api/tsconfig.json
git restore -- packages/api/.mercur/index.d.ts
git diff --check
```

## 结果

- Node: `v24.15.0`
- Focused Jest: 6 suites passed, 19 tests passed.
- API typecheck: passed.
- `git diff --check`: passed.
- `packages/api/.mercur/index.d.ts`: typecheck 后已恢复，未纳入本轮验证 PR。

## 覆盖合同

- 商户角色能力只读合同。
- Vendor 手机草稿商品只读合同。
- 商家主页装修只读合同。
- 物流/面单只读合同。
- 提货卡消费者流程只读合同。
- 直播只读合同。

## 安全边界

仍然保持阻塞：

- 支付 provider / 支付通知真实运行。
- 预发 disposable DB 外部执行。
- coupon / promotion / gift card / store credit。
- checkout shipping options。
- 订单已支付状态。
- 真实商品创建。
- 真实库存初始化。
- 真实履约单。
- 真实物流/面单/云打印。
- 真实直播/IM/聊天室/直播交易。
- 退款、结算、佣金、打款、权限。

## 下一轮建议

下一轮可以进入“只读 contract 到 UI/route 之前的准备验证”：

1. `readonly-contracts-export-index`
   - 建立只读合同索引文档，说明哪些 contract 可以被 Admin/Vendor/Storefront 未来读取。

2. `admin-readonly-contracts-panel-plan`
   - 规划 Admin 只读合同总览面板，不接写接口。

3. `vendor-readonly-contracts-panel-plan`
   - 规划 Vendor 能力/草稿/装修/履约/直播只读总览。

4. `storefront-readonly-contracts-visibility-plan`
   - 规划消费者侧哪些状态可展示，哪些必须隐藏。
