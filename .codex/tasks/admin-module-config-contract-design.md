# Task: admin-module-config-contract-design

## 目标

设计 Admin 模块开关从只读 capability contract 演进到真实配置存储的后端合同，不写业务代码。

覆盖：

- 平台级开关
- 市场级开关
- 商户类型开关
- 商户覆盖配置
- 审计日志
- 回滚策略
- 只读能力视图与可编辑配置视图的边界

## 允许修改

- `docs/admin-module-config-contract-design.md`
- `project-ledger/**`
- `.codex/queue.md`

## 禁止修改

- 禁止修改 `apps/**`
- 禁止修改 `packages/**`
- 禁止让模块开关真实生效
- 禁止修改支付、订单、退款、结算、佣金、权限业务逻辑
- 禁止新增依赖
- 不要 push

## 要求

- 明确第一阶段仍为只读或 mock 配置。
- 明确真实配置落库前需要的权限、审计、幂等和回滚。
- 明确哪些能力属于高风险，必须串行。
- 给出 PR 拆分和验证步骤。

## 验证

```bash
git diff --check -- docs/admin-module-config-contract-design.md project-ledger .codex/queue.md
```

## 输出

- 修改文件
- 验证结果
- 风险点
- 下一步建议
