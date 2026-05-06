# vendor-market-context-readonly-plan

## 目标

规划 Vendor 商户后台如何接入市场上下文只读数据，让商户能看到所属市场、档口号、市场公告、营业时间和配送能力说明。

本任务只写计划，不改业务代码。

## 允许修改

- `docs/vendor-market-context-readonly-plan.md`
- `.codex/tasks/vendor-market-context-readonly-plan.md`
- `.codex/queue.md`

## 禁止修改

- 禁止修改 `apps/**`
- 禁止修改 `packages/**`
- 禁止新增依赖
- 禁止修改 checkout、shipping option、order、payment、refund、settlement、commission、permission、fulfillment 逻辑
- 禁止接入真实物流、短信、IM、直播、AI 或支付 Provider
- 禁止写入真实密钥

## 规划要求

- 明确数据来源优先使用只读 market read model/API。
- 明确 Vendor 首屏、店铺资料、配送设置、公告中心和快速上架页面如何消费只读上下文。
- 明确“市场统一配送”和“商家自行配送”只是展示/引导，不影响真实 checkout shipping options。
- 明确商户跨市场、多档口、多类型角色的展示策略。
- 给出小 PR 拆分、验证步骤和回滚方式。

## 验证

```bash
git diff --check -- docs/vendor-market-context-readonly-plan.md .codex/tasks/vendor-market-context-readonly-plan.md .codex/queue.md
```

## 提交规则

- 默认不要自动提交。
- 默认不要 push。
- 如果用户已明确进入连续 PR 流程，提交、push、开 PR 前仍需先验证通过。
