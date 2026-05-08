# Template Preview V2 Validation

更新时间：2026-05-08 Asia/Shanghai

## 范围

本报告汇总第九十八轮四个低风险 template v2 surface：

- `storefront-home-template-v2`
- `storefront-shop-template-v2`
- `admin-dashboard-template-v2`
- `vendor-role-workspace-template-v2`

四个 PR 都是展示层或文档/ledger 改动，不改变 checkout、cart、order、payment、refund、settlement、commission、payout、permission 或 fulfillment runtime。

## 合并状态

- Storefront 首页 v2：已合并。
- Storefront 店铺页 v2：已合并。
- Admin 运营首页 v2：已合并。
- Vendor 多角色经营看板 v2：已合并。

## 验证摘要

Storefront 首页 v2：

- `cd apps/storefront && bun run build` 通过。
- `cd apps/storefront && bun run lint` 通过，保留既有 React Hook warning。
- `/cn` HTTP 200。
- 桌面和移动截图已本地检查。

Storefront 店铺页 v2：

- `cd apps/storefront && bun run build` 通过。
- `cd apps/storefront && bun run lint` 通过，保留既有 React Hook warning。
- `/cn/sellers/a-hai-xian-huo-dang` HTTP 200。
- 桌面和移动截图已本地检查。

Admin 运营首页 v2：

- `cd apps/admin && bun run lint` 通过。
- `cd apps/admin && bun run build` 通过。
- `/dashboard/cn` HTTP 200。
- 子 agent 复核确认未修改订单、支付、退款、结算、佣金、权限或履约 runtime。

Vendor 多角色经营看板 v2：

- `cd apps/vendor && bun run lint` 通过。
- `cd apps/vendor && bun run build` 通过。
- `/` HTTP 200。
- 桌面截图已本地检查。
- 子 agent 复核发现两个 UI 文案 P2：模板 id/回滚工程文案外露、静态“当前主角色”可能误导真实权限。二者已在提交前修复。

## 视觉产物边界

截图和浏览器 QA 产物继续保留在本地 `docs/visual-qa-artifacts/**`，不纳入提交。后续如需要长期保存截图，应单独建立轻量 QA artifact 策略，不和代码 PR 混入。

## 当前风险

- Storefront 首页和店铺页仍有静态展示数据，不能当成真实库存、价格、履约承诺或市场运营配置。
- Admin 首页指标仍是展示数据，不是运营真实报表。
- Vendor 角色看板仍是只读预览，不是权限、开通状态或真实接单能力。
- 模板 registry 已有只读 TypeScript contract，但四个页面尚未从统一 template registry / view model 读取模板。

## 下一轮建议

1. `template-preview-v2-post-merge-validation`：docs-only 记录四个 PR 在最新 main 上的最终验证。
2. `template-registry-surface-binding-plan`：规划 Storefront/Admin/Vendor 如何从统一模板 registry 或稳定 view model 读取模板 id、可见模块和回滚策略，不改页面。
3. `vendor-role-workspace-visual-qa`：只做浏览器截图/人工检查清单，判断多角色经营看板是否过密。
4. `storefront-template-data-source-plan`：规划消费者首页/店铺页从静态展示数据切到真实 discovery/shop read model 的步骤。

高风险方向继续保持串行阻塞：支付、退款、对账、结算、佣金、权限、真实履约、真实物流、真实直播、真实提货卡兑换。
