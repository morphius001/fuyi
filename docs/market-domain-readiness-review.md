# Market Domain Readiness Review

更新时间：2026-05-08 16:55 Asia/Shanghai

## 结论

市场域已经有一层可用的 read-only 基础，但还不能视为真实市场运营模型。

当前适合继续做 read-only / docs-only 拆分，不适合直接做市场写接口、商户入驻生效、配送规则影响 checkout、真实订单履约或权限生效。

## 已有能力

### API read model

已有目录：

- `packages/api/src/modules/china-market-read-model/**`
- `packages/api/src/modules/china-market-membership/**`
- `packages/api/src/api/store/china/markets/**`
- `packages/api/src/api/store/china/discovery/**`
- `packages/api/src/api/admin/china/markets/**`
- `packages/api/src/api/vendor/china/market-context/**`

当前语义：

- Store 端已有中国市场列表、市场详情、市场档口列表只读 API。
- Store discovery 已提供消费者发现页需要的市场 / 店铺 / 类目只读数据。
- Admin 端已有市场列表和详情只读 API。
- Vendor 端已有 market context 只读 API。
- `china-market-read-model` 支持 static adapter、repository adapter 和 vendor market context builder。

### Frontend clients

已有文件：

- `apps/storefront/src/lib/data/china-markets.ts`
- `apps/storefront/src/lib/data/china-sellers.ts`
- `apps/admin/src/lib/china-admin-market-client.ts`
- `apps/vendor/src/lib/china-vendor-market-context-client.ts`

当前语义：

- Storefront 可以读取市场和商家只读信息。
- Admin 可以读取市场只读数据。
- Vendor 可以读取商户所在市场 context。

## 当前缺口

### 1. 市场实体仍未完全真实运营化

已有 read model，但还缺：

- 市场真实写入入口。
- 市场启停状态。
- 市场运营负责人。
- 市场可见范围。
- 市场公告版本管理。
- 市场营业日历。
- 市场节假日例外规则。

下一步建议：先 docs-only 设计，再做 read-only schema contract，不直接写 Admin 保存接口。

### 2. 商户与档口关系还不能生效到业务链路

已有市场 context 和 seller metadata，但还缺：

- 一个商户跨多个市场的正式关系模型。
- 同一商户多个档口。
- 档口号、楼层、区域、摊位状态。
- 商户在不同市场的营业状态。
- 档口展示优先级。
- 商户角色与市场关系的审核状态。

禁止直接影响：

- 订单归属。
- 结算主体。
- 权限。
- 配送方式。

### 3. 配送 profile 仍只能只读展示

已有统一配送 / 商家自配送 / 自提的展示语义，但还缺：

- 市场配送规则模型。
- 商户是否加入统一配送的配置。
- 配送供应商关系。
- 配送时段。
- 运费模板。
- 冷链 / 泡沫箱 / 冰袋等包装要求。
- checkout shipping options 生效规则。

继续边界：

- 先做 docs-only 和 read-only view。
- 不改 checkout。
- 不改 cart total。
- 不创建履约单。

### 4. 公告和营业时间还缺版本与时区规则

需要补：

- `Asia/Shanghai` 固定展示。
- 市场公告有效期。
- 商户公告有效期。
- 临时休市。
- 临时延长营业。
- 按市场 / 按档口的营业差异。

### 5. 供应链上游关系仍未模型化

用户已明确需要：

- 养殖户。
- 种植户。
- 种苗批发。
- 外地批发商。
- 物料供应商。
- 配送供应商。

这些不能混成普通商户默认能力，需要独立角色和关系边界。

## 推荐 PR 顺序

### PR 1: `market-domain-contract-docs`

类型：docs-only。

内容：

- 市场实体字段。
- 商户-市场-档口关系。
- 营业时间和公告。
- 配送 profile。
- 供应商角色关系。
- 禁止影响 checkout / order / settlement / permission。

验证：

- `git diff --check`

### PR 2: `market-domain-read-model-contract`

类型：API read-only skeleton。

内容：

- 定义 TypeScript view shape。
- 不新增 migration。
- 不新增写 API。
- 不影响现有 route 输出。

验证：

- API typecheck。
- focused unit tests。

### PR 3: `admin-market-readiness-panel-plan`

类型：docs-only。

内容：

- Admin 市场配置页下一步只读面板结构。
- 哪些字段只是展示。
- 哪些字段未来才能写入。

验证：

- `git diff --check`

### PR 4: `vendor-market-context-readiness-plan`

类型：docs-only。

内容：

- Vendor 首页和设置页如何展示商户市场关系。
- 普通商户 / 物料供应商 / 配送供应商 / 上游供应商的差异。

验证：

- `git diff --check`

### PR 5: `storefront-market-discovery-readiness-plan`

类型：docs-only。

内容：

- Storefront 首页、搜索、店铺页如何消费市场域 read model。
- 自提 / 配送只展示到商家和档口层级，不展示在商品卡片层级。

验证：

- `git diff --check`

## 高风险边界

以下继续串行，不能混入市场域低风险 PR：

- checkout shipping options 生效。
- 运费计算。
- 订单履约。
- 物流状态。
- 快递打印。
- 商户结算。
- 佣金。
- 权限。
- 市场开关影响真实访问权限。

## 推荐下一项

执行 `market-domain-contract-docs`，先把真实市场域合同写清楚，再进入 read-only skeleton。
