# Task: admin-shell

## Goal

把 `apps/admin` 改造成中国大陆平台运营后台基础版。不只是翻译，要强化 `ChinaAdminShell`：形成适合平台运营人员使用的后台壳、菜单结构、首页指标和提货卡管理入口。

## Read First

- `AGENTS.md`
- 本文件 `.codex/tasks/admin-shell.md`
- `apps/admin/CLAUDE.md`
- `apps/admin/src/README.md`

## Allowed Changes

- `apps/admin/**`

## Forbidden Changes

- 禁止修改 `packages/api/**`
- 禁止修改 `apps/vendor/**`
- 禁止修改 `apps/storefront/**`
- 禁止修改支付、订单、退款、结算、佣金、权限业务逻辑
- 禁止接入真实卡密、兑换、订单、库存、物流、支付、结算逻辑
- 禁止写入真实密钥
- 不要自动提交
- 不要 push

## Shell Requirements

- 保留 `@mercurjs/admin` 外层认证、Provider、ProtectedRoute。
- 不要绕过现有认证、权限和 route 保护。
- 可以在现有扩展机制内实现中国大陆运营后台壳。
- 如果需要命名新壳组件，优先使用 `ChinaAdminShell`。

## Menu Structure

建议一级菜单：

- 首页
- 商家管理
- 商品管理
- 订单管理
- 售后管理
- 提货卡管理
- 支付与对账
- 结算管理
- 营销管理
- 客服与消息
- 风控管理
- 系统设置

菜单可以先链接到已有页面、只读占位页或 mock 数据页。不要新增真实状态变更。

## Dashboard Metrics

首页指标应偏平台运营视角，可使用 mock 或只读占位数据：

- 今日成交额
- 今日订单数
- 待处理售后
- 待审核商家
- 上架商品数
- 活跃商家数
- 提货卡待处理事项
- 服务通知异常数

必须明确 mock/placeholder 数据来源，不要伪装为真实 API 数据。

## Pickup Card Management

提货卡是线下实体卡，线上使用卡号/卡密/二维码兑换商品或套餐并发货。

明确不是：

- 不是优惠券
- 不是满减券
- 不是折扣券
- 不是储值卡
- 不是支付方式

提货卡菜单建议：

- 提货卡概览
- 卡种管理
- 批次管理
- 卡号查询
- 兑换记录
- 风控与冻结
- 操作日志

页面和状态要求：

- 第一版可以使用 mock 数据。
- 状态建议包含：草稿、待启用、已启用、已冻结、已过期、已作废、已兑换、部分兑换。
- 显示卡种、批次、面值或权益描述、有效期、库存/发卡量、已兑换数、冻结数。
- 卡密必须脱敏显示；不要生成真实卡密。
- 不实现真实兑换、订单创建、库存扣减、物流发货、支付、结算。

## Verification

优先运行：

```bash
bun --cwd apps/admin run lint
bun --cwd apps/admin run build
```

如任务影响共享类型或根配置，再运行：

```bash
bun run lint
bun run check-types
```

手动验证：

- Admin 登录/保护路由仍由现有 `@mercurjs/admin` 外层处理。
- 所有一级菜单可访问或有明确占位。
- 提货卡页面明确为 mock/placeholder。
- 没有真实卡密、兑换、订单、库存、物流、支付、结算逻辑。

## Output

完成后只输出：

- 修改文件
- 验证结果
- 风险点
- 下一步建议

