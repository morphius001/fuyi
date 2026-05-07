# Preprod Market Membership Dry-Run Checklist

更新时间：2026-05-07 Asia/Shanghai

## 目标

在真实注册 market membership migration 之前，先把预发 disposable DB dry-run 的条件、步骤、回滚和验收标准固定下来。

本文件只做 checklist，不执行任何数据库命令，不修改 migration，不写 seed，不接入真实业务流程。

## 适用范围

表：

- `china_market`
- `china_market_membership`
- `china_seller_role`
- `china_market_announcement`
- `china_market_business_hour`
- `china_market_delivery_profile`

链路：

- migration up/down
- repository adapter
- Vendor market context route
- Admin market readonly view
- Storefront markets readonly API

## 绝对前置条件

执行预发 dry-run 前必须逐项确认：

- 目标数据库是预发 disposable DB。
- 目标数据库可删除、可重建、可回滚。
- 目标数据库不含生产用户、生产商户、生产订单、生产支付、生产退款、生产结算或生产权限数据。
- 用户明确给出目标 DB 名称、host、port、user，但不得把真实密码写入仓库。
- 如果目标库有数据，必须先明确备份文件路径或书面确认无需备份。
- 当前任务不得指向生产 `DATABASE_URL`。
- 当前任务不得使用真实微信支付、支付宝、短信、IM、物流、直播或 AI provider credential。
- 当前任务不得运行 production seed。

## 禁止事项

预发 dry-run 阶段禁止：

- 在生产数据库执行。
- 自动注册 production migration。
- 写入真实商户资料、手机号、证照、订单、支付单、退款单、物流单或结算单。
- 修改 checkout、订单、支付、退款、结算、佣金、权限或真实履约逻辑。
- 创建 Admin 写接口或让模块开关真实生效。
- 把 dry-run fixture 当生产 seed 使用。
- 在没有完整日志和回滚结果时进入真实 migration 注册。

## 环境确认清单

执行人必须记录：

| 项目           | 必填内容                                             |
| -------------- | ---------------------------------------------------- |
| 环境名称       | 例如 `preprod-disposable-market-membership`          |
| DB host        | 不写密码                                             |
| DB port        | 例如 `5432`                                          |
| DB name        | 必须带 dry-run/preprod/disposable 语义               |
| DB user        | 不写密码                                             |
| 是否含生产数据 | 必须为否                                             |
| 备份路径       | 如无需备份，写明原因                                 |
| 回滚方式       | down migration / drop disposable DB / restore backup |
| 执行窗口       | 具体日期和 Asia/Shanghai 时间                        |
| 负责人         | 执行人和复核人                                       |

## 执行步骤

### 1. 只读连通性检查

- 确认 DB 可连接。
- 确认当前用户权限只覆盖 dry-run 所需 schema。
- 确认目标库不是生产库。
- 记录当前表列表。

### 2. Migration up dry-run

- 使用 market membership migration skeleton 对目标库执行 up。
- 保存完整 SQL 日志。
- 保存命令输出。
- 不运行 production seed。

### 3. 表结构检查

必须确认 6 张表存在：

- `china_market`
- `china_market_membership`
- `china_seller_role`
- `china_market_announcement`
- `china_market_business_hour`
- `china_market_delivery_profile`

必须确认关键约束：

- market status check。
- membership status check。
- seller role key/status check。
- announcement audience/status/severity check。
- business hour weekday check。
- delivery type check。
- checkout impact 必须保持 `none`。
- soft delete 字段和索引符合设计。

### 4. 最小 fixture

只允许写入 dry-run 假数据：

- market：`market_preprod_dry_run_001`
- seller：`sel_preprod_dry_run_001`
- booth：`A区18号`
- role：`seafood_stall`
- delivery：`market_pickup`、`market_unified_delivery`
- announcement：商户公告和消费者公告各一条

禁止使用：

- 真实手机号。
- 真实营业执照、许可证、身份证。
- 真实订单号、支付单号、退款单号、物流单号。
- 真实 provider credential。

### 5. Read Model 验证

必须验证：

- repository adapter 能读取 rows。
- Vendor route 当前 seller 有 membership 时进入 repository mode。
- Vendor route 表缺失时 fallback。
- Vendor route 当前 seller 无 membership 时 fallback。
- market filter 只返回当前 seller 拥有的市场。
- `runtimeEnabled` 仍为 `false`。
- `checkoutImpact` 仍为 `none`。

### 6. Admin/Storefront 只读验证

Admin：

- 市场详情 ready。
- empty memberships。
- fallback/error。
- 不出现保存、发布、生效按钮。

Storefront：

- markets API ready。
- markets API empty。
- markets API fallback/error。
- 不影响 checkout。

### 7. Migration down / rollback

必须至少完成一种：

- down migration 成功删除 6 张表。
- 或 drop disposable DB 成功。
- 或 restore backup 成功。

回滚后必须确认：

- seller/product/order/payment/refund/settlement/commission/permission 相关表不受影响。
- Vendor route fallback 可用。
- API typecheck/build 可恢复。

## 退出标准

只有全部满足才允许进入下一阶段：

- up 成功。
- 表和约束检查成功。
- 最小 fixture 成功。
- Vendor repository/fallback 三态成功。
- Admin/Storefront 只读三态成功。
- down/rollback 成功。
- 无支付、订单、退款、结算、佣金、权限、真实履约 diff。
- 日志和截图已归档。

## 失败处理

任一失败时：

1. 停止后续步骤。
2. 保留日志。
3. 执行 rollback。
4. 记录失败原因。
5. 不进入真实 migration 注册。

## 后续任务

通过本 checklist 后，仍然不能直接上线。下一步应先做：

1. `market-membership-repository-integration-test`
2. `admin-market-readonly-api-db-qa`
3. `storefront-market-readonly-api-db-qa`
4. `admin-market-membership-browser-qa`

真实 migration 注册必须等本地、预发、浏览器 QA 全部通过后单独串行执行。
