# Task: vendor-shell

## Goal

把 `apps/vendor` 改造成中国大陆商户后台基础版。不只是翻译，要强化商户后台壳，形成适合中国大陆商家日常运营的基础信息架构和页面骨架。

## Read First

- `AGENTS.md`
- 本文件 `.codex/tasks/vendor-shell.md`
- `apps/vendor/CLAUDE.md`
- `apps/vendor/src/README.md`

## Allowed Changes

- `apps/vendor/**`

## Forbidden Changes

- 禁止修改 `apps/admin/**`
- 禁止修改 `apps/storefront/**`
- 禁止修改 `packages/api/**`
- 禁止修改支付、订单、退款、结算、佣金、权限业务逻辑
- 不接真实 API
- 不实现真实发货、退款、结算
- 禁止写入真实密钥
- 不要自动提交
- 不要 push

## Shell Requirements

- 保留现有商户后台认证、Provider、ProtectedRoute 和权限边界。
- 不要绕过商户身份、订单归属、结算和权限控制。
- 可以在现有扩展机制内实现中国大陆商户后台壳。

## Menu Structure

一级菜单：

- 首页
- 商品管理
- 订单管理
- 物流管理
- 售后管理
- 客服管理
- 店铺管理
- 结算管理
- 评价管理
- 账号权限

菜单可以先链接到已有页面、只读占位页或 mock 数据页。不要新增真实状态变更。

## Home Metrics

首页指标应偏商户日常经营视角，可使用 mock 或只读占位数据：

- 今日成交额
- 今日订单数
- 待发货订单
- 待处理售后
- 在售商品数
- 库存预警
- 未读客服消息
- 待结算金额
- 店铺评分

必须明确 mock/placeholder 数据来源，不要伪装为真实 API 数据。

## Page Skeleton Requirements

每个页面骨架应包含：

- 中文标题
- 简短业务说明
- 关键指标或状态筛选
- 空状态
- 错误或禁用状态说明
- 后续接真实 API 的 TODO 或注释，保持简洁

页面骨架不得执行真实发货、退款、结算、库存扣减或权限变更。

## Verification

优先运行：

```bash
bun --cwd apps/vendor run lint
bun --cwd apps/vendor run build
```

如任务影响共享类型或根配置，再运行：

```bash
bun run lint
bun run check-types
```

手动验证：

- Vendor 登录/保护路由仍由现有外层处理。
- 所有一级菜单可访问或有明确占位。
- 不存在真实发货、退款、结算调用。
- 商户权限和订单归属边界未改动。

## Output

完成后只输出：

- 修改文件
- 验证结果
- 风险点
- 下一步建议

