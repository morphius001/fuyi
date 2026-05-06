# vendor-market-context-api-plan

## 目标

设计 Vendor 专用市场上下文只读 API 合同，不写接口实现、不改 UI。

## 允许修改

- `docs/vendor-market-context-api-plan.md`
- `.codex/tasks/vendor-market-context-api-plan.md`
- `.codex/queue.md`

## 禁止修改

- 禁止修改 `apps/**`
- 禁止修改 `packages/**`
- 禁止新增依赖
- 禁止修改 checkout、shipping option、order、payment、refund、settlement、commission、permission、fulfillment 逻辑
- 禁止接入真实物流、短信、IM、直播、AI 或支付 Provider
- 禁止写入真实密钥

## 要求

- 明确 Vendor API 不能使用消费者 Store API 作为权限来源。
- 明确 API 只读、可 fallback、不能影响运行时履约。
- 明确 seller 身份来源、sellerId 推导边界和权限检查边界。
- 明确响应结构、错误结构、缓存策略、审计和单测验证。
- 明确后续实现 PR 拆分。

## 验证

```bash
git diff --check -- docs/vendor-market-context-api-plan.md .codex/tasks/vendor-market-context-api-plan.md .codex/queue.md
```
