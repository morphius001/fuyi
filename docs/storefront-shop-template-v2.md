# Storefront Shop Template V2

更新时间：2026-05-08 Asia/Shanghai

## 目标

本轮把消费者端店铺 / 档口主页 v2 做成更适合本地生鲜海鲜场景的第一版：用户先看市场、档口、营业状态和配送 / 自提方式，再进入商品区查看规格和价格。

## 本轮改动

- 店铺页文案去掉 `Store API`、`只读配置`、`安全边界`、`样例不直接加购` 等工程化表达。
- 移动端商品区从“真实可购商品”改为“今日可买”，说明改为进入详情页看规格后加入购物车。
- 档口样例区改为“档口今日参考 / 常卖鲜货”，强调价格库存以商家确认为准。
- 配送、自提、市场能力继续放在店铺头部和侧栏说明，商品卡只做轻提示。
- 底部移动操作改为消费者语言：先看规格再下单，结算页确认配送和费用。

## 未做内容

- 不接新的后端接口。
- 不修改 checkout、cart、order、payment、refund、settlement、commission、payout、permission 或 fulfillment runtime。
- 不接真实客服、直播、物流、库存扣减、提货卡兑换或支付服务。
- 不让店铺页决定真实配送服务、运费、订单履约或支付状态。

## 验证结果

- `cd apps/storefront && bun run build` 通过。
- `cd apps/storefront && bun run lint` 通过。
- `git diff --check` 通过。
- `http://127.0.0.1:3101/cn/sellers/a-hai-xian-huo-dang` 返回 200。
- 桌面截图已生成：`docs/visual-qa-artifacts/storefront-shop-v2-desktop.png`。
- 移动截图已生成：`docs/visual-qa-artifacts/storefront-shop-v2-mobile.png`。

截图只作为本地视觉 QA 产物，不纳入提交。

## 风险

- 店铺页仍包含展示样例，不能视为真实库存、价格或履约承诺。
- 真实商品区依赖已有商品详情和购物车流程，本轮不改变它们。
- 移动端底部导航仍属于现有移动壳，本轮只调整店铺页自身文案。

## 回滚方式

本轮主要改动集中在 `apps/storefront/src/app/[locale]/(main)/sellers/[handle]/page.tsx`，可通过回滚本 PR 恢复上一版店铺页。由于未修改 API、数据库、checkout 或交易链路，回滚不需要数据迁移。
