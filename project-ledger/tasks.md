# 后续任务队列

## 下一批建议

1. Admin 模块开关后端设计
   - 已完成第一层只读 capability API 契约。
   - 已覆盖市场、商户类型、物料供应商、配送供应商、直播、提货卡、快递打印、移动端快速上架、AI 上架草稿、商家装修、上游供应和支付/结算高风险边界。
   - Admin 模块开关页已读取登录态 `/admin/china/capabilities`，未登录或读取失败时回退只读 mock 边界说明。
   - 下一步再做真实配置存储、审计字段和 Admin UI 接入；暂时不要让开关改变业务行为。

2. Storefront 搜索页真实店铺/市场/类目
   - 商品结果已接 Store API，样例入口已明确降级。
   - 已新增 `/store/china/discovery` 只读发现 API：店铺来自 seller 表，类目来自 product_category 表，市场作为配置契约。
   - Storefront 搜索页已读取 discovery 数据。
   - Demo 类目已从服装占位收口为国内生鲜类目：鲜活蟹类、鲜活虾类、冰鲜鱼类、贝类净养。
   - 下一步才做真实市场模型、搜索排序、距离/配送覆盖和类目商品数量聚合。

3. Vendor 供应商角色真实 capability view
   - 首页已新增供应方角色开通矩阵。
   - 后端已新增 `/store/china/vendor-capabilities` 只读 capability view。
   - Vendor 首页已新增“后端能力契约”区块读取这个只读 view。
   - 下一步才考虑菜单显隐和商户类型配置；仍不要改变真实权限、接单、履约、结算行为。

4. 商家履约配置真实化
   - 商家页已按当前档口过滤商品。
   - Demo seller seed 已写入市场、档口、类目、资质和履约方式 metadata。
   - 商家页已优先从 seller metadata 读取配送/自提规则，读取不到再回退静态 profile。
   - 下一步才做真实商家履约配置模型和后台维护入口，不要让展示字段直接改变结算页 shipping options。

5. 地址与履约表单
   - 中国省/市/区县/街道/详细地址。
   - 同一市场内统一配送和商家自配送都要能表达。
   - Storefront 地址表单已完成第一层字段顺序收口；本轮不改地址模型、结算提交、配送选项或订单逻辑。

6. 第十轮设计任务
   - `market-model-backend-design` 已完成，定义多市场、商户跨市场、档口、营业时间、公告、配送规则和角色边界。
   - `admin-module-config-contract-design` 已完成，定义平台/市场/商户类型/单商户配置层级、审计、幂等、回滚和高风险阻断。
   - `vendor-fulfillment-config-design` 已完成，定义统一配送、商家自配送、自提、配送供应商和未来 checkout 接入边界。
   - `integration-release-readiness` 已完成，明确当前 integration 只适合作为本地集成基线，后续必须拆 PR，不 push、不创建 PR。

## 当前边界

第十轮队列已清空。下一步不是继续往三端混写功能，而是按 `docs/integration-release-readiness.md` 做拆 PR / staging 准备。

推荐顺序：

1. PR A: Codex 工作流、ledger、启动脚本和已审查任务文件。
2. PR B: API 只读能力契约、discovery、seller products 和 demo seed。
3. PR C: Storefront 消费端本地化、真实商品读取、搜索/店铺/地址/购物车文案。
4. PR D: Admin 中国平台运营后台壳和只读 capability 展示。
5. PR E: Vendor 中国商户后台壳和只读 capability 展示。
6. PR F: Mock provider skeleton。
7. PR G: 架构和下一阶段设计文档。

高风险串行任务仍然延后：支付、退款、对账、结算、佣金、权限、真实配送生效、Admin 模块开关真实落库和 checkout shipping options 生效。

## 第十一轮 Docs-only Staging 准备

1. `integration-pr-staging-index`
   - 状态：done。
   - 目标：按 `docs/integration-release-readiness.md` 生成 PR A-G staging 索引。
   - 范围：只改 `.codex/tasks/integration-pr-staging-index.md`、`docs/integration-pr-staging-index.md`、`.codex/queue.md` 和 `project-ledger/**`。
   - 禁止：不改 `apps/**`、`packages/**`，不 push，不创建 PR，不触碰高风险业务逻辑。

第十一轮队列已清空。没有明确 staging 目标前，自动队列暂停在拆 PR 边界。

## 高风险串行任务

- Mock China Payment Provider
- 支付通知幂等框架
- 支付宝 Provider
- 微信支付 Provider
- 退款
- 对账
- 商家结算

这些任务不能和订单、支付、退款、结算、佣金、权限相关改动混在普通 UI PR 里。
