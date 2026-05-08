# Storefront Adapter 页面绑定验证

更新时间：2026-05-09 Asia/Shanghai

## 目标

本轮对 Storefront home / shop / search 三个消费者页面的 adapter 只读绑定阶段做收口验证。验证范围覆盖 PR #260 到 PR #264 的页面绑定结果，确认这些改动仍然停留在展示层和本地 view model adapter 边界内。

本轮不新增页面功能，不修改 API，不接真实排序、广告、竞价、推荐、库存聚合、配送生效、购物车、订单、支付、退款、结算、佣金、打款、权限、履约、物流或真实 Provider。

## 已完成绑定

### 首页

- PR #260 `storefront-home-adapter-binding-readonly`
- PR #263 `storefront-home-product-cards-binding-readonly`
- 文件：`apps/storefront/src/app/[locale]/(main)/page.tsx`
- 当前页面构造 `buildChinaHomeViewModel(...)`
- 已绑定：
  - 首屏 active market 展示
  - 桌面市场类目
  - 移动端推荐档口
  - 移动端“今日鲜货”
  - 桌面推荐档口商品缩略卡
  - 桌面“今日上新”
- 未改变：
  - 商品详情真实来源
  - 加购
  - cart / checkout / order
  - 库存占用或履约

### 店铺页

- PR #261 `storefront-shop-header-adapter-binding-readonly`
- PR #264 `storefront-shop-product-cards-binding-readonly`
- 文件：`apps/storefront/src/app/[locale]/(main)/sellers/[handle]/page.tsx`
- 当前页面构造 `buildChinaShopViewModel(...)`
- 已绑定：
  - 店铺名称
  - 市场名称
  - 档口号
  - 公告 / 营业 / 履约提示
  - 直播状态 badge
  - 移动端“档口今日参考”
  - 桌面“常卖鲜货”
- 未改变：
  - Store API 真实商品卡
  - `ProductCard`
  - checkout shipping options
  - 加购、订单、支付或履约

### 搜索页

- PR #262 `storefront-search-adapter-binding-readonly`
- 文件：`apps/storefront/src/app/[locale]/(main)/search/page.tsx`
- 当前页面构造 `buildChinaSearchViewModel(...)`
- 已绑定：
  - query 展示
  - 市场配置展示
  - 类目结果
  - 店铺 / 档口结果
  - 静态商品样例结果
- 未改变：
  - Store API 真实商品结果
  - `ProductCard`
  - 搜索排序
  - 广告、竞价或推荐系统
  - cart / checkout / order / payment

## 验证结果

本轮已运行：

```bash
cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn/apps/storefront
/home/codex/.bun/bin/bun run build

cd /home/codex/code/fuyi-pr-bx-workflow-handoff-cn
git diff --check
git diff --name-only
```

- Storefront build 通过。
- `git diff --check` 通过。
- 本轮 diff 仅包含任务文件、验证文档、队列和 ledger 文件。
- 本轮没有修改 `apps/**` 或 `packages/**` 业务代码。
- `docs/visual-qa-artifacts/` 仍是本地截图产物目录，不纳入本 PR。

## 已知警告

Storefront build 仍可能输出既有 React Hook dependency warnings。本阶段这些 warning 属于历史范围，本轮不扩大修复：

- `apps/storefront/src/components/organisms/ShippingAddress/ShippingAddress.tsx`
- `apps/storefront/src/components/cells/PasswordValidator/PasswordValidator.tsx`
- `apps/storefront/src/components/cells/CartDropdown/CartDropdown.tsx`
- `apps/storefront/src/components/sections/CartAddressSection/CartAddressSection.tsx`

## 风险边界

- 当前 adapter 绑定只负责消费者页面展示字段，不是价格、库存、配送、履约或结算事实来源。
- 首页和店铺页的样例商品卡仍是展示辅助，不占库存，不创建购物车或订单。
- 搜索页真实商品仍来自既有 Store API，不接真实排序、广告、竞价或推荐系统。
- Storefront discovery / markets read model 仍是只读基础，不等同于完整市场运营模型。
- 支付、退款、结算、佣金、打款、权限、履约和物流仍是高风险串行任务。

## 回滚方式

如任一页面展示异常，可按页面单独回滚对应绑定 PR：

- 首页首屏：回滚 PR #260 的 `page.tsx` 绑定片段。
- 首页商品卡：回滚 PR #263 的 `freshProducts` 输入和派生展示片段。
- 店铺头部：回滚 PR #261 的 `shopViewModel` 头部字段使用片段。
- 店铺商品卡：回滚 PR #264 的 `shopViewModel.products` 派生展示片段。
- 搜索页：回滚 PR #262 的 `searchViewModel` 结果展示片段。

Adapter skeleton 文件可保留，因为它们仍是本地只读纯函数，不会单独改变运行时交易行为。
