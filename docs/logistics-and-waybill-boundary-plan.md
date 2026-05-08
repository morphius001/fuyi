# Logistics And Waybill Boundary Plan

更新时间：2026-05-08 19:24 Asia/Shanghai

## 结论

配送和快递面单要拆成四层，不能直接从 UI 进入真实发货或真实打印：

1. 展示层：消费者和商户看到支持哪些方式。
2. 配置层：市场、商户、配送供应商的只读或草稿配置。
3. 执行层：真实报价、下单、派送、追踪、回写。
4. 面单层：真实电子面单、云打印、取消面单、重打。

当前只适合做展示层和只读配置层，不适合进入执行层或面单层。

## 履约方式

| 方式 | 当前可做 | 当前禁止 |
| --- | --- | --- |
| 到档自提 | 只读展示、商户说明 | 不创建自提核销 |
| 商家自行配送 | 只读展示、配置草案 | 不确认发货、不创建配送任务 |
| 市场统一配送 | 只读展示、市场能力说明 | 不写 checkout shipping options |
| 配送供应商 | 供应商角色和能力只读 | 不派单、不报价、不接真实供应商 |
| 冷链/快递 | 面单计划和 mock 状态 | 不生成真实运单、不云打印 |

## Storefront 边界

消费者侧可以展示：

- 店铺/档口支持的配送方式。
- 到档自提说明。
- 是否支持市场统一配送。
- 是否支持商家自行配送。
- 商品详情页的冷链提示。

消费者侧不能做：

- 直接选择未接入 checkout 的配送方式。
- 展示虚假的实时运费。
- 展示真实物流轨迹。
- 触发面单生成。

## Vendor 边界

Vendor 侧可以规划：

- 配送方式说明。
- 商家是否愿意使用市场统一配送。
- 商家自行配送服务范围。
- 配送供应商合作状态。
- 快递打印 mock 入口。

Vendor 侧当前不能做：

- 确认真实发货。
- 创建真实履约单。
- 请求真实物流报价。
- 生成真实运单号。
- 打印真实面单。
- 回写订单物流状态。

## Admin 边界

Admin 侧可以规划：

- 市场配送规则。
- 配送供应商档案。
- 服务范围。
- 异常履约只读监控。
- 快递面单 Provider 配置占位。

Admin 侧当前不能做：

- 分配真实配送任务。
- 启用真实 Provider。
- 保存真实快递账号密钥。
- 改订单履约状态。
- 改结算或佣金。

## 快递打印拆分

快递打印必须独立分阶段：

1. `waybill-print-readonly-contract`
   - 定义面单能力 view shape。
   - 不打印。

2. `mock-waybill-provider-contract`
   - 定义 mock provider 输入输出。
   - 只返回 mock tracking id / mock label URL。

3. `waybill-print-local-smoke`
   - 本地 mock smoke。
   - 不接真实云打印。

4. `real-waybill-provider-plan`
   - 规划快递100、菜鸟、顺丰、京东物流等真实 provider。
   - 必须有密钥管理、验签、幂等、重试、取消、重打、日志和回滚。

## 与订单/履约的安全边界

真实接入前，任何配送/面单功能都不得：

- 改 `shipping_methods`。
- 改 cart total。
- 改 order fulfillment。
- 改 order shipment。
- 改 payment。
- 改 refund。
- 改 settlement。
- 改 commission。
- 改 permission。

## 下一步

建议继续做 `logistics-and-waybill-readonly-contract`，先把统一配送、自配送、自提、配送供应商和面单能力做成纯 TypeScript 只读 view shape。
