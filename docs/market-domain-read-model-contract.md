# Market Domain Read Model Contract

更新时间：2026-05-08 17:18 Asia/Shanghai

## 结论

新增市场域合同 view shape：

```ts
buildChinaMarketDomainContractView(seed)
```

它位于：

```text
packages/api/src/modules/china-market-read-model/market-domain-contract-view.ts
```

该 view 只表达市场域实体、商户角色和高风险边界，不新增 route、不新增 migration、不连接数据库、不影响 checkout 或订单链路。

## 覆盖内容

实体：

- 市场。
- 营业时间。
- 市场公告。
- 档口。
- 商户市场关系。
- 商户角色。
- 市场配送能力。

角色：

- 海鲜档口。
- 冻品商户。
- 干货商户。
- 水果蔬菜商户。
- 物料供应商。
- 配送供应商。
- 种植户。
- 养殖户。
- 种苗供应商。
- 外地批发商。

高风险边界：

- checkout shipping options。
- order fulfillment。
- payment。
- refund。
- settlement。
- commission。
- payout。
- permission。

## 安全边界

所有输出都固定：

- `readOnly: true`
- `runtimeEnabled: false`
- `writeEnabled: false`
- `runtimeImpact: "none"`
- `permissionImpact: "none"`

这意味着它只能作为 read model 合同，不会使市场开关、商户角色或配送能力真实生效。

## 验证

通过：

```bash
cd packages/api && TEST_TYPE=unit NODE_OPTIONS=--experimental-vm-modules jest --silent --runInBand --forceExit --runTestsByPath src/modules/china-market-read-model/__tests__/market-domain-contract-view.unit.spec.ts
bunx tsc --noEmit -p packages/api/tsconfig.json
git diff --check
```

## 仍未进入范围

- 市场写 API。
- migration。
- Admin 保存/发布。
- Vendor 修改市场关系。
- Storefront 真实筛选生效。
- checkout shipping options 生效。
- 订单履约。
- 结算、佣金、权限。
