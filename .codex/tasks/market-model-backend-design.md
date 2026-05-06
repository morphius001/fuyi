# Task: market-model-backend-design

## 目标

设计中国大陆多市场模型的后端架构文档，不写业务代码。

覆盖：

- 市场可切换
- 商户属于哪个市场
- 商户档口号
- 一个商户跨多个市场
- 市场营业时间
- 市场公告
- 市场配送规则
- 商户类型：海鲜档口、水果蔬菜商户、物料供应商、配送供应商、养殖户、种植户、种苗供应商、外地批发商
- 角色开关与能力边界

## 允许修改

- `docs/market-model-backend-design.md`
- `project-ledger/**`
- `.codex/queue.md`

## 禁止修改

- 禁止修改 `apps/**`
- 禁止修改 `packages/**`
- 禁止改支付、订单、退款、结算、佣金、权限业务逻辑
- 禁止新增依赖
- 禁止接入真实物流、支付、短信、IM 服务
- 不要 push

## 要求

- 明确哪些是第一阶段只读配置，哪些后续会影响真实业务。
- 明确哪些字段可以先放 metadata，哪些必须未来建真实模块/表。
- 明确多市场商户、档口号、营业时间、公告和配送规则的关系。
- 明确供应商角色和普通商户角色不能混淆。
- 给出 PR 拆分和验证步骤。

## 验证

```bash
git diff --check -- docs/market-model-backend-design.md project-ledger .codex/queue.md
```

## 输出

- 修改文件
- 验证结果
- 风险点
- 下一步建议
