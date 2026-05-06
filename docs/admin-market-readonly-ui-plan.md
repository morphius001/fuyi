# Admin Market Readonly UI Plan

更新时间：2026-05-07 Asia/Shanghai

## 结论

Admin 可以开始规划接入 `/admin/china/markets*` 只读 API，但第一步只做只读页面数据替换，不提供保存、发布、审核或权限变更。

本计划不修改 `apps/**`。

## 可用 API

- `GET /admin/china/markets`
- `GET /admin/china/markets/:id`
- `GET /admin/china/module-configs`
- `GET /admin/china/module-configs/effective`

## 接入顺序

### PR AB1: Admin Market Client

范围：

- 在 Admin 数据层新增 markets readonly client。
- 不改页面。
- 不改权限。

验证：

```bash
cd apps/admin && bun run lint
cd apps/admin && bun run build
```

### PR AB2: Market Settings Readonly Page

范围：

- 市场配置页读取 `/admin/china/markets`。
- 展示市场名、城市、状态、档口数量、公告和配送展示能力。
- 保持只读提示。

非目标：

- 不保存市场。
- 不修改档口关系。
- 不发布公告。
- 不让配送生效。

### PR AB3: Market Detail Readonly Page

范围：

- 市场详情读取 `/admin/china/markets/:id`。
- 展示 memberships、announcements、businessHours、deliveryProfiles。
- 操作按钮禁用或标为“后续接入”。

### PR AB4: Module Config Cross Link

范围：

- 模块开关页可展示当前 market context 的 effective config。
- 不改变菜单或权限。

## UI 边界

Admin 看到市场配置，不代表：

- 市场已经真实落库。
- 商户档口关系可编辑。
- 配送规则影响 checkout。
- 模块开关影响权限。
- 订单、支付、退款、结算或履约已经改变。

## 验收重点

- 页面有明确只读/mock/source 标记。
- 空 API/fallback 不白屏。
- 高风险按钮不可点击。
- 不出现“保存成功”“发布成功”等误导文案。
- 不影响现有 Admin 登录和 ProtectedRoute。

## 禁止混入

- Admin 写接口。
- market migration。
- RBAC/permission。
- checkout shipping options。
- 订单履约。
- 支付、退款、结算、佣金。
- 真实物流、短信、IM、直播、AI。

## 下一步

下一步可创建 `admin-market-client` 任务文件，只新增 Admin 数据 client，不改页面。
