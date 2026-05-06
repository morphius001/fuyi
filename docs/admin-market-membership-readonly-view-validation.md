# Admin Market Membership Readonly View Validation

更新时间：2026-05-07 Asia/Shanghai

## 结论

Admin 市场/商户关系只读视图已经在当前 main 具备，不需要重复实现页面。

现有入口：

- 市场能力列表：`/cn/operations/market-capabilities`
- 市场详情只读页：`/cn/operations/market-capabilities/:id`
- 路由文件：`apps/admin/src/routes/cn/operations/market-capabilities/[id]/page.tsx`
- 页面组件：`apps/admin/src/components/ChinaAdminMarketDetailReadonly.tsx`

## 已覆盖能力

只读详情页已展示：

- 市场基础信息：名称、slug、省市区、地址、时区、营业信息、公告/服务范围 metadata。
- 商户市场关系：商户名称、handle/id、档口号、档口名称、主档口标记、状态。
- 配送 profile：名称、类型、服务范围、截单时间、启用状态。
- 营业时间：星期、开闭市时间、开闭状态、备注。
- 市场公告：标题、内容、audience、severity、status。
- 只读边界：`runtimeEnabled` 与 API note。

## 验证结果

通过：

```bash
bun --cwd apps/admin build
git diff --check
```

静态检查：

```bash
test -f apps/admin/src/routes/cn/operations/market-capabilities/[id]/page.tsx
grep -RIn 'MembershipsTable\|DeliveryProfilesTable\|BusinessHoursTable\|AnnouncementsTable\|ReadonlyBoundary' apps/admin/src/components/ChinaAdminMarketDetailReadonly.tsx
```

结果确认：

- Admin build passed.
- 详情页路由存在。
- 详情页包含 membership、delivery profile、business hours、announcement、readonly boundary 五个关键只读区。

## 安全边界

本任务没有修改业务代码，也没有引入：

- 保存、发布、启用、禁用等写操作。
- 新的 Admin API。
- `packages/api/medusa-config.ts` 注册改动。
- checkout、订单、支付、退款、结算、佣金、权限或真实履约逻辑。
- 真实短信、IM、物流、直播、AI 或支付 provider。

## 后续建议

- 真正运行 migration 后，再做一次真实 DB 数据下的浏览器 QA。
- 如果运营希望跨市场聚合查看全部 membership，可以新增独立只读列表页；当前详情页已经满足单市场查看。
