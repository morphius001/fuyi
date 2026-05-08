# Storefront Home Template V2

更新时间：2026-05-08 Asia/Shanghai

## 目标

本轮把消费者首页第一版模板从说明型页面收口为本地生鲜/海鲜平台首页：用户先选市场，再看档口，再看今日鲜货。页面仍使用现有静态展示数据和既有链接，不接新后端接口，不改变交易链路。

## 本轮改动

- 桌面端左侧类目改成单一“市场类目”，避免“全部类目 / 市场类目”重复。
- 桌面端主视觉文案收短，突出本地鲜货市场、档口和今日鲜货。
- 桌面端推荐档口和今日上新模块增加清晰标题，降低解释性文字。
- 移动端首屏改为 App-like 短首页：市场信息、搜索、横滑类目、推荐档口、今日鲜货。
- 移动端移除“今日行情”大块模块，避免首页过长。
- 商品卡不再把配送能力写成商品事实，只保留“自提/配送进店确认”这类轻提示。

## 未做内容

- 不接真实市场、档口、商品、库存、价格、配送或支付接口。
- 不修改 checkout、cart、order、payment、refund、settlement、commission、payout、permission 或 fulfillment runtime。
- 不增加物料供应商、配送供应商、养殖户/种植户、种苗供应商和外地批发商的消费者首页入口。
- 不接真实提货卡兑换、直播、客服、物流或支付服务。

## 视觉边界

消费者首页主路径：

```text
选市场 -> 找店/档口 -> 看今日鲜货 -> 加购/去结算
```

后台能力、商家能力和供应链能力继续放在 Admin/Vendor 或独立页面，不抢消费者首页注意力。

## 验证结果

- `cd apps/storefront && bun run build` 通过。
- `cd apps/storefront && bun run lint` 通过。
- `git diff --check` 通过。
- `http://127.0.0.1:3101/cn` 返回 200。
- 桌面截图已生成：`docs/visual-qa-artifacts/storefront-home-v2-desktop.png`。
- 移动截图已生成：`docs/visual-qa-artifacts/storefront-home-v2-mobile.png`。

截图只作为本地视觉 QA 产物，不纳入提交。

## 风险

- 首页仍使用现有静态展示数据，不能视为真实库存、价格或履约承诺。
- 移动端底部导航会遮挡最后一屏底部，这是现有移动壳通用问题，本轮不扩大范围处理。
- 搜索、类目和档口链接仍沿用当前 Storefront 路由，后续可由模板系统或真实 discovery view model 继续替换。

## 回滚方式

本轮主要改动集中在 `apps/storefront/src/app/[locale]/(main)/page.tsx`，可通过回滚本 PR 恢复上一版首页。由于未修改 API、数据库、checkout 或交易链路，回滚不需要数据迁移。
