# Storefront Adapter Binding Sequence Plan

更新时间：2026-05-08 Asia/Shanghai

## 目标

Storefront 已有三个本地只读 adapter skeleton：

- `buildChinaHomeViewModel()` -> `storefront-home-market-shop-v2`
- `buildChinaShopViewModel()` -> `storefront-shop-stall-v2`
- `buildChinaSearchViewModel()` -> `storefront-search-market-results-v1`

下一阶段可以把页面从静态展示逐步绑定到这些 adapter 输出。但绑定必须按小 PR 串行推进，每个 PR 只动一个页面 surface，且只读展示，不改变购物车、库存、结算、订单、支付、退款、结算、佣金、打款、权限、履约、物流或真实 Provider。

## 总体顺序

建议顺序：

1. `storefront-home-adapter-binding-readonly`
2. `storefront-shop-header-adapter-binding-readonly`
3. `storefront-search-adapter-binding-readonly`
4. `storefront-home-product-cards-binding-readonly`
5. `storefront-shop-product-cards-binding-readonly`
6. `storefront-binding-validation`

这样先让消费者主入口稳定读取统一 view model，再逐步替换商品卡数据源，避免一次性重写首页、店铺页和搜索页。

## PR 1: 首页首屏只读绑定

任务名：`storefront-home-adapter-binding-readonly`

允许范围：

- 首页 data composition 文件
- 首页首屏市场 / 类目 / 店铺展示组件
- 必要的文档、任务文件、ledger

只允许绑定：

- 市场切换展示
- 类目导航展示
- 店铺 / 档口推荐展示
- static fallback

禁止：

- 商品详情页
- 购物车按钮行为
- checkout
- order
- payment
- fulfillment
- B-side 物料 / 配送 / 上游供给主入口

验证：

- `cd apps/storefront && bun run build`
- 首页桌面截图
- 首页移动端截图
- `git diff --check`

回滚：

- 恢复首页首屏使用现有静态展示数据。
- 保留 adapter 文件不删除，避免影响后续计划。

## PR 2: 店铺头部只读绑定

任务名：`storefront-shop-header-adapter-binding-readonly`

允许范围：

- 店铺页 data composition 文件
- 店铺头部 / 档口信息 / 市场上下文 / 公告 / 配送说明展示组件
- 必要的文档、任务文件、ledger

只允许绑定：

- 店铺名称
- 市场名称
- 档口号
- 营业时间
- 公告
- 配送 / 自提说明
- 直播状态 badge 占位
- 提货卡独立入口提示

禁止：

- checkout shipping options
- 真实运费
- 发货 / 履约状态
- 购物车和订单写入
- 真实直播 / IM / 推流
- 真实提货卡兑换

验证：

- `cd apps/storefront && bun run build`
- 店铺页桌面截图
- 店铺页移动端截图
- `git diff --check`

回滚：

- 恢复店铺头部使用当前静态展示数据。

## PR 3: 搜索结果只读绑定

任务名：`storefront-search-adapter-binding-readonly`

允许范围：

- 搜索页 data composition 文件
- 搜索结果分组展示组件
- 必要的文档、任务文件、ledger

只允许绑定：

- query
- market context
- 市场 / 类目 / 店铺 / 商品结果分组
- 无结果提示
- static fallback

禁止：

- 真实排序
- 广告
- 竞价
- 推荐系统
- 自动询价
- 自动补货
- 自动客服
- 购物车 / 订单写入

验证：

- `cd apps/storefront && bun run build`
- 搜索有结果截图
- 搜索无结果截图
- 移动端搜索截图
- `git diff --check`

回滚：

- 恢复搜索页使用当前静态/现有展示数据。

## PR 4: 首页商品卡只读绑定

任务名：`storefront-home-product-cards-binding-readonly`

只允许绑定：

- 今日鲜货商品标题
- 规格
- 价格文案
- 库存提示
- 所属店铺 / 市场 / 档口

禁止：

- 库存占用
- cart mutation
- order mutation
- checkout shipping options
- payment / refund / settlement / commission / payout

验证：

- 首页桌面和移动端截图
- 商品卡字段对齐检查
- `cd apps/storefront && bun run build`

## PR 5: 店铺商品卡只读绑定

任务名：`storefront-shop-product-cards-binding-readonly`

只允许绑定：

- 当前店铺商品列表
- 规格、价格、库存提示
- 商品来源店铺 / 档口

禁止：

- 跨店购物车规则
- 库存占用
- 真实配送规则
- 订单、支付、退款、履约状态

验证：

- 店铺页桌面和移动端截图
- 不同店铺商品隔离检查
- `cd apps/storefront && bun run build`

## PR 6: 绑定验证

任务名：`storefront-binding-validation`

验证：

- 首页、店铺页、搜索页构建通过。
- 桌面 / 移动截图覆盖主路径。
- 没有把 B-side 物料、配送供应商、上游、种苗和外地批发放进消费者主路径。
- 没有页面展示 `fallback`、`mock`、`metadata`、`API failed` 等内部字段。
- 没有 checkout/cart/order/payment/refund/settlement/commission/payout/permission/fulfillment runtime diff。

## 视觉 QA 要求

每个页面绑定 PR 必须生成本地截图，但截图只放 `docs/visual-qa-artifacts/` 作为本地 QA 产物，不提交。

建议视口：

- desktop: 1440 x 1000
- mobile: 390 x 844

## 结论

可以进入只读页面绑定，但必须先从首页首屏开始，避免同时改多个消费者路径。所有交易和履约相关能力继续保持只读展示或独立后续高风险串行任务。
