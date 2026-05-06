# Task: vendor-fulfillment-config-design

## 目标

设计商家履约配置后端架构文档，不写业务代码。

覆盖：

- 市场统一配送
- 商家自行配送
- 商家自提
- 配送供应商接入
- 商户是否允许自行决定配送方式
- 未来如何安全影响 checkout shipping options

## 允许修改

- `docs/vendor-fulfillment-config-design.md`
- `project-ledger/**`
- `.codex/queue.md`

## 禁止修改

- 禁止修改 `apps/**`
- 禁止修改 `packages/**`
- 禁止修改 checkout、shipping option、order、payment、refund、settlement、commission、permission 逻辑
- 禁止接入真实物流服务
- 禁止新增依赖
- 不要 push

## 要求

- 明确本轮只做设计，不改变结算页配送选项。
- 明确统一配送、商家配送和自提的优先级设计。
- 明确未来接真实配送供应商前的 mock/provider 边界。
- 给出 PR 拆分和验证步骤。

## 验证

```bash
git diff --check -- docs/vendor-fulfillment-config-design.md project-ledger .codex/queue.md
```

## 输出

- 修改文件
- 验证结果
- 风险点
- 下一步建议
