# vendor-market-context-next-plan

## 目标

规划后续真正 Vendor API route、builder 和页面细节拆分。

本任务只做文档，不写业务代码。

## 允许修改

- `docs/vendor-market-context-next-plan.md`
- `.codex/tasks/vendor-market-context-next-plan.md`
- `.codex/queue.md`

## 禁止修改

- `apps/**`
- `packages/**`
- `package.json`
- `bun.lock`
- `.env*`
- 真实密钥和真实 provider 配置

## 必须覆盖

- Builder PR
- Readonly route PR
- Vendor client API 状态 polish
- Vendor 页面视觉 QA
- 鉴权和 seller 身份边界
- delivery profile 不影响 checkout 的边界
- 支付、订单、退款、结算、佣金、权限不触碰的风险门禁

## 验证命令

```bash
git diff --check
```

## 完成后

- 更新 `.codex/queue.md`。
- 记录下一轮建议任务。
- 不自动修改业务代码。
